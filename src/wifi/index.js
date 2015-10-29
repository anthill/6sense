'use strict';
require('es6-shim');

var fs = require('fs');
var machina = require('machina');
var spawn = require('child_process').spawn;
var exec = require('child_process').exec; // Use exec only for little commands
var schedule = require('node-schedule');

var PacketReader = require('./packet-reader');

var QUERY_TIMEOUT = 10*1000*2;
var ALL_DAY_MAX_LAST_SEEN = 60 * 1000; // Precision : Up to +10%
var ALL_DAY_SIGNAL_PRECISION = 5; // In dB
var ALL_DAY_DATE_PRECISION = 30 * 1000; // In seconds


function execPromise(command, callback) {

    if (!callback)
        callback = function () {
            return true;
        };

    return new Promise(function (resolve, reject) {
        exec(command, function (err, stdout, stderr) {
            if (err)
                reject(callback(err, stdout, stderr));
            else
                resolve(callback(err, stdout, stderr));
        });
    });
}


function createFsmWifi () {

    var fsm = new machina.Fsm({

        initialState: "sleeping",

        myInterface: 'wlan0',
        recordInterval: null,
        instantMap: {},
        allDayMap: {},
        packetReader: null,

        initialize: function(){
            if (this.packetReader) {
                this.sleep();
                this.packetReader.stop();
            }

            this.packetReader = new PacketReader(this.myInterface + 'mon');

            this.packetReader.on('error', function (err) {
                console.log(err);
            });

            // TODO : add listeners (end)
        },

        states: {
            "sleeping": {

                _onEnter: function() {
                    console.log('ZZZzzzZZZzzz... ', this.state, ' ...ZZZzzzZZZzzz');
                },

                changeInterface: function(newInterface) {
                    if (newInterface)
                        this.myInterface = newInterface;
                    this.handle('initialize');
                },

                wakeUp: function(){
                    var self = this;

                    enterMonitorMode(this.myInterface)
                    .then(function(){
                        console.log('OK all good !');
                        self.transition('monitoring');
                    })
                    .catch(function(err){ // if error, what about deferUntilTransition ? still pending ?? -> yes
                        self.clearQueue('monitoring'); // Clear the possible deferUntilTransition event
                        console.log('err', err, err.stack);
                        console.log('Couldn\'t enter Monitor mode... Going back to sleep.');
                        exitMonitorMode(self.myInterface);
                    });
                },

                record: function(period){
                    this.deferUntilTransition('monitoring');
                    this.handle('wakeUp');
                },

                _onExit: function(){
                    console.log('Exiting sleeping state');
                }

            },

            "monitoring": {

                _onEnter: function(){
                    console.log('============== ' + this.state + ' ==============');
                },

                tryToSleep: function(){
                    var self = this;

                    exitMonitorMode(self.myInterface)
                    .then(function(){
                        console.log('Monitor mode deactivated');
                        self.transition('sleeping');
                    })
                    .catch(function(err){
                        console.log('err', err, err.stack);
                        console.log('Couldn\'t exit Monitor mode, still monitoring');
                    });
                },

                record: function(period){
                    var self = this;

                    startRecording(period)
                    .then(function(){
                        self.transition('recording');
                    })
                    .catch(function(err){
                        console.log('err', err, err.stack);
                        console.log('Couldn\'t enter Recording mode, still monitoring');
                    });
                },

                _onExit: function(){
                    console.log('Exiting monitoring state');
                }
            },

            "recording": {

                _onEnter: function(){
                    var self = this;
                    console.log('************** ' + this.state + ' **************');
                },

                tryToSleep: function(){
                    this.deferUntilTransition('monitoring');
                    this.handle('pause');
                },

                pause: function(){
                    var self = this;

                    console.log('pausing');
                    stopRecording(this.process)
                    .then(function(){
                        self.transition('monitoring');
                    })
                    .catch(function(err){
                        self.clearQueue('monitoring'); // Clear the possible deferUntilTransition event
                        console.log('err', err, err.stack);
                        console.log('Couldn\'t exit Recording mode, still monitoring');
                    });
                },

                _onExit: function(){
                    console.log('Exiting recording state');
                }
            }
        },

        wakeUp: function(){
            this.handle('wakeUp');
        },

        sleep: function(){
            this.handle('tryToSleep');
        },

        record: function(period){
            this.handle('record', period);
        },

        pause: function(){
            this.handle('pause');
        }
    });

    function enterMonitorMode(myInterface) {
        // this spawns the AIRMON-NG START process whose purpose is to set the wifi card in monitor mode
        // it is a one-shot process, that stops right after success
        return new Promise(function(resolve, reject) {

            console.log(myInterface);

            console.log('Activating Monitor mode... ');
            var physicalInterface;

            // Get the physical interface
            return execPromise('((iw dev | head -n 1 | sed s/#// | grep phy) || (iw phy | head -n 1 | sed "s/Wiphy //" | grep phy))',
            function (error, stdout, stderr) {
                if (error) {
                    reject(stderr.toString());
                    return false;
                }
                else {
                    physicalInterface = stdout.toString().replace('\n', '') || 'phy0';
                    console.log('physical interface to use :', physicalInterface);
                    return true;
                }
            })
            .then(function () {
            // Create a monitor interface on the physical interface
                return execPromise('iw phy ' + physicalInterface + ' interface add ' + (myInterface || 'wlan0') + 'mon type monitor', function (error, stdout, stderr) {
                    if (error && error.code !== 233) { // Error code 233 === Already in monitor mode
                        console.log("ERROR1 !", stderr);
                        reject(error);
                        return false;
                    }
                    else {
                        return true;
                    }
                });
            })
            .then(function () {
            // Activate the monitor interface
                return execPromise('ifconfig ' + (myInterface || 'wlan0') + 'mon up', function (error, stdout, stderr) {
                    if (error) {
                        console.log("ERROR2 !", stderr);
                        reject(error);
                        return false;
                    }
                    else {
                        return true;
                    }
                });
            })
            .then(function () {
            // Delete the old interface
                return execPromise('iw dev '+ (myInterface || 'wlan0') + ' del', function (error) {
                    if (error) {
                        console.log(error);
                        reject(error);
                    }
                });
            })
            .then(resolve)
            .catch(function (err) {
                console.log('error while entering monitor mode :', err);
                reject(err);
            });
        });
    }

    function exitMonitorMode(myInterface) {

        return new Promise(function(resolve, reject){
            console.log("Deactivating Monitor mode... " + myInterface);

            var physicalInterface = 'phy0';

            // Get the physical interface
            return execPromise('((iw dev | head -n 1 | sed s/#// | grep phy) || (iw phy | head -n 1 | sed "s/Wiphy //" | grep phy))',
                function (error, stdout, stderr) {
                if (error) {
                    reject(stderr.toString());
                    return false;
                }
                else
                    physicalInterface = stdout.toString().replace('\n', '') || 'phy0';
            })
            .then(function () {
            // Re-add the initial interface
                return execPromise('iw phy ' + physicalInterface + ' interface add ' + (myInterface || 'wlan0') + ' type managed', function (error) {
                    if (error) {
                        console.log(error);
                        reject(error);
                    }
                });
            })
            .then(function () {
            // End monitoring mode
                return execPromise('iw dev ' + (myInterface || 'wlan0') + 'mon' + ' del', function (error, stdout, stderr) {
                    if (error) {
                        console.log("ERROR !", stderr);
                        reject(error);
                        return false;
                    }
                });
            })
            .then(function () {
            // Re-up the initial interface
                return execPromise('ifconfig ' + (myInterface || 'wlan0') + ' up');
            })
            .then(resolve)
            .catch(function (err) {
                console.log('error while exiting monitor mode :', err);
                reject(err);
            });

        });
    }



    function startRecording(period){
        console.log('Starting recording process...');

        // start recording
        return new Promise(function(resolve, reject) {

            fsm.packetReader.start(fsm.myInterface + 'mon');

            // packetReader listener
            fsm.packetReader.on('packet', function (packet) {

                // Add to the instantMap
                if (fsm.instantMap[packet.mac_address] === undefined) {
                    fsm.instantMap[packet.mac_address] = [packet.signal_strength];
                }
                else {
                    if (packet.signal_strength !== fsm.instantMap[packet.mac_address].slice(-1)[0])
                        fsm.instantMap[packet.mac_address].push(packet.signal_strength);
                }

                // Add to the allDayMap
                if (fsm.allDayMap[packet.mac_address] === undefined) {
                    fsm.allDayMap[packet.mac_address] = {
                        last_seen: new Date(),
                        measurements:
                        [{
                            date: new Date(),
                            signal_strength: packet.signal_strength
                        }],
                        active: true
                    };
                }
                else {
                    var lastMeasurement = fsm.allDayMap[packet.mac_address].measurements.slice(-1)[0];

                    var isSignalStrengthDeltaEnough = packet.signal_strength - lastMeasurement.signal_strength >=
                        ALL_DAY_SIGNAL_PRECISION;
                    var isDateDeltaEnough = new Date().getTime() - lastMeasurement.date.getTime() >=
                        ALL_DAY_DATE_PRECISION;


                    fsm.allDayMap[packet.mac_address].last_seen = new Date();

                    if (isDateDeltaEnough && isSignalStrengthDeltaEnough)
                        fsm.allDayMap[packet.mac_address].measurements
                        .push(
                        {
                            date: new Date(),
                            signal_strength: packet.signal_strength
                        });
                    }
            });

            // measurements emitter (instant mode)
            fsm.recordInterval = setInterval(function () {
                var signal_strengths = Object.keys(fsm.instantMap).map(function (key) {
                    return Math.round(fsm.instantMap[key]
                    .reduce(function(sum, a) {
                        return sum + a;
                    }, 0) / (fsm.instantMap[key].length || 1));
                });

                fsm.emit('processed', signal_strengths);
                fsm.instantMap = {};

            }, period * 1000);


            // on error, resolve Promise => weird, but ok
            fsm.packetReader.once('error', function(){
                resolve();
            });

            // on timeout, reject Promise
            setTimeout(function(){
                fsm.emit('recordError', 'timeout');
                reject(new Error("Timeout"));
            }, QUERY_TIMEOUT);
        });
    }

    function stopRecording(process){
        console.log('Stopping recording...');

        return new Promise(function(resolve) {

            if (fsm.recordInterval)
                clearInterval(fsm.recordInterval);

            fsm.packetReader.removeAllListeners('packet');
            fsm.packetReader.stop();
            resolve();
        });
    }

    // allDayMap anonymisation
    setInterval(function () {
        Object.keys(fsm.allDayMap).forEach(function (key) {
            var obj = fsm.allDayMap[key];

            if (obj.active) {
                // When it disapears for too long, make the result anonymous.
                if (new Date().getTime() - obj.last_seen.getTime() >= ALL_DAY_MAX_LAST_SEEN) {
                    var random = Math.random.toString(36).slice(2);
                    fsm.allDayMap[random] = obj;
                    fsm.allDayMap[random].active = false;
                    delete fsm.allDayMap[key];
                }
            }
        });
    }, ALL_DAY_MAX_LAST_SEEN / 10); // Want more precision ? Divide by more than 10

    // sending allDayMap every night.
    schedule.scheduleJob('00 00 * * *', function(){
        var trajectories = Object.keys(fsm.allDayMap).map(function (key) {
            return fsm.allDayMap[key].measurements;
        });
        fsm.emit('trajectories', trajectories);
        fsm.allDayMap = {};
    });

    return fsm;
}

module.exports = createFsmWifi;

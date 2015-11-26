"use strict";

var noble = require('noble');
var machina = require('machina');
var exec = require('child_process').exec;
var path = require('path');

var BLUETOOTH_SCRIPT = './initBluetooth.sh';

var createFsmBluetooth = function () {

    noble.on('warning', function (m) {
        console.log('NOBLE WARNING:', m);
    });

    noble.on('stateChange', function (state) {
        if (state === 'poweredOff') {
            console.log('bluetooth dongle hanged up');

            if (fsm.recordInterval) {
                // Stop record
                clearInterval(fsm.recordInterval);
                fsm.recordInterval = undefined;
                fsm.transition('uninitialized');
            }
        }
    });

    var fsm = new machina.Fsm({
        initialState: "uninitialized",

        period: 300,
        recordInterval: undefined,
        devices: {},

        sendMeasurement: function() {
            var measurement = {date: new Date(), devices: []};

            Object.keys(fsm.devices).forEach(function (key) {
                measurement.devices.push(fsm.devices[key]);
            });
            fsm.emit('processed', measurement);
        },

        initialize: function() {
            var self = this;

            exec('/bin/sh ' + path.resolve(__dirname, BLUETOOTH_SCRIPT), function (err) {
                if (err)
                    console.log('Error in exec :', err);
            });

            noble.once('stateChange', function(state) {

                if (state === 'poweredOn') {
                    self.transition('initialized');
                }
                else {
                    noble.stopScanning();
                }
            });
        },

        states: {
            "uninitialized": {
                _onEnter: function() {
                    console.log('bluetooth state :', this.state);
                },

                record: function(_period){
                    this.deferUntilTransition(_period, 'initialized');
                    this.initialize();
                }
            },

            "initialized": {
                _onEnter: function() {
                    console.log('bluetooth state :', this.state);
                },

                record: function(_period) {
                    var self = this;
                    if (_period)
                        self.period = _period;

                    noble.once('scanStart', function() {
                        if (self.recordInterval)
                            clearInterval(self.recordInterval);
                        self.recordInterval = setInterval(self.sendMeasurement, self.period * 1000);
                        self.transition('recording');
                    });

                    try {
                        noble.startScanning([], true);
                    }
                    catch (err) {
                        console.log('Error while starting bluetooth :', err);

                        // Try to re-initialize the FSM
                        self.deferUntilTransition(_period, 'initialized');
                        self.initialize();
                    }
                }
            },

            "recording": {
                _onEnter: function() {
                    console.log('bluetooth state :', this.state);
                },

                stopRecording: function() {
                    var self = this;

                    noble.once('scanStop', function() {
                        if (self.recordInterval)
                            clearInterval(self.recordInterval);
                        self.recordInterval = null;

                        self.transition('initialized');
                    });

                    // If no response in 10s, stop it.
                    setTimeout(function () {
                        if (self.recordInterval)
                            clearInterval(self.recordInterval);
                        self.recordInterval = null;

                        self.transition('uninitialized');
                    }, 10000);

                    noble.stopScanning();
                }
            }
        },

        record: function(_period) {
            fsm.handle('record', _period);
        },

        pause: function() {
            fsm.handle('stopRecording');
        },

        resume: function() {
            fsm.handle('record');
        },

        stop: function() {
            fsm.handle('stopRecording');
        }

    });

    noble.on('discover', function(peripheral) {
        var id = peripheral.id;
        var entered = !fsm.devices[id];

        if (entered) {
            fsm.devices[id] = {signal_strength: peripheral.rssi};
        }

        fsm.devices[id].lastSeen = Date.now();
    });

    setInterval(function() {
        for (var id in fsm.devices) {
            if (fsm.devices[id].lastSeen < (Date.now() - ((fsm.period * 1000) || 60000))) {
                delete fsm.devices[id];
            }
        }
    }, ((fsm.period * 1000) || 60000) / 2);

    return fsm;
};

module.exports = createFsmBluetooth;

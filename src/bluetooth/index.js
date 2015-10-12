"use strict";

var noble = require('noble');
var machina = require('machina');
var exec = require('child_process').exec;
var path = require('path');

var BLUETOOTH_SCRIPT = './initBluetooth.sh';

var fsm = new machina.Fsm({
    initialState: "uninitialized",

    period: 300,
    recordInterval: undefined,
    devices: {},

    sendMeasurement: function() {
        var measurement = {date: new Date(), devices: []};

        Object.keys(fsm.devices).forEach(function (key) {
            measurement.devices.push({ID: fsm.devices[key].ID, signal_strength: fsm.devices[key].signal_strength});
        });
        fsm.emit('processed', measurement);
    },

    initialize: function() {
        var self = this;

        exec('sh ' + path.resolve(__dirname, BLUETOOTH_SCRIPT));

        noble.on('stateChange', function(state) {
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
                this.deferUntilTransition(_period);
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
                noble.startScanning([], true);

                noble.on('scanStart', function() {
                    if (self.recordInterval)
                        clearInterval(self.recordInterval);
                    self.recordInterval = setInterval(self.sendMeasurement, self.period * 1000);
                    self.transition('recording');
                });
            }
        },

        "recording": {
            _onEnter: function() {
                console.log('bluetooth state :', this.state);
            },

            stopRecording: function() {
                var self = this;
                noble.stopScanning();
                noble.on('scanStop', function() {
                    clearInterval(self.recordInterval);
                    self.recordInterval = null;

                    self.transition('initialized');
                });
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
        fsm.devices[id] = {ID: id, signal_strength: peripheral.rssi};
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

module.exports = fsm;

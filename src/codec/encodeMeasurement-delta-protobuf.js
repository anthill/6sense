"use strict";

var fs = require('fs');
var path = require('path');
var protobuf = require('protocol-buffers');

var deltaEncode = require('./delta-encode');

var messages = protobuf(fs.readFileSync(path.join(__dirname, '/delta-encoded-measurements.proto')));

module.exports = function(measurements){
    return messages.AffluenceSensorMeasurements.encode({
        measurements: measurements.map(function(measurement){

            var IDs = measurement.devices.map(function (device) {
                return device.ID;
            });

            var signal_strengths = measurement.devices.map(function (device) {
                return device.signal_strength;
            });

            return {
                date: measurement.date,
                signal_strengths: deltaEncode(signal_strengths),
                IDs: IDs
            }
        })
    });
};

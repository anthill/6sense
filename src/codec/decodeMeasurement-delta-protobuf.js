"use strict";

var fs = require('fs');
var path = require('path');

var protobuf = require('protocol-buffers');

var deltaDecode = require('./delta-decode');

var messages = protobuf(fs.readFileSync(path.join(__dirname, '/delta-encoded-measurements.proto')));

module.exports = function(buffer){
    var protoDecoded = messages.AffluenceSensorMeasurements.decode(buffer).measurements;
    protoDecoded.forEach(function(measurement){
        measurement.signal_strengths = deltaDecode(measurement.signal_strengths);
    });
    return protoDecoded.map(function (measurement, index) {

        var devices = measurement.signal_strengths.map(function (signal_strength, index) {
            return {
                signal_strength: signal_strength,
                ID: (measurement.IDs && index < measurement.IDs.length) ? measurement.IDs[index] : undefined
            };
        })

        return {
            date: measurement.date,
            devices: devices
        }
    });
};

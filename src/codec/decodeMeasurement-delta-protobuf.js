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
    return protoDecoded;
};

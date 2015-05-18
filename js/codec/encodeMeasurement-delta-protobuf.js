"use strict";

var fs = require('fs');

var protobuf = require('protocol-buffers');

var deltaEncode = require('./delta-encode');

var messages = protobuf(fs.readFileSync(__dirname + '/delta-encoded-measurements.proto'));

module.exports = function(measurements){
    return messages.AffluenceSensorMeasurements.encode({
        measurements: measurements.map(function(measurement){
            return {
                date: measurement.date,
                signal_strengths : deltaEncode(measurement.signal_strengths)
            }
        })
    });
};

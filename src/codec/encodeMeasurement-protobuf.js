"use strict";

var fs = require('fs');

var protobuf = require('protocol-buffers');


var messages = protobuf(fs.readFileSync(__dirname + '/measurements.proto'));


module.exports = function(measurements){
    return messages.AffluenceSensorMeasurements.encode({
        measurements: measurements
    })
};

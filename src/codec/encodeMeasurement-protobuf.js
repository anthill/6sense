"use strict";

var fs = require('fs');
var path = require('path');
var protobuf = require('protocol-buffers');


var messages = protobuf(fs.readFileSync(path.join(__dirname, '/measurements.proto')));


module.exports = function(measurements){
    return messages.AffluenceSensorMeasurements.encode({
        measurements: measurements
    })
};

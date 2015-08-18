"use strict";

var zlib = require('zlib');

var decodeProtoDelta = require('./decodeMeasurement-delta-protobuf');
var unshrinkMeasurementInformation = require('./unshrinkMeasurementInformation');


/*
var shrinkMeasurementInformation = require('./shrinkMeasurementInformation');



module.exports = function encode(measurements){
    var shrinkedMessages = measurements.map(shrinkMeasurementInformation);
    var delta_protobuf_based_buffer = encodeProtoDelta(shrinkedMessages);

    return new Promise(function(resolve, reject){
        zlib.deflate(delta_protobuf_based_buffer, function(err, buffer){
            if(err) reject(err); else resolve(buffer.toString('base64'));
        });
    });
};
*/

module.exports = function(str){
    var buffer = new Buffer(str, 'base64');

    return (new Promise(function(resolve, reject){
        zlib.inflate(buffer, function(err, buffer){
            if(err) reject(err); else resolve(buffer);
        });
    }))
        .then(decodeProtoDelta)
        .then(function(measurements){
            return measurements.map(unshrinkMeasurementInformation);

        })

}




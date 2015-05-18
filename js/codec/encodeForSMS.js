"use strict";



var encodeProtoDelta = require('./encodeMeasurement-delta-protobuf');
var shrinkMeasurementInformation = require('./shrinkMeasurementInformation');

var zlib = require('zlib');

module.exports = function encode(measurements){
	var shrinkedMessages = measurements.map(shrinkMeasurementInformation);
	var delta_protobuf_based_buffer = encodeProtoDelta(shrinkedMessages);

	return new Promise(function(resolve, reject){
	    zlib.deflate(delta_protobuf_based_buffer, function(err, buffer){
	        if(err) reject(err); else resolve(buffer.toString('base64'));
	    });
	});
};





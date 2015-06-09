"use strict";

require('es6-shim');

var zlib = require('zlib');

var shrinkMeasurementInformation = require('./shrinkMeasurementInformation');

var encodeProto = require('./encodeMeasurement-protobuf');
var encodeProtoDelta = require('./encodeMeasurement-delta-protobuf');
var encodeZip = require('./encodeMeasurement-zip');

var measurements = [
    {
        date: new Date('2015-05-15T14:38:00+02:00'),
        signal_strengths: [-60, -63, -75, -40, -64, -70, -66, -82, -70, -80, -91, -73, -23, -83, -73, -76, -74, -72, -70, -68, -66, -67, -67, -65, -65, -63, -55, -57, -61, -48, -53, -54, -48, -45, -36, -40, -41]
    },
    {
        date: new Date('2015-05-15T14:39:00+02:00'),
        signal_strengths: [-60,-63,-75,-40,-64,-70,-82,-66,-82,-70,-80,-91,-73,-
23,-83,-73,-76,-74,-72,-70,-68,-66,-67,-67,-65,-65,-63,-55,-57,-61,-48,-53,-54,-
48,-45,-36,-40,-41]
    },
    {
        date: new Date('2015-05-15T14:40:00+02:00'),
        signal_strengths: [-60,-63,-75,-40,-64,-70,-82,-66,-82,-70,-80,-91,-73,-
23,-83,-73,-76,-74,-72,-70,-68,-66,-67,-67,-65,-65,-63,-55,-57,-61,-48,-53,-54,-
48,-45,-36,-40,-41]
    },
    {
        date: new Date('2015-05-15T14:41:00+02:00'),
        signal_strengths: [-60,-63,-75,-40,-64,-70,-82,-72,-70,-80,-91,-73,-23,-
83,-73,-76,-74,-72,-70,-68,-66,-67,-67,-65,-65,-63,-55,-57,-61,-48,-53,-54,-48,-
45,-36,-40,-41]
    },
    {
        date: new Date('2015-05-15T14:42:00+02:00'),
        signal_strengths: [-60,-63,-75,-40,-64,-70,-91,-73,-23,-83,-73,-76,-74,-
72,-70,-68,-66,-67,-67,-65,-65,-63,-55,-57,-61,-48,-53,-54,-48,-45,-36,-40,-41]
    }
];

var shrinkedMessages = measurements.map(shrinkMeasurementInformation);

console.log('ref JSON', JSON.stringify(shrinkedMessages).length);

var protobuf_based_buffer = encodeProto(shrinkedMessages);
var delta_protobuf_based_buffer = encodeProtoDelta(shrinkedMessages);
var zip_based_bufferP = encodeZip(shrinkedMessages);

zip_based_bufferP.then(function(zip_based_buffer){
    console.log('naive-protobuf', protobuf_based_buffer.length);
    console.log('delta_protobuf', delta_protobuf_based_buffer.length);
    console.log('zip', zip_based_buffer.length);
    //console.log(protobuf_based_buffer);
    //console.log(zip_based_buffer);
})



var protobuf_and_zip_based_bufferP = new Promise(function(resolve, reject){
    zlib.deflate(protobuf_based_buffer, function(err, buffer){
        if(err) reject(err); else resolve(buffer);
    });
});

protobuf_and_zip_based_bufferP.then(function(bothBuf){
    console.log('naive-protobuf + zip', bothBuf.length);
});

    
    

var delta_protobuf_and_zip_based_bufferP = new Promise(function(resolve, reject){
    zlib.deflate(delta_protobuf_based_buffer, function(err, buffer){
        if(err) reject(err); else resolve(buffer);
    });
});

delta_protobuf_and_zip_based_bufferP.then(function(bothBuf){
    console.log('delta-protobuf + zip', bothBuf.length);
});





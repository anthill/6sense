"use strict";

require('es6-shim');

var zlib = require('zlib');

var shrinkMeasurementInformation = require('./shrinkMeasurementInformation');

var encodeProto = require('./encodeMeasurement-protobuf');
var encodeProtoDelta = require('./encodeMeasurement-delta-protobuf');
var encodeZip = require('./encodeMeasurement-zip');
var hashMacAddress = require('../hashMacAddress')

function hashID(id) {
    return hashMacAddress(id, (new Date()).toISOString().slice(0, 10));
}

var measurements = [
    {
        date: new Date('2015-05-15T14:38:00+02:00'),
        signal_strengths: [-60, -63, -75, -40, -64, -70, -66, -82, -70, -80, -91, -73, -23, -83, -73, -76, -74, -72, -70, -68, -66, -67, -67, -65, -65, -63, -55, -57, -61, -48, -53, -54, -48, -45, -36, -40, -41],
        IDs:    ["BA:5E:BA:11:00:00", "BA:5E:BA:11:00:01", "BA:5E:BA:11:00:02", "BA:5E:BA:11:00:03", "BA:5E:BA:11:00:04",
                "BA:5E:BA:11:00:05", "BA:5E:BA:11:00:06", "BA:5E:BA:11:00:07", "BA:5E:BA:11:00:08", "BA:5E:BA:11:00:09", 
                "BA:5E:BA:11:00:10", "BA:5E:BA:11:00:11", "BA:5E:BA:11:00:12", "BA:5E:BA:11:00:13", "BA:5E:BA:11:00:14", 
                "BA:5E:BA:11:00:15", "BA:5E:BA:11:00:16", "BA:5E:BA:11:00:17", "BA:5E:BA:11:00:18", "BA:5E:BA:11:00:19", 
                "BA:5E:BA:11:00:20", "BA:5E:BA:11:00:21", "BA:5E:BA:11:00:22", "BA:5E:BA:11:00:23", "BA:5E:BA:11:00:24", 
                "BA:5E:BA:11:00:25", "BA:5E:BA:11:00:26", "BA:5E:BA:11:00:27", "BA:5E:BA:11:00:28", "BA:5E:BA:11:00:29", 
                "BA:5E:BA:11:00:31", "BA:5E:BA:11:00:32", "BA:5E:BA:11:00:33", "BA:5E:BA:11:00:34", "BA:5E:BA:11:00:35", 
                "BA:5E:BA:11:00:36", "BA:5E:BA:11:00:37"].map(hashID)
    },

    {
        date: new Date('2015-05-15T14:39:00+02:00'),
        signal_strengths: [-30, -33, -35, -30, -34, -30, -36, -32, -30, -30, -31, -33, -33, -33, -33, -36, -34, -32, -30, -38, -36, -37, -37, -35, -35, -33, -35, -37, -31, -38, -33, -34, -38, -35, -36, -30, -41],
        IDs:    ["BA:DF:00:DD:FF:00", "BA:DF:00:DD:FF:01", "BA:DF:00:DD:FF:02", "BA:DF:00:DD:FF:03", "BA:DF:00:DD:FF:04",
                "BA:DF:00:DD:FF:05", "BA:DF:00:DD:FF:06", "BA:DF:00:DD:FF:07", "BA:DF:00:DD:FF:08", "BA:DF:00:DD:FF:09", 
                "BA:DF:00:DD:FF:10", "BA:DF:00:DD:FF:11", "BA:DF:00:DD:FF:12", "BA:DF:00:DD:FF:13", "BA:DF:00:DD:FF:14", 
                "BA:DF:00:DD:FF:15", "BA:DF:00:DD:FF:16", "BA:DF:00:DD:FF:17", "BA:DF:00:DD:FF:18", "BA:DF:00:DD:FF:19", 
                "BA:DF:00:DD:FF:20", "BA:DF:00:DD:FF:21", "BA:DF:00:DD:FF:22", "BA:DF:00:DD:FF:23", "BA:DF:00:DD:FF:24", 
                "BA:DF:00:DD:FF:25", "BA:DF:00:DD:FF:26", "BA:DF:00:DD:FF:27", "BA:DF:00:DD:FF:28", "BA:DF:00:DD:FF:29", 
                "BA:DF:00:DD:FF:31", "BA:DF:00:DD:FF:32", "BA:DF:00:DD:FF:33", "BA:DF:00:DD:FF:34", "BA:DF:00:DD:FF:35", 
                "BA:DF:00:DD:FF:36", "BA:DF:00:DD:FF:37"].map(hashID)
    },
    {
        date: new Date('2015-05-15T14:40:00+02:00'),
        signal_strengths: [-60, -63, -75, -40, -64, -70, -82, -66, -82, -70, -80, -91, -73,
        -23, -83, -73, -76, -74, -72, -70, -68, -66, -67, -67, -65, -65, -63, -55, -57, -61, -48, -53, -54,
        -48, -45, -36, -40, -41]
    }
    // {
    //     date: new Date('2015-05-15T14:41:00+02:00'),
    //     signal_strengths: [-60, -63, -75, -40, -64, -70, -82, -72, -70, -80, -91, -73, -23,
    //     -83, -73, -76, -74, -72, -70, -68, -66, -67, -67, -65, -65, -63, -55, -57, -61, -48, -53, -54, -48,
    //     -45, -36, -40, -41]
    // },
    // {
    //     date: new Date('2015-05-15T14:42:00+02:00'),
    //     signal_strengths: [-60, -63, -75, -40, -64, -70, -91, -73, -23, -83, -73, -76, -74,
    //     -72, -70, -68, -66, -67, -67, -65, -65, -63, -55, -57, -61, -48, -53, -54, -48, -45, -36, -40, -41]
    // }
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





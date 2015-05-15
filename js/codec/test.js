"use strict";

require('es6-shim');

var shrinkMeasurementInformation = require('./shrinkMeasurementInformation');

var encodeProto = require('./encodeMeasurement-protobuf');
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
var zip_based_bufferP = encodeZip(shrinkedMessages);

zip_based_bufferP.then(function(zip_based_buffer){
    console.log('pbuf VS zip', protobuf_based_buffer.length, zip_based_buffer.length);
    console.log(protobuf_based_buffer);
    console.log(zip_based_buffer);
})





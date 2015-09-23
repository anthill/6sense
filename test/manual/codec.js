"use strict";

require('es6-shim')

var encodeForSMS = require('../../src/codec/encodeForSMS');
var decodeForSMS = require('../../src/codec/decodeFromSMS');
var hashMacAddress = require('../../src/hashMacAddress')

function hashID(id) {
    return hashMacAddress(id, new Date());
}

var measurements = [
    {
        date: new Date('2015-05-15T14:38:00+02:00'),
        devices: [
            {signal_strength: -60, ID: hashID("BA:5E:BA:11:00:00")},
            {signal_strength: -63, ID: hashID("BA:5E:BA:11:00:01")},
            {signal_strength: -75, ID: hashID("BA:5E:BA:11:00:02")},
            {signal_strength: -40, ID: hashID("BA:5E:BA:11:00:03")},
            {signal_strength: -64, ID: hashID("BA:5E:BA:11:00:04")},
            {signal_strength: -70, ID: hashID("BA:5E:BA:11:00:05")},
            {signal_strength: -66, ID: hashID("BA:5E:BA:11:00:06")},
            {signal_strength: -82, ID: hashID("BA:5E:BA:11:00:07")},
            {signal_strength: -70, ID: hashID("BA:5E:BA:11:00:08")},
            {signal_strength: -80, ID: hashID("BA:5E:BA:11:00:09")},
            {signal_strength: -91, ID: hashID("BA:5E:BA:11:00:10")},
            {signal_strength: -73, ID: hashID("BA:5E:BA:11:00:11")},
            {signal_strength: -23, ID: hashID("BA:5E:BA:11:00:12")},
            {signal_strength: -83, ID: hashID("BA:5E:BA:11:00:13")},
            {signal_strength: -73, ID: hashID("BA:5E:BA:11:00:14")},
            {signal_strength: -76, ID: hashID("BA:5E:BA:11:00:15")},
            {signal_strength: -74, ID: hashID("BA:5E:BA:11:00:16")},
            {signal_strength: -72, ID: hashID("BA:5E:BA:11:00:17")},
            {signal_strength: -70, ID: hashID("BA:5E:BA:11:00:18")},
            {signal_strength: -68, ID: hashID("BA:5E:BA:11:00:19")},
            {signal_strength: -66, ID: hashID("BA:5E:BA:11:00:20")},
            {signal_strength: -67, ID: hashID("BA:5E:BA:11:00:21")},
            {signal_strength: -67, ID: hashID("BA:5E:BA:11:00:22")},
            {signal_strength: -65, ID: hashID("BA:5E:BA:11:00:23")},
            {signal_strength: -65, ID: hashID("BA:5E:BA:11:00:24")},
            {signal_strength: -63, ID: hashID("BA:5E:BA:11:00:25")},
            {signal_strength: -55, ID: hashID("BA:5E:BA:11:00:26")},
            {signal_strength: -57, ID: hashID("BA:5E:BA:11:00:27")},
            {signal_strength: -61, ID: hashID("BA:5E:BA:11:00:28")},
            {signal_strength: -48, ID: hashID("BA:5E:BA:11:00:29")},
            {signal_strength: -53, ID: hashID("BA:5E:BA:11:00:30")},
            {signal_strength: -54, ID: hashID("BA:5E:BA:11:00:31")},
            {signal_strength: -48, ID: hashID("BA:5E:BA:11:00:32")},
            {signal_strength: -45, ID: hashID("BA:5E:BA:11:00:33")},
            {signal_strength: -36, ID: hashID("BA:5E:BA:11:00:34")},
            {signal_strength: -40, ID: hashID("BA:5E:BA:11:00:35")},
            {signal_strength: -41, ID: hashID("BA:5E:BA:11:00:36")}]
    },
    {
        date: new Date('2015-05-15T14:40:00+02:00'),
        devices: [
            {signal_strength: -30, ID: hashID("BA:5E:BA:11:FF:00")},
            {signal_strength: -33, ID: hashID("BA:5E:BA:11:FF:01")},
            {signal_strength: -35, ID: hashID("BA:5E:BA:11:FF:02")},
            {signal_strength: -40, ID: hashID("BA:5E:BA:11:FF:03")},
            {signal_strength: -44, ID: hashID("BA:5E:BA:11:FF:04")},
            {signal_strength: -40, ID: hashID("BA:5E:BA:11:FF:05")},
            {signal_strength: -26, ID: hashID("BA:5E:BA:11:FF:06")},
            {signal_strength: -22, ID: hashID("BA:5E:BA:11:FF:07")},
            {signal_strength: -30, ID: hashID("BA:5E:BA:11:FF:08")},
            {signal_strength: -30, ID: hashID("BA:5E:BA:11:FF:09")},
            {signal_strength: -31, ID: hashID("BA:5E:BA:11:FF:10")},
            {signal_strength: -33, ID: hashID("BA:5E:BA:11:FF:11")},
            {signal_strength: -13, ID: hashID("BA:5E:BA:11:FF:12")},
            {signal_strength: -13, ID: hashID("BA:5E:BA:11:FF:13")},
            {signal_strength: -93, ID: hashID("BA:5E:BA:11:FF:14")},
            {signal_strength: -96, ID: hashID("BA:5E:BA:11:FF:15")},
            {signal_strength: -94, ID: hashID("BA:5E:BA:11:FF:16")},
            {signal_strength: -52, ID: hashID("BA:5E:BA:11:FF:17")},
            {signal_strength: -50, ID: hashID("BA:5E:BA:11:FF:18")},
            {signal_strength: -58, ID: hashID("BA:5E:BA:11:FF:19")},
            {signal_strength: -56, ID: hashID("BA:5E:BA:11:FF:20")},
            {signal_strength: -37, ID: hashID("BA:5E:BA:11:FF:21")},
            {signal_strength: -17, ID: hashID("BA:5E:BA:11:FF:22")},
            {signal_strength: -55, ID: hashID("BA:5E:BA:11:FF:23")},
            {signal_strength: -55, ID: hashID("BA:5E:BA:11:FF:24")},
            {signal_strength: -33, ID: hashID("BA:5E:BA:11:FF:25")},
            {signal_strength: -35, ID: hashID("BA:5E:BA:11:FF:26")},
            {signal_strength: -87, ID: hashID("BA:5E:BA:11:FF:27")},
            {signal_strength: -81, ID: hashID("BA:5E:BA:11:FF:28")},
            {signal_strength: -88, ID: hashID("BA:5E:BA:11:FF:29")},
            {signal_strength: -83, ID: hashID("BA:5E:BA:11:FF:30")},
            {signal_strength: -64, ID: hashID("BA:5E:BA:11:FF:31")},
            {signal_strength: -88, ID: hashID("BA:5E:BA:11:FF:32")},
            {signal_strength: -85, ID: hashID("BA:5E:BA:11:FF:33")},
            {signal_strength: -36, ID: hashID("BA:5E:BA:11:FF:34")},
            {signal_strength: -30, ID: hashID("BA:5E:BA:11:FF:35")},
            {signal_strength: -31, ID: hashID("BA:5E:BA:11:FF:36")}]
    }

];

encodeForSMS(measurements)
    .then(decodeForSMS)
    .then(function(res){
        console.log('encode + decode', JSON.stringify(res));

    })
    .catch(function(err){
        console.error('encode + decode err', err);
    })

"use strict";

var moment = require('moment');

var MIN_DATE_UNIX_TIMESTAMP = require('./MIN_DATE_UNIX_TIMESTAMP');

var MIN_SIGNAL_STRENGTH = require('./MIN_SIGNAL_STRENGTH');

function fromByte(v){
    return v + MIN_SIGNAL_STRENGTH;
}

module.exports = function unshrinkMeasurementInformation(measurement){

    // Unshrink date
    var unshrinkedDate = moment.unix(measurement.date*60 + MIN_DATE_UNIX_TIMESTAMP);
    
    // Unshrink signal strengths
    var devices = measurement.devices.map(function (device) {
        device.signal_strength = fromByte(device.signal_strength)
        return device;
    })

    return {
        date: unshrinkedDate,
        devices: devices
    };
};

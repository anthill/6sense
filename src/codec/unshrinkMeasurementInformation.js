"use strict";

var moment = require('moment');

var MIN_DATE_UNIX_TIMESTAMP = require('./MIN_DATE_UNIX_TIMESTAMP');

var MIN_SIGNAL_STRENGTH = require('./MIN_SIGNAL_STRENGTH');

function fromByte(v){
    return v + MIN_SIGNAL_STRENGTH;
}

module.exports = function unshrinkMeasurementInformation(measurement){
    var unshinkedDate = moment.unix(measurement.date*60 + MIN_DATE_UNIX_TIMESTAMP);
    
    return {
        date: unshinkedDate,
        signal_strengths: measurement.signal_strengths.map(fromByte),
        IDs: measurement.IDs
    };
};

"use strict";

var moment = require('moment');

var MIN_DATE_UNIX_TIMESTAMP = require('./MIN_DATE_UNIX_TIMESTAMP');


var MIN_SIGNAL_STRENGTH = require('./MIN_SIGNAL_STRENGTH');
// var MAX_SIGNAL_STRENGTH = MIN_SIGNAL_STRENGTH + 255;

function toByte(v){
    return v - MIN_SIGNAL_STRENGTH;
}

/*
    
*/
module.exports = function shrinkMeasurementInformation(measurement){
    var date = moment(measurement.date);
    var secondTimestamp = date.unix();
    var recentTimestampSec = secondTimestamp - MIN_DATE_UNIX_TIMESTAMP 
    
    var recentTimestampMin = Math.floor(recentTimestampSec/60);

    var signal_strengths = measurement.signal_strengths.map(toByte);

    // if no IDs in measuremement, array filled with 0s
    var IDs =   measurement.IDs ||
                Array.apply(null, Array(signal_strengths.length)).map(function () {return 0});

    // Sort two the arrays by signal_strength
    var objs = [];
    for (var i = 0; i < measurement.signal_strengths.length; i++) {
        objs.push({
                signal_strength: signal_strengths[i],
                ID: IDs[i]})
    }
    objs.sort(function(a, b) {
        return a.signal_strength < b.signal_strength ? -1 : 1;
    })
    for (var j = 0; j < objs.length; j++) {
        signal_strengths[j] = objs[j].signal_strength;
        IDs[j] = objs[j].ID;
    }

    return {
        date: recentTimestampMin,
        signal_strengths: signal_strengths,
        IDs: IDs
    };
};

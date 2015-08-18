'use strict';

// instant mode:
// The instant mode returns the number of devices that have sent some packets since deltaTime seconds.
// If deltaTime is too small (say, 10 seconds), the output will have instable results, due to the fact
// that devices do not try to connect every single second, and then some might be lost during counting process.


// histo mode:
// The histo mode returns a list of results according to the input parameters. This list has a certain number of
// items (nbBins), separated by a certain deltaTime (binDuration). Each bin will compile all devices that have tried
// to connect during the binDuration time elapsed since previous bin.

var moment = require('moment-timezone');
var createList = require('./utils.js').createOrderedList;

module.exports = {

    instant: function(deviceMap, interval){
        console.log('Processing with instant mode');
        // get now moment ...
        var now = new Date();
        now = moment.tz(now, 'GMT');
        now.tz('Europe/Paris');

        // assign a power level list to each date
        var deviceLevels = [];

        deviceMap.forEach(function(device){
            // console.log('dif', now.format() - Date.parse(device["Last time seen"]));

            if (now - Date.parse(device["Last time seen"]) < interval * 1000)
                deviceLevels.push(device.Power);
        });

        return {
            date: now.format(),
            signal_strengths: deviceLevels
        };
    },

    histo: function(deviceMap, nbBins, binDuration){
        // get now moment ...
        var now = new Date();
        now = moment.tz(now, 'GMT');
        now.tz('Europe/Paris').format();

        var delta = nbBins * binDuration;

        // ... return to delta minutes before ...
        var before = now.clone();
        before.subtract(delta, 'm');
        before.startOf('minute');

        // ... and take all bins from there
        var dates = [before.format()];

        if (nbBins > 1){
            var bins = createList(nbBins - 1);
            bins.forEach(function(){
                dates.push(before.add(binDuration, 'm').format());
            });
        }

        // initialize maps
        var deviceLevelMap = new Map();
        dates.forEach(function(date){
            deviceLevelMap.set(date, []);
        });

        // assign a power level list to each date
        dates.forEach(function(date){

            deviceMap.forEach(function(device){

                var start = device["First time seen"];
                var end = device["Last time seen"];
                var power = device["Power"];

                if (start <= date && date < end){
                    var deviceLevels = deviceLevelMap.get(date);
                    deviceLevels.push(power);
                    deviceLevelMap.set(date, deviceLevels);
                }
            });
        });

        var outputList = [];
        // deviceLevelMap back to list before CSV write
        deviceLevelMap.forEach(function(deviceLevels, date){
            outputList.push({
                date: date,
                signal_strengths: deviceLevels
            });
        });

        return outputList;
    }
};

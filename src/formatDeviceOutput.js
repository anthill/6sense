'use strict';

var moment = require('moment-timezone');

function formatDeviceOutput(devices){

    // maybe an simple list is enough here... ?
    var deviceMap = new Map();

    // format output
    var cleanDevices = devices.map(function(device){

        var newObject = {};

        for (var field in device){
            var value = device[field];
            var newField = field.trim();
            var newValue;
            if (newField === 'First time seen' || newField === 'Last time seen'){
                var newDate = moment.tz(value, 'GMT');
                // console.log('newDate', newDate.format());
                newValue = newDate.tz('Europe/Paris').format();
                // console.log('newValue', newValue);
            }
            else if (newField === 'Power' || newField === '# packets')
                newValue = parseInt(value.trim());
            else
                newValue = value.trim();
            
            newObject[newField] = newValue;
        }

        return newObject;
    });

    // update device database
    cleanDevices.forEach(function(cleanDevice){
        deviceMap.set(cleanDevice['Station MAC'], cleanDevice);
    });

    return deviceMap;
}

module.exports = formatDeviceOutput;

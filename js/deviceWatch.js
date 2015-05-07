// maybe we could find a single CSV package, but will do for now
var csvR = require('csv-parser');
var csvW = require('fast-csv');
var split = require('split');
var through = require('through');
var moment = require('moment-timezone');

var makeMap = require('./utils.js').makeMap;

var OUTPUT_FILE = 'data/output.csv';

function writeCSVOutput(deviceMap){
    
    // get now moment ...
    var now = new Date();
    var now = moment.tz(now, 'GMT');
    now.tz('Europe/Paris').format();

    // ... return to 5 min before ...
    now.subtract(5, 'm');
    now.startOf('minute');

    // ... and take all 5 minutes from there
    var minutes = [0, 1, 2, 3];
    var dates = [now.format()];

    minutes.forEach(function(minute){
        dates.push(now.add(1, 'm').format());
    });

    // initialize map
    var deviceNumberMap = new Map();
    dates.forEach(function(date){
        deviceNumberMap.set(date, 0);
    })

    // assign device presence to dates
    deviceMap.forEach(function(device){

        var start = device["First time seen"];
        var end = device["Last time seen"];

        dates.forEach(function(date){
            if (start <= date && date < end)
                deviceNumberMap.set(date, deviceNumberMap.get(date) + 1);
        });
    });

    // deviceNumberMap.forEach(function(nb, date){
    //     console.log('nb of devices', date, nb);
    // })

    var outputList = [];
    // deviceNumberMap back to list before CSV write: 5... 4... 3... 2... 1...
    deviceNumberMap.forEach(function(nb, date){
        outputList.push({
            date: date,
            deviceNb: nb
        });
    });

    var csvStream = csvW.format({headers: false}),
        writableStream = fs.createWriteStream(OUTPUT_FILE);
     
    csvStream.pipe(writableStream);

    outputList.forEach(function(input){
        csvStream.write(input);
    });

    csvStream.end();
}

function formatOutput(devices){

    var deviceMap = new Map();

    // format output
    var cleanedDevices = devices.map(function(device){

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
    // console.log('nb devices watched', cleanedDevices.length);

    // update device database
    cleanedDevices.forEach(function(cleanDevice){
        deviceMap.set(cleanDevice['Station MAC'], cleanDevice);
    });

    return deviceMap;
}

function readCSVInput(file){
    var process = false;

    var devices = [];

    fs.createReadStream(file)
    .pipe(split())
    .pipe(through(function(line){
        // Only consider second part of the original CSV file, the one that starts with 'Station MAC'
        if (line.match(/^Station/) || process === true){
            if (line.match(/^$/))
                process = false;
            else {
                this.queue(line + '\n');
                process = true;
            }
        }
    }))
    .pipe(csvR())
    .on('data', function(data){
        devices.push(data);
    })
    .on('end', function(data){
        var deviceMap = formatOutput(devices);
        writeCSVOutput(deviceMap);
    });    
}

module.exports = function(file){
    readCSVInput(file);
}

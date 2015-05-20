// maybe we could find a single CSV package, but will do for now
var EventEmitter = require("events").EventEmitter;
var csvR = require('csv-parser');
// var csvW = require('fast-csv');
var split = require('split');
var through = require('through');
var moment = require('moment-timezone');

var makeMap = require('./utils.js').makeMap;

// var OUTPUT_FILE = 'data/output.csv';

var shouldProcessFile = true;

function sortResults(deviceMap){

    // get now moment ...
    var now = new Date();
    var now = moment.tz(now, 'GMT');
    now.tz('Europe/Paris').format();

    // ... return to 5 min before ...
    var before = now.clone();
    before.subtract(8, 'm'); // skipping current minute by taking 5 minutes from 8 minutes ago
    before.startOf('minute');

    // ... and take all 5 minutes from there
    var minutes = [0];
    var dates = [before.format()];

    minutes.forEach(function(minute){
        dates.push(before.add(1, 'm').format());
    });

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

    // deviceLevelMap.forEach(function(nb, date){
    //     console.log('nb of devices', date, nb);
    // })

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

// function writeCSVOutput(outputList){

//     return new Promise(function(resolve, reject){

//         var csvStream = csvW.format({headers: false}),
//         writableStream = fs.createWriteStream(OUTPUT_FILE);

//         writableStream.on("finish", function(){
//             console.log('Updated output.csv');
//             resolve();
//         });

//         csvStream.pipe(writableStream);

//         outputList.forEach(function(input){
//             csvStream.write(input);
//         });

//         csvStream.end();

//     });
// }

function formatOutput(devices){

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

function readCSVInput(file){

    return new Promise(function(resolve, reject){
        var shouldProcessLine = false;

        var devices = [];

        fs.createReadStream(file)
        .pipe(split())
        .pipe(through(function(line){
            // Only consider second part of the original CSV file, the one that starts with 'Station MAC'
            if (line.match(/^Station/) || shouldProcessLine === true){
                if (line.match(/^$/))
                    shouldProcessLine = false;
                else {
                    this.queue(line + '\n');
                    shouldProcessLine = true;
                }
            }
        }))
        .pipe(csvR())
        .on('data', function(data){
            devices.push(data);
        })
        .on('end', function(data){
            resolve(devices);
        }); 
    });
       
}

var ee = new EventEmitter();

module.exports = {
    emitter: ee,

    parser: function(file){
    
        // we process the file only if the previous process has finished. This is to avoid overwatching
        if (shouldProcessFile){
            shouldProcessFile = false;

            console.log('Processing file... ', new Date());

            setTimeout(function(){ // smoothing timings
                readCSVInput(file)
                .then(function(devices){
                    var deviceMap = formatOutput(devices);
                    var results = sortResults(deviceMap);
                    // 1°) if you want to write a CSV output
                    // writeCSVOutput(results)
                    // .then(function(){
                    //     shouldProcessFile = true;
                    // });

                    // 2°) if you want to emit an event
                    ee.emit('results', results);
                    shouldProcessFile = true;
                });
            }, 500);
        }
    }
     
};

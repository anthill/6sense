// maybe we could find a single CSV package, but will do for now
var csvR = require('csv-parser');
var csvW = require('fast-csv');
var split = require('split');
var through = require('through');
var moment = require('moment-timezone');

var makeMap = require('./utils.js').makeMap;

var OUTPUT_FILE = 'data/output.csv';

var shouldProcessFile = true;

// WARNING: these power level values depend on the driver...
var powerLevels = [-80, -60, -50, -1]

function writeCSVOutput(deviceMap){

    return new Promise(function(resolve, reject){
        // get now moment ...
        var now = new Date();
        var now = moment.tz(now, 'GMT');
        now.tz('Europe/Paris').format();

        // ... return to 5 min before ...
        var before = now.clone();
        before.subtract(6, 'm'); // skipping current minute by taking 5 minutes from 6 minutes ago
        before.startOf('minute');

        // ... and take all 5 minutes from there
        var minutes = [0, 1, 2, 3];
        var dates = [before.format()];

        minutes.forEach(function(minute){
            dates.push(before.add(1, 'm').format());
        });

        // initialize maps
        var deviceNumberMap = new Map();
        dates.forEach(function(date){
            var devicePowerMap = new Map();

            powerLevels.forEach(function(level){
                devicePowerMap.set(level, 0)
            });
            devicePowerMap.set('none', 0); // -1 case
            devicePowerMap.set('total', 0); // total

            deviceNumberMap.set(date, devicePowerMap);
        })

        // assign device presence to dates
        deviceMap.forEach(function(device){

            var start = device["First time seen"];
            var end = device["Last time seen"];
            var power = device["Power"];

            dates.forEach(function(date){
                if (start <= date && date < end){
                    var devicePowerMap = deviceNumberMap.get(date);

                    if (power === -1)
                        devicePowerMap.set('none', devicePowerMap.get('none') + 1);
                    else {
                        for (var i = 0; i < powerLevels.length; i++){
                            var level = powerLevels[i];
                            if (power < level){
                                devicePowerMap.set(level, devicePowerMap.get(level) + 1);
                                break;
                            }    
                        }
                    }

                    devicePowerMap.set('total', devicePowerMap.get('total') + 1);

                    deviceNumberMap.set(date, devicePowerMap);
                }
                    
            });
        });

        // deviceNumberMap.forEach(function(nb, date){
        //     console.log('nb of devices', date, nb);
        // })

        var outputList = [];
        // deviceNumberMap back to list before CSV write: 5... 4... 3... 2... 1...
        deviceNumberMap.forEach(function(devicePowerMap, date){
            var obj = {date: date};

            devicePowerMap.forEach(function(nb, level){
                obj[level] = nb;
            });

            console.log('obj', obj);
            outputList.push(obj);
            
        });

        var csvStream = csvW.format({headers: false}),
            writableStream = fs.createWriteStream(OUTPUT_FILE);

        writableStream.on("finish", function(){
            console.log('Updated output.csv');
            resolve();
        });

        csvStream.pipe(writableStream);

        outputList.forEach(function(input){
            csvStream.write(input);
        });

        csvStream.end();
    });
    
    
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
            var deviceMap = formatOutput(devices);
            writeCSVOutput(deviceMap)
            .then(function(){
                resolve();
            });
        }); 
    });
       
}

module.exports = function(file){
    
    // we process the file only if the previous process has finished. This is to avoid overwatching
    if (shouldProcessFile){
        shouldProcessFile = false;

        console.log('Processing file... ', new Date());

        setTimeout(function(){ // smoothing timings
            readCSVInput(file)
            .then(function(){
                shouldProcessFile = true;
            });
        }, 500);
    }
     
};

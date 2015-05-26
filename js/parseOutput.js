'use strict';

// maybe we could find a single CSV package, but will do for now
var EventEmitter = require("events").EventEmitter;

var instantMode = require('./modes.js').instant;
var readCSVInput = require('./readCSVInput.js');
var formatDeviceOutput = require('./formatDeviceOutput.js');
var writeCSVOutput = require('./writeCSVOutput.js');

// var OUTPUT_FILE = 'data/output.csv';

var shouldProcessFile = true;

var ee = new EventEmitter();

module.exports = {
    emitter: ee,

    parser: function(file, interval){
    
        // we process the file only if the previous process has finished. This is to avoid overwatching
        if (shouldProcessFile){
            shouldProcessFile = false;

            setTimeout(function(){ // smoothing timings
                readCSVInput(file)
                .then(function(devices){
                    var deviceMap = formatDeviceOutput(devices);
                    var result = instantMode(deviceMap, interval);
                    // 1°) if you want to write a CSV output
                    // writeCSVOutput(results)
                    // .then(function(){
                    //     shouldProcessFile = true;
                    // });

                    // 2°) if you want to emit an event
                    ee.emit('processed', result);
                    shouldProcessFile = true;
                });
            }, 500);
        }
    }
     
};

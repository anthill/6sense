'use strict';

var csv = require('csv-parser');
var split = require('split');
var through = require('through');

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
        .pipe(csv())
        .on('data', function(data){
            devices.push(data);
        })
        .on('end', function(data){
            resolve(devices);
        }); 
    });
       
}

module.exports = readCSVInput;
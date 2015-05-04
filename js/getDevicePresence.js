'use strict';

var csv = require('fast-csv');
var split = require('split');
var fs = require('fs');
var watch = require('node-watch');

var INPUT_FILE = './output.csv';
var OUTPUT_FILE = './history.csv';


function readCSVInput(file){

    var process = false;

    var latestDevices = [];

    console.log('start');

    fs.createReadStream(file)
    .pipe(split())
    .on('data', function(data){

        if (data.length !== 0){
            fs.appendFile(OUTPUT_FILE, data + '\n', function (err) {
                if (err) throw err;
                console.log('The "data to append" was appended to file!');
            });
        }
        
    })
    .on('end', function(data){
        console.log('CSV read');
    });    
}

// readCSVInput(INPUT_FILE);

watch(INPUT_FILE, function(file){
    readCSVInput(file);
});

// module.exports = function(){
//     watch(INPUT_FILE, function(file){
//         readCSVInput(file);
//     });
// };
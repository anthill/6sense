'use strict';

var csv = require('fast-csv');
var split = require('split');
var fs = require('fs');

var INPUT_FILE = '../output.csv';
var OUTPUT_FILE = '../history.csv';


var shouldProcessFile = true;

function readCSVInput(file){

    console.log('start');

    fs.createReadStream(file)
    // .pipe(split())
    .on('data', function(data){
        if (data.length !== 0){
            fs.appendFile(OUTPUT_FILE, data + '\n', function (err) {
                if (err) throw err;
                console.log('The "data to append" was appended to file!');
            });
        }
        
    })
    .on('error', function(err){
        console.log('ERROR', err.stack);
    })
    .on('end', function(data){
        console.log('CSV read');
        shouldProcessFile = true;
    });    
}

setInterval(function(){
    readCSVInput(INPUT_FILE);
}, 300000);


// fs.watch(INPUT_FILE, function(file){
//     console.log('hey');
//     readCSVInput(file);
// });

// module.exports = function(){
//     watch(INPUT_FILE, function(file){
//         readCSVInput(file);
//     });
// };
'use strict';

var fs = require('fs');
var csv = require('fast-csv');

var OUTPUT_FILE = './output.csv';

function writeCSVOutput(outputList){

    return new Promise(function(resolve, reject){

        var csvStream = csv.format({headers: false}),
        writableStream = fs.createWriteStream(OUTPUT_FILE);

        writableStream.on("finish", function(){
            console.log('Updated output.csv');
            resolve();
        });

        writableStream.on("error", reject);

        csvStream.pipe(writableStream);

        outputList.forEach(function(input){
            csvStream.write(input);
        });

        csvStream.end();

    });
}

module.exports = writeCSVOutput;

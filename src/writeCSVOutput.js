'use strict';

var csv = require('fast-csv');

function writeCSVOutput(outputList){

    return new Promise(function(resolve, reject){

        var csvStream = csv.format({headers: false}),
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

module.exports = writeCSVOutput;
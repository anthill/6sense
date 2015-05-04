"use strict";

var csv = require('fast-csv');
var fs = require('fs');

var csvStream = csv.format({headers: true}),
    writableStream = fs.createWriteStream("output.csv");
 
var inputs = require('./devices.json');

 
csvStream.pipe(writableStream);

inputs.forEach(function(input){
	csvStream.write(input);
});

csvStream.end();
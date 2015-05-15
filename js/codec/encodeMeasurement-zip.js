"use strict";

var zlib = require('zlib');

module.exports = function(measurements){    
    var input = new Buffer(JSON.stringify(measurements));
    return new Promise(function(resolve, reject){
        zlib.deflate(input, function(err, buffer){
            if(err) reject(err); else resolve(buffer);
        });
    });
}


"use strict";

/*
	buffer
	returns an array of integers [0, 255]
*/

var HIGH_MASK = 0xF0;
var LOW_MASK = 0x0F;

module.exports = function(buffer){
	var arr = [];
	var previousValue;


	Array.prototype.forEach.call(buffer, function(byte){
		if(previousValue === undefined){
			arr.push(byte);
			previousValue = byte;
		}
		else{
			var highDelta = (byte & HIGH_MASK) >> 4;
			if(highDelta === 0x0F){ // escape value
				previousValue = undefined;
				return;
			}
			else{
				var v = previousValue + highDelta;
				arr.push(v);
				previousValue = v;
			}

			var lowDelta = (byte & LOW_MASK);
			if(lowDelta === 0x0F){ // escape value
				previousValue = undefined;
				return;
			}
			else{
				var val = previousValue + lowDelta;
				arr.push(val);
				previousValue = val;
			}
		}

	});

	return arr;
}

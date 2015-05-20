'use strict';

var EventEmitter = require("events").EventEmitter;

var encodeForSMS = require('./js/codec/encodeForSMS.js');

var sense = require('./index.js');

var emitter = new EventEmitter();

sense.record();

sense.on('results', function(results){
	console.log('ready to send SMS');
	console.log('results', results);

	// var sms = encodeForSMS(results);

});

module.exports = sense;
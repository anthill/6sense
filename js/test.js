'use strict';

var EventEmitter = require("events").EventEmitter;

var encodeForSMS = require('./js/codec/encodeForSMS.js');

var fsm = require('./finiteStateMachine.js');

var emitter = new EventEmitter();

fsm.record();

fsm.on('results', function(results){
	console.log('ready to send SMS');
	console.log('results', results);

	// var sms = encodeForSMS(results);

});

module.exports = fsm;
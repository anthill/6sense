"use strict";
require('es6-shim')

var bluetooth = require('./index.js')
var exec = require('child_process').exec;
var path = require('path');


var BLUETOOTH_SCRIPT = path.resolve(__dirname, './initBluetooth.sh');

bluetooth.on('processed', function(measurement) {
	console.log('new measurement :', measurement);
});

bluetooth.on('transition', function (info) {
	if (info.toState === "initialized") {
		bluetooth.handle('record', 10);		
	}
})

exec('sh ' + BLUETOOTH_SCRIPT, function () {
	bluetooth.handle('initialize')
});

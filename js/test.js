'use strict';

var sense = require('./index.js');

sense.record(60);

sense.on('processed', function(result){
	console.log('date: ', result.date, ', nb: ', result.signal_strengths.length);
});

module.exports = sense;
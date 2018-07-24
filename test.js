var dongle = require('./src/index'); 

// start recording and gather results every 60 seconds
dongle.record(60);

dongle.on('processed', function(result){
	console.log(JSON.stringify(result));
});

dongle.on('trajectories', function(result){
	console.log(JSON.stringify(result));
});
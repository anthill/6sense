var dongle = require('./src/index')(); 

dongle.trackAddress("C4:61:8B:C0:89:A2")

// start recording and gather results every 60 seconds
dongle.record(20);

dongle.on('processed', function(result){
	console.log(JSON.stringify(result));
});

dongle.on('macDetected', function(result){
	console.log(JSON.stringify(result));
});


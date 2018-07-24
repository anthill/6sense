# 6sense

This is sub project of 6element. The purpose is to count the number of devices around the sensor using their connection attempts. No need for the device to be connected, we just detect the packets emitted for network detection.

This software was designed with privacy in mind, as only a list of signal levels and an untraceable id that change everyday can be outputed.

## How to install

```
npm install 6sense
```

The prerequisit is to have

* [iw](http://wireless.kernel.org/en/users/Documentation/iw)

* [tcpdump](http://www.tcpdump.org/)

* A wifi interface with monitoring capability.


## Quick start

Each part of `6sense` is basically a finite state machine interfacing the dongle.

### wifi specific

```javascript
var dongle = require('6sense'); 

// start recording and gather results every 60 seconds
dongle.record(60);

dongle.on('processed', function(result){
	console.log(JSON.stringify(result));
});

dongle.on('trajectories', function(result){
	console.log(JSON.stringify(result));
});
```

Here are the main functions:

```js
dongle.wakeUp()  // from 'sleeping' to 'monitoring'
dongle.sleep();  // from 'monitoring' or 'recording' back to 'sleeping'
dongle.record(300); // from 'sleeping' or 'monitoring' to 'recording'
dongle.pause();  // from 'recording' to 'monitoring'
dongle.changeAllDayConfig({
	max_last_seen: 5 * 60 * 1000, // ms
	signal_precision: 5, // dB
	date_precision: 30 * 1000 // ms
}); // Change the config for the all-day measurement map
```

## Licence

MIT




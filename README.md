# 6sense

This is sub project of 6element. The purpose is to count the number of devices around the sensor using their connection attempts. No need for the device to be connected, we just detect the packets emitted for network detection.

It's composed of two parts, each corresponding with one type of signal: **wifi** and **bluetooth**.

This software was designed with privacy in mind, as only a list of signal levels and an untraceable id that change everyday can be outputed.

## How to install

```
npm install 6sense
```

### wifi specific

The prerequisit is to have

* [iw](http://wireless.kernel.org/en/users/Documentation/iw)

* [tcpdump](http://www.tcpdump.org/)

* A wifi interface with monitoring capability.

### bluetooth specific

The prerequisit is to have [bluetoothctl](https://wiki.archlinux.org/index.php/Bluetooth#Bluetoothctl) or anything that can power on your bluetooth device and a script to start it.

Put your script in src/bluetooth/initBluetooth.sh

**If your dongle is powered on without any script, this part is not necessary.**


## Quick start

Each part of `6sense` is basically a finite state machine interfacing the dongle.

### wifi specific

```javascript
var dongle = require('6sense').wifi(); 

// start recording and gather results every 60 seconds
dongle.record(60);

dongle.on('processed', function(result){
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

### bluetooth specific

```javascript
var dongle = require('6sense').bluetooth();

// Here, power on your bluetooth device

// start recording and gather results every 60 seconds
dongle.record(60);

dongle.on('processed', function(result) {
	console.log(JSON.stringify(result));
})
```

Here are the main functions:

```js
dongle.initialize() // from 'uninitialized' to 'initialized' (it's started automatically)
dongle.record(300) // from 'initialized' to 'recording'
dongle.pause() // from 'recording' to 'initialized'
dongle.resume() // from 'initialized' to 'recording'
dongle.stop() // from 'recording' to 'initialized'
```

## Licence

MIT




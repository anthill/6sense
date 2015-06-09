# 6sense

This is sub project of 6element. The purpose is to count the number of devices around the sensor using their connection attempts. No need for the device to be connected, we just detect the packets emitted for network detection.

This software was designed with privacy in mind, as only a list of signal levels can be outputed.

### Install

The prerequisit is to have [airodump-ng](http://www.aircrack-ng.org/install.html) installed on your system. You also need a wifi device with monitoring capability. Then:

```
npm install 6sense
```

### Quick start

`6sense` is basically a finite state machine interfacing the wifi dongle. We assume that your wlan car is located at `wlan0`.

```javascript
var dongle = require('6sense'); 

// start recording and gather results every 60 seconds
dongle.record(60);

dongle.on('processed', function(result){
    console.log('date: ', result.date, ', signals: ', result.signal_strengths);
});
```

Here are the main functions:

```
dongle.wakeUp()  // from 'sleeping' to 'monitoring'
dongle.sleep();  // from 'monitoring' or 'recording' back to 'sleeping'
dongle.record(300); // from 'sleeping' or 'monitoring' to 'recording'
dongle.pause();  // from 'recording' to 'monitoring'
```

### Licence

MIT




# 6sense

This is sub project of 6element. The purpose is to count the number of devices around the sensor using their connection attempts.

**Initialize project**

```bash
npm run prepare
npm install
```

**Launch Monitoring**

```bash
sudo node
```

Then, in node console, start a finite state machine:
```
var my6sense = require('./js/index.js'); 
// or require('6sense') if you installed the package


my6sense.on('processed', function(result){
    console.log('date: ', result.date, ', nb: ', result.signal_strengths.length);
});
```

API is:
```
my6sense.wakeUp()  // from 'sleeping' to 'monitoring'
my6sense.sleep();  // from 'monitoring' or 'recording' back to 'sleeping'
my6sense.record(300); // from 'sleeping' or 'monitoring' to 'recording'
my6sense.pause();  // from 'recording' to 'monitoring'
```





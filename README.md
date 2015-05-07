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
var fsm = require('./js/finiteStateMachine.js');
```

API is:
```
fsm.wakeUp();
fsm.goToSleep();
fsm.record();
fsm.pause();
```





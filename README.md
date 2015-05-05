# 6sense

This is sub project of 6element. The purpose is to count the number of devices around the sensor using their connection attempts.

**Initialize project**

```bash
npm run prepare
npm install
```

**Launch Monitoring**
```bash
npm run monitor
```
This monitors all devices and updates ```data/report-01.csv```.
You can change the update rate in ```runMonitoring.sh``` at ```write-interval```(in seconds).

**Write outputs**
This part is WIP.

```bash
node js/deviceWatch.js
```
This starts a watcher on ```data/report-01.csv```, and updates ```data/output.csv```.
```data/output.csv``` is replaced at each refresh.

```bash
node js/n.js
```
This starts a watcher on ```data/output.csv``` and updates ```data/history.csv```.
Additionnal data is appended to ```data/history.csv``` at each refresh.
Might not be super effective for now.


Nothing more to add for now.

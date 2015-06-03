'use strict';
require('es6-shim');

var fs = require('fs');
var machina = require('machina');
var spawn = require('child_process').spawn;
var fork = require('child_process').fork;

var parser = require('./parseOutput.js').parser;
var emitter = require('./parseOutput.js').emitter;

var QUERY_TIMEOUT = 10*1000*2;

function enterMonitorMode(myInterface){
    // this spawns the AIRMON-NG START process whose purpose is to set the wifi card in monitor mode
    // it is a one-shot process, that stops right after success
    return new Promise(function(resolve, reject){
        console.log('Activating Monitor mode... ' + myInterface);
        var myProcess = spawn("airmon-ng", ["start", myInterface]);

        // on success, resolve Promise
        myProcess.stdout.on("data", function(chunkBuffer){
            // check chunk buffer for final line output and then enter
            var message = chunkBuffer.toString();
            if (message.match(/monitor mode vif enabled/))
                resolve(myProcess.pid);
        });

        // on error, reject Promise
        myProcess.stderr.on("data", function(chunkBuffer){
            var message = chunkBuffer.toString();
            console.log("Error => " + message);
            reject(new Error("Entering monitor mode => " + message));
        });

        // on timeout, reject Promise 
        setTimeout(function(){
            reject(new Error("Entering monitor mode => Timeout"));
        }, QUERY_TIMEOUT);
    });
}

function exitMonitorMode(myInterface){
    // this spawns the AIRMON-NG STOP process, whose purpose is to set the wifi card in normal mode
    // it is a one-shot process, that stops right after success
    return new Promise(function(resolve, reject){
        console.log("Deactivating Monitor mode... " + myInterface);
        var myProcess = spawn("airmon-ng", ["stop", myInterface + "mon"]);

        // on success, resolve Promise
        myProcess.stdout.on("data", function(chunkBuffer){
            var message = chunkBuffer.toString();
            // console.log("Data => " + message);
            if (message.match(/monitor mode vif disabled/))
                resolve(myProcess.pid);
        });

        // on error, reject Promise
        myProcess.stderr.on("data", function(chunkBuffer){
            var message = chunkBuffer.toString();
            console.log("Error => " + message);
            reject(new Error("Exiting monitor mode => " + message));
        });

        // on timeout, reject Promise 
        setTimeout(function(){
            reject(new Error("Exiting monitor mode => Timeout"));
        }, QUERY_TIMEOUT);
    });
}



function startRecording(optObj){
    /*  
        This starts a recording process which is composed of two steps:
        1°) spawns AIRODUMP-NG with optObj options. This will write a dump file reporting devices that are trying to access wifi
        2°) spawns a node process that watches the dump file and formats it into a correct output.
        Both will need to be killed.
    */

    console.log('Starting recording process...');

    optObj['--write'] += 'report'; // path to airodump output file
    var file = optObj['--write'] + '-01.csv'; // path to airodump output file
    var options = [];

    for (var field in optObj){
        if (field !== 'interface'){
            options.push(field);
            options.push(optObj[field]);
        } else
            options.push(optObj[field] + 'mon');   
    }

    console.log('options list', options);

    // spawning airodump process
    return new Promise(function(resolve, reject){
        console.log('Starting airodump process');
        var airodumpProcess = spawn("airodump-ng", options);
        console.log("airodumpProcess: ", airodumpProcess.pid);

        // on error, resolve Promise => weird, but ok
        airodumpProcess.stderr.on("data", function(chunkBuffer){
            resolve({
                file: file,
                airodumpProcess: airodumpProcess
            });
        });

        // on timeout, reject Promise
        setTimeout(function(){
            reject(new Error("airodump Error => Timeout"));
        }, QUERY_TIMEOUT);
    });
}

function stopRecording(process){

    console.log('Stopping process...');

    return new Promise(function(resolve, reject){
        console.log('killing process id', process.pid);
        process.kill();
        process.on('exit', function(code){
            console.log('Process killed');
            resolve(code);
        });
    })
}

var fsm = new machina.Fsm({

    initialize: function(){
        // None for now...
    },

    initialState: "sleeping",

    myInterface: null,
    process: null,
    file: null,
    watcher: null,
    interval: null,

    states: {
        "sleeping": {
            
            _onEnter: function() {
                console.log('ZZZzzzZZZzzz... ', this.state, ' ...ZZZzzzZZZzzz');
            },

            wakeUp: function(){
                var self = this;
                this.myInterface = 'wlan0';

                enterMonitorMode(this.myInterface)
                .then(function(){
                    console.log('OK all good !');
                    self.transition('monitoring');
                })
                .catch(function(err){ // if error, what about deferUntilTransition ? still pending ??
                    console.log('err', err, err.stack);
                    console.log('Couldn\'t enter Monitor mode... Going back to sleep.');
                    exitMonitorMode();
                });
            },

            record: function(options){
                this.deferUntilTransition(options);
                this.handle('wakeUp');
            },

            _onExit: function(){
                console.log('Exiting sleeping state');
            }

        },

        "monitoring": {
            
            _onEnter: function(){
                console.log('============== ' + this.state + ' ==============');
            },
                        
            tryToSleep: function(){
                var self = this;

                exitMonitorMode(self.myInterface)
                .then(function(){
                    console.log('Monitor mode deactivated');
                    self.myInterface = null;
                    self.transition('sleeping');
                })
                .catch(function(err){
                    console.log('err', err, err.stack);
                    console.log('Couldn\'t exit Monitor mode, still monitoring');
                });
            },
            
            record: function(options){
                var self = this;

                options.interface = this.myInterface;

                this.interval = options['--write-interval'];

                startRecording(options)
                .then(function(results){
                    self.file = results.file;
                    self.process = results.airodumpProcess;
                    self.transition('recording');
                })
                .catch(function(err){
                    console.log('err', err, err.stack);
                    console.log('Couldn\'t enter Recording mode, still monitoring')
                });
            },
            
            _onExit: function(){
                console.log('Exiting monitoring state');
            }
        },

        "recording": {
            
            _onEnter: function(interval){
                var self = this;
                console.log('************** ' + this.state + ' **************');
                try {
                    fs.unlink("./data/report-01.csv");
                }
                console.log('Checking ',  this.file);
                console.log('interval ',  this.interval);

                if (this.file){
                    console.log('Watching ' + this.file);

                    emitter.on('processed', function(results){
                        self.emit('processed', results);
                    });

                    setTimeout(function(){ // smoothing timings
                        self.watcher = fs.watch(self.file, function(){
                            parser(self.file, self.interval);                
                        });   
                    }, 1000);
                }
                else{
                    console.log('Couldn\'t find the file to be watched');
                    self.transition('monitoring'); 
                }
                         
            },
            
            tryToSleep: function(){
                this.deferUntilTransition();
                this.handle('pause');
            },

            pause: function(){
                var self = this;

                console.log('pausing', this.process.pid);
                stopRecording(this.process)
                .then(function(){
                    console.log('Stopping the file watch');
                    self.watcher.close();
                    self.transition('monitoring');
                })
                .catch(function(err){
                    console.log('err', err, err.stack);
                    console.log('Couldn\'t exit Recording mode, still monitoring');
                });
            },
            
            _onExit: function(){
                var self = this;

                emitter.removeAllListeners('results');

                fs.unlink("./data/report-01.csv");

                setTimeout(function(){ // smoothing timings
                    spawn('rm', ['-fr', self.file]);
                    this.file = null;
                    this.processes = null;
                    this.watcher = null;
                    this.interval = null;
                }, 500);
                console.log('Exiting recording state');
            }
        }
    },

    wakeUp: function(){
        this.handle('wakeUp');
    },

    sleep: function(){
        this.handle('tryToSleep');
    },

    // This is in case you need to call RECORD with arguments. Not using it since it's not practical
        
    /*record: function(format, refreshTime, path, myInterface){

        var options = {
            '--output-format': format,
            '--write-interval': refreshTime,
            '--write': path,
            'interface': myInterface
        };
    */

    record: function(interval){

        var options = {
            '--output-format': 'csv',
            '--write-interval': interval,
            '--write': './data/'
        };

        this.handle('record', options);
    },

    pause: function(){
        this.handle('pause')
    }
});

module.exports = fsm;
'use strict';
require('es6-shim');

var machina = require('machina');
var spawn = require('child_process').spawn;

var deviceWatchPath = require.resolve('./deviceWatch.js');

var QUERY_TIMEOUT = 10*1000;

function enterMonitorMode(){
    // this spawns the AIRMON-NG START process whose purpose is to set the wifi card in monitor mode
    // it is a one-shot process, that stops right after success
    return new Promise(function(resolve, reject){
        var myProcess = spawn("airmon-ng", ["start", "wlan0"]);
        console.log("myProcess: ", myProcess.pid, "nodeProcess: ", process.pid);

        // on success, resolve Promise
        myProcess.stdout.on("data", function(chunkBuffer){
            // check chunk buffer for final line outoput and then enter
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
            console.log('Error => Timeout');
            reject(new Error("Entering monitor mode => Timeout"));
        }, QUERY_TIMEOUT);
    });
}

function exitMonitorMode(){
    // this spawns the AIRMON-NG STOP process, whose purpose is to set the wifi card in normal mode
    // it is a one-shot process, that stops right after success
    return new Promise(function(resolve, reject){
        console.log("Deactivating Monitor mode...");
        var myProcess = spawn("airmon-ng", ["stop", "wlan0mon"]);

        // on success, resolve Promise
        myProcess.stdout.on("data", function(chunkBuffer){
            resolve();
        });

        // on error, reject Promise
        myProcess.stderr.on("data", function(chunkBuffer){
            var message = chunkBuffer.toString();
            console.log("Error => " + message);
            reject(new Error("Exiting monitor mode => " + message));
        });

        // on timeout, reject Promise 
        setTimeout(function(){
            console.log('Error => Time out');
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

    var file = optObj['--write'] + 'report-01.csv'; // path to airodump output file
    var options = [];

    for (var field in optObj){
        if (field !== 'interface'){
            options.push(field);
            options.push(optObj[field]);
        } else
            options.push(optObj[field]);   
    }

    console.log('options list', options);

    // spawning airodump process
    return new Promise(function(resolve, reject){
        var airodumpProcess = spawn("airodump-ng", options);
        console.log("airodumpProcess: ", airodumpProcess.pid);

        // on success, resolve Promise with process references
        airodumpProcess.stdout.on("data", function(chunkBuffer){
            resolve(airodumpProcess);
        });

        // on error, reject Promise
        airodumpProcess.stderr.on("data", function(chunkBuffer){
            var message = chunkBuffer.toString();
            console.log("airodump Error => " + message);
            reject((new Error("airodump Error => " + message));
        });

        // on timeout, reject Promise
        setTimeout(function(){
            console.log('airodump Error => Timeout');
            reject(new Error("airodump Error => Timeout"));
        }, QUERY_TIMEOUT);
    })
    // spawning deviceWatch process
    .then(function(airodumpProcess){
        var deviceWatchProcess = spawn(deviceWatchPath, [file]);
        console.log("deviceWatchProcess: ", deviceWatchProcess.pid);

        // on success, resolve Promise with both process references
        deviceWatchProcess.stdout.on("data", function(chunkBuffer){
            resolve({
                file: file,
                processes: [airodumpProcess, deviceWatchProcess]
            });
        });

        // on error, reject Promise and kill airodump process
        deviceWatchProcess.stderr.on("data", function(chunkBuffer){
            var message = chunkBuffer.toString();
            console.log("deviceWatch Error => " + message);

            airodumpProcess.kill();
            airodumpProcess.on('exit', function(){
                reject(new Error("deviceWatch Error => " + message));
            });
            
        });

        // on timeout, reject Promise and kill airodump process
        setTimeout(function(){
            console.log('deviceWatch Error => Timeout');

            airodumpProcess.kill();
            airodumpProcess.on('exit', function(){
                reject(new Error("deviceWatch Error => Timeout"));
            });
        }, QUERY_TIMEOUT);
    });
}

function stopRecording(processes){

    var areExitedP = processes.map(function(process){

        return new Promise(function(resolve, reject){
            console.log('killing process id', pid);
            process.kill();
            process.on('exit', function(code){
                console.log('Process killed', )
                resolve(code);
            });
        })
    });

    return Promise.all(areExitedP);
}

var fsm = new machina.Fsm({

    initialize: function(){
        // None for now...
    },

    initialState: "sleeping",

    states: {
        "sleeping": {
            
            _onEnter: function() {
                console.log('ZZZzzzZZZzzz...')
            },

            wakeUp: function(){
                enterMonitorMode()
                .then(function(){
                    console.log('OK all good !');
                    this.transition('monitoring');
                })
                .catch(function(err){ // if error, what about deferUntilTransition ? still pending ??
                    console.log('Couldn\'t enter Monitor mode... Going back to sleep.');
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
                console.log('Entering monitoring state');
            },
                        
            tryToSleep: function(){
                exitMonitorMode()
                .then(function(){
                    console.log('Monitor mode deactivated');
                    this.transition('sleeping');
                })
                .catch(function(err){
                    console.log('Couldn\'t exit Monitor mode, still monitoring');
                });
            },
            
            record: function(options){

                startRecording(options)
                .then(function(results){
                    this.transition('recording', results);
                })
                .catch(function(){
                    console.log('Couldn\'t enter Recording mode, still monitoring')
                });
            },
            
            _onExit: function(){
                console.lob('Exiting monitoring state');
            }
        },

        "recording": {

            runningProcesses: [],
            file: null,
            
            _onEnter: function(results){
                this.file = results.file;
                this.runningProcesses = results.processes;
                
                console.log('Entering recording state');
                console.log('process ids', processes[0].id, processes[1].id);
            },
            
            tryToSleep: function(){
                this.deferUntilTransition();
                stopRecording(this.airodumpPid, this.recordPid)
                .then(function(){
                    this.transition('monitoring');
                });
            },

            pause: function(){
                stopRecording(this.runningProcesses)
                .then(function(codes){
                    this.transition('monitoring');
                });
            },
            
            _onExit: function(){
                spawn('rm', ['-fr', this.file]);
                this.file = null;
                this.runningProcesses = [];

                console.log('Exiting recording state');
            }
        }
    },

    wakeUp: function(){
        this.handle('wakeUp');
    },

    goToSleep: function(){
        this.handle('tryToSleep');
    },

    record: function(format, refreshTime, path, interface){

        var options = {
            '--output-format': format,
            '--berlin': refreshTime,
            '--write-interval': refreshTime,
            '--write': path,
            'interface': interface
        };

        this.handle('record', options);
    },

    pause: function(){
        this.handle('pause')
    }


});
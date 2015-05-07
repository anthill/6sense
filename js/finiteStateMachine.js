'use strict';
require('es6-shim');

var fs = require('fs');
var machina = require('machina');
var spawn = require('child_process').spawn;
var fork = require('child_process').fork;

var deviceWatch = require('./deviceWatch.js');

var QUERY_TIMEOUT = 10*1000*2;

function enterMonitorMode(){
    // this spawns the AIRMON-NG START process whose purpose is to set the wifi card in monitor mode
    // it is a one-shot process, that stops right after success
    return new Promise(function(resolve, reject){
        console.log('Activating Monitor mode...');
        var myProcess = spawn("airmon-ng", ["start", "wlan0"]);

        // on success, resolve Promise
        myProcess.stdout.on("data", function(chunkBuffer){
            // check chunk buffer for final line outoput and then enter
            var message = chunkBuffer.toString();
            // console.log("stdout => " + message.trim());
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

function exitMonitorMode(){
    // this spawns the AIRMON-NG STOP process, whose purpose is to set the wifi card in normal mode
    // it is a one-shot process, that stops right after success
    return new Promise(function(resolve, reject){
        console.log("Deactivating Monitor mode...");
        var myProcess = spawn("airmon-ng", ["stop", "wlan0mon"]);

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

    // console.log('file', file);

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
        console.log('Starting airodump process');
        var airodumpProcess = spawn("airodump-ng", options);
        console.log("airodumpProcess: ", airodumpProcess.pid);

        // // on success, resolve Promise with process references
        // airodumpProcess.stdout.on("data", function(chunkBuffer){
        //     var message = chunkBuffer.toString();
        //     console.log("airodump data => " + message);
        //     resolve(airodumpProcess);
        // });

        // on error, reject Promise
        airodumpProcess.stderr.on("data", function(chunkBuffer){
            // var message = chunkBuffer.toString();
            // console.log("airodump Error => " + message);

            resolve({
                file: file,
                airodumpProcess: airodumpProcess
            });
            // reject(new Error("airodump Error => " + message));
        });

        // on timeout, reject Promise
        setTimeout(function(){
            // console.log('airodump Error => Timeout');
            reject(new Error("airodump Error => Timeout"));
        }, QUERY_TIMEOUT);
    });
    // // spawning deviceWatch process
    // .then(function(airodumpProcess){
    //     console.log('Starting watching process: ', file);
    //     var deviceWatchProcess = spawn('node', [deviceWatchPath, file]);
    //     console.log("deviceWatchProcess: ", deviceWatchProcess);
    //     // console.log("deviceWatchProcess: ", deviceWatchProcess.stdout);

    //     // on success, resolve Promise with both process references
    //     deviceWatchProcess.stdout.on("data", function(chunkBuffer){
    //         console.log('File watched', file);
    //         console.log('airodump process ongoing', airodumpProcess);
    //         console.log('Watching process ongoing', deviceWatchProcess);

    //         return {
    //             file: file,
    //             processes: [airodumpProcess, deviceWatchProcess]
    //         };
    //     });

    //     // on error, reject Promise and kill airodump process
    //     deviceWatchProcess.stderr.on("data", function(chunkBuffer){
    //         var message = chunkBuffer.toString();
    //         console.log("deviceWatch Error => " + message);

    //         airodumpProcess.kill();
    //         airodumpProcess.on('exit', function(){
    //             return new Error("deviceWatch Error => " + message);
    //         });
            
    //     });

    //     // on timeout, reject Promise and kill airodump process
    //     setTimeout(function(){
    //         airodumpProcess.kill();
    //         airodumpProcess.on('exit', function(){
    //             return new Error("deviceWatch Error => Timeout");
    //         });
    //     }, QUERY_TIMEOUT);
    // });
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

    process: null,
    file: null,

    states: {
        "sleeping": {
            
            _onEnter: function() {
                console.log('ZZZzzzZZZzzz...', this.state);
            },

            wakeUp: function(){
                var self = this;

                enterMonitorMode()
                .then(function(){
                    console.log('OK all good !');
                    self.transition('monitoring');
                })
                .catch(function(err){ // if error, what about deferUntilTransition ? still pending ??
                    console.log('err', err, err.stack);
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
                console.log('Entering ' + this.state + ' state');
            },
                        
            tryToSleep: function(){
                var self = this;

                exitMonitorMode()
                .then(function(){
                    console.log('Monitor mode deactivated');
                    self.transition('sleeping');
                })
                .catch(function(err){
                    console.log('err', err, err.stack);
                    console.log('Couldn\'t exit Monitor mode, still monitoring');
                });
            },

            sleep: "sleeping",
            
            record: function(options){
                var self = this;

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
                if (this.file){

                }
                
                console.log('Exiting monitoring state');
            }
        },

        "recording": {
            
            _onEnter: function(results){
                var self = this;
                console.log('Entering ' + this.state + ' state');
                fs.watch(this.file, function(){
                    deviceWatch(self.file);
                });                
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
                    fs.unwatchFile(self.file); // unwatchFile doesn't seem to work... maybe just use setTimeout instead of watch ???
                    self.transition('monitoring');
                })
                .catch(function(err){
                    console.log('err', err, err.stack);
                    console.log('Couldn\'t exit Recording mode, still monitoring');
                });
            },
            
            _onExit: function(){
                var self = this;

                setTimeout(function(){
                    spawn('rm', ['-fr', self.file]);
                }, 5000);

                this.file = null;
                this.processes = null;
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

    record: function(){
    // record: function(format, refreshTime, path, myInterface){

        // var options = {
        //     '--output-format': format,
        //     '--berlin': refreshTime,
        //     '--write-interval': refreshTime,
        //     '--write': path,
        //     'interface': myInterface
        // };

        var options = {
            '--output-format': 'csv',
            '--berlin': 120,
            '--write-interval': 10,
            '--write': './data/',
            'interface': 'wlan0mon'
        };

        this.handle('record', options);
    },

    pause: function(){
        this.handle('pause')
    }
});

module.exports = fsm;
 'use strict';

var fs = require('fs');
var readline = require('readline');
var spawn = require('child_process').spawn;
var util = require('util');
var EventEmitter = require('events').EventEmitter;


function PacketReader(monitor_interface) {
    var self = this;
    EventEmitter.call(this);

    var voidStream = fs.createWriteStream('/dev/null'); // Not needed in node v4

    var tcpdumpProcess;
    var readliner;
    var errorReader;


    this.stop = function () {
        if (readliner)
            readliner.close();
        if (errorReader)
            errorReader.close();
        if (tcpdumpProcess)
            tcpdumpProcess.kill();

        readliner = null;
        errorReader = null;
        tcpdumpProcess = null;
        self.emit('stop');
    };


    this.start = function () {

        if (tcpdumpProcess || readliner || errorReader) { // if already started
            self.emit('error', "PacketReader already started");
            return ;
        }
        // start tcpdump
        tcpdumpProcess = spawn('tcpdump', ['-I', '-e', '-q', '-t', '-U', '-i', monitor_interface || 'wlan0mon']);

        readliner = readline.createInterface({
            input: tcpdumpProcess.stdout,
            output: voidStream
        });

        errorReader = readline.createInterface({
                input: tcpdumpProcess.stderr,
                output: voidStream
        });


        // add listeners
        tcpdumpProcess.on('close', function () {
            self.stop();
            self.emit('end');
        });

        errorReader.on('line', function (buffer) {
            self.emit('error', buffer.toString());
        });

        readliner.on('line', function (buffer) {
            var line = buffer.toString();
            var match;

            match = line.match(/SA:(..:..:..:..:..:..)/);
            var mac_address = match ? match[1].toUpperCase() : undefined;

            match = line.match(/(-\d{1,2})dB/);
            var signal_strength = match ? match[1] : undefined;

            if (mac_address !== undefined && signal_strength !== undefined) {
                self.emit('packet', {
                    mac_address: mac_address,
                    signal_strength: parseInt(signal_strength, 10)
                });
            }
        });
    };
}

util.inherits(PacketReader, EventEmitter);

module.exports = PacketReader;
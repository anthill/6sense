"use strict";

require('es6-shim');

var expect = require('chai').expect;

var hashMacAddress = require('../src/hashMacAddress');

function generateRandomMac() {
    return "XX:XX:XX:XX:XX:XX".replace(/X/g,function () {
        return Math.random().toString(16).toUpperCase().charAt(3)
    })
}

describe('hashMacAddress', function() {
    
    it('should hash a MAC address', function() {
        var hashed = hashMacAddress(generateRandomMac, new Date().toISOString().slice(0, 10));
        
        expect(hashed).to.exist;
    });    
    
    it('should be deterministic', function() {
        var macAddress = generateRandomMac();

        var hash1 = hashMacAddress(macAddress, new Date().toISOString().slice(0, 10));
        var hash2 = hashMacAddress(macAddress, new Date().toISOString().slice(0, 10));

        expect(hash2).to.be.equal(hash1);
    })

    it ('should change the hash everyday', function() {
        var macAddress = generateRandomMac();

        var hash1 = hashMacAddress(macAddress, new Date('2015-05-15T14:38:00+02:00').toISOString().slice(0, 10));
        var hash2 = hashMacAddress(macAddress, new Date('2015-05-16T14:38:00+02:00').toISOString().slice(0, 10));

        expect(hash2).to.not.equal(hash1);
    })

    it('should not have collisions for 1000 hashes', function() {
        var previousHash;
        var thisHash;

        for (var i = 0; i < 1000; ++i) {
            thisHash = hashMacAddress(generateRandomMac(), new Date().toISOString().slice(0, 10))

            expect(thisHash).to.not.equal(previousHash)
            previousHash = thisHash;
        }
    })

    it('should not allows to trace manufacturer informations', function() {
        var macAddresses = ['AA:BB:CC:00:11:22', 'AA:BB:CC:33:44:55', 'AA:BB:CC:66:77:88']
        var previousHash;
        var thisHash;

        macAddresses.forEach(function (address) {
            thisHash = hashMacAddress(address, new Date().toISOString().slice(0, 10))

            expect(thisHash).to.not.equal(previousHash);
            previousHash = thisHash;
        })
    })
});

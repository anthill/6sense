"use strict";

require('es6-shim');

var expect = require('chai').expect;

var hashMacAddress = require('../src/general/hashMacAddress');

function generateRandomMac() {
    return "XX:XX:XX:XX:XX:XX".replace(/X/g, function () {
        return Math.random().toString(16).toUpperCase().charAt(3)
    })
}

describe('hashMacAddress', function() {
    
    it('should hash a MAC address', function() {
        var hashed = hashMacAddress(generateRandomMac, new Date());
        
        expect(hashed).to.exist;
    });    
    
    it('should be deterministic', function() {
        var macAddress = generateRandomMac();

        var hash1 = hashMacAddress(macAddress, new Date());
        var hash2 = hashMacAddress(macAddress, new Date());

        expect(hash2).to.be.equal(hash1);
    })

    it ('should change the hash everyday', function() {
        var macAddress = generateRandomMac();

        var hash1 = hashMacAddress(macAddress, new Date('2015-05-15T14:38:00+02:00'));
        var hash2 = hashMacAddress(macAddress, new Date('2015-05-16T14:38:00+02:00'));

        expect(hash2).to.not.equal(hash1);
    })

    // This test may fail sometimes. It's a normal outcome
    it('should not have collisions for 1000 hashs', function() {
        var previousHash;
        var thisHash;

        for (var i = 0; i <= 1000; ++i) {
            thisHash = hashMacAddress(generateRandomMac(), new Date())

            expect(thisHash).to.not.equal(previousHash)
            previousHash = thisHash;
        }
    })

    it('should not allows to trace manufacturer informations', function() {
        var macAddresses = ['AA:BB:CC:00:11:22', 'AA:BB:CC:33:44:55', 'AA:BB:CC:66:77:88']
        var previousHash;
        var thisHash;

        macAddresses.forEach(function (address) {
            thisHash = hashMacAddress(address, new Date())

            expect(thisHash).to.not.equal(previousHash);
            previousHash = thisHash;
        })
    })

    // This test may fail sometimes. It's a normal outcome
    it ('should not return a hash that is a substring of the MAC address', function () {
        var hash;
        var macAddress;

        for (var i = 0; i <= 1000; ++i) {
            macAddress = generateRandomMac();
            hash = hashMacAddress(macAddress, new Date());

            expect(macAddress.replace(/:/g, '').indexOf(hash.toString(16).toUpperCase())).to.be.equal(-1)
        }
    })
});

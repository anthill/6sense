"use strict";

require('es6-shim');

var assert = assert = require('chai').assert;

var deltaEncode = require('../src/codec/delta-encode');

describe('delta-encode', function(){
    
    it('should encode the unique value if there is only one value', function(){
        var b = deltaEncode([10]);
        
        assert.strictEqual(b.length, 1);
        assert.strictEqual(b[0], 10);
    });
    
    it('should encode the value and 0x00 if 3 equal values are passed', function(){
        var b = deltaEncode([14, 14, 14]);
        
        assert.strictEqual(b.length, 2);
        assert.strictEqual(b[0], 14);
        assert.strictEqual(b[1], 0x00);
    });
    
    it('should encode the value and 0x10 for [14, 15, 15]', function(){
        var b = deltaEncode([14, 15, 15]);
        
        assert.strictEqual(b.length, 2);
        assert.strictEqual(b[0], 14);
        assert.strictEqual(b[1], 0x10);
    });
    
    it('should encode the value and 0x1F for [14, 15]', function(){
        var b = deltaEncode([14, 15]);
        
        assert.strictEqual(b.length, 2);
        assert.strictEqual(b[0], 14);
        assert.strictEqual(b[1], 0x1F);
    });
    
    it('should encode the 0, 0xF0 and 17 for [0, 17]', function(){
        var b = deltaEncode([0, 17]);
        
        assert.strictEqual(b.length, 3);
        assert.strictEqual(b[0], 0);
        assert.strictEqual(b[1], 0xF0);
        assert.strictEqual(b[2], 17);
    });
    
    it('should encode the 0, 0xF0, 17, 0x0F, 80 for [0, 17, 17, 80]', function(){
        var b = deltaEncode([0, 17, 17, 80]);
        
        assert.strictEqual(b.length, 5);
        assert.strictEqual(b[0], 0);
        assert.strictEqual(b[1], 0xF0);
        assert.strictEqual(b[2], 17);
        assert.strictEqual(b[3], 0x0F);
        assert.strictEqual(b[4], 80);
    });
    
    
});

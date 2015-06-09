"use strict";

require('es6-shim');

var assert = assert = require('chai').assert;

var deltaEncode = require('../src/codec/delta-encode');
var deltaDecode = require('../src/codec/delta-decode');

describe('delta-encode', function(){
    
    it('[10]', function(){
        var arr = [10];
        var res = deltaDecode( deltaEncode(arr) )
        
        assert.sameMembers(arr, res);
    });
    
    it('[10, 10]', function(){
        var arr = [10, 10];
        var res = deltaDecode( deltaEncode(arr) )
        
        assert.sameMembers(arr, res);
    });
    
    it('[10, 10, 30]', function(){
        var arr = [10, 10, 30];
        var res = deltaDecode( deltaEncode(arr) )
        
        assert.sameMembers(arr, res);
    });
    
    it('[10, 10, 30, 50]', function(){
        var arr = [10, 10, 30, 50];
        var res = deltaDecode( deltaEncode(arr) )
        
        assert.sameMembers(arr, res);
    });
    
    it('[10, 10, 30, 50, 51, 52]', function(){
        var arr = [10, 10, 30, 50, 51, 52];
        var res = deltaDecode( deltaEncode(arr) )
        
        assert.sameMembers(arr, res);
    });
    
    
});

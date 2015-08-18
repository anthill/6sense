"use strict";

/*
    values is an asc sorted array of integer [0, 255] (1-byte)
    delta encoding consists in providing the first value and then only increments to the previous value.
    increments are stored in 4-bits. 0b1111 is an escape value if the delta between 2 values is >=15; in that case, the next byte is a new value
*/

module.exports = function(values){
    // allocate a buffer purposefully too big
    var buffer = new Buffer(2*values.length);
    var nextIndex = 0;
    var byteBeingBuilt;
    var previousValue; // undefined indicates next values should be written in full, not delta
    
    values.forEach(function(v){
        if(previousValue === undefined){
            buffer.writeUInt8(v, nextIndex++);
            previousValue = v;
            return;
        }
        
        var delta = v - previousValue;
        
        if(delta >= 0x0F){
            // write 0xF
            if(byteBeingBuilt !== undefined)
                byteBeingBuilt += 0x0F;
            else
                byteBeingBuilt = 0x0F << 4;
            
            buffer.writeUInt8(byteBeingBuilt, nextIndex++);
            buffer.writeUInt8(v, nextIndex++);
            byteBeingBuilt = undefined;
        }
        else{
            if(byteBeingBuilt !== undefined){
                byteBeingBuilt += delta;
                buffer.writeUInt8(byteBeingBuilt, nextIndex++);
                byteBeingBuilt = undefined;
            }
            else
                byteBeingBuilt = delta << 4;
        }
        
        previousValue = v;
            
    });
    
    // in case we ended with a leftover semi-byte, pad with 0x0F
    if(byteBeingBuilt !== undefined){
        byteBeingBuilt += 0x0F;
        buffer.writeUInt8(byteBeingBuilt, nextIndex++);
        byteBeingBuilt = undefined;
    }
    
    return buffer.slice(0, nextIndex);
}

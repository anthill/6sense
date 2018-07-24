'use strict';

module.exports = {

    makeMap: function(object, key){
        var myMap = new Map();

        if (object.length !== 0){
            for (var field in object){
                myMap.set(object[field][key], object[field]);
            }
        }

        return myMap;
    },

    createOrderedList: function(nb){
        var list = [];

        for (var i = 0; i < nb; i++){
            list.push(i);
        }

        return list;
    },

    /*
        Map<string, any> with a limited number of entries
        the only guarantee this map provides is that it'll have at most maxEntries
        It is free to remove any entry anytime.
    */
    limitedEntryMap: function(maxEntries) {
        var map  = Object.create(null);
        
        var keys = [];
        var nextIndex = 0;
        
        return {
            get: function(key){
                return map[key];
            },
            set: function(key, value){
                if(keys.indexOf(key) === -1){
                    // cleanup map entry if there is one already
                    if(keys[nextIndex] !== undefined){
                        delete map[keys[nextIndex]];
                    }
                    
                    keys[nextIndex] = key;
                    nextIndex = (nextIndex+1) % maxEntries;
                }
                
                return map[key] = value;
            },
            has: function(key){
                return key in map;
            },
            clear: function(){
                map = Object.create(null);
                nextIndex = 0;
                keys = [];
            },
            get size(){
                return this.keys().length;
            },
            keys: function(){
                return Object.keys(map);
            },
            delete: function(key){
                delete map[key];
            }
        }
    }
};

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
    }
};

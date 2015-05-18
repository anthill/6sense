"use strict";

require('es6-shim');

var decodeFromSMS = require("../../js/codec/decodeFromSMS.js")

var hilink = require('hilink');


hilink.listInbox(function( response ){
    var result = JSON.stringify( response, null, 2 );
    result.response.Messages.forEach(function(msg){
        decodeFromSMS(msg.Content).then(function(clearMessage){
            console.log(clearMessage);
        })
    })
});
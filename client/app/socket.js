/* global io */
"use strict";

const log = require('../../systems/log');
const bus  = require('../../systems/bus');

var socket;

const init = (token) => {
    socket = io.connect({
        query: 'token=' + token
    });
    
    socket.on('connect', function (args) {        
        let sessionId = this.id;
        //console.log(`Socket SessionId: ${sessionId}`);
        setTimeout(() => {
            bus.emit('socket-initialized', {sessionId});
        }, 500);
    }); 
    
    // receive event
    socket.on('event', (args) => {
        //console.log('Server event recieved: ' + args.event);
        //console.dir(args)
        bus.emit(args.event, args)
    });
    
    // send command
    bus.on('command', (args) => {
        socket.emit('command', args);
    }); 
    
    // jwt exception
    socket.on('error', (error) => {
        if (error.type == "UnauthorizedError" || error.code == "invalid_token") {
            console.log("User's token has expired");
            bus.emit('token-expired');
        }
    });  
    
}

module.exports.init = init;
module.exports.socket = socket;
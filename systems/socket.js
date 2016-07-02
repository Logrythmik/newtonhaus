"use strict";

const log = require('../systems/log');
const bus = require('../systems/bus');

const init = (context) => {
    let socket = context.sockets;
    log.trace('Client Connected: ', socket.decoded_token.name);    
    
    // recieve command
    socket.on('command', (args) => {
        if(args && args.command) {
            log.trace(`Received command: ${args.command}`);
            bus.emit(args.command, args);       
        } else { 
            log.error(`Received null command args from socket: ${args}`);
        }
    });
    
    // send event
    var handleEvent = (args) => {
        if(args && args.event) {
            var session = socket.io.sockets.connected[args.sessionId];
            if(args.sessionId && session) {
                session.emit('event', args)
            } else {
                log.trace(`Sending event: ${args.event}`);
                socket.emit('event', args);
            }
        } else {
            log.error(`Received null event args from bus: ${args}`);
        }
    }  
    bus.on('event', handleEvent);
    
    // clean-up
    socket.on('disconnect', () => {
        bus.off('event', handleEvent);
    });
}

// export function for listening to the socket
module.exports.init = init;
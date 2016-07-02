"use strict";

const log = require('./log');
const EventEmitter = require('events');
const eventEmitter = new EventEmitter.EventEmitter();

eventEmitter.setMaxListeners(500);

module.exports.on = (evt, fct) => {
    eventEmitter.on(evt, fct);
    return this;
}

module.exports.once = (evt, fct) => {
    eventEmitter.once(evt, fct);
    return this;
}

module.exports.off = (evt, fct) => {
    eventEmitter.removeListener(evt, fct);
}

module.exports.emit = (evt, args) => {
    eventEmitter.emit(evt, args);
}

module.exports.event = (evt, args, sessionId) => {
    log.trace(`Sending server event: ${evt}`);
    args = args || {};
    args.event = evt;
    args.sessionId = sessionId;
    eventEmitter.emit('event', args);
    eventEmitter.emit(evt, args);
    return this;
}

module.exports.command = (command, args) => {
    log.trace(`Sending client command: ${command}`);
    args = args || {};
    args.command = command;
    eventEmitter.emit('command', args);
    eventEmitter.emit(command, args);
}
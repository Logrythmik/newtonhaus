"use strict";

const COMMANDS = require('./constants').COMMANDS;

var debug = false

const log = console.log;
const dir = console.dir;
const error = console.error;
const trace = (msg) => {
    if(debug) log(msg);
}

const init = (context) => {
    let bus = context.bus;
    let config = context.config;
    debug = config.debug;
    
    bus.on(COMMANDS.LOG, (args)=> log(args.message));
    bus.on(COMMANDS.TRACE, (args)=> trace(args.message));
    bus.on(COMMANDS.DIR, (args)=> dir(args.message));
    bus.on(COMMANDS.ERROR, (args)=> error(args.message));
}

module.exports = {write: log, log, trace, error, dir, init, debug}

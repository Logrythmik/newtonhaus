'use strict';
const _ = require('lodash');
const log = require('./log');
const state = require('./state');

const match = require('./utils').match;
const checkConditions= require('./utils').checkConditions;

const init = (context) => {
    let bus = context.bus;
    let app = context.app;
    let jwtCheck = context.jwtCheck;
    let dirname = context.dirname;    
    let config = context.config;
        
    var doTask = (relay, args) => {
        if(_.isFunction(relay.run))
            relay.run(args, context);
        if(relay.command) {
            var commandArgs = relay.commandArgs || {};
            if(_.isFunction(relay.commandArgs))
                commandArgs = relay.commandArgs(args, context)
            bus.emit(relay.command, commandArgs);
        }
        if(relay.commands && _.isArray(relay.commands)) {
            _.each(relay.commands, (command) => {
                var commandArgs = command.args || command;
                if(_.isFunction(command.args))
                    commandArgs = relay.args(args, context)
                bus.emit(command.command, commandArgs);
            });
        }
    }
    // setup event relays
    _.each(config.eventRelays, (relay) => {
        log.trace(`Configuring relay: ${relay.name}`);
        bus.on(relay.event, (args) => {
            //log.trace(`Received event for relay ${relay.event}`);
            var matches = match(args, relay.eventArgs);
            if(relay.conditions)
                matches = checkConditions(config, relay.conditions, args);
            if(matches) {
                log.trace(`Sending relayed command ${relay.command} for event ${relay.event}`);
                if(relay.wait)
                    setTimeout(()=> doTask(relay, args), relay.wait);
                else
                   doTask(relay, args);
            }
        });
    });
    
    app.use('/bus', jwtCheck);
    
    app.post('/bus', (req, res) => {
        if(req.body && req.body.type) {                
            log.trace('External Message Received: ' + req.body.type);
            bus.emit(req.body.type, req.body);
            res.sendStatus(200);
        } else {
            log.error('Invalid Message');
            res.sendStatus(500);
        }        
    });        
    
}

module.exports.init = init;

"use strict"

const _ = require('lodash');
const log = require('./log');
const relay = require('./relay');
const scheduler = require('./scheduler');
const state = require('./state');
const web = require ('./web');
const bus = require('./bus');
var systems = {};

module.exports.init = (context) => {
    
    context.bus = bus;
    
    let dirname = context.dirname;    
    let config = context.config;    
    let app = context.app;
    let express = context.express;
        
    // initialize system listeners
    log.init(context);
    
    log.trace('Initializing systems');
    
    // initialize new device status object
    config.devices = {};
    
    // initialize system listeners
    log.init(context);    
    web.init(context);
       
    // iterate through all the configured systems and initialize them with their config
    // settings and an instance of the message bus
    _.each(config.systems, (systemName) => {
        var system = require(`../systems/${systemName}`);
        var name = system.info.name;        
        if(system.server && system.server.init) {            
            log.trace(`Initializing ${name}`);
            try{
                system.server.init(context);
                systems[systemName] = system.info;
                log.trace(`Initialized ${name}`);              
            } catch (err) {
                log.error(err);
            }            
        }        
        if(system.client) {
            // serve up system client folders
            log.trace(`Serving folder for ${name}: /${systemName}`);
            app.use(`/${systemName}`, express.static(dirname + `/systems/${systemName}/client`));            
        }
    });
    
    relay.init(context);
    scheduler.init(context);
    state.init(context)
   
}

module.exports.state = systems;
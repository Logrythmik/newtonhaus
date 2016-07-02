
'use strict';

const _ = require('lodash');
const log = require('../../log');
const secret_config = require('../secrets');
const io = require('socket.io-client');
//const COMMANDS = require('../constants').COMMANDS;
const EVENTS = require('../constants').EVENTS;
//const secrets = require('../../../server/secrets');


// INIT
module.exports.init = (context) => {
    let bus = context.bus;
    let app = context.app;
    let dirname = context.dirname;    
     
    var url = `https://stream.automatic.com?token=${secret_config.clientId}:${secret_config.clientSecret}`;
    log.trace('Automatic initialized: ' + url);
    
    //*/
    var socket = io(url);

    socket.on('trip:finished', function(eventJSON) {
        log.trace('Automatic: Trip Finished');
        bus.event(EVENTS.TRIP_FINISHED, eventJson);
    });
    
    socket.on('ignition:on', function(eventJSON) {
        log.trace('Automatic: Ignition On');
        bus.event(EVENTS.INGITION_ON,eventJson);
    });
    
    socket.on('ignition:off', function(eventJSON) {
        log.trace('Automatic: Ingition Off');
        bus.event(EVENTS.LOCATION_UPDATED,eventJson);
    });
    
    socket.on('location:updated', function(eventJSON) {
        log.trace('Automatic: Location Updated');
        bus.event(EVENTS.IGNITION_OFF,eventJson);
    });

    // Handle `error` messages
    socket.on('error', function(errorMessage) {
        log.trace('Automatic Error' + errorMessage);
    });
    //*/
    
    app.get('/automatic/auth', (req, res) => {      
        res.sendFile(dirname + '/systems/automatic/client/auth.html');
    });
    
    app.get('/automatic/redirect', (req, res) => {
        // todo: save the details of this user
        res.redirect('/');   
    });
    
        
    app.post('/automatic/webhook', (req, res) => {
        if(req.body && req.body.type) {
            log.trace('Automatic: Event Received: ' + req.body.type);
            bus.emit('automatic:'+ req.body.type, req.body);
            res.sendStatus(200);
        } else {
            log.error('Automatic: Invalid Webhook');
            res.sendStatus(500);
        }        
    });    
}
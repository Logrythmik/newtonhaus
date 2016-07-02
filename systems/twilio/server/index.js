'use strict';

const _ = require('lodash');
const log = require('../../log');
const twilio = require('twilio');
const COMMANDS = require('../constants').COMMANDS;
const EVENTS = require('../constants').EVENTS;
const config_secret = require('../secrets');
const qs = require('querystring');

const client = new twilio.RestClient(config_secret.sid, config_secret.token);

const sendNotification = (number, message) => { 
    log.trace(`Sending SMS To: ${number} | Message: ${message}`);
    client.sms.messages.create({
        to: number,
        from: config_secret.number,
        body: message
    }, (error, message) => {
       if (!error)
            log.trace('Sent SMS notification');
       else 
            log.error(error);
    });
}

const lowerCaseProperties = (oldObject) => {
    var keysUpper = Object.keys(oldObject)
    var newObject = {}
    for(var i in keysUpper){
        newObject[keysUpper[i].toLowerCase()] = oldObject[keysUpper[i]]
    }
    return newObject;
}

module.exports.init = function(context) {
    
    let bus = context.bus;
    let app = context.app;
    let dirname = context.dirname;    
    let config = context.config;
      
    log.trace('Twilio initialized');
    
    // commands ----------------------------------------------
    
    bus.on(COMMANDS.SEND_SMS, (cmd) => {
        log.trace(`Received Send SMS command -> Message:${cmd.message}`);
        
        if(cmd.number)
            sendNotification(cmd.number, cmd.message);
        else 
            // send to default numbers list if no number is supplied
            _.each(config_secret.notification_numbers, (number)=>{
                sendNotification(number, cmd.message);
            })
    }); 
    
    let middleWare = twilio.webhook(config_secret.token, {
        url:'https://maus.newtonhaus.com/twiml'
    });
    
    // api endpoints    
    app.post('/twiml', middleWare, (req, res) => {        
        let resp = new twilio.TwimlResponse();
        let args = lowerCaseProperties(req.body);
        bus.event(EVENTS.SMS_RECEIVED, args);
        //if(context.config.debug)
        //    resp.sms('Message received');        
        res.send(resp);
    });
    
    log.trace('Twilio initialized');
}
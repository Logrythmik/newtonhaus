
"use strict";

const _ = require('lodash');
const log = require('../../log');
const marantz = require('./http')
const manager = require('./telnet');
const COMMANDS = require('../constants').COMMANDS;
const EVENTS = require('../constants').EVENTS;
const config_secret = require('../secrets');

// Receiver State Monitoring Service ----------------------------------------
class StateMonitoringService {
    constructor(bus, receiverConfigs, config){
        this.bus = bus;
        this.receivers = {};
        this.intervals = [];
        var self = this;  
         _.each(receiverConfigs, function(rec){
            self.setupReceiver(rec, config);        
        });
    }
    
    setupReceiver(rec, config) {
        log.trace('Begin monitoring ' + rec.ipAddress);
        var self = this;
        
        marantz.refreshReceiver(rec, (receiver) => {
            self.setReceiver(rec.ipAddress, receiver);
            config.devices[rec.ipAddress] = receiver;
        });

        try{
            //telnet monitoring - using manager should automatically reconnect, but that needs to be verified
            this.client = new manager(rec.ipAddress, log.error);
            this.client.manager.on('data', (receiver) => { self.setReceiver(rec.ipAddress, receiver); })
        } catch(err) {
            log.error('Unable to connect using Telnet. Resorting to polling, like it is the 90s');
            var interval = setInterval(() => {
                marantz.refreshReceiver(rec, (receiver) => {
                    self.setReceiver(rec.ipAddress, receiver);
                    config.devices[rec.ipAddress] = receiver;
                });
            }, 2500);
            this.intervals.push(interval);
        }        
        
        log.trace('Completed monitoring ' + rec.ipAddress);
        
    }
    
    setReceiver(ipAddress, receiver){
        var existing = this.receivers[ipAddress] || {};
        var originalReceiver = _.cloneDeep(existing);

        var merged = _.merge(existing, receiver);

        // do nothing if we already know this merged object
        if(!_.isEqual(merged, originalReceiver)) {
            this.receivers[ipAddress] = merged;
            this.bus.event(EVENTS.RECEIVER_UPDATED,  {ipAddress, receiver:merged });            
        }
    }
    
    setZone(ipAddress, zone) {
        
    }

    getReceiver(ipAddress){
        if(this.receivers[ipAddress])
            return new Receiver(this.receivers[ipAddress]);
        return null;
    }

    getReceivers(){
        return this.receivers;
    }
}

class Receiver {
    
    constructor(state){
        this.$state = state;
    }
        
    setVolume(volume, zone, cb) {
        var existingVolume = this.$state.zones[zone].volume;
        if(Math.abs(existingVolume-volume)>10)
            volume = existingVolume + (volume>existingVolume?10:-10);
        this.$state.zones[zone].volume = volume;    
        marantz.setVolume(this.$state.ipAddress, volume, zone, cb);
    }

    adjustVolume(delta, zone, cb) {
        var volume = this.$state.zones[zone].volume;
        var newVolume = volume + parseFloat(delta);
        marantz.setVolume(this.$state.ipAddress, newVolume, zone, cb);
    }

    setMute(ipAddress, mute, zone, cb) {
        this.$state.zones[zone].mute = mute;
        marantz.setMute(this.$state.ipAddress, mute, zone, cb);
    }

    setPower(ipAddress, power, zone, cb) {
        this.$state.zones[zone].power = power;
        marantz.setPower(this.$state.ipAddress, power, zone, cb);
    }

    setInput(ipAddress, input, zone, cb) {
       this.$state.zones[zone].input = input;
       marantz.setInput(this.$state.ipAddress, input, zone, cb);
    }
}

var monitoringService;

const init = function(context) {
    
    let bus = context.bus;
    let app = context.app;
    let dirname = context.dirname;    
    let config = context.config;
    
    monitoringService = new StateMonitoringService(bus, config_secret.receivers, config);
      
        
    // receiver commands ----------------------------------------------
    
    bus.on(COMMANDS.REFRESH_RECEIVER, (cmd) => {
        log.trace(`Received refresh receiver command -> Ip:${cmd.ipAddress}`);
        var receiver = monitoringService.getReceiver(cmd.ipAddress);
        if(receiver){
            bus.event(EVENTS.RECEIVER_UPDATED, { ipAddress: cmd.ipAddress, receiver: receiver.$state });
            // always set the latest device state in the global devices object
            config.devices[cmd.ipAddress] = receiver.$state;
        }
    });
    
    bus.on(COMMANDS.SET_VOLUME, (cmd) => {
        log.trace(`Received volume command -> Ip:${cmd.ipAddress} Volume:${cmd.volume} Zone:${cmd.zone}`);
        var receiver = monitoringService.getReceiver(cmd.ipAddress);
        if(receiver)
            receiver.setVolume(cmd.volume, cmd.zone, ()=>
                // TODO: we may not need to do this...
                bus.event(EVENTS.RECEIVER_UPDATED, { ipAddress: cmd.ipAddress, receiver: receiver.$state }));
    });
    
    bus.on(COMMANDS.ADJUST_VOLUME, (cmd) => {
        log.trace(`Received adjust volume command -> Ip:${cmd.ipAddress} Delta:${cmd.delta} Zone:${cmd.zone}`);
        var receiver = monitoringService.getReceiver(cmd.ipAddress);
        if(receiver) {
            receiver.adjustVolume(cmd.delta, cmd.zone, ()=>
                bus.event(EVENTS.RECEIVER_UPDATED, { ipAddress: cmd.ipAddress, receiver: receiver.$state }));
        }
    });
       
    bus.on(COMMANDS.SET_MUTE, (cmd) => {
        log.trace(`Received mute command -> Ip:${cmd.ipAddress} Mute:${cmd.mute} Zone:${cmd.zone}`);
        var receiver = monitoringService.getReceiver(cmd.ipAddress);
        if(receiver)
            receiver.setMute(cmd.ipAddress, cmd.mute, cmd.zone, ()=>
                bus.event(EVENTS.RECEIVER_UPDATED, { ipAddress: cmd.ipAddress, receiver: receiver.$state }));
    });
        
    bus.on(COMMANDS.SET_POWER, (cmd) => {
        log.trace(`Received power command -> Ip:${cmd.ipAddress} Power:${cmd.power} Zone:${cmd.zone}`);
        var receiver = monitoringService.getReceiver(cmd.ipAddress);
        if(receiver)
            receiver.setPower(cmd.ipAddress, cmd.power, cmd.zone, ()=>
                bus.event(EVENTS.RECEIVER_UPDATED, { ipAddress: cmd.ipAddress, receiver: receiver.$state }));
    });
    
    bus.on(COMMANDS.SET_INPUT, (cmd) => {
        log.trace(`Received input command -> Ip:${cmd.ipAddress} Input:${cmd.input} Zone:${cmd.zone}`);
        var receiver = monitoringService.getReceiver(cmd.ipAddress);
        if(receiver)
            receiver.setInput(cmd.ipAddress, cmd.input, cmd.zone, ()=>
                bus.event(EVENTS.RECEIVER_UPDATED, { ipAddress: cmd.ipAddress, receiver: receiver.$state }));
    });
    
}


// COMMON DEVICE EXPORTS ------------------------------------

module.exports.init = (config, bus, app, callback) => {
    init(config, bus, app, callback);
}

module.exports.getDevice = (address) => {
    return monitoringService.getReceiver(address);
}

module.exports.setDevice = (address, args) => {
    var receiver = monitoringService.getReceiver(address);
    // TODO: view the params and determine which what to do
}

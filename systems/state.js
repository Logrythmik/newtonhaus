'use strict';

const _ = require('lodash');
const log = require('./log');

const COMMANDS = require('./constants').COMMANDS;
const EVENTS = require('./constants').EVENTS;

const match = require('./utils').match;
const checkConditions= require('./utils').checkConditions;

class StateService {
    
    constructor (context) { 
        var self = this; 
        let bus = context.bus;
        let app = context.app;
        let dirname = context.dirname;    
        let config = context.config;            
        self.config = config;
        self.monitoredStates = {};
        self.intervals = [];
        _.each(config.states, (state) => {            
            self._registerState(state, bus, app);       
        });  
    
        bus.on(COMMANDS.SET_STATE, (args) => {
            var result = self._getState(args.key);
            self.activateState(result);
            bus.event(EVENTS.STATE_REFRESHED, result);
        }); 
        
        bus.on(COMMANDS.GET_STATE, (args) => {
            let result = self.checkState(args.key);
            bus.event(EVENTS.STATE_REFRESHED, result);
        });   
    }
    
    _registerState(state, bus, app) {        
        let self = this;
        let key = state.key;
        log.trace(`Initializing State: ${state.name}`);
        // add a copy to our monitoring object
        self.monitoredStates[key] = _.merge({}, state);   
        self.checkState(key);     
        if(state.monitor) {            
            // setup monitor on a delay, just in case the event isn't sent
            log.trace(`Monitoring State: ${state.name}`);
            var timer = setInterval(()=> {         
                var original = self._getState(key);
                var result = self.checkState(key);
                // do nothing if we already know this object
                if(!_.isEqual(result, original)) {                     
                    bus.event(EVENTS.STATE_REFRESHED, result); 
                }
            }, state.monitorInterval || 10000);
            this.intervals.push(timer);  
            
            // create a monitoring route for monitored states
            app.get(`/monitor/${key}`, (req, res) => {                    
                let result = self.checkState(key);        
                if(!result.meetsExpectations) res.status(417);
                res.json(result);
            });    
        }    
    }
    
    _getState(key) {
        return this.monitoredStates[key];
    }
    
    
    checkState (key)  {
        var self = this;
        var state = self.monitoredStates[key];
        state.meetsExpectations = false;
        
        // query all devices from their systems
        _.each(state.devices, (device) =>{
            let system = require(`./${device.system}`);
            if(system.server.getDevice)
                device.actual = this.config.devices[device.address] = system.server.getDevice(device.address);        
        });
        
        // check all their properties against the expectations
        if(state.devices)
            state.meetsExpectations = _.all(state.devices, (device) => {
                return device.meetsExpectations = match(device.actual, device.expect);        
            });
        
        if(state.conditions && state.meetsExpectations)
            state.meetsExpectations = checkConditions(this.config, state.conditions);
        
        return state;
    }
    
    activateState (state)  {        
        if(!state || state.success) return;
        
        // go through all devices
        _.each(state.devices, (device)=> {
            if(!device.meetsExpectations) {
                // if the device isn't right, tell it to be
                let system = require(`./${device.system}`);
                if(system.server.setDevice) 
                    system.server.setDevice(device.address, device.expect);            
            }
        });
        this.checkState(state.key);
        return state;
    }

}

var stateService;

module.exports.init = (context) => {
   stateService = new StateService(context);
};

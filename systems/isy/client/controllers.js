/* global angular */
"use strict";

const _ = require('lodash');
const log = require('../../log');
const COMMANDS = require('../constants').COMMANDS;
const EVENTS = require('../constants').EVENTS;

const allDevices = {};

class DeviceCtrl { // Device --------------------------------------------------------    
    
    constructor($scope, $timeout, nhBus) {  
        this.$scope = $scope;
        this.$timeout = $timeout;
        this.bus = nhBus;
        var self = this;
        this.bus.once('socket-initialized', (args)=> {
            self._subscribeToChanges(self.config.address, args.sessionId);   
        });       
        
    }
    
    _subscribeToChanges (address, sessionId) {
        if(sessionId == undefined)
            throw "SessionId cannot be null"
        var self = this;
        
        var eventHandler = (device) => {
            if(device.address == address || device.address.startsWith(address) || address.startsWith(device.address))   {
                delete self.doing;
                allDevices[device.address] = self._setDevice(device); 
            }            
        }
                
        this.bus.on(EVENTS.DEVICE_CHANGED, eventHandler);
        this.bus.on(EVENTS.DEVICE_REFRESH, eventHandler);        
        this.bus.command(COMMANDS.REFRESH_DEVICE, { address, sessionId });  
        this.bus.on('refresh', () => {
            self.bus.command(COMMANDS.REFRESH_DEVICE, { address, sessionId });   
        });
    }
    
    _setDevice(device) {        
        return this.device = device;
    }
    
    _do(what) {
        this.doing = what;
        var self = this;
        this.$timeout(()=> {delete self.doing;},15000)
    }
    
    setScene(power) {
        if(power != undefined)
            this.device.power = power;
        log.trace(`Clicked scene -> ID:${this.config.address} Scene:${this.device.name} Power:${this.device.power}`);
        this.bus.command(COMMANDS.SET_SCENE, { 
           address: this.config.address,
           power: this.device.power
        });
    }       
    
    setLight(power) {
        if(power != undefined)
            this.device.power = power;
        log.trace(`Clicked light power -> ID:${this.config.address} Power:${this.device.power}`);
        this.bus.command(COMMANDS.LIGHT_SET, { 
           address: this.config.address,
           power: this.device.power
        });
    }
    
    setLightLevel(level) {
        if(level != undefined)
            this.device.level = level;
            
        if(this.device.level == 0)
            this.setLight(false);
        else {
            log.trace(`Clicked light level control -> ID:${this.config.address} Level:${this.device.level}`);
            this.bus.command(COMMANDS.LIGHT_SET_LEVEL, { 
                address: this.config.address, 
                level: this.device.level
            });
        }        
    }
    
    setFanLevel(level) {     
        if(level != undefined)
            this.device.level = level;   
        log.trace(`Clicked fan level control -> ID:${this.config.address} Level:${this.device.level}`);
        this.bus.command(COMMANDS.FAN_SET_LEVEL, { 
           address: this.config.address,
           level: this.device.level
        });
    }    
}
DeviceCtrl.$inject = ['$scope','$timeout','nhBus'];


class LockCtrl extends DeviceCtrl {
    constructor($scope, $timeout, nhBus) { 
        super($scope, $timeout, nhBus)
       
    }
    
    _setDevice(device){
        device.open = !device.power;
        device.close = () => this.lock();
        return super._setDevice(device);
    }
    
    lock() {
        this._do('Locking');
        log.trace(`Clicked lock command -> ID:${this.config.address} Power:${true}`);
        this.bus.command(COMMANDS.LOCK_SET, { 
           address: this.config.address,
           power: true
        });
    }
    
    setLock(power) {
        if(power)
            this.lock();
        else
            this.unlock();       
    }   
    
    unlock() {
        this._do('Unlocking');
        log.trace(`Clicked lock command -> ID:${this.config.address} Power:${false}`);
        this.bus.command(COMMANDS.LOCK_SET, { 
           address: this.config.address,
           power: false
        });
    }    
}
LockCtrl.$inject = ['$scope','$timeout','nhBus'];

class GarageCtrl extends DeviceCtrl {
    constructor($scope, $timeout, nhBus) { 
        super($scope, $timeout, nhBus)
        // subscribe to the sensor & motor
        //for(let i=1;i<=2;i++)
        //    super._subscribeToChanges(`${this.config.address} ${i}`); 
    }
    
    _setDevice(device){
        if(device.address == this.config.address + ' 1') {
            device.open = device.power;
            device.close = () => this.close();
            return super._setDevice(device);
        }
    }
    
    close() {
        this._do('Closing');
        log.trace(`Clicked garage close command -> ID:${this.config.address}`);
        this.bus.command(COMMANDS.GARAGE_TRIGGER, { 
           address: this.config.address
        });
    }   
    
    open() {
        this._do('Opening');
        log.trace(`Clicked garage open command -> ID:${this.config.address}`);
        this.bus.command(COMMANDS.GARAGE_TRIGGER, { 
           address: this.config.address
        });
    } 
}
GarageCtrl.$inject = ['$scope','$timeout', 'nhBus'];

class VariableCtrl {
    constructor($scope, $timeout, nhBus) { 
        this.$scope = $scope;
        this.$timeout = $timeout;
        this.bus = nhBus;
        var self = this;
        
        this.bus.once('socket-initialized', (args)=> {
            self._subscribeToChanges(self.config.key);   
        });       
        
    }
    _subscribeToChanges (key) {        
        var self = this;
        
        var eventHandler = (variable) => {
            self.variable = variable;
            if( variable.key == key)
                self.display = self.config.switch[variable.value];            
        }
                
        this.bus.on(EVENTS.VARIABLE_CHANGED, eventHandler);
        this.bus.on(EVENTS.VARIABLE_REFRESH, eventHandler);        
        this.bus.command(COMMANDS.REFRESH_VARIABLE, { key });  
        this.bus.on('refresh', () => {
            self.bus.command(COMMANDS.REFRESH_VARIABLE, { key });   
        });
    }
    
    
}
VariableCtrl.$inject = ['$scope','$timeout','nhBus'];


export { DeviceCtrl, LockCtrl, GarageCtrl, VariableCtrl }
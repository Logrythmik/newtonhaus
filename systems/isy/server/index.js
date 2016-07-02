
"use strict";
const _ = require('lodash');
const ISY = require('isy-js');
const log = require('../../log');
const COMMANDS = require('../constants').COMMANDS;
const EVENTS = require('../constants').EVENTS;
const config_secrets = require('../secrets');

var isy;
var init = (context) => {
    let bus = context.bus;
    let app = context.app;
    let dirname = context.dirname;    
    let config = context.config;
        
    var eventListener = (isy, device) => {
        var deviceView = getDeviceView(device);
        bus.event(EVENTS.DEVICE_CHANGED, deviceView);
         // always set the latest device state in the global devices object
        config.devices[device.address] = deviceView;
    };
    
    var variableListener = (isy, variable) => {
        var view = getVariableView(variable);
        bus.event(EVENTS.VARIABLE_CHANGED, view);
        var key = `${view.type}:${view.id}`;
        config.variables[key] = view;
    }    
   
    // init iSY with event monitor in place.
    isy = new ISY.ISY(
        config_secrets.ipAddress, 
        config_secrets.username, 
        config_secrets.password, 
        false, 
        eventListener, 
        false, true, true, 
        variableListener);
    
    isy.initialize((err) => {
        config.variables = config.variables || {};
        registerCommands(config, isy, bus);
        _.each(isy.deviceList, (device) => {
            config.devices[device.address] = getDeviceView(device)
        }); 
        _.each(Object.getOwnPropertyNames(isy.variableIndex), (variableKey) => {
            config.variables[variableKey] = getVariableView(isy.variableIndex[variableKey]);
        });        
    });    
}

var getVariableView = (variable) => {
    return {
        id: variable.id,
        type: variable.type,
        value: variable.value,
        initial: variable.init,
        key: `${variable.type}:${variable.id}`
    };
}


var getDeviceView = (device) => {
    if(!device) return null;
    var power = false;
    var level = null;
    
    try {        
        switch (device.deviceType) {
            case (isy.DEVICE_TYPE_LIGHT): 
            case (isy.DEVICE_TYPE_DIMMABLE_LIGHT):
            case (isy.DEVICE_TYPE_SCENE): {
                power = device.getCurrentLightState();
                if(device.isDimmable)
                    level = device.getCurrentLightDimState();
                break;
            }
            case (isy.DEVICE_TYPE_FAN): {
                level = device.getCurrentFanState();
                //power = level != device.FAN_OFF;
                break;
            }
            case (isy.DEVICE_TYPE_LOCK):
            case (isy.DEVICE_TYPE_SECURE_LOCK): {
                power = device.getCurrentLockState();
                break;
            }
            case (isy.DEVICE_TYPE_OUTLET): {
                power = device.getCurrentOutletState();
                break;
            }
            case (isy.DEVICE_TYPE_DOOR_WINDOW_SENSOR): {
                power = device.getCurrentDoorWindowState();
                break;
            }
            case (isy.DEVICE_TYPE_MOTION_SENSOR): {
                power = device.getCurrentMotionSensorState();
            }  
        }
        return {
            address: device.address,
            power,
            level,
            name: device.name,                   
            deviceType: device.deviceType,
            lastChanged: device.lastChanged
        };
    } catch(exc) {
        log.error(exc);
        return null;
    }    
}

const _getDevice = (address) => {
    return isy.getDevice(address) || isy.getDevice(address + " 1");
}

const getDevice = (address) => { 
    var device = _getDevice(address);
    if(!device) return null;     
    return getDeviceView(device);
}

var registerCommands = (config, isy, bus) => {
    
    bus.on(COMMANDS.REFRESH_DEVICE, (args) => {
        var device = getDevice(args.address);    
        config.devices[args.address] = device;   
        if(!device) return;            
        log.trace(`ISY: isy.refresh | Address: ${args.address}`);
        bus.event(EVENTS.DEVICE_REFRESH, device, args.sessionId);       
    });
    
     bus.on(COMMANDS.REFRESH_VARIABLE, (args) => {
        var variable = config.variables[args.key];  
        if(!variable) return;    
        variable.key = `${variable.type}:${variable.id}`;   
        log.trace(`ISY: isy.variable-refresh | Key: ${args.key}`);
        bus.event(EVENTS.VARIABLE_REFRESH, variable);       
    });
    
    bus.on(COMMANDS.SCENE_SET, (args) => {
        setDevice(args.address, args);
    });
    
    bus.on(COMMANDS.LIGHT_SET, (args) => {
        setDevice(args.address, args);
    });
    
    bus.on(COMMANDS.LIGHT_SET_LEVEL, (args) => {
        setDevice(args.address, args);
    });

    bus.on(COMMANDS.FAN_SET_LEVEL, (args) => {
        setDevice(args.address, args);
    }); 
    
    bus.on(COMMANDS.LOCK_SET, (args) => {
        setDevice(args.address, args);
    })
    
     bus.on(COMMANDS.GARAGE_TRIGGER, (args) => {
        setDevice(args.address, args);
    })
   
}

const setDevice = (address, args) => {
    var device = _getDevice(address);
    if(device == null) return;
    
    var message = `ISY: ${device.deviceType} ${args.command} | Address: ${device.address} `;
    if(args.hasOwnProperty('power')) {
        if(device.power == args.power) return;
        message += `| Power: ${args.power}`;
    } 
    if(args.hasOwnProperty('level')) {
        if(device.level == args.level) return;
        message += `| Level: ${args.level}`;
    }    
    log.trace(message);
       
    switch (device.deviceType) {
        case (isy.DEVICE_TYPE_LIGHT): 
        case (isy.DEVICE_TYPE_DIMMABLE_LIGHT):
        case (isy.DEVICE_TYPE_SCENE): {
            if(args.hasOwnProperty('power'))
                device.sendLightCommand(args.power, () => {});
            if(args.hasOwnProperty('level'))
                device.sendLightDimCommand(args.level, () => {});
            break;
        }
        case (isy.DEVICE_TYPE_FAN): {
            if(args.hasOwnProperty('level'))
                device.sendFanCommand(args.level, () => {});
            break;
        }
        case (isy.DEVICE_TYPE_LOCK):
        case (isy.DEVICE_TYPE_SECURE_LOCK): {
            device.sendLockCommand(args.power, () => {});
            break;
        }
        case (isy.DEVICE_TYPE_OUTLET): {            
            device.sendOutletCommand(args.power, () => {});
            break;
        }
        case (isy.DEVICE_TYPE_DOOR_WINDOW_SENSOR): {
            // if we were monitoring a door sensor, we need to send the command to the garage door.
            device = isy.getDevice(address + " 2");
            device.sendOutletCommand(true, () => {});
            break;
        }
    }
}


// INIT ------------------------------------

module.exports.init = (config, bus, app, callback) => {
    init(config, bus, app, callback);
}

module.exports.getDevice = getDevice;
module.exports.setDevice = setDevice;
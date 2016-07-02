"use strict";

const COMMANDS = {
    REFRESH_DEVICE: 'Isy.RefreshDevice',
    REFRESH_VARIABLE: 'Isy.RefreshVariable',
    SCENE_ON: 'Isy.Scene.On',
    LIGHT_SET: 'Isy.Light.Set', 
    LIGHT_SET_LEVEL: 'Isy.Light.SetLevel',
    FAN_SET_LEVEL: 'Isy.Fan.SetLevel',
    LOCK_SET: 'Isy.Lock.Set',
    GARAGE_TRIGGER: 'Isy.Garage.Trigger'
}

const EVENTS  = {
    DEVICE_CHANGED: 'Isy.DeviceChanged',
    DEVICE_REFRESH: 'Isy.DeviceRefresh',
    VARIABLE_CHANGED: 'Isy.VariableChanged',
    VARIABLE_REFRESH: 'Isy.VariableRefresh'
}

module.exports.EVENTS = EVENTS;
module.exports.COMMANDS = COMMANDS;
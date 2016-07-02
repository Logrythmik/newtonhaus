"use strict";
const _ = require('lodash');
const moment = require('moment');

const _match = (source, toMatch, result) => {
    if(result == undefined) result = true;
    if(source == undefined) return result;
    if(toMatch == undefined) return result;
    _.each(Object.getOwnPropertyNames(toMatch), (property) => {
        if(result == false) return result;
        if(_.isObject(source[property]))
            result = _match(source[property], toMatch[property], result);
        else if(_.isFunction(toMatch[property]))
            result = toMatch[property](source[property]);
        else if(_.isArray(toMatch[property])) {
            _.each(toMatch[property], (val) => {
                if(result == false) return result;
                result = _.includes(source[property], val);
            });            
        }
        else
            result = source[property] == toMatch[property];
    });
    return result;
}

const _checkConditions = (config, conditions, args) =>{
    var result = true;
    if(conditions.time) {
        if(conditions.time.before && moment().after(moment(conditions.time.before, conditions.time.format || 'HH:mm')))
            return false;
        if(conditions.time.after && moment().before(moment(conditions.time.after, conditions.time.format || 'HH:mm')))
            return false;
    } 
    
    if(conditions.devices)
    {
        _.each(Object.getOwnPropertyNames(conditions.devices), (address) => {
            if(result == false) return false;
            result = _match(config.devices[address], conditions.devices[address])
        });
    }
    if(result && conditions.states)
    {
        _.each(Object.getOwnPropertyNames(conditions.states), (key) => {
            if(result == false) return false;
            result = _match(config.states[key], conditions.states[key])
        });
    }
    if(result && conditions.variables)
    {
        _.each(Object.getOwnPropertyNames(conditions.variables), (key) => {
            if(result == false) return false;
            result = _match(config.variables[key], conditions.variables[key])
        });
    }
    if(result && conditions.if && _.isFunction(conditions.if)){
        result = conditions.if(args, config);
    }
    return result;
}


module.exports.match = _match;
module.exports.checkConditions = _checkConditions;
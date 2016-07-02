
var _ = require('lodash');

const INPUTS = require('../constants').INPUTS;
const inputRegEx = new RegExp('^(SI|Z\\d)(' + INPUTS.reduce((p,c,i)=>p+'|'+c.replace('/', '\\/')) + ')$');

var parseCommand = function(command) {
    var parseZone = function(zone) {
        var zoneMatch = command.match(/^Z(\d)/);
        if(zoneMatch) return parseInt(zoneMatch[1]);
        return 1;
    }
    
    var parseVolume = function(command) {
        var match = command.match(/^(MV|Z\d)(\d{2,3}|-*)$/);
        
        if(match) {
            var receiver = {
                zones: {
                    [parseZone(match[1])]: {
                        volume: -80 + parseFloat(command.substring(2,4) + '.' + command.substring(4,5))
                    }
                }
            };
            return receiver;
        }
        return false;
    }
    
    var parseInput = function(command) {
        var match = command.match(inputRegEx);
        
        if(match) {
            var receiver = {
                zones: {
                    [parseZone(match[1])]: {
                        input: match[2]
                    }
                }
            };

            return receiver;
        }
        return false;
    }
    
    var parsePower = function(command) {
        var match = command.match(/^(PW|ZM|Z\d)(ON|OFF)$/);
        
        if(match) {
            var receiver = {
                zones: {
                    [parseZone(match[1])]: {
                        power: match[2] == 'ON' ? true : false
                    }
                }
            };
            return receiver;
        }
        return false;
    }
    
    var parseMute = function(command) {
        var match = command.match(/^(Z\d)?(MU(ON|OFF))$/);
        
        if(match) {
            var receiver = {
                zones: {
                    [parseZone(match[1])]: {
                        mute: match[3] == 'ON' ? true : false
                    }
                }
            };
            return receiver;
        }
        return false;
    }
    
    var receiver = parseVolume(command); if(receiver) return receiver;
    receiver = parseInput(command); if(receiver) return receiver;
    receiver = parsePower(command); if(receiver) return receiver;
    receiver = parseMute(command); if(receiver) return receiver;
}

module.exports.parse = (command) => {
    return parseCommand(command);
}
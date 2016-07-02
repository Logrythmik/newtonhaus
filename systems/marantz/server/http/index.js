"use strict";

// ----------------- Receiver Controller Service -----------------------------

const unirest = require('unirest');
const xml = require('xml2js');
const _ = require('lodash');
const net = require('net');

var tryParse = function(func, def) {
    try {
        return func();
    } catch (e) {}
        return def || '';
    };

var getBaseUrl = function(ipAddress) {
    if(net.isIPv4(ipAddress)) return `http://${ipAddress}`;
    var msg = `Marantz  ipAddress was not a valid IPv4 string representation. [${ipAddress}]`
    throw new Error(msg);
}

var ensureInputName = function(name) {
    /* Receivers report slightly different inputs depending on API. For simplicity, we swap any known input
       name from the web API to the name used in the serial API.
    */
    if (name == 'CBL/SAT') name = 'SAT/CBL';
    if (name == 'NETWORK') name = 'NET';
    if (name == 'Blu-ray') name = 'BD';
    if (name == 'TV AUDIO') name = 'TV';
    if (name == 'Media Player') name = 'MPLAY';
    
    return name;
}

var parseInputs = function(result) {
    return result.item.InputFuncList[0].value.map(function(element, index, context) {
        var name = ensureInputName(element);
        
        var friendly = (!result.item.RenameSource[0].value[index].value) ?
            result.item.RenameSource[0].value[index].trim() :
            result.item.RenameSource[0].value[index].value[0].trim();

        var enabled;
        if (result.item.SourceDelete) {
            enabled = result.item.SourceDelete[0].value[index].trim().toLowerCase() == 'use' ? true : false;
        }

        var input = {
            index: index,
            name: name,
            friendly: friendly.length > 0 ? friendly : element,
            enabled: enabled
        };

        return input;
    });
} // end parseInputs

var parseZone = function(result, index) {
    var input = ensureInputName(tryParse(() => result.item.InputFuncSelect[0].value[0].trim()));

    return {
        name: tryParse(() => result.item.Zone[0].value[0].trim()),
        power: tryParse(() => result.item.Power[0].value[0].trim().toLowerCase() == 'on' ? true : false),
        input,
        volume: tryParse(() => result.item.MasterVolume[0].value[0].trim() == '--' ? -80 : parseFloat(result.item.MasterVolume[0].value[0].trim())),
        mute: tryParse(() => result.item.Mute[0].value[0].trim().toLowerCase() == 'on' ? true : false)
    };
} //end parseZone

var getRequest = function(url, func) {
    unirest.get(url)
        .end(function(response) {
            try{
                if(response && response.body) {
                    xml.parseString(response.body, function readXml(error, result) {

                        if (error) throw error;
                        if (func) func(result);
                    });
                } else {
                    func({complete: true});
                }
            } catch(exc) {
                //TODO: something
        }
    });
}

var getReceiverUrl = function(ipAddress, extended) {
    return getBaseUrl(ipAddress) + (extended ?
        '/goform/formMainZone_MainZoneXml.xml' :
        '/goform/formMainZone_MainZoneXmlStatus.xml');
}

var setBaseInfo = function(config, callback) {
    getRequest(getReceiverUrl(config.ipAddress), function(result) {

        var receiver = {
            ipAddress: config.ipAddress,
            name: tryParse(() =>   result.item.Zone[0].value[0].trim()),
            model: tryParse(() => result.item.Model[0].value[0].trim()),
            inputs: parseInputs(result),
            zones: {
                1: parseZone(result)
            }
        };

        callback(receiver);

        //Some receivers only report source deleted information from XmlStatus
        //receiver. Inputs will be updated twice.
        if (receiver.inputs[0].enabled === undefined) {
            setExtendedInfo(config, callback);
        }
    });
}

var setExtendedInfo = function(config, callback) {
    getRequest(getReceiverUrl(config.ipAddress, true), function(result) {
        callback({
            ipAddress: config.ipAddress,
            inputs: parseInputs(result)
        });
    });
}

var setZoneInfo = function(config, zone, callback) {
    var getZoneUrl = function() {
        return getBaseUrl(config.ipAddress) + `/goform/formZone${zone}_Zone${zone}XmlStatus.xml`;
    }

    getRequest(getZoneUrl(), function(result) {
            callback({
            zones: {
                [zone]: parseZone(result)
            }
        });
    });
}

module.exports.refreshReceiver = function(config, callback) {
    setBaseInfo(config, function(receiver) {
        callback(receiver);
        for (var i = 2; i <= config.zones.length; i++) {
            setZoneInfo(config, i, callback);
        }
    });
}

module.exports.setVolume = function(ipAddress, volume, zone, cb) {
    getRequest(getBaseUrl(ipAddress) + `/goform/formiPhoneAppVolume.xml?${zone}+${volume}`, cb);
}

module.exports.setMute = function(ipAddress, mute, zone, cb) {
    if(mute) getRequest(getBaseUrl(ipAddress) + `/goform/formiPhoneAppMute.xml?${zone}+MuteOn`, cb);
    else getRequest(getBaseUrl(ipAddress) + `/goform/formiPhoneAppMute.xml?${zone}+MuteOff`, cb);
}

module.exports.setPower = function(ipAddress, power, zone, cb) {
    if(power) getRequest(getBaseUrl(ipAddress) + `/goform/formiPhoneAppPower.xml?${zone}+PowerOn`, cb);
    else getRequest(getBaseUrl(ipAddress) + `/goform/formiPhoneAppPower.xml?${zone}+PowerStandby`, cb);
}

module.exports.setInput = function(ipAddress, input, zone, cb) {
    var upperInput = input.toUpperCase();

    if(zone == 1) getRequest(getBaseUrl(ipAddress) + `/goform/formiPhoneAppDirect.xml?SI${upperInput}`, cb);
    else  getRequest(getBaseUrl(ipAddress) + `/goform/formiPhoneAppDirect.xml?Z${zone}${upperInput}`, cb);
}
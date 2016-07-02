"use strict";

const EVENTS = {
    RECEIVER_UPDATED: 'Marantz.ReceiverUpdated'
}

const COMMANDS = {
    REFRESH_RECEIVER: 'Marantz.RefreshReceiver',
    SET_POWER: 'Marantz.SetPower',
    SET_MUTE: 'Marantz.SetMute',
    SET_VOLUME: 'Marantz.SetVolume',
    ADJUST_VOLUME: 'Marantz.AdjustVolume',
    SET_INPUT: 'Marantz.SetInput'
}

module.exports.EVENTS = EVENTS;
module.exports.COMMANDS = COMMANDS;
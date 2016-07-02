/* global angular */
"use strict";

const _ = require('lodash');
const log = require('../../log');
const COMMANDS = require('../constants').COMMANDS;
const EVENTS = require('../constants').EVENTS;

class ReceiverCtrl { // Receiver --------------------------------------------------------    
    
  constructor($scope, nhBus) {  
    this.$scope = $scope;
    var self = this;
    this.bus = nhBus; 
    this.bus.on(EVENTS.RECEIVER_UPDATED, (args) => {        
        var {ipAddress,receiver} = args;
        if(ipAddress == self.config.address) {            
            self.receiver = receiver;
            self.receiver.power = _.some(self.receiver.zones, {power:true});            
        }
    });
    
    this.bus.once('socket-initialized', (args) => {
        let sessionId = args.sessionId;
        self.bus.command(COMMANDS.REFRESH_RECEIVER, { ipAddress: self.config.address, sessionId });  
        self.bus.on('refresh', () => {            
            self.bus.command(COMMANDS.REFRESH_RECEIVER, { ipAddress: self.config.address, sessionId });  
        });   
    });
      
  }
  
}

ReceiverCtrl.$inject = ['$scope','nhBus'];


class ZoneCtrl  { // Zone ------------------------------------------------------------
        
    constructor($scope, $timeout, nhBus){
        this.$scope = $scope;     
        this.$timeout = $timeout;
        this.bus = nhBus;
        this.inputIcons = {
            "FM": 		"radio",
            "CD": 		"album",
            "PHONO":	"surround_sound",
            "M-XPORT": 	"bluetooth",
            "NET": 		"settings_ethernet",
            "DVD": 		"album",
            "BD": 		"cast",
            "TV": 		"tv",
            "SAT/CBL": 	"dvr",
            "GAME": 	"games",
            "AUX": 		"settings_input_composite",
            "MPLAY": 	"equalizer",
            "iPod/USB": "usb"
        };   
    }
    
    setVolume() {
        log.trace(`Clicked volume control -> IP:${this.receiver.ipAddress} Volume:${this.zone.volume} Zone:${this.id}`);
        this.bus.command(COMMANDS.SET_VOLUME, { 
           ipAddress: this.receiver.ipAddress, 
           volume: this.zone.volume, 
           zone: this.id
        });
    }
    
    setMute(mute) {
        this.zone.mute = mute;
        log.trace(`Clicked mute control -> IP:${this.receiver.ipAddress} Mute:${mute} Zone:${this.id}`);
        this.bus.command(COMMANDS.SET_MUTE, { 
           ipAddress: this.receiver.ipAddress, 
           mute: this.zone.mute, 
           zone: this.id
        });
    }
    
    setPower(power) {
        if(power != undefined)
            this.zone.power = power;
        log.trace(`Clicked power control -> IP:${this.receiver.ipAddress} Power:${power} Zone:${this.id}`);
        this.bus.command(COMMANDS.SET_POWER, { 
           ipAddress: this.receiver.ipAddress, 
           power: this.zone.power, 
           zone: this.id
        });
    }
    
    setInput(input) {
        this.zone.input = input;
        log.trace(`Clicked input control -> IP:${this.receiver.ipAddress} Input:${this.zone.input} Zone:${this.id}`);
        this.bus.command(COMMANDS.SET_INPUT, { 
           ipAddress: this.receiver.ipAddress, 
           input: this.zone.input, 
           zone: this.id 
        });
    }      

    openMenu($mdOpenMenu, ev) {
        $mdOpenMenu(ev);
        // HACK: This is necessary to force a re-calc on the md-menu. Some weird bug
        this.$timeout(()=>window.dispatchEvent(new Event('resize')), 500);        
    }
    
    getInputIcon(input, isrec){
        if(this.zone.power == false && isrec)
            return "menu";
        return this.inputIcons[input];
    }
}

ZoneCtrl.$inject = ['$scope','$timeout','nhBus'];


export { ReceiverCtrl, ZoneCtrl }
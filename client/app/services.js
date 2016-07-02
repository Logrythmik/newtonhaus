'use strict';

const bus = require("../../systems/bus");

class BusService {
    constructor($rootScope){
        this.$rootScope = $rootScope;
    }
    
    on(evt, fnc) {
        var self = this;
        var action = fnc;
        bus.on(evt, (args) => {                  
            if(!self.$rootScope.$$phase)      
                self.$rootScope.$apply(()=>action(args));    
            else 
                action(args);
        });        
    }
    
    once(evt, fnc) {
        bus.once(evt, fnc)
    }
    
    emit(evt, args) {
        bus.emit(evt,args)
    }
    
    command(evt, args) {        
        bus.command(evt, args)
    }
    
    off(evt, fct) {
        bus.off(evt, fct);
    }
}

BusService.$inject = ['$rootScope'];

export { BusService }
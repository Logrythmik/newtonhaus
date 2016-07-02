'use strict';

const _ = require('lodash');
const COMMANDS = require('../../systems/constants').COMMANDS;
const EVENTS = require('../../systems/constants').EVENTS;

class StatusCtrl {
    
    constructor($scope, nhBus, $interval) { 
        this.$scope = $scope; 
        this.bus = nhBus;
        
        var self = this;
        
        var handleEvent = (args) =>{
            if(args.key == self.$scope.config.key)
                self.$scope.state = args;
        };       
        
        this.bus.on(EVENTS.STATE_CHANGED, handleEvent); 
        this.bus.on(EVENTS.STATE_REFRESHED, handleEvent);
        
        this.bus.once('socket-initialized', (args)=> {
            let sessionId = args.sessionId;        
            var getState = () => {
                self.bus.command(COMMANDS.GET_STATE, {key: self.$scope.config.key, sessionId });
            };                
            self.bus.on('refresh', getState);
            $interval(getState, 3000);
            getState();
        }); 
        
        
        this.$scope.set = () => {
            var self = this;
            this.bus.command(COMMANDS.SET_STATE, {key: self.$scope.config.key});
        }       
    }
}
StatusCtrl.$inject = ['$scope', 'nhBus', '$interval'];

class MessageCtrl {    
    constructor(nhBus) { 
        this.bus = nhBus;
        var self = this;        
        this.bus.on(self.config.event, (args) => {
            self.message = args[self.config.select];
        });         
    }
}
MessageCtrl.$inject = ['nhBus'];


var ConfirmClickDirective = ($timeout, $compile) => {
    return {
        scope: {},
        link: function (scope, element, attrs) {
            scope.confirmingAction = false;

            var originalHtml = element.html();
            var hasConfirmed = false;
            var promise;
            
            var restoreText = function () {
                element.removeClass('md-warn');
                element.html(originalHtml);
                $compile(element.contents())(scope.$parent);
                scope.confirmingAction = false;
            };

            return element.bind('click', function () {
                if (!scope.confirmingAction) {
                    scope.$apply(function () {
                        element.text(attrs.confirmMessage || 'Click to confirm');
                        element.addClass('md-warn');
                        return scope.confirmingAction = true;
                    });
                    return promise = $timeout(restoreText, 1500);
                } else {
                    if (hasConfirmed) {
                        return undefined;
                    }
                    hasConfirmed = true;
                    $timeout.cancel(promise);
                    var result = scope.$parent.$apply(attrs.confirmClick);
                    restoreText();
                    hasConfirmed = false;
                    return result;
                }
            });
        }
    };
}

ConfirmClickDirective.$inject = ['$timeout','$compile'];

export { StatusCtrl, MessageCtrl, ConfirmClickDirective }
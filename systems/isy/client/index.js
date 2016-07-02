/* global angular */
'use strict';
 
const {DeviceCtrl, LockCtrl, GarageCtrl, VariableCtrl} = require('./controllers'); 

angular
	.module('newtonMaus-isy',['ngMaterial', 'ngMdIcons'])
 	.config(function($mdThemingProvider){
		$mdThemingProvider.theme('default');
	})  
    
    // filters 
    
    
    .filter('power', ()=> {
        return (input) => {
            return input ? 'On' : 'Off';            
        }
    })
    
    .filter('lightlevel', ()=> {
        return (input) => {
            switch(input){
                case 0: return 'Off';
                case 25: return 'Quarter';
                case 50: return 'Half';
                case 75: return 'Three Quarters';
                case 100: return 'Full Power';
            }
            return null;
        }
    })    
         
    // directives
    
   
    
    .directive('isySwitch', ()=> {
        return {
            restrict: 'E',
            controller: DeviceCtrl,
            controllerAs: 'deviceCtrl',  
            bindToController: true,
            scope: { config: '=' },           
            templateUrl: '/isy/controls/switch.html',     
            replace: true
        }
    })
    
    .directive('isySwitchButton', ()=> {
        return {
            restrict: 'E',
            controller: DeviceCtrl,
            controllerAs: 'deviceCtrl',  
            bindToController: true,
            scope: { config: '=' },           
            templateUrl: '/isy/controls/switch-button.html',     
            replace: true
        }
    })
    
    .directive('isyLightDim', ()=> {
        return {
            restrict: 'E',
            controller: DeviceCtrl,
            controllerAs: 'deviceCtrl',  
            bindToController: true,
            scope: { config: '=' },           
            templateUrl: '/isy/controls/light-dim.html',             
            replace: true
        }
    })
    
    
    .directive('isyLightDimSelect', ()=> {
        return {
            restrict: 'E',
            controller: DeviceCtrl,
            controllerAs: 'deviceCtrl',  
            bindToController: true,
            scope: { config: '=' },           
            templateUrl: '/isy/controls/light-dim-select.html',             
            replace: true
        }
    })
        
    .directive('isySceneButton', ()=> {
        return {
            restrict: 'E',
            controller: DeviceCtrl,
            controllerAs: 'deviceCtrl',  
            bindToController: true,
            scope: { config: '=' },           
            templateUrl: '/isy/controls/scene-button.html',            
            replace: true
        }
    })
    
    .directive('isyFan', ()=> {
        return {
            restrict: 'E',
            controller: DeviceCtrl,
            controllerAs: 'deviceCtrl',  
            bindToController: true,
            scope: { config: '=' },           
            templateUrl: '/isy/controls/fan.html', 
            replace: true
        }
    })   
    
    
    .directive('isyLock', ()=> {
        return {
            restrict: 'E',
            controller: LockCtrl,
            controllerAs: 'deviceCtrl',  
            bindToController: true,
            scope: { config: '=' },           
            templateUrl: '/isy/controls/lock.html',  
            replace: true
        }
    })
    
    
    .directive('isyOutlet', ()=> {
        return {
            restrict: 'E',
            controller: DeviceCtrl,
            controllerAs: 'deviceCtrl',  
            bindToController: true,
            scope: { config: '=' },           
            templateUrl: '/isy/controls/outlet.html', 
            replace: true
        }
    })
    
    .directive('isyWindow', ()=> {
        return {
            restrict: 'E',
            controller: DeviceCtrl,
            controllerAs: 'deviceCtrl',  
            bindToController: true,
            scope: { config: '=' },           
            templateUrl: '/isy/controls/window.html',  
            replace: true
        }
    })
    
    .directive('isyDoor', ()=> {
        return {
            restrict: 'E',
            controller: DeviceCtrl,
            controllerAs: 'deviceCtrl',  
            bindToController: true,
            scope: { config: '=' },           
            templateUrl: '/isy/controls/door.html',  
            replace: true
        }
    })
    
    .directive('isyGarage', ()=> {
        return {
            restrict: 'E',
            controller: GarageCtrl,
            controllerAs: 'deviceCtrl',  
            bindToController: true,
            scope: { config: '=' },           
            templateUrl: '/isy/controls/garage.html',  
            replace: true
        }
    })
    
    .directive('isyMotion', ()=> {
        return {
            restrict: 'E',
            controller: DeviceCtrl,
            controllerAs: 'deviceCtrl',  
            bindToController: true,
            scope: { config: '=' },           
            templateUrl: '/isy/controls/motion.html', 
            replace: true
        }
    })
    
    .directive('isyGeneric', ()=> {
        return {
            restrict: 'E',
            controller: DeviceCtrl,
            controllerAs: 'deviceCtrl',  
            bindToController: true,
            scope: { config: '=' },           
            templateUrl: '/isy/controls/generic.html', 
            replace: true
        }
    })
    
    .directive('isyVariable', ()=> {
        return {
            restrict: 'E',
            controller: VariableCtrl,
            controllerAs: 'variableCtrl',  
            bindToController: true,
            scope: { config: '=' },           
            templateUrl: '/isy/controls/variable.html', 
            replace: true
        }
    })
         
    ;
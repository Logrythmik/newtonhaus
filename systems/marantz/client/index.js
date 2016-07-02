/* global angular */
'use strict';
 
const {ReceiverCtrl, ZoneCtrl} = require('./controllers'); 

angular
	.module('newtonMaus-marantz',['ngMaterial', 'ngMdIcons'])
 	.config(function($mdThemingProvider){
		$mdThemingProvider.theme('default');
	})  
          
    // directives
    .directive('marantzReceiver', ()=> {
        return {
            restrict: 'E',
            controller: ReceiverCtrl,
            scope: { config: '=' },           
            templateUrl: '/marantz/controls/receiver.html',  
            controllerAs: 'recCtrl',         
            bindToController: true,
            replace: true
        }
    })
    .directive('marantzZone', ()=> {
        return {
            restrict: 'E',
            controller: ZoneCtrl,
            scope: {  config: '=', receiver: '=', zone: '=', id: '=' },
            templateUrl: '/marantz/controls/zone.html',
            controllerAs: 'zoneCtrl',  
            bindToController: true,
            replace: true
        }
    });
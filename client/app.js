/* global angular */
'use strict';
const log = require('../systems/log');
const client = require(`../systems/client`);

// app
const { BusService } = require('./app/services'); 
const { AppCtrl } = require('./app/controllers'); 
const { StatusCtrl, MessageCtrl, ConfirmClickDirective } = require('./app/directives')

angular
.module('newtonMaus', [])
    .constant('nhConstants', {
        EVENTS: {
            PAGE_REFRESH: 'nh.page.refresh'
        }
    })
    .service('nhBus', BusService)
    .service('nhLog', log)
    ;

var dependencies = [ 
        'newtonMaus',     
        'ui.router', 
        'ngMaterial', 
        'ngMdIcons',
        'auth0', 
        'angular-storage', 
        'angular-jwt'     
        ];
        
dependencies = dependencies.concat(client.dependencies);
 
angular
	.module('newtonMausApp', dependencies)
 	.config(($mdThemingProvider, authProvider, $httpProvider, jwtInterceptorProvider) => {
		$mdThemingProvider.theme('default');
        authProvider.init(window.auth0);
        jwtInterceptorProvider.tokenGetter = ['store', function(store) {
            return store.get('token');
        }];
        $httpProvider.interceptors.push('jwtInterceptor');        
	})       
    .controller("nhApp", AppCtrl)     
    .directive('nhDevice', ['$compile', ($compile) => {
        return {
            restrict: 'E',
            scope: { config:'=', nhlayout:'@'},
            link: (scope, element, attrs) => {
                var directive = scope.config.control;
                element.html(`<${directive} config='config'></${directive}>`);
                $compile(element.contents())(scope);
            }
        }
    }])
    .directive('nhStatus', ['nhBus', (nhBus) => {
        return {
            restrict: 'E',
            templateUrl: '/partials/status.html',
            scope: { config:'=', nhlayout:'@'},
            controller: StatusCtrl
        }
    }])
    .directive('nhMessage', () => {
        return {
            restrict: 'E',
            templateUrl: '/partials/message.html',
            scope: { config:'=', nhlayout:'@'},
            controller: MessageCtrl,
            controllerAs: 'messageCtrl',  
            bindToController: true,
        }
    })    
    .directive('confirmClick', ConfirmClickDirective)
    .run((auth)=>{
        auth.hookEvents();
    });
"use strict";

const _ = require('lodash');
const log = require('../../systems/log');
const socket = require('./socket');

class AppCtrl { // Root App -------------------------------------------------------------
    
    constructor($scope, $http, auth, store, jwtHelper, $rootScope, nhBus, $mdSidenav) { 
        this.$scope = $scope; 
        this.$http = $http;
        this.jwtHelper = jwtHelper;
        this.auth = auth;  
        this.store = store;
        this.selectedTab = this.store.get('selected-tab');
        this.bus= nhBus;
        this.$mdSidenav = $mdSidenav;
        var self = this;
                        
        this.bus.on('select-tab', (msg) => {
            self.selectedTab = msg.tab;            
        });
        
        this.bus.on('token-expired', () => {
            self.auth.isAuthenticated = false;
        });
        
        $rootScope.$on('$locationChangeStart', () => {
            var token = self.store.get('token');
            if (token) {
                if(this.jwtHelper.isTokenExpired(token)){
                    self.logout();
                    return;
                }
                if (!auth.isAuthenticated) {
                    var profile = self.store.get('profile');
                    auth.authenticate(profile, token);
                    self.init(token);   
                }     
            }
        });
    }
  
    login() {
        var self = this;
        this.auth.signin({}, 
            function loginSuccess (profile, token) {                 
                self.store.set('profile', profile);
                self.store.set('token', token);
                self.init(token);          
            }, 
            function loginError (err) {
                log.error(err);
            });
    }
    
    init(token){
        var self = this;
        return this.$http.get('/config').then((res)=>{
            self.config = res.data.config;
            self.states = res.data.states;
        }).then(()=>{
            socket.init(token);
        });;
    }
    
  
    logout() {        
        this.auth.signout();
        this.store.remove('profile');
        this.store.remove('token');
    }
    
    onTabSelected(index) {
        this.store.set('selected-tab', index);
    }
    
    refresh() {
        this.bus.emit('refresh');
    }   
    
}

AppCtrl.$inject = ['$scope', '$http','auth', 'store', 'jwtHelper','$rootScope','nhBus','$mdSidenav'];

export { AppCtrl }
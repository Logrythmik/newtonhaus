const expect = require('chai').expect;
const utils = require('../systems/utils');

describe('Utils -> Conditions: systems/utils.js', () => {
      
    it('checks single device state', () => {
        var config = {
            devices: {
                'fake': {
                    power: true,
                    foo: 123
                }
            }};
        var conditions = {
            devices: {
                'fake': {
                    power: true
                }
            }
        };
        var match = utils.checkConditions(config, conditions, {});        
        expect(match).to.equal(true);  
    });
    
    it('checks single device state (negative)', () => {
        var config = {
            devices: {
                'fake': {
                    power: false,
                    foo: 123
                }
            }};
        var conditions = {
            devices: {
                'fake': {
                    power: true
                }
            }
        };
        var match = utils.checkConditions(config, conditions, {});        
        expect(match).to.equal(false);  
    });
    
    it('checks multiple device state', () => {
        var config = {
            devices: {
                'fake': {
                    power: true,
                    foo: 123
                },
                'fake2': {
                    power: false
                }
            }};
        var conditions = {
            devices: {
                'fake': {
                    power: true
                },
                'fake2': {
                    power: false
                }
            }
        };
        var match = utils.checkConditions(config, conditions, {});        
        expect(match).to.equal(true);  
    });
    
    it('checks multiple device state (negative)', () => {
        var config = {
            devices: {
                'fake': {
                    power: true,
                    foo: 123
                },
                'fake2': {
                    power: true
                }
            }};
        var conditions = {
            devices: {
                'fake': {
                    power: true
                },
                'fake2': {
                    power: false
                }
            }
        };
        var match = utils.checkConditions(config, conditions, {});        
        expect(match).to.equal(false);  
    });
  }); 
  
  it('checks time', () => {
        var config = {};
        var conditions = {
            time: {
                before: '2100' // 9m
            }
        };
        
        var match = utils.checkConditions(config, conditions, {});
        
        expect(match).to.equal(true);  
  });
  
});
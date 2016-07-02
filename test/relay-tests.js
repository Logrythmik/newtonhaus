const expect = require('chai').expect;
const relay = require('../systems/relay');

const context = {
    app: {
        use: () => {},
        post: () => {},
        get: () => {}
    },
    bus: {
        on: () => {},
        emit: () => {}
    },
    config: {}
}

describe('Event Relay: systems/relay.js', () => {
  describe('init()',  () => {
      
      
    it('register a listener for each event', () => {
        var registerCount = 0;
        
        context.config= {   
            eventRelays: [{ 
                name: 'Test Relay',
                event: 'TEST1',
                eventArgs: {
                    address: 'ZW006_1'
                },
                command: 'Test Command',
                commandArgs: { foo: 1}                
            }]
        };
            
        context.bus  =  { //mock bus
            on: (event, fnc) => {
                registerCount++;
            },            
            emit: (evt, args) => {
                
            }    
        };
                
        relay.init(context);  
            
        expect(registerCount).to.equal(1);        
    });
  });
  
});
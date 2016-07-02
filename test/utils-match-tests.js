const expect = require('chai').expect;
const utils = require('../systems/utils');

describe('Utils -> Match Tests: systems/utils.js', () => {
      
    it('performs simple object-matching', () => {
        var match = utils.match({
            foo: 1,
            goo: 2
        }, {
            goo: 2
        });        
        expect(match).to.equal(true);
    });
    
    it('performs simple object-matching (negative)', () => {
        var match = utils.match({
            foo: 1,
            goo: 2
        }, {
            goo: 1
        });        
        expect(match).to.equal(false);
    });
    
    it('performs complex deep object-matching',  () => {
        var match = utils.match({
            foo: 1,
            goo: { doo: { boo: 1 } }
        }, 
        { goo: { doo: { boo: 1 } } });        
        expect(match).to.equal(true);        
    });
    
    it('performs complex deep object-matching (negative)',  () => {
        var match = utils.match({
            foo: 1,
            goo: { doo: { boo: 2 } }
        }, 
        { goo: { doo: { boo: 1 } } });        
        expect(match).to.equal(false);        
    });
    
    it('performs complex object-matching, using a function',  () => {
        var match = utils.match({
            foo: 1,
            goo: { doo: { boo: 1 } }
        }, 
        { foo: (val) => {
            return val == 1;
        } });        
        expect(match).to.equal(true);        
    }); 
       
    // TODO: this isn't working yet, but we don't have use-cases for it   
    /*it('performs complex object-matching, using an array',  () => {          
        var match = utils.match({
            foo: [1,2,3,4,5,6],
            goo: { doo: { boo: 1 } }
        }, 
        { foo: [1] }); 
        
        expect(match).to.equal(true);  
    });
    */
  
});
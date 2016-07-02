const server = require('./server');
const constants = require('./constants');

module.exports = {
    info: { 
        name: 'Smart Home',
        namespace: 'insteon-isy'
    },
    client: true,
    server: server,
    constants: constants    
}
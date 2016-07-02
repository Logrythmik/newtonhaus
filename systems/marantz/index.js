const server = require('./server');
const constants = require('./constants');

module.exports = {
    info:  { 
        name: 'Marantz',
        namespace: 'marantz'
    },
    client: true,
    server: server,
    constants: constants
}
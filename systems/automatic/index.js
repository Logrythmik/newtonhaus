const server = require('./server');

module.exports = {
    info: { 
        name: 'Automatic Event Streaming',
        namespace: 'automatic'
    },
    server: server,
    client: true,
    constants: {}    
}
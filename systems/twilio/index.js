const server = require('./server');
const constants = require('./constants');

module.exports = {
    info: {
        name: 'Twilio',
        namespace: 'twilio'
    },
    client: true,
    server: server,
    constants: constants
}
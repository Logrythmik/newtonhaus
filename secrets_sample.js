module.exports = {
    auth0: {
        privateKey: 'xx',
        audience: 'xx'
    }, 
    automatic: {
        clientId: 'xx',
        clientSecret: 'xx',
        users: [{
            id: 'x',
            name: 'Some User'
        }]
    },
    isy: {
        ipAddress: '192.168.1.2',      
        username: 'xx',
        password: 'xx'
    },
    marantz: {
        // Configure each of the receivers below
        receivers: [{
            ipAddress: '192.168.1.3',
            zones: [{
                name: 'Master Bedroom',
                index: 1
            },{
                name: 'Bathroom',
                index: 2
            }]
        },{
            ipAddress: '192.168.1.4',
            zones: [{
                name: 'Lounge', 
                index: 1
            }]
        },{
            ipAddress: '192.168.1.5',
            zones: [{
                name: 'Living Room',
                index: 1
            },{
                name: 'Deck',
                index: 2  
            }]     
        }]
    },
    twilio: {
        sid: 'xx',
        token: 'x',
        number: 'x',
        notification_numbers: ['xx','xx']
    }
}
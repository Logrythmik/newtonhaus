const SYS = require('./systems/constants')
const ISY = require('./systems/isy/constants');
const MARANTZ = require('./systems/marantz/constants');
const TWILIO = require('./systems/twilio/constants');
const AUTOMATIC = require('./systems/automatic/constants');

const JASONPHONE = "2:1";
const BRIANPHONE = "2:3";
const JASONPHONE2 = "2:2";

const UI_WARN = {
    fill: 'rgb(255,87,34)',
    color: 'rgb(255,87,34)'
}

module.exports = {
    
    systems: ['isy','marantz','twilio'], //'automatic'],        
    
    debug: true,
           
    eventRelays: [{ 
        name: 'Front door notification',
        event: ISY.EVENTS.DEVICE_CHANGED,
        eventArgs: {
            address: 'ZW006_1'
        },
        command: TWILIO.COMMANDS.SEND_SMS,
        commandArgs: (args) => {
            if(args.power)
                return { message: 'The front door is locked'};
            else 
                return { message: 'The front door is unlocked'};
        } 
    },{ 
        name: 'Back door notification',
        event: ISY.EVENTS.DEVICE_CHANGED,
        eventArgs: {
            address: 'ZW007_1'
        },
        command: TWILIO.COMMANDS.SEND_SMS,
        commandArgs: (args) => {
            if(args.power)
                return { message: 'The back door is locked'};
            else 
                return { message: 'The back door is unlocked'};
        } 
    },{ 
        name: 'Door to the Font Garage notification',
        event: ISY.EVENTS.DEVICE_CHANGED,
        eventArgs: {
            address: 'ZW009_1'
        },
        command: TWILIO.COMMANDS.SEND_SMS,
        commandArgs: (args) => {
            if(args.power)
                return { message: 'The door to the Front garage is locked'};
            else 
                return { message: 'The door to the Front garage is unlocked'};
        } 
    },{ 
        name: 'Door to the Back Garage notification',
        event: ISY.EVENTS.DEVICE_CHANGED,
        eventArgs: {
            address: 'ZW010_1'
        },
        command: TWILIO.COMMANDS.SEND_SMS,
        commandArgs: (args) => {
            if(args.power)
                return { message: 'The door to the Back garage is locked'};
            else 
                return { message: 'The door to the Back garage is unlocked'};
        } 
    },{ 
        name: 'Front garage notification',
        event: ISY.EVENTS.DEVICE_CHANGED,
        eventArgs: {
            address: '20 F9 CE 1'
        },
        command: TWILIO.COMMANDS.SEND_SMS,
        commandArgs: (args) => {
            if(args.power)
                return { message: 'The front garage is open'};
            else 
                return { message: 'The front garage is closed'};
        } 
    },{ 
        name: 'Shop garage notification',
        event: ISY.EVENTS.DEVICE_CHANGED,
        eventArgs: {
            address: '2F 74 6D 1'
        },
        command: TWILIO.COMMANDS.SEND_SMS,
        commandArgs: (args) => {
            if(args.power)
                return { message: 'The shop garage is open'};
            else 
                return { message: 'The shop garage is closed'};
        } 
    },{ 
        name: 'Alley truck garage notification',
        event: ISY.EVENTS.DEVICE_CHANGED,
        eventArgs: {
            address: '24 5E 4A 1'
        },
        command: TWILIO.COMMANDS.SEND_SMS,
        commandArgs: (args) => {
            if(args.power)
                return { message: 'The truck garage is open'};
            else 
                return { message: 'The truck garage is closed'};
        } 
    },{ 
        name: 'Alley scooter garage notification',
        event: ISY.EVENTS.DEVICE_CHANGED,
        eventArgs: {
            address: '25 2C C2 1'
        },
        command: TWILIO.COMMANDS.SEND_SMS,
        commandArgs: (args) => {
            if(args.power)
                return { message: 'The scooter garage is open'};
            else 
                return { message: 'The scooter garage is closed'};
        } 
    },{
        name: 'Lock down the house and notify the owners.',
        event: 'nm.LockDown', 
        commands: [{
            command: SYS.SET_STATE,
            args: { key: 'lockdown' }
        },{
            command: TWILIO.COMMANDS.SEND_SMS,
            args: { message: 'Locking down the house.' }
        },]
    },{ 
        name: 'Jason is home',
        event: ISY.EVENTS.VARIABLE_CHANGED,
        eventArgs: {
            key: JASONPHONE,
            value: 1
        },   
        command: TWILIO.COMMANDS.SEND_SMS,
        commandArgs:  { 
            number: '+13039565688',
            message: 'Welcome home Jason. Text Open to open the garage and front door.'                     
        } 
    },{ 
        name: 'Jason open text',
        event: TWILIO.EVENTS.SMS_RECEIVED,
        eventArgs: {
            from: '+13039565688',
            body: 'Open'
        },   
        commands: [{
            command: TWILIO.COMMANDS.SEND_SMS,
            args: {
                message: "Opening the house for Jason..."
            }
        },{
            command: ISY.COMMANDS.GARAGE_TRIGGER,
            args: {
                 address: '20 F9 CE'
            }
        },{
            command: ISY.COMMANDS.LOCK_SET,
            args: {
                 address: 'ZW006_1',
                 power: false
            }
        }]
    },{ 
        name: 'Jason close text',
        event: TWILIO.EVENTS.SMS_RECEIVED,
        eventArgs: {
            from: '+13039565688',
            body: 'Close'
        },   
        command: 'nm.LockDown'
    },{ 
        name: 'Brian Texted',
        event: TWILIO.EVENTS.SMS_RECEIVED,
        eventArgs: {
            from: '+15154913110'
        },
        command: TWILIO.COMMANDS.SEND_SMS,
        commandArgs:  { 
            number: '+15154913110',
            message: 'Hi Brian'                     
        } 
    }],
    
    states: {
        lockdown :{
            name: 'Lock Down',
            key: 'lockdown',
            monitor: true,
            monitorInterval: 10000,
            devices: [{
                name: 'Front Door',
                system: 'isy',
                address: 'ZW006_1',
                expect: { power: true}
            },{
                name: 'Back Door',
                system: 'isy',
                address: 'ZW007_1',
                expect: { power: true}
            },/*{
                name: 'Door to the Front Garage',
                system: 'isy',
                address: 'ZW009_1',
                expect: { power: true}
            },{
                name: 'Door to the Back Garage',
                system: 'isy',
                address: 'ZW010_1',
                expect: { power: true}
            },*/
            {
                name: 'Front Garage',
                system: 'isy',
                address: '20 F9 CE',
                expect: { power: false}
            },{
                name: 'Shop Garage',
                system: 'isy',
                address: '2F 74 6D',
                expect: { power: false}
            },{
                name: 'Truck Garage',
                system: 'isy',
                address: '24 5E 4A',
                expect: { power: false}
            },{
                name: 'Scooter Garage',
                system: 'isy',
                address: '25 2C C2',
                expect: { power: false}
            }]
        }
    },
   

    jobs:[{
        name: 'Test Message every Minute',
        cron: { minute: null },        
        command: 'nm.LockDown',
        conditions: {            
            states: {
                lockdown: { meetsExpectations: false }
            },            
            variables: {                
                JASONPHONE : { value: 0 },
                BRIANPHONE : { value: 0 }
            }
        }
    }],
    
    // client config
    client: {
        title: 'newtonMaus',
        systems: [{
            title:'Insteon Settings',
            partial: '/isy/settings.html'
        },{
            title:'Marantz Settings',
            partial: '/marantz/settings.html'
        },{
            title:'Twilio Settings',
            partial: '/twilio/settings.html'
        }],
        auth0: {
            // Auth 0 client info
            domain: 'newtonhaus.auth0.com',
            clientID: '9Tz2I2DUrgOKMjUYA0pgYgXUMyGRo7DP'
        },
        devices: [{
            control: 'nh-status',
            name: 'House Lockdown',
            key: 'lockdown',
            icon: 'lock',
            icon_open: 'lock_open'                
        }],
        tabs: [{
            name: 'Main',  
            sections: [{
                name: 'Lights',
                layout: 'row', 
                devices: [{
                    address: '19038',
                    name: 'All Lights',
                    control: 'isy-switch-button',
                    flex: 'auto'
                },{
                    address: '8508',
                    name: 'Kitchen Lights',
                    control: 'isy-switch-button',
                    flex: 'auto'
                },{
                    address: '24230',
                    name: 'Wall Lights',
                    control: 'isy-switch-button',
                    flex: 'auto'
                },
                {
                    address: '22 E0 6 1',
                    name: 'Dining Room',
                    control: 'isy-switch-button',
                    flex: 'auto'
                },{
                    address: '31673',
                    name: 'Main Lights',
                    control: 'isy-switch-button',
                    flex: 'auto'
                }]
            },{
                name: 'Scenes',
                layout: 'row',
                devices: [{
                    address: '33574',
                    name: 'Head to Bed',
                    control: 'isy-scene-button',
                    flex: 'auto',
                    power: true
                },{
                    address: '60756',
                    name: 'Watching TV',
                    control: 'isy-scene-button',
                    flex: 'auto',
                    power: true
                },{
                    address: '19038',
                    name: 'All Lights On',
                    control: 'isy-scene-button',
                    flex: 'auto',
                    power: true
                }]
            },{               
                name: 'Audio',
                layout: 'row',
                devices: [{
                    address: '192.168.75.16',
                    name: 'Main floor receiver',
                    control: 'marantz-receiver' ,
                    flex: 100              
                }]
            }]
        },{ 
            name: 'Master',
            sections: [{
                name: 'Lights & Fan',
                layout: 'row', 
                devices: [{
                    address: '14 C9 9B 2',
                    name: 'Master Fan',
                    control: 'isy-fan',
                    flex: 'auto'
                },{
                    address: '14 C9 9B 1',
                    name: 'Master Light',
                    control: 'isy-light-dim-select',
                    flex: 'auto'
                },{
                    address: '23 B0 15 1',
                    name: 'Bathroom Lights',
                    control: 'isy-light-dim-select',
                    flex: 'auto'
                }]
            },{
                name: 'Scenes',
                layout: 'row',
                devices: [{
                    address: '27028',
                    name: 'Good Night House',
                    control: 'isy-scene-button',
                    flex: 50,
                    power: false
                },{
                    address: '50381',
                    name: 'Bath Time',
                    control: 'isy-scene-button',
                    flex: 50
                },{
                    address: '664',
                    name: 'Bedroom Lights',
                    control: 'isy-switch-button'
                }]
            },{
                name: 'Audio',
                layout: 'row',
                devices: [{                
                    address: '192.168.75.14',
                    name: 'Master Bedroom Receiver',
                    control: 'marantz-receiver',
                    flex: 100
                }]
            }]
        },{      
            name: 'Lounge',
            sections: [{
                name: 'Lights',
                layout: 'row',
                devices: [{
                    address: '30740',
                    name: 'All Lights',
                    control: 'isy-switch-button',
                    flex: 'auto'
                },{
                    address: '1063',
                    name: 'Non-Basement Lights',
                    control: 'isy-switch-button',
                    flex: 'auto'
                }]
            },{
                name: 'Scenes',
                layout: 'row',
                devices: [{
                    address: '41028',
                    name: 'Movie Time',
                    control: 'isy-scene-button',
                    flex: 'auto'
                },{
                    address: '33574',
                    name: 'Head to Bed',
                    control: 'isy-scene-button',
                    flex: 'auto'
                }]
            },{
                name: 'Audio',
                layout: 'row',
                devices: [{
                    address: '192.168.75.15',
                    name: 'Basement Receiver',
                    control: 'marantz-receiver',
                    flex: 100               
                }]
            }]          
        },{
            name: 'Exterior',
            sections: [{
                name: 'Doors',
                layout: 'row',
                icon: '',
                devices: [{
                    address: 'ZW006_1',
                    name: 'Front Door',
                    control: 'isy-lock',
                    flex: 50
                },{
                    address: 'ZW007_1',
                    name: 'Back Door',
                    control: 'isy-lock',
                    flex: 50
                },{
                    address: 'ZW009_1',
                    name: 'Front Garage',
                    control: 'isy-lock',
                    flex: 50
                },{
                    address: 'ZW010_1',
                    name: 'Back Garage',
                    control: 'isy-lock',
                    flex: 50
                }]
            },{
                name: 'Garage Doors',
                layout: 'row',
                icon: '',
                devices: [{
                    address: '20 F9 CE',
                    name: 'Front Garage',
                    control: 'isy-garage',
                    flex: 50
                },{
                    address: '2F 74 6D',
                    name: 'Shop Garage',
                    control: 'isy-garage',
                    flex: 50
                },{
                    address: '25 2C C2',
                    name: 'Scooter Garage',
                    control: 'isy-garage',
                    flex: 50
                },{
                    address: '24 5E 4A',
                    name: 'Truck Garage',
                    control: 'isy-garage',
                    flex: 50
                }]
            },{
                name: 'Lights',
                layout: 'row',
                icon: '',
                devices: [{
                    address: '22 14 B5 1',
                    name: 'Front Porch',
                    control: 'isy-switch-button',
                    flex: 'auto'
                },{
                    address: '2383',
                    name: 'Back Yard',
                    control: 'isy-switch-button',
                    flex: 'auto'
                }]
            },{               
                name: 'Status',
                layout: 'row',
                devices: [{
                    key: JASONPHONE,
                    name: 'Jason\'s Phone',
                    control: 'isy-variable',
                    icon: 'phone_iphone',
                    flex: 50,
                    switch: {
                        '1':  {
                            text: 'Jason is Home'
                        },
                        '0': {
                            text: 'Jason is Not Home',
                            style: UI_WARN
                        }
                    }              
                },
                /*{
                    key: JASONPHONE2,
                    name: 'Jason\'s Phone',
                    control: 'isy-variable',
                    icon: 'phone_iphone',
                    flex: 50,
                    switch: {
                        '1':  {
                            text: 'Jason is upstairs'
                        },
                        '0': {
                            text: 'Jason is not upstairs',
                            style: UI_WARN
                        }
                    }              
                },*/
                {
                    key: BRIANPHONE,
                    name: 'Brian\'s Phone',
                    control: 'isy-variable',
                    icon: 'phone_iphone',
                    flex: 50,
                    switch: {
                        '1':  {
                            text: 'Brian is Home',
                        },
                        '0': {
                            text: 'Brian is Not Home',
                            style: UI_WARN
                        }
                    }             
                }/*,{
                    name: 'Test Messages',
                    control: 'nh-message',
                    event: 'Test.Message',
                    flex: 100,
                    select: 'message'
                }*/]
            }]
        }]
    }
}

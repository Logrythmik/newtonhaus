
"use strict"

/*
    To enable running the command outside of the program root directory, 
    we set the process directory to the directy the script is located in
    fo module loads will be properly pathed.
*/
process.chdir(__dirname);

const config = require('../../config');

// Init Service  -----------------------------------------------------

const bus = require('../bus');
const isy = require(`./server`);
const log = require('../log');
const yargs = require('yargs');
//const ISY = require('isy-js');

isy.init(config.systems.isy, bus, (err, isy) => {
    if(err) {
        console.error(err);
        return;
    }
   
    yargs.usage('Usage: $0 <command> [options]')
        .command('status', 'Displays current ISY information.', function (yargs, argv) {
            argv = yargs.option('a', {
                alias: 'address',
                demand: true,
                description: 'The address of the light or scene'
            })
            .help('help')
            .argv;
            console.dir(config);
            
            var device = isy.getDevice(argv.address);
            console.dir(device);
        })
        .command('set', 'Turns a light or scene on or off, or sets a light to a specific level', function (yargs, argv) {
            argv = yargs.option('a', {
                alias: 'address',
                demand: true,
                description: 'The address of the light or scene'
            })
            .option('off', {
                default: false,
                description: 'Flag to turn scene off',
                type: 'boolean'
            })
            .option('l', {
                alias: 'level',
                description: 'The level to set a device to. Scenes are not supported by ISY.'
            })
            .help('help')
            .argv;

            console.dir('sending bus command for ' + argv.address);
            if(argv.off) {
                bus.emit('Insteon.Light.TurnOff', {address: argv.address});
            } else {
                if(argv.level) {
                    bus.emit('Insteon.Light.SetLevel', {address: argv.address, level: argv.level});    
                } else {
                    bus.emit('Insteon.Light.TurnOn', {address: argv.address});    
                }
            }
        })
        .command('garage', 'Get a garage door status and enables control.', function (yargs, argv) {
            argv = yargs.option('a', {
                alias: 'address',
                demand: true,
                description: 'The address of the garage door'
            })
           .option('trigger', {
                default: false,
                description: 'Flag to trigger the door relay',
                type: 'boolean'
            })
            .help('help')
            .argv;

            var regex = /^(([a-fA-F0-9]{2}\s){3})(.*)$/
            var baseAddress = argv.address.match(regex)[1].trim();
            
            var device = isy.getDevice(baseAddress + ' 1');
            console.dir(device);
            
            if(argv.trigger) {
                var relay = isy.getDevice(baseAddress + ' 2');
                relay.sendOutletCommand(true, (success) => {
                    console.log('success: ' + success);
                })
            }
        })
        .demand(1)
        .help('help')
        .argv;
});


"use strict"

/*
    To enable running the command outside of the program root directory, 
    we set the process directory to the directy the script is located in
    fo module loads will be properly pathed.
*/
process.chdir(__dirname);

const defaultIpAddress = '192.168.75.16'
const marantz = require('./server/controller');

const argv = require('yargs')
    .usage('Usage: $0 <command> [options]')
    .command('status', 'Displays current receiver information.', function (yargs, argv) {
            argv = yargs.option('a', {
                alias: 'ipAddress',
                demand: true,
                default: defaultIpAddress,
                description: 'IP Address of receiver'
            })
            .help('help')
            .argv;
            
            marantz.refreshReceiver({ipAddress: argv.ipAddress}, function(receiver) {
                console.dir(receiver);
            });
        })
    .command('set', 'Set command for supported options', function(yargs, argv) {
        argv = yargs.option('a', {
                alias: 'ipAddress',
                demand: true,
                default: defaultIpAddress,
                description: 'IP Address of receiver'
            })
            .option('z', {
                alias: 'zone',
                demand: true,
                default: 1,
                description: 'The zone to control' })
            .command('input', 'input', function(yargs, argv) {
                    var argl = yargs.option('i', {
                            alias: 'input',
                            demand: true,
                            description: 'Input to select.'
                        })
                        .argv;
                    marantz.setInput(argv.ipAddress, argl.input, argv.zone, function() { });})
            .command('mute', 'mute', function(yargs, argv) {
                    var argl = yargs.option('m', {
                            alias: 'mute',
                            demand: true,
                            default: false,
                            description: 'Mute.',
                            type: 'boolean'
                        })
                        .argv;
                    marantz.setMute(argv.ipAddress, argl.mute, argv.zone, function() { });})
            .command('power', 'power', function(yargs, argv) {
                    var argl = yargs.option('p', {
                            alias: 'power',
                            demand: true,
                            default: true,
                            description: 'Power',
                            type: 'boolean'
                        })
                        .example('marantz set power -p false', 'ensures the receiver zone 1 is off')
                        .example('marantz set power -p true -z 2', 'ensures the receiver zone 2 is on')
                        .help('help')
                        .argv;
                    marantz.setPower(argv.ipAddress, argl.power, argv.zone, function() { });})
            .command('volume', 'volume', function(yargs, argv) {
                    var argl = yargs.option('v', {
                            alias: 'volume',
                            demand: true,
                            description: 'Volume. Use --volume=-{value} for negative volume levels.'
                        })
                        .example('marantz set volume --volume=-15', 'sets the volume to -15 dB')
                        .example('marantz set volume --volume=-15 --zone=2', 'sets the volume of zone 2 to -15 dB')
                        .argv;
                    marantz.setVolume(argv.ipAddress, argl.volume, argv.zone, function() { });})
            .demand(2)
            .help('help')
            .argv;
    })
    .demand(1)
    .help('help')
    .argv;

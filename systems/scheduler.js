'use strict';
const _ = require('lodash');
const log = require('./log');
const schedule = require('node-schedule');

const match = require('./utils').match;
const checkConditions= require('./utils').checkConditions;

const init = (context) => {
    let bus = context.bus;
    let app = context.app;
    let dirname = context.dirname;    
    let config = context.config;
        
    var doTask = (job, config) => {
        var run = true;
        if(job.conditions && !checkConditions(config, job.conditions))
            return;
        if(_.isFunction(job.run))
            job.run(config, bus);
        if(job.command)
            bus.emit(job.command, job.commandArgs);
        if(job.commands && _.isArray(job.commands)) {
            _.each(relay.commands, (command) => {
                var commandArgs = command.args;
                if(_.isFunction(command.args))
                    commandArgs = job.args(args)
                bus.emit(command, commandArgs);
            });
        }
    }
    
    // setup jobs
    _.each(config.jobs, (job) => {
        log.trace(`Configuring job ${job.name}`); 
        schedule.scheduleJob(job.cron, ()=> {
            doTask(job, config);
        });        
    });    
}

module.exports.init = init;
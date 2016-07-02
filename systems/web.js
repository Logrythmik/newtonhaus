"use strict"

const mustacheExpress = require('mustache-express');
const engine = mustacheExpress();
const bodyParser = require('body-parser');

module.exports.init = (context) => {
    let bus = context.bus;
    let app = context.app;
    let dirname = context.dirname;    
    let config = context.config;
    let jwtCheck = context.jwtCheck;
    let secrets = context.secrets;
    let express = context.express;
        
    app.set('view engine', 'mustache');
    app.set('views', dirname + '/client');
    app.set('port', 3000);
    app.use(express.static(dirname + '/public'));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({
        extended: true
    }));
        
    // Routes -----------------------------------------------
    
    app.use('/config', jwtCheck);
    
    app.engine('mustache', engine);
    // app
    app.get('/', (req, res) => {
        if(config.debug)
            engine.cache.reset();
        res.render('app.mustache', {           
            debug: config.debug, 
            config: config.client 
        });
    });

    // app config
    app.get('/config', (req, res) => {
        res.json({
            config: config.client, 
            states: config.states, 
            devices: config.devices,
            variables: config.variables
        });
    });
    app.get('/config/client', (req, res) => {
        res.json(config.client);
    });
    app.get('/config/states', (req, res) => {
        res.json(config.states);
    });
    app.get('/config/devices', (req, res) => {
        res.json(config.devices);
    });
    app.get('/config/variables', (req, res) => {
        res.json(config.variables);
    });
    app.get('/config/state', (req, res) => {
        res.json(config.state);
    });

    // app cache
    app.get("/app.appcache", (req, res) => {
        res.set("Content-Type", "text/cache-manifest");
        res.set("Cache-Control", "no-store, no-cache");
        res.set("Expires", "-1");
        res.sendFile(dirname + "/client/app.appcache");
    });
}
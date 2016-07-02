/* global Buffer */
/* global __dirname */
"use strict"
const secrets = require('./secrets');

// Web  -----------------------------------------------
const express = require('express');
const http = require('http');
const jwt = require('express-jwt');
const app = express();
const server = http.createServer(app);

const jwtCheck = jwt({
  secret: new Buffer(secrets.auth0.privateKey , 'base64'),
  audience: secrets.auth0.audience
});

if (process.env.NODE_ENV === 'development')
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
  
  
// Systems  -----------------------------------------------------
const config = require('./config'); 
const systems = require('./systems');

var context = {
    config, 
    secrets,
    app, 
    express, 
    dirname: __dirname,
    jwtCheck
    };
    
systems.init(context);
    
// Socket -----------------------------------------------
const socket = require('./systems/socket');
const socketioJwt = require("socketio-jwt");
const io = require('socket.io').listen(server);
io.use(socketioJwt.authorize({
  secret: Buffer(secrets.auth0.privateKey, 'base64'),
  handshake: true
}));
io.sockets.on('connection', (sockets) =>{
    context.sockets = sockets;
    context.sockets.io = io;
    socket.init(context);
});

const port = app.get('port');

// Start -----------------------------------------------
server.listen(port,  () => {
    let env = app.get('env');
    console.log(`Express server listening on port ${port} in ${env} mode`);
});

module.exports = app;





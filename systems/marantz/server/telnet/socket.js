"use strict";

/**
 * Module dependencies.
 */
var net = require('net')
var on = require('./on');
var Emitter = require('component-emitter');
var bind = require('component-bind');
var _ = require('lodash');
var parser = require('./parser');

/**
 * Module exports.
 */
module.exports = exports = Socket;

/**
 * Shortcut to `Emitter#emit`.
 */
var emit = Emitter.prototype.emit;

/**
 * `Socket` constructor.
 *
 * @api public
 */
function Socket (ipAddress, fn) {
  this.ipAddress = ipAddress;
  this.connected = false;
  this.disconnected = true;
  this.open(fn);
}

/**
 * Subscribe to open, close and packet events
 *
 * @api private
 */
Emitter(Socket.prototype);

/**
 * Subscribe to open, close and packet events
 *
 * @api private
 */
Socket.prototype.subEvents = function () {
  if (this.subs) return;

  var socket = this.socket;
  this.subs = [
    on(this.socket, 'connect', bind(this, 'onconnect')),
    on(this.socket, 'data', bind(this, 'ondata')),
    on(this.socket, 'end', bind(this, 'onend')),
    on(this.socket, 'error', bind(this, 'onerror'))
  ];
};

/**
 * "Opens" the socket.
 *
 * @api public
 */
Socket.prototype.open = 
Socket.prototype.connect = function(fn) {
    if (this.connected) return this;

    this.emit('connecting');
    this.subEvents();
    this.socket = net.createConnection({
        host: this.ipAddress,
        port: 23
    }, () => {
        
        this.onopen();
    }, fn);
    
    return this;
}

/**
 * Called upon engine `open`.
 *
 * @api private
 */

Socket.prototype.onopen = function () {
  console.log('transport is open');
  this.emit('connect');
};

/**
 * Called upon engine `close`.
 *
 * @param {String} reason
 * @api private
 */

Socket.prototype.onclose = function (reason) {
  console.log('close:' + reason);
  this.connected = false;
  this.disconnected = true;
  delete this.id;
  this.emit('disconnect', reason);
};

/**
 * Called with socket data.
 *
 * @param {Object} packet
 * @api private
 */

Socket.prototype.ondata = function (data) {
    var received = data.toString().split('\r');
    _.each(received, command => {
        if(command != '') {
            var data = parser.parse(command);
            if(data) this.emit('data', data);
        }
    });
};

/**
 * Called upon server connect.
 *
 * @api private
 */

Socket.prototype.onconnect = function () {
  this.connected = true;
  this.disconnected = false;
};

/**
 * Called upon server disconnect.
 *
 * @api private
 */

Socket.prototype.onend = function () {
  debug('server disconnect');
  this.destroy();
  this.onclose('server disconnect');
};

/**
 * Called upon forced client/server side disconnections,
 * this method ensures the manager stops tracking us and
 * that reconnections don't get triggered for this.
 *
 * @api private.
 */

Socket.prototype.destroy = function () {
  if (this.subs) {
    // clean subscriptions to avoid reconnections
    for (var i = 0; i < this.subs.length; i++) {
      this.subs[i].destroy();
    }
    this.subs = null;
  }

  this.socket.unref();
};

/**
 * Disconnects the socket manually.
 *
 * @return {Socket} self
 * @api public
 */

Socket.prototype.close =
Socket.prototype.disconnect = function () {
  if (this.connected) {
    debug('performing disconnect');
    this.packet({ type: parser.DISCONNECT });
  }

  // remove socket from pool
  this.destroy();

  if (this.connected) {
    // fire events
    this.onclose('client disconnect');
  }
  return this;
};

/**
 * Errors on the socket.
 *
 * @return {Socket} self
 * @api public
 */

Socket.prototype.onerror = function (err, val) {
    this.emit('error', err);
};
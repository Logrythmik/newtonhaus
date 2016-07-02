
/**
 * Module dependencies.
 */
var manager = require('./manager')

/**
 * Module exports.
 */

module.exports = exports = Client;

/**
 * `Socket` constructor.
 *
 * @api public
 */
function Client (ipAddress) {
  this.ipAddress = ipAddress;
  this.manager = new manager(this.ipAddress);
}


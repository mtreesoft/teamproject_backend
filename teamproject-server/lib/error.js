var util = require('util');

var TeamProjectError = module.exports = function (msg) {
	// console.log("type === " + msg + " === " + typeof(msg) + ", instance = " + msg.code);
	this.message = (typeof(msg) === "object") ? msg : [msg];
};

util.inherits(TeamProjectError, Error);

TeamProjectError.prototype.name = 'TeamProjectError';
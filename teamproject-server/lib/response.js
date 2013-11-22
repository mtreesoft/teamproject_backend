var Response = module.exports = function(code, message) {
	this.code = code;
	this.message = [];

	if (!message) return;
	
	this.message = Array.isArray(message) ? message : [message];
};

Response.prototype.toString = function() {
	return JSON.stringify(this);
};
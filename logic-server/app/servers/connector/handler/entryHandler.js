var Handler = function(app) {
	this.app = app;
};

module.exports = function(app) {
	return new Handler(app);
};

/**
 * New client entry chat server.
 * 
 * @param {Object}
 *            msg request message
 * @param {Object}
 *            session current session object
 * @param {Function}
 *            next next stemp callback
 * @return {Void}
 */
Handler.prototype.entry = function(msg, session, next) {
	console.log(msg.name + " " + msg.ps);
	next(null, {
		code : 200,
		msg : 'game server is ok.'
	});
};

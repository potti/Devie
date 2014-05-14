var userDao = require('../../../dao/userDao');

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
	var self = this;
	console.log(msg.name + " " + msg.ps);
	userDao.getUser(msg.name, msg.ps, function(err, res){
		if(err || res.length <= 0) {
			next(err, {code: 500});
			return;
		}
		var sessionService = self.app.get('sessionService');
		var rid = res[0].id;
		var power = res[0].power;
		session.bind(rid);
		session.set('power', power);
		session.push('power', function(err) {
			if(err) {
				console.error('set rid for session service failed! error is : %j', err.stack);
			}
		});
		session.set('rid', rid);
		session.push('rid', function(err) {
			if(err) {
				console.error('set rid for session service failed! error is : %j', err.stack);
			}
		});
		
		next(null, {
			code : 200,
			msg : 'game server is ok.'
		});
	});
	
};

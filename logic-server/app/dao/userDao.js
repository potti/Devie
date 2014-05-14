var logger = require('pomelo-logger').getLogger(__filename);
var pomelo = require('pomelo');

var utils = require('../util/utils');

var userDao = module.exports;

userDao.getUser = function(name, pass, cb) {
	var sql = 'SELECT * from user where name = ? and password = ?';

	var param = [name,pass];
	pomelo.app.get('dbclient').query(sql, param, function(err, res) {
		if (err !== null) {
			utils.invokeCallback(cb, err, null);
		} else {
			utils.invokeCallback(cb, null, res);
		}
	});
};

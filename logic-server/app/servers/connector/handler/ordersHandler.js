var ordersDao = require('../../../dao/ordersDao');
var utils = require('../../../util/utils');
var logger = require('pomelo-logger').getLogger(__filename);
var async = require('async');

var Handler = function(app) {
	this.app = app;
};

module.exports = function(app) {
	return new Handler(app);
};


Handler.prototype.create = function(msg, session, next) {
	ordersDao.createOrder(msg, session.get('rid'), function(err, orderId){
		if(err) {
			next(err, {code: 500});
			return;
		}
		next(null, {
			code : 200,
			orderId : orderId
		});
	});
	
};

Handler.prototype.update = function(msg, session, next) {
	
	ordersDao.updateGoods(msg, function(err, orderId){
		if(err) {
			next(err, {code: 500});
			return;
		}
		next(null, {
			code : 200,
			orderId : orderId
		});
	});
	
};

Handler.prototype.del = function(msg, session, next) {
	if(session.get('power') < 5){
		next(null, {
			code : 500
		});
		return;
	}
	ordersDao.del(msg, function(err, success){
		if(err || !success) {
			next(err, {code: 500});
			return;
		}
		next(null, {
			code : 200
		});
	});
};

Handler.prototype.getSchedule = function(msg, session, next) {
	
	ordersDao.getOrderSchedule(msg, function(err, res){
		if(err) {
			next(err, {code: 500});
			return;
		}
		next(null, {
			code : 200,
			orders : res
		});
	});
};

Handler.prototype.queryOrders = function(msg, session, next) {
	
	ordersDao.queryOrders(msg, function(err, res){
		if(err) {
			next(err, {code: 500});
			return;
		}
		next(null, {
			code : 200,
			orders : res
		});
	});
};

Handler.prototype.checkdress = function(msg, session, next) {
	
	ordersDao.checkdress(msg, function(err, res){
		if(err) {
			next(err, {code: 500});
			return;
		}
		next(null, {
			code : res
		});
	});
};

Handler.prototype.dresses = function(msg, session, next) {
	
	ordersDao.getDresses(function(err, res){
		if(err) {
			next(err, {code: 500});
			return;
		}
		next(null, {
			code : 200,
			dresses : res
		});
	});
};

Handler.prototype.comefrom = function(msg, session, next) {
	
	ordersDao.getComeFrom(function(err, res){
		if(err) {
			next(err, {code: 500});
			return;
		}
		next(null, {
			code : 200,
			comefrom : res
		});
	});
};

Handler.prototype.getOrderById = function(msg, session, next) {
	
	ordersDao.getOrderById(msg, function(err, res){
		if(err) {
			next(err, {code: 500});
			return;
		}
		next(null, {
			code : 200,
			order : res
		});
	});
};


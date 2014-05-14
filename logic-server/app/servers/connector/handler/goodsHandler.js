var goodsDao = require('../../../dao/goodsDao');
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
	if(session.get('power') < 5){
		next(null, {
			code : 500
		});
		return;
	}
	goodsDao.createGoods(msg, function(err, goods){
		if(err) {
			next(err, {code: 500});
			return;
		}
		next(null, {
			code : 200,
			goods : goods
		});
	});
	
};

Handler.prototype.update = function(msg, session, next) {
	if(session.get('power') < 5){
		next(null, {
			code : 500
		});
		return;
	}
	goodsDao.updateGoods(msg, function(err, goods){
		if(err) {
			next(err, {code: 500});
			return;
		}
		next(null, {
			code : 200,
			goods : goods
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
	goodsDao.del(msg, function(err, success){
		if(err || !success) {
			next(err, {code: 500});
			return;
		}
		next(null, {
			code : 200
		});
	});
	
};

Handler.prototype.factorys = function(msg, session, next) {
	
	goodsDao.getFactorys(function(err, res){
		if(err) {
			next(err, {code: 500});
			return;
		}
		next(null, {
			code : 200,
			factorys : res
		});
	});
};

Handler.prototype.query = function(msg, session, next) {
	goodsDao.getGoods(msg, function(err, res){
		if(err) {
			next(err, {code: 500});
			return;
		}
		next(null, {
			code : 200,
			data : res,
			power : session.get('power')
		});
	});
};

Handler.prototype.getGoodById = function(msg, session, next) {
	if(session.get('power') < 5){
		next(null, {
			code : 500
		});
		return;
	}
	goodsDao.getGoodById(msg, function(err, res){
		if(err) {
			next(err, {code: 500});
			return;
		}
		next(null, {
			code : 200,
			good : res
		});
	});
};

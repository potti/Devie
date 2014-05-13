var logger = require('pomelo-logger').getLogger(__filename);
var pomelo = require('pomelo');
var Goods = require('../domain/entity/goods');

var async = require('async');
var utils = require('../util/utils');

var goodsDao = module.exports;

goodsDao.pagerow = function() {
	return 10;
};

goodsDao.getGoods = function(msg, cb) {
	var totalsql = 'select count(*) as total from goods where del = 0';
	var sql = 'select a.*,b.name as factoryname from goods a left join factory b on a.factory = b.id where del=0 and 1 = 1';
	var args = [];
	var page = msg.page || 1;
	if (msg) {
		if (msg.factory.length > 0) {
			sql += " and a.factory = ?";
			args.push(msg.factory);
		}
		if (msg.dressname.length > 0) {
			sql += " and a.dressname like ?";
			args.push("%" + msg.dressname + "%");
		}
		if (msg.dressno.length > 0) {
			sql += " and a.dressno like ?";
			args.push("%" + msg.dressno + "%");
		}
	}
	sql += " ORDER BY a.buydate DESC ";
	var total;
	async.waterfall([ function(cb) {
		pomelo.app.get('dbclient').query(totalsql, null, cb);
	}, function(res, cb) {
		total = res[0].total;
		console.log("total:" + total);
		console.log(sql);
		pomelo.app.get('dbclient').query(sql, args, cb);
	} ], function(err, res) {
		if (err !== null) {
			utils.invokeCallback(cb, err, null);
		} else {
			utils.invokeCallback(cb, null, {
				total : total,
				goods : res
			});
		}
	});

	
//	pomelo.app.get('dbclient').query(sql, args, function(err, res) {
//		if (err !== null) {
//			utils.invokeCallback(cb, err, null);
//		} else {
//			utils.invokeCallback(cb, null, res);
//		}
//	});
};

goodsDao.createGoods = function(param, cb) {
	var sql = 'insert into goods (dressname, dressno, factory, factoryno, price, factoryprice, buydate, number) values(?,?,?,?,?,?,?,?)';
	var args = [ param.dressname, param.dressno, param.factory,
			param.factoryno, param.price, param.factoryprice, param.buydate, param.number ];

	pomelo.app.get('dbclient').insert(sql, args, function(err, res) {
		if (err !== null) {
			logger.error('create goods failed! ' + err.message);
			logger.error(err);
			utils.invokeCallback(cb, err.message, null);
		} else {
			var goods = new Goods({
				id : res.insertId,
				dressname : param.dressname,
				dressno : param.dressno,
				factory : param.factory,
				factoryno : param.factoryno,
				price : param.price,
				factoryprice : param.factoryprice,
				dressnum : param.number
			});
			utils.invokeCallback(cb, null, goods);
		}
	});
};

goodsDao.updateGoods = function(param, cb) {
	var sql = 'update goods set dressname = ? ,dressno = ? , factory = ?, factoryno = ? , price = ?, factoryprice = ?, buydate = ? where id = ?';
	var args = [ param.dressname, param.dressno, param.factory,
			param.factoryno, param.price, param.factoryprice, param.buydate,
			param.id ];
	pomelo.app.get('dbclient').query(sql, args, function(err, res) {
		if (err !== null) {
			utils.invokeCallback(cb, err.message, null);
		} else {
			if (!!res && res.affectedRows > 0) {
				var goods = new Goods({
					id : res.insertId,
					dressname : param.dressname,
					dressno : param.dressno,
					factory : param.factory,
					factoryno : param.factoryno,
					price : param.price,
					factoryprice : param.factoryprice
				});
				utils.invokeCallback(cb, null, goods);
			} else {
				logger.error('update goods failed!');
				utils.invokeCallback(cb, 'update goods failed!', null);
			}
		}
	});
};

goodsDao.getGoodById = function(msg, cb) {
	var sql = 'select * from goods where del=0 and id = ' + msg.id;
	pomelo.app.get('dbclient').query(sql, null, function(err, res) {
		if (err !== null) {
			utils.invokeCallback(cb, err, null);
		} else {
			if(res.length > 0){
				utils.invokeCallback(cb, null, res[0]);
			}else{
				utils.invokeCallback(cb, null, null);
			}
		}
	});
};


goodsDao.del = function(param, cb) {
	var sql = 'update goods set del = 1 where id = ?';
	var args = [ param.id ];
	pomelo.app.get('dbclient').query(sql, args, function(err, res) {
		if (err !== null) {
			utils.invokeCallback(cb, err.message, null);
		} else {
			if (!!res && res.affectedRows > 0) {
				utils.invokeCallback(cb, null, true);
			} else {
				utils.invokeCallback(cb, null, false);
			}
		}
	});
};

goodsDao.getFactorys = function(cb) {
	var sql = 'select * from factory ';

	pomelo.app.get('dbclient').query(sql, null, function(err, res) {
		if (err !== null) {
			utils.invokeCallback(cb, err, null);
		} else {
			utils.invokeCallback(cb, null, res);
		}
	});
};

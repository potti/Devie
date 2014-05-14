var logger = require('pomelo-logger').getLogger(__filename);
var pomelo = require('pomelo');
var Order = require('../domain/entity/order');

var async = require('async');
var utils = require('../util/utils');
var moment = require('moment');

var ordersDao = module.exports;

ordersDao.getOrderSchedule = function(param, cb) {
	var sql = "SELECT b.order_id as id, CONCAT(b.date, ' ',b.starthour) as startTime, CONCAT(b.date, ' ',b.endhour) as endTime, a.summary from (SELECT a.id, a.ctime as time, CONCAT(a.order_no, '</br>' , a.custom_name, '</br>', GROUP_CONCAT(CONCAT(c.dressno, ' ',c.dressname , ' : ' , b.dress_num)  SEPARATOR '</br>')) as summary ";
	sql += "from orders a LEFT JOIN order_detail b on a.id = b.order_id LEFT JOIN goods c on b.dress_id = c.id WHERE a.del=0 and a.wedding_date >= ? and a.wedding_date <= ?";
	var args;
	if(param.dressId !== ''){
		sql += " and b.dress_id = ?";
		args = [param.startdate,param.enddate,param.dressId,param.startdate,param.enddate];
	}else{
		args = [param.startdate,param.enddate,param.startdate,param.enddate];
	}
	sql += " GROUP BY a.id) a LEFT JOIN schedule b on a.id = b.order_id where b.date >= ? and b.date <= ?";
	pomelo.app.get('dbclient').query(sql, args, function(err, res) {
		if (err !== null) {
			logger.error('getOrderSchedule failed! ' + err.message);
			logger.error(err);
			utils.invokeCallback(cb, err.message, null);
		} else {
			utils.invokeCallback(cb, null, res);
		}
	});
};

ordersDao.queryOrders = function(param, cb){
	var sql = "SELECT a.id, a.wedding_date,a.wedding_date_end, a.custom_name, a.tel,";
	sql += "a.final_price, a.guarantee, a.restmoney, a.`security`,c.dressname, b.dress_num,b.id as dress_id,b.detail_remark";
	sql += " from orders a LEFT JOIN order_detail b on a.id = b.order_id LEFT JOIN goods c on b.dress_id = c.id where a.del=0 and 1=1";
	var args = [];
	if(param.weddingdate.length > 0){
		sql += " and a.wedding_date <= ? and a.wedding_date_end >= ?";
		args.push(param.weddingdate);
		args.push(param.weddingdate);
	}
	if(param.dressId.length > 0){
		sql += " and b.dress_id = ?";
		args.push(param.dressId);
	}
	if(param.name.length > 0){
		sql += " and a.custom_name like ?";
		args.push("%" + param.name + "%");
	}
	if(param.tel.length > 0){
		sql += " and a.tel = ?";
		args.push(param.tel);
	}
	logger.info(sql);
	pomelo.app.get('dbclient').query(sql, args, function(err, res) {
		if (err !== null) {
			logger.error('queryOrders failed! ' + err.message);
			logger.error(err);
			utils.invokeCallback(cb, err.message, null);
		} else {
			if(res && res.length > 0){
				var map = {};
				res.forEach(function(date){
					if(date.id in map){
						var tmp = map[date.id];
						tmp.dress.push({'dress_name':date.dressname,'id':'did_' + date.dress_id,'dress_num':date.dress_num,'detail_remark':date.detail_remark});
					}else{
						var key = date.id;
						date.dress = [];
						date.dress.push({'dress_name':date.dressname,'id':'did_' + date.dress_id,'dress_num':date.dress_num,'detail_remark':date.detail_remark});
						delete date.dressname;
						delete date.dress_id;
						delete date.dress_num;
						delete date.detail_remark;
						map[key] = date;
					}
				});
				var rebuild = [];
				for(var key in map){
					if (map.hasOwnProperty(key)) {
						rebuild.push(map[key]);
					}
				}
				utils.invokeCallback(cb, null, rebuild);
			}else{
				utils.invokeCallback(cb, null, res);
			}
		}
	});
};

ordersDao.createOrder = function(param, rid, cb) {
	var orderId;
	async.waterfall([ function(cb) {
		var sql = 'insert into orders (wedding_date,wedding_date_end,custom_name,tel,come_from,friend,price,discount,final_price,remark,ctime,order_no,guarantee,restmoney,security,user) values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
		var args = [param.wedding_date,param.wedding_date_end,param.custom_name,param.tel,param.come_from,param.friend,param.price,param.discount,param.final_price,param.remark,param.ctime,param.order_no,param.guarantee,param.restmoney,param.security, rid];

		pomelo.app.get('dbclient').insert(sql, args, function(err, res) {
			if (err !== null) {
				logger.error('create order failed! ' + err.message);
				logger.error(err);
				utils.invokeCallback(cb, err.message, null);
			} else {
				var order = new Order({
					id : res.insertId
				});
				utils.invokeCallback(cb, null, order);
			}
		});
	}, function(res, cb) {
		orderId = res.id;
		console.log("orderId:" + orderId);
		var detail = param.detail;
		var sql = 'insert into order_detail (order_id, dress_id, dress_num, detail_remark) values(?,?,?,?)';
		var i = 0;
		async.whilst(
			function(){
				return i < detail.length;
			},
			function(cb2){
				var obj = JSON.parse(detail[i]);
				var args = [orderId, obj.dress_id, obj.dress_num, obj.detail_remark];
				pomelo.app.get('dbclient').insert(sql, args, cb2);
				i++;
			},
			function(err){
				if (err && err !== null) {
					utils.invokeCallback(cb, err, null);
				}else {
					utils.invokeCallback(cb, null, res);
				}
			}
		);
	}, function(res, cb) {
		orderId = res.id;
		console.log("orderId:" + orderId);
		var startdate = moment(param.wedding_date, "YYYY-MM-DD");
		var enddate = moment(param.wedding_date_end, "YYYY-MM-DD");
		
		var days = enddate.diff(startdate,'day') + 1;
		var countsql = 'select count(*) as num from schedule where date = ?';
		var insertsql = 'insert into schedule (order_id, date, starthour, endhour) values(?,?,?,?)';
		var i = 0;
		async.whilst(
			function(){
				return i < days;
			},
			function(cb2){
				var dtemp = (i === 0 ? startdate.format("YYYY-MM-DD") : startdate.add('days', 1).format("YYYY-MM-DD"));
				async.waterfall([ function(cb3) {
					var args = [dtemp];
					pomelo.app.get('dbclient').query(countsql, args, function(err, res) {
						if (err !== null) {
							logger.error('query schedule failed! ' + err.message);
							logger.error(err);
							utils.invokeCallback(cb3, err.message, null);
						} else {
							utils.invokeCallback(cb3, null, res);
						}
					});
				},function(res, cb3) {
					var num = (res[0].num || 0) + 1;
					var starthour = num + ":00" ;
					var endhour = num + ":58";
					var args = [orderId,dtemp,starthour, endhour];

					pomelo.app.get('dbclient').insert(insertsql, args, function(err, res) {
						if (err !== null) {
							logger.error('create schedule failed! ' + err.message);
							logger.error(err);
							utils.invokeCallback(cb3, err.message, null);
						} else {
							utils.invokeCallback(cb3, null, null);
						}
					});
				}],function(err, res){
					if (err !== null) {
						utils.invokeCallback(cb2, err, null);
					} else {
						utils.invokeCallback(cb2, null, null);
					}
				});
				i++;
			},
			function(err){
				if (err && err !== null) {
					utils.invokeCallback(cb, err, null);
				}else {
					utils.invokeCallback(cb, null, orderId);
				}
			}
		);
	} ], function(err, res) {
		if (err !== null) {
			utils.invokeCallback(cb, err, null);
		} else {
			utils.invokeCallback(cb, null, orderId);
		}
	});
};

ordersDao.updateGoods = function(param, cb) {
	async.waterfall([ function(cb) {
		var sql = 'update orders set wedding_date=?,wedding_date_end=?,custom_name=?,tel=?,come_from=?,friend=?,price=?,discount=?,final_price=?,remark=?,mtime=now(),ctime=?,order_no=?,guarantee=?,restmoney=?,security=? where id = ?';
		var args = [param.wedding_date,param.wedding_date_end, param.custom_name, param.tel,param.come_from, param.friend, param.price, param.discount, param.final_price, param.remark, param.ctime,param.order_no,param.guarantee,param.restmoney,param.security,param.id];
		pomelo.app.get('dbclient').query(sql, args, function(err, res) {
			if (err !== null) {
				logger.error('update order failed! ' + err.message);
				logger.error(err);
				utils.invokeCallback(cb, err.message, null);
			} else {
				utils.invokeCallback(cb, null, param.id);
			}
		});
	}, function(res, cb) {
		var sql = 'delete from order_detail where order_id=?';
		var args = [param.id];
		pomelo.app.get('dbclient').query(sql, args, function(err, res) {
			if (err !== null) {
				logger.error('update order failed! ' + err.message);
				logger.error(err);
				utils.invokeCallback(cb, err.message, null);
			} else {
				utils.invokeCallback(cb, null, param.id);
			}
		});
	}, function(res, cb) {
		var orderId = param.id;
		var detail = param.detail;
		var sql = 'insert into order_detail (order_id, dress_id, dress_num, detail_remark) values(?,?,?,?)';
		var i = 0;
		async.whilst(
			function(){
				return i < detail.length;
			},
			function(cb2){
				var obj = JSON.parse(detail[i]);
				var args = [orderId, obj.dress_id, obj.dress_num, obj.detail_remark];
				pomelo.app.get('dbclient').insert(sql, args, cb2);
				i++;
			},
			function(err){
				if (err && err !== null) {
					utils.invokeCallback(cb, err, null);
				}else{
					utils.invokeCallback(cb, null, orderId);
				}
			}
		);
	} ], function(err, res) {
		if (err !== null) {
			utils.invokeCallback(cb, err, null);
		} else {
			utils.invokeCallback(cb, null, param.id);
		}
	});
};

ordersDao.getOrderById= function(param, cb){
	if(!param.id){
		return;
	}
	var id = param.id;
	async.waterfall([ function(cb) {
		var sql = 'select * from orders where del=0 and id=?';
		var args = [id];

		pomelo.app.get('dbclient').query(sql, args, function(err, res) {
			if (err !== null || res.length === 0) {
				logger.error('checkdress failed! ' + err.message);
				logger.error(err);
				utils.invokeCallback(cb, err.message, null);
			} else {
				utils.invokeCallback(cb, null, res);
			}
		});
	}, function(res, cb) {
		var sql = 'select a.*, b.dressname from (select * from order_detail where order_id=?) a left join goods b on a.dress_id=b.id';
		var args = [id];
		pomelo.app.get('dbclient').query(sql, args, function(err, detailRes) {
			if (err !== null) {
				logger.error('getOrderById failed! ' + err.message);
				logger.error(err);
				utils.invokeCallback(cb, err.message, null);
			} else {
				res[0].detail = detailRes;
				utils.invokeCallback(cb, null, res[0]);
			}
		});
	} ], function(err, res) {
		if (err !== null) {
			utils.invokeCallback(cb, err, null);
		} else {
			utils.invokeCallback(cb, null, res);
		}
	});
};

ordersDao.checkdress= function(param, cb){
	
	async.waterfall([ function(cb) {
		var sql = 'select sum(b.dress_num) as num from orders a left join order_detail b on a.id = b.order_id where a.del=0 and a.id!=? and a.wedding_date=? and b.dress_id=?';
		var args = [param.id || '0', param.wedding_date, param.dress_id];

		pomelo.app.get('dbclient').query(sql, args, function(err, res) {
			if (err !== null) {
				logger.error('checkdress failed! ' + err.message);
				logger.error(err);
				utils.invokeCallback(cb, err.message, null);
			} else {
				utils.invokeCallback(cb, null, res[0].num || 0);
			}
		});
	}, function(num, cb) {
		var sql = 'select number from goods a where a.id=?';
		var args = [param.dress_id];
		pomelo.app.get('dbclient').query(sql, args, function(err, res) {
			if (err !== null) {
				logger.error('checkdress failed! ' + err.message);
				logger.error(err);
				utils.invokeCallback(cb, err.message, null);
			} else {
				var code = 200;
				if(param.dress_num + num > res[0].number){
					code = 500;
				}
				utils.invokeCallback(cb, null, code);
			}
		});
	} ], function(err, res) {
		if (err !== null) {
			utils.invokeCallback(cb, err, null);
		} else {
			utils.invokeCallback(cb, null, res);
		}
	});
};

ordersDao.del = function(param, cb) {
	if(!param.id){
		return;
	}
	var id = param.id;
	async.waterfall([ function(cb) {
		var sql = 'update orders set del = 1 where id=?';
		var args = [id];

		pomelo.app.get('dbclient').query(sql, args, function(err, res) {
			if (err !== null || res.length === 0) {
				logger.error('del order failed! ' + err.message);
				logger.error(err);
				utils.invokeCallback(cb, err.message, null);
			} else {
				utils.invokeCallback(cb, null, true);
			}
		});
	}, function(res, cb) {
		var sql = 'delete from schedule where order_id =?';
		var args = [id];
		pomelo.app.get('dbclient').query(sql, args, function(err, res) {
			if (err !== null || res.length === 0) {
				logger.error('del order failed! ' + err.message);
				logger.error(err);
				utils.invokeCallback(cb, err.message, null);
			} else {
				utils.invokeCallback(cb, null, true);
			}
		});
	}], function(err, res) {
		if (err !== null) {
			utils.invokeCallback(cb, err, null);
		} else {
			utils.invokeCallback(cb, null, res);
		}
	});
};

ordersDao.getDresses = function(cb) {
	var dsql = "SELECT goods.id, CONCAT(goods.dressno, '-',goods.dressname) as name from goods";

	pomelo.app.get('dbclient').query(dsql, null, function(err, res) {
		if (err !== null) {
			utils.invokeCallback(cb, err, null);
		} else {
			utils.invokeCallback(cb, null, res);
		}
	});
};

ordersDao.getComeFrom = function(cb) {
	var sql = 'SELECT * from come_from';

	pomelo.app.get('dbclient').query(sql, null, function(err, res) {
		if (err !== null) {
			utils.invokeCallback(cb, err, null);
		} else {
			utils.invokeCallback(cb, null, res);
		}
	});
};

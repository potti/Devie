

var Order = function(opts) {
	this.id = opts.id;
	this.wedding_date = opts.wedding_date;
	this.custom_name = opts.custom_name;
	this.tel = opts.tel;
	this.come_from = opts.come_from ;
	this.friend = opts.friend || '';
	this.price = opts.price || 0;
	this.discount = opts.discount || '';
	this.final_price = opts.final_price;
	this.remark = opts.remark;
	this.user = opts.user;
	this.ctime = opts.ctime;
	this.detail = [];
	
};

/**
 * Expose 'Entity' constructor
 */

module.exports = Order;

var OrderDetail = function(opts){
	this.id = opts.id;
	this.order_id = opts.order_id;
	this.dress_id = opts.dress_id;
	this.dress_num = opts.dress_num;
	this.detail_remark = opts.detail_remark ;
	this.dress_name = opts.dress_name;
};

Order.prototype.setDetail = function(array) {
	array.forEach(function(entry) {
		this.detail.push(new OrderDetail(entry));
	});
};




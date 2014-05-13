

var Goods = function(opts) {
	this.id = opts.id;
	this.dressname = opts.dressname;
	this.dressno = opts.dressno;
	this.factory = opts.factory;
	this.factoryno = opts.factoryno || '';
	this.price = opts.price;
	this.factoryprice = opts.factoryprice || 0;
	this.buydate = opts.buydate;
};

/**
 * Expose 'Entity' constructor
 */

module.exports = Goods;

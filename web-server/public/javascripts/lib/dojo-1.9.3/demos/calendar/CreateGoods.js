define([
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/_base/array",
	"dojo/json",
	"dojo/date/locale",
	"dojo/data/ItemFileReadStore",
	"dijit/_WidgetBase",	
	"dijit/_TemplatedMixin",
	"dijit/_WidgetsInTemplateMixin",
	"dojo/text!./templates/createGoods.html",
	"dijit/form/FilteringSelect",
	"dijit/form/DateTextBox",
	"dijit/form/ValidationTextBox",
	"dijit/form/NumberTextBox",
	"dijit/form/Button",
	"dojox/form/Uploader",
	"dijit/form/Form",
	"dojox/layout/TableContainer",
	"dojo/date"
],

function(
	declare,
	lang,
	arr,
	JSON,
	locale,
	ItemFileReadStore,
	_WidgetBase,
	_TemplatedMixin,
	_WidgetsInTemplateMixin,
	template
	) {

	return declare("demo.CreateGoods", [ _WidgetBase, _TemplatedMixin,
					         _WidgetsInTemplateMixin ], {
		
		widgetInTemplate : true,

		templateString : template,
		
		postCreate : function() {

			this.inherited(arguments);
			
			var self = this;

			pomelo.request('connector.goodsHandler.factorys', null, function(
					data) {
				if (data.code != 200) {
					return;
				}
				var store = new ItemFileReadStore({
					// data : JSON.stringify(data.factorys)
					// data : dojo.fromJson(JSON.stringify(data.factorys))
					data : {
						identifier: 'id',
						label: 'name',
						items : data.factorys
					}
				});
				self.factory.set('store', store);
			});

			self.factory.set('searchAttr', 'name');
			self.buydate.set('value', new Date());

			self.submitbtn.set('innerHTML', '确定');
			self.submitbtn.on('click', function() {
				if (!self.createGoodsForm.validate()) {
					return;
				}
				var route;
				if (self.id.get('value') === '') {
					route = 'connector.goodsHandler.create';
				} else {
					route = 'connector.goodsHandler.update';
				}
				var id = self.id.get('value');
				var buydate = locale.format(self.buydate.get('value'), {selector:'date',datePattern:'yyyy-MM-dd'});//, timePattern:'HH:mm:ss'
				var factory = self.factory.get('value');
				var factoryno = self.factoryno.get('value');
				var dressname = self.dressname.get('value');
				var dressno = self.dressno.get('value');
				var price = self.price.get('value');
				var factoryprice = self.factoryprice.get('value');
				var number = self.dressnum.get('value');
				pomelo.request(route, {
					id : id,
					buydate : buydate,
					factory : factory,
					factoryno : factoryno,
					dressname : dressname,
					dressno : dressno,
					price : price,
					factoryprice : factoryprice,
					number : number
				}, function(data) {
					if (data.code != 200) {
						alert("保存失败,请重试");
						return;
					}
					alert("入库成功!");
					var newone = data.goods;
					self.id.set('value', newone.id);
				});
			});

			self.clearbtn.set('innerHTML', '重新输入');
			self.clearbtn.on('click', function() {
				self.id.reset();
				self.buydate.set('value', new Date());
				self.factory.reset();
				self.factoryno.reset();
				self.dressname.reset();
				self.dressno.reset();
				self.price.reset();
				self.factoryprice.reset();
				self.dressnum.reset();
			});
			
			this.good_table.startup();
		},

		startup : function(){
			
		},
		
		load : function(){
			if(!this.param.id){
				return;
			}
			var self = this;
			pomelo.request('connector.goodsHandler.getGoodById', {
				id : this.param.id
			}, function(
					data) {
				if (data.code != 200) {
					return;
				}
				if(data.good){
					self.id.set('value', data.good.id);
					self.buydate.set('value',locale.parse(data.good.buydate.substring(0, 10), {selector:'date',datePattern:'yyyy-MM-dd'}));
					self.factory.set('value', data.good.factory);
					self.factoryno.set('value', data.good.factoryno);
					self.dressname.set('value', data.good.dressname);
					self.dressno.set('value', data.good.dressno);
					self.price.set('value', data.good.price);
					self.factoryprice.set('value', data.good.factoryprice);
					self.dressnum.set('value', data.good.number);
				}
			});
		},

		param : null,

		_setParamAttr : function(value) {
			this._set("param", value);
		}

	});
});

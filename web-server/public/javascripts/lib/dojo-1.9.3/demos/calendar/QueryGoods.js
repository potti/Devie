define([
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/_base/array",
	"dojo/json",
	"dojo/date/locale",
	"dojo/data/ItemFileReadStore",
	"dojo/data/ItemFileWriteStore",
	"dijit/form/Button",
	"dijit/_WidgetBase",	
	"dijit/_TemplatedMixin",
	"dijit/_WidgetsInTemplateMixin",
	"dojo/text!./templates/queryGoods.html",
	"dijit/form/FilteringSelect",
	"dojox/grid/EnhancedGrid",
	"dijit/form/ValidationTextBox",
	"dijit/form/Form",
	"./utils",
	"dojox/grid/enhanced/plugins/Pagination"
],

function(
	declare,
	lang,
	arr,
	JSON,
	locale,
	ItemFileReadStore,
	ItemFileWriteStore,
	Button,
	_WidgetBase,
	_TemplatedMixin,
	_WidgetsInTemplateMixin,
	template){
					
		return declare("demo.QueryGoods", [ _WidgetBase, _TemplatedMixin,
			_WidgetsInTemplateMixin ], {
			
		widgetInTemplate : true,

		templateString : template,
		
		id:null,
		
		utils:null,

		postCreate : function() {

			this.inherited(arguments);

			var self = this;
			
			this.utils = lang.getObject("demo.utils");

			pomelo.request('connector.goodsHandler.factorys', null, function(
					data) {
				if (data.code != 200) {
					return;
				}
				var store = new ItemFileReadStore({
					data : {
						identifier : 'id',
						label : 'name',
						items : data.factorys
					}
				});
				self.qg_f.set('store', store);
			});

			self.qg_f.set('searchAttr', 'name');

			self.qcbtn.on('click', function() {
				self.qg_f.reset();
				self.qg_dname.reset();
				self.qg_dno.reset();
			});

			self.qgbtn.on('click', function() {
				self.doQuery(self.renderGrid);
			});

			this.layout = [ [ {
				'name' : ' ',
				'field' : 'id',
				'width' : '20px'
			}, {
				'name' : '名称',
				'field' : 'dressname',
				'width' : '220px'
			}, {
				'name' : '编号',
				'field' : 'dressno',
				'width' : '140px'
			}, {
				'name' : '工厂',
				'field' : 'factoryname',
				'width' : '100px'
			}, {
				'name' : '工厂编号',
				'field' : 'factoryno',
				'width' : '100px'
			}, {
				'name' : '数量',
				'field' : 'number',
				'width' : '50px',
				'cellStyles' : 'text-align:right'
			}, {
				'name' : '原价',
				'field' : 'factoryprice',
				'width' : '50px',
				'cellStyles' : 'text-align:right'
			}, {
				'name' : '进价',
				'field' : 'price',
				'width' : '50px',
				'cellStyles' : 'text-align:right'
			}, {
				'name' : '购买日期',
				'field' : 'buydate',
				'width' : '100px',
				'cellStyles' : 'text-align:center',
				'formatter' : function(data){
			        return data.substring(0, 10);
			    }
			}, {
				'name' : '',
				'width' : '50px',
				'cellStyles' : 'text-align:center',
				'formatter' : function(col, rowIndex){
			        var b = new Button({
			        	label: "修改",
			        	onClick: function() {
			        		var rowdata = self.qggrid.getItem(rowIndex);
		        	        var id = rowdata['id'];
		        	        self.utils.menuClick('修改商品','modifyGoods',{'id':id});
			        	}
			        });
			        return b;
			    }
			}, {
				'name' : '',
				'width' : '50px',
				'cellStyles' : 'text-align:center',
				'formatter' : function(col, rowIndex){
			        var b = new Button({
			        	label: "删除",
			        	onClick: function() {
			        		self.utils.delConfirm(function(){
			        			var rowdata = self.qggrid.getItem(rowIndex);
			        	        var id = rowdata['id'];
			        	        pomelo.request('connector.goodsHandler.del', {
			        	        		'id' : id
			        	        	}, function(
			        					data) {
			        				if (data.code != 200) {
			        					return;
			        				}
			        				self.qggrid.get('store').deleteItem(rowdata);
			        				self.qggrid.render();
			        			});
			        		});
			        	}
			        });
			        return b;
			    }
			} ] ];

			self.qggrid.set('structure', this.layout);
			self.qggrid.set('rowSelector', '15px');
			self.qggrid.set('autoHeight', true);
			self.qggrid.set('autoWidth', true);
			self.doQuery(self.initGrid);

		},
		
		initGrid : function(){
			this.qggrid.startup();
		},
		
		renderGrid : function(){
			this.qggrid.render();
		},
		
		startup : function(){
			
		},
		
		load : function(){
		},

		param : null,

		_setParamAttr : function(value) {
			this._set("param", value);
		},

		doQuery : function(cb) {
			var self = this;
			var qf = self.qg_f.get('value');
			var qdn = self.qg_dname.get('value');
			var qfn = self.qg_dno.get('value');
			pomelo.request('connector.goodsHandler.query', {
				factory : qf,
				dressname : qdn,
				dressno : qfn
			}, function(data) {
				if (data.code != 200) {
					return;
				}
				var store = new ItemFileWriteStore({
					data : {
						identifier : 'id',
						items : data.data.goods
					}
				});
				var total = data.data.total;
				self.qggrid.set('store', store);
				if(cb){
					cb();
				}
			});
		}

	});
});

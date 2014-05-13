define([
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/_base/array",
	"dojo/json",
	"dojo/date/locale",
	"dojo/query",
	"dojo/data/ItemFileReadStore",
	"dojo/data/ItemFileWriteStore",
	"dijit/form/Button",
	"dojo/dom-construct",
	"dijit/_WidgetBase",
	"dijit/_TemplatedMixin",
	"dijit/_WidgetsInTemplateMixin",
	"dojo/text!./templates/createOrder.html",
	"dijit/form/DateTextBox",
	"dijit/form/NumberTextBox",
	"dojox/form/Uploader",
	"dijit/form/Form",
	"dijit/form/SimpleTextarea",
	"dojox/layout/TableContainer",
	"dijit/form/ValidationTextBox",
	"demos/calendar/FilteringSelect",
	"dijit/form/FilteringSelect",
	"dojo/parser",
	"dojo/date"
],

function(
	declare,
	lang,
	array,
	JSON,
	locale,
	query,
	ItemFileReadStore,
	ItemFileWriteStore,
	Button,
	domConstruct,
	_WidgetBase,
	_TemplatedMixin,
	_WidgetsInTemplateMixin,
	template
	) {

	return declare("demo.CreateOrder", [ _WidgetBase, _TemplatedMixin,
					         _WidgetsInTemplateMixin ], {
		
		widgetInTemplate : true,

		templateString : template,
		
		postCreate : function() {

			this.inherited(arguments);
			
			var self = this;
			
			pomelo.request('connector.ordersHandler.dresses', null, function(
					data) {
				if (data.code != 200) {
					return;
				}
				var store = new ItemFileReadStore({
					data : {
						identifier: 'id',
						label: 'name',
						items : data.dresses
					}
				});
				self.order_details_dress.set('store', store);
			});
			
			pomelo.request('connector.ordersHandler.comefrom', null, function(
					data) {
				if (data.code != 200) {
					return;
				}
				var store = new ItemFileReadStore({
					data : {
						identifier: 'id',
						label: 'name',
						items : data.comefrom
					}
				});
				self.come_from.set('store', store);
			});
			
			self.order_final_price.on('blur', function(){
				var r = (self.order_final_price.get('value') || 0) - (self.guarantee.get('value') || 0);
				self.restmoney.set('value', r);
			});
			
			self.guarantee.on('blur', function(){
				var r = (self.order_final_price.get('value') || 0) - (self.guarantee.get('value') || 0);
				self.restmoney.set('value', r);
			});
			
			self.order_details_adddress.on('click', function(){
				if(!self.wedding_date.get('value')){
					alert("请选择婚期");
					return;
				}
				if(!self.order_details_dress.get('value')){
					alert("请选择礼服");
					return;
				}
				if(!self.order_details_num.get('value')){
					alert("请填写数量");
					return;
				}
				pomelo.request('connector.ordersHandler.checkdress', {
					id : self.id.get('value'),
					wedding_date : locale.format(self.wedding_date.get('value'), {selector:'date',datePattern:'yyyy-MM-dd'}),
					dress_id : self.order_details_dress.get('value'),
					dress_num : self.order_details_num.get('value')
				}, function(data) {
					if (data.code != 200) {
						alert("[" + self.order_details_dress.get('displayedValue') + "]没有档期了");
						return;
					}
					var newDress = {
						dress_id : self.order_details_dress.get('value'),
						dress_name : self.order_details_dress.get('displayedValue'),
						dress_num : self.order_details_num.get('value'),
						detail_remark : self.order_details_remark.get('value')
					};
			        self.dressStore.newItem(newDress);
			        self.order_details.render();
				});
			});

			this.clearbtn.on('click', function() {
				self.dressStore = new ItemFileWriteStore({
					clearOnClose:true,
					data : {
						identifier : 'id',
						items : []
					}
				});
				self.order_details.set('store', self.dressStore);
				self.order_details.render();
				self.ctime.reset();
				self.order_no.reset();
				self.id.reset();
				self.wedding_date.reset();
				self.wedding_date_end.reset();
				self.custom_name.reset();
				self.tel.reset();
				self.come_from.reset();
				self.friend.reset();
				self.order_price.reset();
				self.discount.reset();
				self.order_final_price.reset();
				self.guarantee.reset();
				self.restmoney.reset();
				self.security.reset();
				self.remark.reset();
			});
			
			this.submitbtn.on('click', function() {
				if (!self.createOrderForm.validate()) {
					return;
				}
				self.dressStore.fetch({
					onComplete: function (items) {
						var detail = [];
						array.forEach(items, function(item){
							detail.push(self.itemToJSON(self.dressStore, item));
                        });
						if(detail.length <= 0){
							alert('还没有选择衣服。。。');
							return;
						}
						var route;
						if (self.id.get('value') === '') {
							route = 'connector.ordersHandler.create';
						} else {
							route = 'connector.ordersHandler.update';
						}
						pomelo.request(route, {
							id : self.id.get('value'),
							order_no : self.order_no.get('value'),
							ctime : locale.format(self.ctime.get('value'), {selector:'date',datePattern:'yyyy-MM-dd'}),
							wedding_date : locale.format(self.wedding_date.get('value'), {selector:'date',datePattern:'yyyy-MM-dd'}),
							wedding_date_end : locale.format(self.wedding_date_end.get('value'), {selector:'date',datePattern:'yyyy-MM-dd'}),
							custom_name : self.custom_name.get('value'),
							tel : self.tel.get('value'),
							come_from : self.come_from.get('value'),
							friend : self.friend.get('value'),
							price : self.order_price.get('value'),
							discount : self.discount.get('value'),
							final_price : self.order_final_price.get('value'),
							remark : self.remark.get('value'),
							guarantee : self.guarantee.get('value'),
							restmoney : self.restmoney.get('value'),
							security : self.security.get('value'),
							detail : detail
						}, function(data) {
							if (data.code != 200) {
								alert("保存失败,请重试");
								return;
							}
							var orderId = data.orderId;
							alert("入库成功! 流水号：" + orderId);
							self.id.set('value', orderId);
						});
					}
				}); 
			});
			
			this.layout = [ [ {
				'name' : '',
				'field' : 'dress_id',
				'hidden' : true
			}, {
				'name' : '礼服',
				'field' : 'dress_name',
				'width' : '200px'
			}, {
				'name' : '数量',
				'field' : 'dress_num',
				'width' : '30px'
			}, {
				'name' : '备注',
				'field' : 'detail_remark',
				'width' : '410px'
			}, {
				'width' : '24px',
				'cellStyles' : 'text-align:center',
				'formatter' : function formatter(){
		            var w = new Button({
		                iconClass: 'delBtnIcon',
		                onClick: function(e) {
		                	 var items = self.order_details.selection.getSelected();
		                     if(items.length){
		                         array.forEach(items, function(selectedItem){
		                             if(selectedItem !== null){
		                                 self.dressStore.deleteItem(selectedItem);
		                             } 
		                         }); 
		                         self.dressStore.save();
		                         self.order_details.render();
		                     } 
		                }
		            });
		            w._destroyOnRemove=true;
		            return w;
		        }
			} ] ];
			
			this.dressStore = new ItemFileWriteStore({
				clearOnClose:true,
				data : {
					identifier : 'dress_id',
					items : []
				}
			});
			this.order_details.set('noDataMessage', '还没有选择衣服。。。');
			this.order_details.set('structure', this.layout);
			this.order_details.set('store', this.dressStore);
			this.order_details.set('autoHeight', true);
			
			this.order_table.startup();
			this.order_details.startup();
			
		},
		
		startup : function(){
			
		},
		
		load : function(){
			if(!this.param.id){
				return;
			}
			var self = this;
			pomelo.request('connector.ordersHandler.getOrderById', {
				id : this.param.id
			}, function(
					data) {
				if (data.code != 200) {
					return;
				}
				if(data.order){
					self.id.set('value', data.order.id);
					self.ctime.set('value',locale.parse(data.order.ctime.substring(0, 10), {selector:'date',datePattern:'yyyy-MM-dd'}));
					self.order_no.set('value', data.order.order_no);
					self.wedding_date.set('value',locale.parse(data.order.wedding_date.substring(0, 10), {selector:'date',datePattern:'yyyy-MM-dd'}));
					self.wedding_date_end.set('value',locale.parse(data.order.wedding_date_end.substring(0, 10), {selector:'date',datePattern:'yyyy-MM-dd'}));
					self.custom_name.set('value', data.order.custom_name);
					self.tel.set('value', data.order.tel);
					self.come_from.set('value', data.order.come_from);
					self.friend.set('value', data.order.friend);
					self.order_price.set('value', data.order.price);
					self.discount.set('value', data.order.discount);
					self.order_final_price.set('value', data.order.final_price);
					self.guarantee.set('value', data.order.guarantee);
					self.restmoney.set('value', data.order.restmoney);
					self.security.set('value', data.order.security);
					self.remark.set('value', data.order.remark);
					for(var i=0;i<data.order.detail.length;i++){
						var temp = data.order.detail[i];
						var newDress = {
								dress_id : temp.dress_id,
								dress_name : temp.dressname,
								dress_num : temp.dress_num,
								detail_remark : temp.detail_remark
						};
						self.dressStore.newItem(newDress);
					}
					self.order_details.render();
				}
			});
		},
		
		dressStore : null,

		param : null,
		
		index : 0,
		
		_setParamAttr : function(value) {
			this._set("param", value);
		},
		
		itemToJSON : function (store, item){
			  var json = {};
			  if(item && store){
			    // Determine the attributes we need to process.
			    var attributes = store.getAttributes(item);
			    if(attributes && attributes.length > 0){
			      var i;
			      for(i = 0; i < attributes.length; i++){
			        var values = store.getValues(item, attributes[i]);
			        if(values){
			          // Handle multivalued and single-valued attributes.
			          if(values.length > 1 ){
			            var j;
			            json[attributes[i]] = [];
			            for(j = 0; j < values.length; j++ ){
			              var value = values[j];
			              // Check that the value isn't another item. If it is, process it as an item.
			              if(store.isItem(value)){
			                json[attributes[i]].push(dojo.fromJson(itemToJSON(store, value)));
			              }else{
			                json[attributes[i]].push(value);
			              }
			            }
			          }else{
			            if(store.isItem(values[0])){
			               json[attributes[i]] = dojo.fromJson(itemToJSON(store, values[0]));
			            }else{
			               json[attributes[i]] = values[0];
			            }
			          }
			        }
			      }
			    }
			  }
//			  return dojo.toJson(json);
			  return JSON.stringify(json);
		}

	});
});

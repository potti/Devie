define([
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/_base/array",
	"dojo/parser", 
	"dojo/_base/connect",
	"dojo/json",
	"dojo/date/locale",
	"dojo/data/ItemFileReadStore",
	"dojo/data/ItemFileWriteStore",
	"dijit/_WidgetBase",	
	"dijit/_TemplatedMixin",
	"dijit/_WidgetsInTemplateMixin",
	"dijit/form/Button",
	"dojo/text!./templates/queryOrder.html",
	"dijit/form/FilteringSelect",
	"dojox/grid/EnhancedGrid",
	"dijit/form/ValidationTextBox",
	"dijit/form/Button",
	"dijit/form/Form",
	"dijit/form/DateTextBox",
	"./FilteringSelect",
	"dojox/grid/enhanced/plugins/Pagination"
],

function(
	declare,
	lang,
	arr,
	parser, 
	connect,
	JSON,
	locale,
	ItemFileReadStore,
	ItemFileWriteStore,
	_WidgetBase,
	_TemplatedMixin,
	_WidgetsInTemplateMixin,
	Button,
	template){
					
		return declare("demo.QueryOrder", [ _WidgetBase, _TemplatedMixin,
			_WidgetsInTemplateMixin ], {
			
		widgetInTemplate : true,

		templateString : template,
		
		id:null,
		
		utils : null,

		postCreate : function() {

			this.inherited(arguments);

			var self = this;
			this.utils = lang.getObject("demo.utils");
			self.qoc_btn.on('click', function() {
				self.qo_wd.reset();
				self.qo_dress.reset();
				self.qo_name.reset();
				self.qo_tel.reset();
			});

			self.qo_btn.on('click', function() {
				for(var i in self.detailRows){
					var id = self.makeSubgridId(i);
					var subGrid = dijit.byId(id);
					if(subGrid){
						dojox.grid.util.removeNode(subGrid.domNode);
					}
				}
				self.detailRows = [];
				self.rows = 0;
				var store = new ItemFileReadStore({
					data : {
						identifier : 'id',
						items : []
					}
				});
				self.qotgrid.set('store', store);
				self.qotgrid.render();
				self.doQuery(self.renderGrid);
			});
			
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
				self.qo_dress.set('store', store);
			});

			// identify subgrids by their row indices
			this.makeSubgridId = function(inRowIndex) {
				return self.qotgrid.id + "_subGrid_" + inRowIndex;
			};
			
			// Main grid structure
			this.gridCells =  [
               { type: 'dojox.grid._RowSelector', width: '20px' }, 
			   {onBeforeRow: function(inDataIndex, inSubRows) {
			   		inSubRows[1].hidden = !self.detailRows[inDataIndex];
   				},
				onAfterRow: function(rowIndex, subRows, rowNode) {
					if(self.detailRows[rowIndex]){
						self.buildSubgrid(rowIndex, subRows[1][0]);
					}
				},
		        cells : [ [ {
				name : '',
				width : 1.5,
				get : '',
				formatter : function(item, rowIndex, cell) {
					var image = (self.detailRows[rowIndex] ? 'openBtnIcon'
							: 'closeBtnIcon');
					var show = (self.detailRows[rowIndex] ? 'false'
							: 'true');
					return '<div dojoType="dijit.form.Button" class="' + image + '" data-dojo-props="showLabel: false" type="button"></div>';
				},
				styles : 'text-align: center;'
			}, {
				name : '婚期(开始)',
				field : 'wedding_date',
				formatter : function(data){
			        return data.substring(0, 10);
			    },
				width : 10
			}, {
				name : '婚期(结束)',
				field : 'wedding_date_end',
				formatter : function(data){
			        return data.substring(0, 10);
			    },
				width : 10
			}, {
				name : '姓名',
				field : 'custom_name',
				width : 10
			}, {
				name : '电话',
				field : 'tel',
				width : 10
			}, {
				name : '总价',
				field : 'final_price',
				cellStyles : 'text-align:right',
				width : 6.5
			}, {
				name : '定金',
				field : 'guarantee',
				cellStyles : 'text-align:right',
				width : 6.5
			}, {
				name : '余款',
				field : 'restmoney',
				cellStyles : 'text-align:right',
				width : 6.5
			}, {
				name : '押金',
				field : 'security',
				cellStyles : 'text-align:right',
				width : 6.5
			}, {
				'name' : '',
				'width' : '50px',
				'cellStyles' : 'text-align:center',
				'formatter' : function(col, rowIndex){
			        var b = new Button({
			        	label: "修改",
			        	onClick: function() {
			        		var rowdata = self.qotgrid.getItem(rowIndex);
		        	        var id = rowdata['id'];
//		        	        var utils = lang.getObject("demo.utils");
		        	        self.utils.menuClick('修改订单','modifyOrder',{'id':id});
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
				        		var rowdata = self.qotgrid.getItem(rowIndex);
			        	        var id = rowdata['id'];
			        	        pomelo.request('connector.ordersHandler.del', {
			        	        		'id' : id
			        	        	}, function(
			        					data) {
			        				if (data.code != 200) {
			        					return;
			        				}
			        				self.qo_btn.onClick();
			        			});
			        		});
			        	}
			        });
			        return b;
			    }
			} ], [
					{ 
						name: '', 
						get : '', 
						formatter: function(data, inRowIndex, cell) {
							// look for a subgrid
							var subGrid = dijit.byId(self.makeSubgridId(inRowIndex));
							var h = (subGrid ? subGrid.cacheHeight : "120")
									+ "px";
							// insert a placeholder
							return '<div style="height: ' + h
									+ '; background-color: white;"></div>';
						}, 
						colSpan: 11,
						styles: 'padding: 0; margin: 0;'
					}
				]]
			}];
			
			// render a subgrid into inCell at inRowIndex
			this.buildSubgrid = function(inRowIndex, inCell) {
				var n = inCell.getNode(inRowIndex).firstChild;
				var id = self.makeSubgridId(inRowIndex);
				var subGrid = dijit.byId(id);
				if (subGrid) {
					n.appendChild(subGrid.domNode);
				} else {
					self.subGridProps.dataRow = inRowIndex;
					self.subGridProps.id = id;
					var item = self.qotgrid.getItem(inRowIndex);
					var store = self.qotgrid.get('store');
				    var dress = store.getValues(item, "dress");
				    self.subGridProps.rowCount = dress.length;
					subGrid = new dojox.grid.DataGrid(self.subGridProps, n);
					var s = new ItemFileReadStore({
						data : {
							identifier : 'id',
							items : dress
						}
					});
					subGrid.set('store', s);
					subGrid.startup();
				}
				subGrid.render();
				if(subGrid){
					subGrid.cacheHeight = subGrid.domNode.offsetHeight;
					inCell.grid.rowHeightChanged(inRowIndex);
				}	
			};

			// the Detail cell contains a subgrid which we set up
			// below
			this.subGridCells = [ {
				noscroll: true,
				cells : [ [ {
					name : "礼物",
					field : 'dress_name',
					width : 20
				}, {
					name : "数量",
					field : 'dress_num',
					cellStyles : 'text-align:right',
					width : 5
				}, {
					name : "备注",
					field : 'detail_remark',
					width: "auto"
				} ] ]
			} ];

			this.subGridProps = {
				structure : self.subGridCells,
				rowCount : 1,
				autoHeight : true,
				autoRender : false,
				dataRow : '',
				id : ''
			};
			// if a subgrid exists at inRowIndex, detach it from the
			// DOM
			this.detachSubgrid = function(inRowIndex) {
				var subGrid = dijit.byId(self.makeSubgridId(inRowIndex));
				if (subGrid) {
					dojox.grid.util.removeNode(subGrid.domNode);
					delete self.detailRows[inRowIndex];
				}
			};
			
			this.toggleDetail = function(inIndex, inShow) {
				if(!inShow){
					self.detachSubgrid(inIndex);
				}
				self.detailRows[inIndex] = inShow;
				self.qotgrid.updateRow(inIndex);
			};

			// when user clicks the +/-
			this.detailRows = [];
			this.rows = 0;
			
			self.qotgrid.set('structure', this.gridCells);
			
			//CellClick事件，用来触发update delete detail等按钮
			self.qotgrid.on("CellClick", function(evt) {
		        var	idc = evt.cellIndex;
		        if(idc > 0){
			    	return;
			    }
		        var idx = evt.rowIndex;
//			    var item = this.getItem(idx);
//			    var store = this.store;
//			    var id = store.getValue(item, "id");
			    self.toggleDetail(idx, !self.detailRows[idx]);
			});
			self.doQuery(self.initGrid);
			
		},
		
		initGrid : function(){
			this.qotgrid.startup();
		},
		
		renderGrid : function(){
			this.qotgrid.render();
		},
		
		startup : function(){
			
		},
		
		load : function(){
		},

		param : null,

		_setParamAttr : function(value) {
			this._set("param", value);
		},
		
		detailRows : [],

		doQuery : function(cb) {
			var self = this;
			var wd = self.qo_wd.get('value') ? locale.format(self.qo_wd.get('value'), {selector:'date',datePattern:'yyyy-MM-dd'}):'';
			var dress = self.qo_dress.get('value');
			var name = self.qo_name.get('value');
			var tel = self.qo_tel.get('value');
			pomelo.request('connector.ordersHandler.queryOrders', {
				weddingdate : wd,
				dressId : dress,
				name : name,
				tel : tel
			}, function(data) {
				if (data.code != 200) {
					return;
				}
				var store = new ItemFileReadStore({
					clearOnClose : true,
					data : {
						identifier : 'id',
						items : data.orders
					}
				});
				self.rows = data.orders.length;
				self.qotgrid.set('store', store);
				if(cb){
					cb();
				}
			});
		}
		  
	});
});

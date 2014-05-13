define([
    "dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/_base/array",
	"dojo/date",
	"dojo/json",
	"dojo/date/locale",
	"dojo/data/ItemFileReadStore",
	"dojo/data/ItemFileWriteStore",
	"dijit/_WidgetBase",
	"dijit/_TemplatedMixin",
	"dijit/_WidgetsInTemplateMixin",
	"dojox/calendar/Calendar",
	"dojo/store/Memory", 
	"dojo/store/Observable",
	"dojo/text!./templates/querySchedule.html"
],

function(
		declare,
		lang,
		arr,
		Date,
		JSON,
		locale,
		ItemFileReadStore,
		ItemFileWriteStore,
		_WidgetBase,
		_TemplatedMixin,
		_WidgetsInTemplateMixin,
		Calendar,
		Memory,
		Observable,
		template){
					
		return declare("demo.QuerySchedule", [ _WidgetBase, _TemplatedMixin,
			_WidgetsInTemplateMixin ], {

			
			widgetInTemplate : true,

			templateString : template,
			
			id:null,
			
			queryParam : {
				startdate : '',
				enddate : '',
				dressId : ''
			},

			postCreate : function() {

				this.inherited(arguments);

				var self = this;
				
				this.queryCal.set('editable',false);
				this.queryCal.columnView.set("minHours", 1);
				this.queryCal.columnView.set("maxHours", 24);
				this.queryCal.columnView.set("hourSize", 300);
				this.queryCal.columnView.set("timeSlotDuration", 60);
				this.queryCal.columnView.set("rowHeaderGridSlotDuration", 60);
				this.queryCal.columnView.set("rowHeaderLabelSlotDuration", 60);
				
				this.queryCal.set('decodeDate',function(s) {
					return locale.parse(s, {datePattern: "yyyy-MM-dd", timePattern: "H:mm"});
				});
				this.queryCal.set('encodeDat', function(s) {
					return locale.parse(s, {datePattern: "yyyy-MM-dd", timePattern: "H:mm"});
				});

			},
			
			load : function(){
//				alert(this.param.queryScheduleKey + "||" + this.param.queryScheduleDate);
				if(!this.param.queryScheduleDate){
					return;
				}
				this.queryCal.set('date',this.param.queryScheduleDate);
				var start = this.getHalfYearStart(this.param.queryScheduleDate);
				var end = this.getHalfYearEnd(this.param.queryScheduleDate);
				self = this;
				self.queryParam.startdate = start;
				self.queryParam.enddate = end;
				self.queryParam.dressId = self.param.queryScheduleKey;
				pomelo.request('connector.ordersHandler.getSchedule', self.queryParam, function(
						data) {
					if (data.code != 200) {
						return;
					}
					self.queryCal.set('store', new Observable(new Memory({
						data : data.orders
					})));
				});
			},

			param : null,

			_setParamAttr : function(value) {
				this._set("param", value);
			},
			
			getHalfYearStart : function(date) {
				var year = date.getFullYear();
				var month = date.getMonth();
				if(month >= 6){
					month = "-07-01";
				}else{
					month = "-01-01";
				}
				return year + month;
			},
			
			getHalfYearEnd : function(date) {
				var year = date.getFullYear();
				var month = date.getMonth();
				if(month >= 6){
					month = "-12-31";
				}else{
					month = "-06-30";
				}
				return year + month;
			}
		});
});

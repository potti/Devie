define([
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/_base/array",
	"dojo/_base/event",
	"./utils", 
	"dijit/layout/ContentPane",
	"dojo/data/ItemFileReadStore",
	"dijit/_WidgetBase",	
	"dijit/_TemplatedMixin",
	"dijit/_WidgetsInTemplateMixin",
	"dojo/text!./templates/ScheduleMenu.html",
	"./DatePicker",
	"dijit/TitlePane",  
	"dojo/date",
    "dojo/date/locale",
    "./FilteringSelect",
    "dojo/_base/connect",
    "dijit/form/Button"
],

function(
	declare,
	lang,
	arr,
	event,
	utils,
	ContentPane,
	ItemFileReadStore,
	_WidgetBase,
	_TemplatedMixin,
	_WidgetsInTemplateMixin,
	template){
					
	return declare("demo.ScheduleMenu", [_WidgetBase,_TemplatedMixin,_WidgetsInTemplateMixin], {
		
		templateString: template,
		
		postCreate: function(){
			
			this.inherited(arguments);
			
			var self = this;
			
			var mergeDateTime = function(isStart){
				var dateEditor = isStart ? self.itemStartDateEditor : self.itemEndDateEditor;
				var timeEditor = isStart ? self.itemStartTimeEditor : self.itemEndTimeEditor;
				var date = dateEditor.get("value");
				var time = timeEditor.get("value");
				date.setHours(time.getHours());
				date.setMinutes(time.getMinutes());
				return date;
			};
			
			this.querySchKeyBtn.on("click", function(value) {
				if(!self.dressSelect.get('value')){
					alert("请选择衣服");
					return;
				}
				if(!self.datePicker.get('value')){
					alert("请选择日期");
					return;
				}
				
				utils.menuClick(self.dressSelect.get('displayedValue'),
						'querySchedule', {
							queryScheduleKey : self.dressSelect.get('value'),
							queryScheduleDate : self.datePicker.get("value")
						});
			});
																							
			// Synchronize date picker.																	
			
			this.datePicker.on("change", function(e){
				var d = self.datePicker.get("value");
				self.calendar.set("date", d);
				self.calendar.load(self.dressSelect.get("value"));
			});						
		},
		
		calendar: null,
		
		_setCalendarAttr: function(value){
			this._set("calendar", value);
			this.configureCalendar(value);
		},
		
		selectionChanged: function(item){
			
			var itemNull = item == null;
			
			
			this.editedItem = itemNull ? null : lang.mixin({}, item); 
		},
		
		configureCalendar: function(calendar){
			
			var self = this;
			
			this.datePicker.set("value", calendar.get("date"));
			
//			calendar.on("change", function(e){		
//				self.selectionChanged(e.newValue);							
//			});	
//			
//			calendar.on("itemEditEnd", function(e){
//				self.selectionChanged(e.item);
//			});
			
			var updateDatePicker = function(startTime, endTime){
				
				self.datePicker.set("currentFocus", startTime, false);							
				self.datePicker.set("minDate", startTime);
				self.datePicker.set("maxDate", endTime);
				self.datePicker._populateGrid();
				
			};
			
			
			// configure item properties panel
			calendar.on("timeIntervalChange", function(e){
				updateDatePicker(e.startTime, e.endTime);
			});
								
			// filter out event according to their calendar
			this.calendarVisibility = [true, true];
		},
		
		load : function(){
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
				self.dressSelect.set('store', store);
			});
		}
	});
});

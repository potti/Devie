define([ "dojo/_base/declare", "dojo/_base/lang", "dojo/_base/fx", "dojo/date",
		"dojo/date/locale", "dojo/store/Memory", "dojo/store/Observable",
		"dojo/dom-attr", "dojo/_base/array", "dijit/registry", "dijit/layout/ContentPane",
		"demos/calendar/CreateGoods", "demos/calendar/CreateOrder",
		"demos/calendar/ModifyGoods", "demos/calendar/ModifyOrder",
		"demos/calendar/QueryGoods", "demos/calendar/QueryOrder",
		"demos/calendar/QuerySchedule" ],

function(declare, lang, fx, Date, locale, Memory, Observable, domAttr, array,registry,
		ContentPane, CreateGoods, CreateOrder, ModifyGoods, ModifyOrder,
		QueryGoods, QueryOrder, QuerySchedule) {

	var utils = lang.getObject("demo.utils", true);

	utils.getTemplate = function(name, args) {
		if (name === 'createGoods') {
			return new CreateGoods(args);
		} else if (name === 'createOrder') {
			return new CreateOrder(args);
		} else if (name === 'modifyGoods') {
			return new CreateGoods(args);
		} else if (name === 'modifyOrder') {
			return new CreateOrder(args);
		} else if (name === 'queryGoods') {
			return new QueryGoods(args);
		} else if (name === 'queryOrder') {
			return new QueryOrder(args);
		} else if (name === 'querySchedule') {
			return new QuerySchedule(args);
		}
	};

	utils.menuClick = function(name, template, msg) {
		var tc = dijit.byId("mainTab");
		var pane = dijit.byId(name + "Tab");
		var comp;
		if (!pane) {
			var old = dijit.byId(name + "Main");
			if (old) {			
				old.destroy();
				old = null;
			    registry.remove(name + "Main");
			}
			pane = new ContentPane({
				title : name,
				id : name + "Tab",
				closable : true
			});
			comp = this.getTemplate(template, {id:name + "Main"});
			pane.addChild(comp);
			tc.addChild(pane);
		}else{
			comp = dijit.byId(name + "Main");
		}
		tc.selectChild(pane);
		if(comp && msg){
			comp.set('param', msg);
			comp.load();
		}

	};

	utils.getStartOfCurrentWeek = function(calendar) {
		return calendar.floorToWeek(new calendar.dateClassObj());
	};

	utils.getHalfYearStart = function(date) {
		var year = date.getFullYear();
		var month = date.getMonth();
		if(month >= 6){
			month = "-07-01";
		}else{
			month = "-01-01";
		}
		return year + month;
	};
	
	utils.getHalfYearEnd = function(date) {
		var year = date.getFullYear();
		var month = date.getMonth();
		if(month >= 6){
			month = "-12-31";
		}else{
			month = "-06-30";
		}
		return year + month;
	};
	
	utils.delConfirm = function (cb){  
        require([ "dijit/Dialog","dijit/form/Button"], function(Dialog) {  
            content="确认要删除吗?<br/><br/><button dojoType='dijit.form.Button' id='orderDelOkBtn'>确定</button>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" +  
                "<button dojoType='dijit.form.Button' id='orderDelCalBtn'>取消</button>";  
              
            var confirmDialog = new Dialog({  
                id:"confirmDialog",  
                title : '确认',  
                content : content,  
                onHide : function() {  
                    this.destroyRecursive();  
                }  
            });  
            confirmDialog.startup();  
              
            var yesButton = dijit.byId('orderDelOkBtn');  
            var noButton = dijit.byId('orderDelCalBtn');  
            dojo.connect(yesButton, 'onClick', function(mouseEvent) {  
	            confirmDialog.hide();  
	            cb();  
            });  
            dojo.connect(noButton, 'onClick', function(mouseEvent) {  
            	confirmDialog.hide();
            });  
              
            confirmDialog.show();  
        });  
    };
	
	return utils;
});

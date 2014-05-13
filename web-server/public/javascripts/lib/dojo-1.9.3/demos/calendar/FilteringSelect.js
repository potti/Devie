define([
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/_base/event",
	"dijit/form/FilteringSelect"],

function(
	declare,
	lang,
	event,
	FilteringSelect){
					
	return declare("demo.FilteringSelect", FilteringSelect, {
		
		searchAttr : "name",
		queryExpr : "*${0}*",
		minKeyCount: 1,
		
		_startSearch: function (/*String*/key) {
			if (!key || key.length < this.minKeyCount) {
				this.closeDropDown();
				return;
			}
			this.inherited(arguments);
		},
		
		onClick : function(e){
			this.closeDropDown();
			event.stop(e);
		}
	});
});

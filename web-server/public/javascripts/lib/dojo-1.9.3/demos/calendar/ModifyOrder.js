define([
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/_base/array",           
	"dijit/_WidgetBase",	
	"dijit/_TemplatedMixin",
	"dijit/_WidgetsInTemplateMixin",
	"dojo/text!./templates/modifyOrder.html",
	"dojo/store/Memory", 
	"dijit/form/Select",
    "dojo/data/ObjectStore"
],

function(
	declare,
	lang,
	arr,
	_WidgetBase,
	_TemplatedMixin,
	_WidgetsInTemplateMixin,
	template,
	Memory,
	Select,
	ObjectStore){
					
		return declare("demo.ModifyOrder", [ _WidgetBase, _TemplatedMixin,
			_WidgetsInTemplateMixin ], {

		templateString : template,
		
		id:null,

		postCreate : function() {

			this.inherited(arguments);

			var self = this;

			var store = new Memory({
				data : [ {
					id : "foo",
					label : "Foo"
				}, {
					id : "bar",
					label : "Bar"
				} ]
			});

			var os = new ObjectStore({
				objectStore : store
			});

			var s = new Select({
				store : os
			}, "factory");
			s.startup();

		},

		param : null,

		_setParamAttr : function(value) {
			this._set("param", value);
		},
		
		load : function(){
			
		}


	});
});

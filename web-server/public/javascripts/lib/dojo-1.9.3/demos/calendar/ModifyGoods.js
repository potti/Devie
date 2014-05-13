define([
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/_base/array",           
	"dijit/_WidgetBase",	
	"dijit/_TemplatedMixin",
	"dijit/_WidgetsInTemplateMixin",
	"dojo/text!./templates/modifyGoods.html",
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
					
		return declare("demo.ModifyGoods", [ _WidgetBase, _TemplatedMixin,
			_WidgetsInTemplateMixin ], {

		templateString : template,

		postCreate : function() {

			this.inherited(arguments);

			var self = this;


		},
		
		load : function(){
			
		},

		param : null,

		_setParamAttr : function(value) {
			this._set("param", value);
		},

	});
});

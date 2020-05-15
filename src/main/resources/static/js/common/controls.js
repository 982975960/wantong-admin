var dzt = dzt || {};
dzt.admin = {};
dzt.admin.controls = {};
dzt.admin.controls.Dropdown = function(jqueryObj, options){
	var _selectedValue = null;
	jqueryObj.on("hidden.bs.dropdown", function(){
		console.debug(arguments);
	});
	jqueryObj.find("ul").on("click", "li", function(){
		$(this).attr("selected", "true");
		var value = $(this).attr("value");
		var text = $(this).html();
		jqueryObj.find("button").html(text + '<span class="caret"></span>');
		_selectedValue = value;
	});
	return {
		getSelectedValue: function(){
			return _selectedValue;
		},
		getRootElement: function(){
			return jqueryObj;
		},
		getButtonElement: function(){
			return jqueryObj.find("button");
		}
	}
};


(function($){
	$.fn.extend({
		dropdown: function(options){
			return dzt.admin.controls.Dropdown(this, options);
		}
	});
})(jQuery);

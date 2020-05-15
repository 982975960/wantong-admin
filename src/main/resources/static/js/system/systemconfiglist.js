wantong.systemConfigList=(function(){
	
	var
	UPDATE_URL = "/system/updatesystemconfig.do",
	_root = null,
	_conf={
	},
	_init = function(conf){
		$.extend(_conf, conf);
		_root = $("#systemConfigListPanel");
		_initUpdateEvent();
	},
	_initUpdateEvent = function(){
		_root.find(".update-button").click(function(){
			_doUpdate($(this));
		});
	},
	_doUpdate = function(updateBtn){
		var row = updateBtn.parents("tr");
		var name = row.find(".keyCol").html();
		var value = row.find(".value").val();
		var comments = row.find(".comments").val();
		
		$.post(UPDATE_URL, {
			name: name,
			value: value,
			comments: comments
		}, function(){
			wanxuebang.frame.refreshPage();
		});
	};
	
	return {
		init: function(conf){
			_init(conf);
		}
	};
	
})();

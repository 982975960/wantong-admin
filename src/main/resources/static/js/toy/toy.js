wanxuebang.toy=(function(){
	
	var
	UPLOAD_URL = "/toy/upload.do",
	DELETE_URL = "/toy/delete.do",
	UPDATE_STATUS_URL = "/toy/updateStatus.do",
	_uploader = null,
	_progressBar = null,
	_toysListTable = null,
	_conf={
		pickerDomName: "#picker"
	},
	_init = function(conf){
		$.extend(_conf, conf);
		_toysListTable = $("#toysListTable");
		_progressBar = $("#uploadProgress");
		_uploader = WebUploader.create({
		    swf: '/js／uploader/Uploader.swf',
		    server: UPLOAD_URL,
		    pick: _conf.pickerDomName,
		    resize: false,
		    accept: {
		        title: 'Images',
		        extensions: 'zip',
		        mimeTypes: 'application/zip'
		    }
		});
		_uploader.on( 'fileQueued', function( file ) {
			_clearErrors();
			_uploader.upload();
	    });
		_uploader.on( 'uploadProgress', function( file, percentage ) {
			if(percentage > 0){
				_progressBar.show();
			}
			_progressBar.find("div:first").css("width", parseInt(percentage * 100) + "%");
			if(percentage > 0.9){
				$("#uploadPickerText").html("Uploading to QiNiu, pls wait and don't close this page!");
			}
		});
		_uploader.on( 'uploadSuccess', function( file, response) {
			var responseJson = JSON.parse(response._raw);
			_handleUploadResult(responseJson);
		});
		_initStatusChangeEvent();
		_initDeleteEvent();
	};
	_initStatusChangeEvent = function(){
		_toysListTable.delegate(".statusItem", "click", function(){
			var selectedValue = $(this).attr("value");
			var selectedText = $(this).html();
			var row = $(this).parents(".toysRow");
			var button = row.find(".statusChangeDropDown");
			button.attr("value", selectedValue);
			button.html(selectedText + "<span class=\"caret\"></span>");
			_enableUpdate(row);
		});
	},
	_initDeleteEvent = function(){
		_toysListTable.delegate(".deleteButton", "click", function(){
			var confirmed = window.confirm("确认删除？");
			if(confirmed){
				var row = $(this).parents(".toysRow");
				var toyId = row.attr("toyId");
				$.get(DELETE_URL + "?toyId="+toyId, function(){
					row.remove();
				});
			}
		});
		
		_toysListTable.delegate(".authCodeButton", "click", function(){
			var row = $(this).parents(".toysRow");
			var toyId = row.attr("toyId");
			wanxuebang.frame.showPage("/toy/listAuthCode.do?toyId=" + toyId);
		});
	},
	_clearErrors = function(){
		$("#errorMsgPanel").hide();
	},
	_enableUpdate = function(row){
		var updateButton = row.find(".updateButton");
		updateButton.show();
		updateButton.click(function(){
			_updateStatus(row);
		});
	},
	_updateStatus = function(row){
		var toyId = row.attr("toyId");
		var status = row.find(".statusChangeDropDown").attr("value");
		var url = UPDATE_STATUS_URL + "?toyId=" + toyId + "&status=" + status;
		$.get(url, function(){
			row.find(".updateButton").hide();
		});
	},
	_handleUploadResult = function(response){
		if(response.result){
			_progressBar.fadeOut();
			$("#uploadPickerText").html("Complete, waiting for page refresh!");
			setTimeout(function(){
				_refreshPage();
			}, 1000);
		}else{
			var errorMsg = response.errorMsg;
			_progressBar.fadeOut(500, function(){
				$("#errorMsgPanel").show();
				$("#errorMsgPanel").find(".panel-body").html(errorMsg);
				$("#uploadPickerText").html("Upload failed. Retry it!");
			});
			
		}
	},
	_refreshPage = function(){
		wanxuebang.frame.switchMenu("toyManage");
	};
	
	return {
		init: function(conf){			
			_init(conf);
		}
	};
	
})();

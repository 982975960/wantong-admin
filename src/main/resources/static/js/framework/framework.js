wantong.framework=(function(){
	
	var
	UPLOAD_URL = "/framework/upload.do",
	DELETE_URL = "/framework/delete.do",
	_uploader = null,
	_progressBar = null,
	_conf={
		pickerDomName: "#picker"
	},
	_init = function(conf){
		$.extend(_conf, conf);
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
		_uploader.options.formData.type = "test";
		_uploader.on('uploadBeforeSend', function(block, data){
			data.type = _conf.type;
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
		});
		_uploader.on( 'uploadSuccess', function( file, response) {
			var responseJson = JSON.parse(response._raw);
			_handleUploadResult(responseJson);
		});
		_initDeleteEvent();
	},
	_initDeleteEvent = function(){
		$(".frameworkVersionLable").click(function(){
			$(".deletePromptPanel").hide();
			$(this).parent().find(".deletePromptPanel").show();
		});
		
		$(".deleteBtn").click(function(){
			var frameworkId = $(this).attr("frameworkid");
			$.get(DELETE_URL + "?frameworkId=" + frameworkId, function(){
				setTimeout(function(){
					_refreshPage();
				}, 1000);
			});
		});
	},
	_clearErrors = function(){
		$("#errorMsgPanel").hide();
	},
	
	_handleUploadResult = function(response){
		if(response.result){
			_progressBar.fadeOut();
			$("#uploadPickerText").html("Upload success. Wait for page refresh.");
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
		wanxuebang.frame.switchMenu("frameworkManage");
	};
	
	return {
		init: function(conf){			
			_init(conf);
		}
	};
	
})();

wanxuebang.toyAuth=(function(){
	
	var
	DOWNLOAD_URL = "/toy/downloadAuthCode.do",
	QUERY_AUTH_CODE_PROGRESS_URL = "/toy/queryAuthCodeProgress.do",
	BATCH_GENERATE_AUTH_CODE_URL = "/toy/batchGenerateAuthCode.do",
	REGENERATE_AUTH_CODE_URL = "/toy/regenerateAuthCode.do";
	_root = null,
	_toyAuthCodesListTable = null,
	_queryStatusTimer = null,
	_agentDropdown = null,
	_typeDropdown = null,
	_toyId = 0,
	_conf={
	},
	_init = function(conf){
		$.extend(_conf, conf);
		_toyId = conf.toyId;
		_root = $("#authCodeListPanel");
		_toyAuthCodesListTable = _root.find("#toyAuthCodesListTable");
		_initAllInputs();
		_initDownloadButtonEvent();
		_initDeleteEvent();
		_initCreateEvent();
	},
	_initAllInputs = function(){
		_agentDropdown = $("#agentDropdown").dropdown();
		_typeDropdown = $("#typeDropdown").dropdown();
	},
	_initDownloadButtonEvent = function(){
		var jobIds = [];
		_toyAuthCodesListTable.find(".downloadAuthCode").each(function(index, domElement){
			var jobId = $(domElement).attr("jobId");
			jobIds.push(jobId);
		});
		$.get(QUERY_AUTH_CODE_PROGRESS_URL + "?jobIds=" + jobIds.join(","), function(data){
			var dataJson = JSON.parse(data);
			for(var jobId in dataJson){
				_updateJobStatus(jobId, dataJson[jobId]);
			}
		});
		clearTimeout(_queryStatusTimer);
		_queryStatusTimer = window.setTimeout(function(){
			_initDownloadButtonEvent();
		}, 3000);
	},
	_initCreateEvent = function(){
		_root.find("#createNewButton").click(function(){
			var salerCode = _agentDropdown.getSelectedValue();
			if(salerCode == null){
				_agentDropdown.getButtonElement().addClass("error");
				return;
			}
			var amount = _root.find("#amount").val();
			if(!/^[1-9]\d*$/.test(amount)){
				_root.find("#amount").addClass("error");
				return;
			}
			var type = _typeDropdown.getSelectedValue();
			if(type == null){
				_typeDropdown.getButtonElement().addClass("error");
				return;
			}
			var url = BATCH_GENERATE_AUTH_CODE_URL + "?salerCode=" + salerCode + "&amount=" + amount + "&type=" + type + "&toyId=" + _toyId;
			var button = _agentDropdown.getButtonElement();
			button.unbind("click");
			$.get(url, function(){
				setTimeout(function(){
					button.html("提交成功，等待页面刷新。。。");
					wanxuebang.frame.refreshPage();
				}, 1000);
			});
		});
	},
	_updateJobStatus = function(jobId, data){
		var downloadBtn = _toyAuthCodesListTable.find("[jobId='" + jobId + "']");
		downloadBtn.unbind("click");
		if(data.status == -1){
			downloadBtn.html("生成失败，点击重试");
			downloadBtn.bind("click", function(){
				_regenerateAuthCode(jobId);
			});
		}else if(data.status == 0){
			downloadBtn.html("二维码生成中");
		}else if(data.status == 1){
			downloadBtn.html(data.piecesProgress + "个二维码已生成");
		}else if(data.status == 2){
			downloadBtn.html("生成压缩包中");
		}else if(data.status == 3){
			downloadBtn.html("下载压缩包");
			downloadBtn.bind("click", function(){
				_download(jobId);
			});
		}
	},
	_regenerateAuthCode = function(jobId){
		var url = REGENERATE_AUTH_CODE_URL + "?jobId=" + jobId;
		$.get(url, function(data){
			var jsonData = JSON.parse(data);
			var jobId = jsonData.jobId;
			var downloadBtn = _toyAuthCodesListTable.find("[jobId='" + jobId + "']");
			downloadBtn.click(function(){});
			downloadBtn.html("二维码生成中");
		});
	},
	_download = function(jobId){
		window.open(DOWNLOAD_URL + "?jobId=" + jobId);
	};
	
	return {
		init: function(conf){
			_init(conf);
		}
	};
	
})();

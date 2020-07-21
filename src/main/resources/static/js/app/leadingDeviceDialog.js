wantong.leadingDeviceDialog = (function () {
  var
      _root = null,
      _layerIndex = 0,
      _excelUploader = null,
      _excelFileList = new Array(),
      _conf = {},
      CHECK_LEADIN_DEVICEID = "/app/checkLeadInDeviceId.do",
      UPLOAD_EXCEL_URL =
          GlobalVar.contextPath + "/app/leadingInDeviceID.do",
      _init = function (conf) {
        $.extend(_conf, conf);
        _root = $("#leadingDeviceDialog");
        _initButton();
        _layerIndex = layer.index;
        _initUploadExcel();
      },
      _initButton = function () {
        _root.find("#saveButton").click(function () {
          _root.find("#saveButton").attr("disabled",
              "disabled").html("正在上传");
          _root.find("#uploadFilePicker").css("visibility",
              "hidden");
          _uploadExcelAndSave();
        });
        _root.find("#closeButton").click(function () {
          layer.close(_layerIndex);
        });
      },
      _uploadExcelAndSave = function () {
        if (_excelFileList == null || _excelFileList.length == 0) {
          layer.msg("请添加Excel文件");
          _root.find("#saveButton").removeAttr(
              "disabled").html(
              "保存");
          _root.find("#uploadFilePicker").css("visibility",
              "inherit");
          return;
        }

        _excelUploader.option("formData", {
          appId: _conf.appId,
          recordId: _conf.recordId
        });
        _excelUploader.upload();
        console.log("123123");

        var success = false;
        var _index = layer.msg('数据保存中...', {icon: 16,shade: [0.5, '#f5f5f5'],scrollbar: false,offset: 'auto', time: 1000000});
        //轮训保存状态
        if (!success) {
          var timeTask = setInterval(()=> {
            $.ajax({
              url: CHECK_LEADIN_DEVICEID,
              type: "POST",
              async: false,
              data: {
                "appId":  _conf.appId
              },
              dataType: "json",
              success: function (data) {
                if (data.code == 0) {
                  //任务完成
                  success = true;
                  layer.msg("保存成功");
                  layer.close(_layerIndex);
                } else if(data.code == 1) {
                  //任务出错
                  success = true;
                  layer.msg(data.msg);
                } else if(data.code == 14){
                  //任务还在进行中
                }
              }
            }).always(()=>{
              if (success) {
                clearInterval(timeTask);
                layer.closeAll();
              }
            });
          }, 500);
        }
      },
      _initUploadExcel = function () {
        var _progressBar = _root.find("#uploadProgress");
        var _uploadFileList = _root.find("#uploadFileList");
        _excelUploader = WebUploader.create({
          swf: GlobalVar.contextPath + '/js／uploader/Uploader.swf',
          server: UPLOAD_EXCEL_URL,
          pick: {
            id: _root.find("#uploadFilePicker"),
            multiple: false
          },
          fileNumLimit: 2,
          duplicate: true,
          accept: {
            title: 'Excel',
            extensions: 'xls',
            mimeTypes: 'application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          }
        });
        _excelUploader.on('fileQueued', function (file) {
          _root.find("#error").hide();
          _excelFileList.push(file.id);
          if (_excelFileList.length >= 2) {
            _excelUploader.removeFile(
                _excelUploader.getFile(_excelFileList[_fileIndex]));
            _fileIndex++;
          }
          _uploadFileList.attr("fileId", file.id);
          _uploadFileList.html(file.name);
        });
        _excelUploader.on('uploadProgress', function (file, percentage) {
          if (percentage > 0) {
            _progressBar.show();
          }
          _progressBar.find("div:first").css("width",
              parseInt(percentage * 100) + "%");
          if (parseInt(percentage * 100) >= 100) {
            _progressBar.hide();
            _root.find("#saveButton").attr("disabled",
                "disabled").html("上传成功，正在保存！");
            _root.find("#cancelBtn").css("display", "none");
          }
        });
        _excelUploader.on('uploadSuccess', function (file, response) {
          /*if (response.code == 0) {
              layer.msg("导入成功");
              setTimeout(function () {
                  layer.close(_layerIndex);
              }, 500);
          } else {
              layer.msg(response.msg);
              setTimeout(function () {
                  layer.close(_layerIndex);
              }, 500);
          }*/
        });
        _excelUploader.on("error", function (type) {
          if (type == "Q_TYPE_DENIED") {
            layer.msg("还没有选择任何Excel.xls文件。");
          }
        });
      };

  return {
    init: function (conf) {
      _init(conf);
    }
  };

})();

wantong.updateResource = (function () {
  var
      i = 0;
  appId = null,
      partnerId = null,
      CREATE_UPDATE_RESOURCE_URL = GlobalVar.contextPath
          + "/app/createNewResource.do",
      TO_UPDATE_RESOURCE_URL = GlobalVar.contextPath
          + "/app/toUpdateResourcePage.do",
      CREATE_NEWRESOURCE_VISIONURL = GlobalVar.contextPath
          + "/app/uploadresource.do",
      VALIDATE_RESOURCE_VERSION_URL = GlobalVar.contextPath
          + "/app/validateResourceVersion.do",
      _root = null,
      _createResourceDiv = null,
      _createResourceBtn = null,
      _createResourceVer = null,
      _tisAlert = null,
      _newResourceVision = null,
      options = null,
      _newResourceVersionForm = null,
      _tisSpan = null;
  _conf = {},
      _init = function (conf) {
        $.extend(_conf, conf);
        _root = $("#tisAppResourceRoot");
        appId = _root.find("#appId").val();
        partnerId = _root.find("#partnerId").val();
        _newResourceVision = _root.find("#newResourceVision");
        _newResourceVersionForm = _root.find("#newResourceVersionForm");
        _tisAlert = _root.find("#tis-alert");
        _tisSpan = _tisAlert.find("span");
        _tisAlert.hide();
        _initCreateResource();
        _initAddNewResource();
        _initCreateNewResourceVision();
        _backPrePage();
      },
      _initCreateResource = function () {
        _createResourceDiv = _root.find("#createResourceDiv");
        _createResourceBtn = _root.find("#createResourceBtn");
        _createResourceVer = _root.find("#createResourceVer");
        _createResourceDiv.hide();
        _createResourceBtn.click(function () {
          if (i == 0) {
            _createResourceBtn.html("返回")
            _tisSpan.html("");
            _tisAlert.hide();
            _createResourceVer.hide();
            _createResourceDiv.show();
            i = 1;
          } else {
            i = 0;
            _createResourceBtn.html("创建新资源")
            _tisSpan.html("");
            _tisAlert.hide();
            _createResourceVer.show();
            _createResourceDiv.hide();
          }
        });
      },
      _initAddNewResource = function () {
        _insertResourceBtn = _root.find("#newResourceSaveButton");
        _insertResourceBtn.on("click", function () {
          var name = _root.find("#newResourName").val();
          $.post(CREATE_UPDATE_RESOURCE_URL, {
            appId: appId,
            name: name
          }, function (data) {
            if (data == 0) {
              wantong.frame.showPage(TO_UPDATE_RESOURCE_URL, {
                appId: appId,
                partnerId: partnerId
              });
            } else if (data == 1) {
              _tisSpan.html(data.msg);
              _tisAlert.show();
            }
          });
        });
      },
      _initCreateNewResourceVision = function () {
        _newResourceVision.on("click", function () {
          version = _root.find("#version").val(),
              summary = _root.find("#summary").val(),
              fileName = _root.find("#exampleInputFile").val(),
              resourceId = _root.find("#resourceId").val();
          if (version.match(/^[0-9]+\.[0-9]+\.[0-9]+$/) == null) {
            _tisSpan.html("Version格式为错误，例如：1.0.1");
            _tisAlert.show();
            return;
          }
          if (fileName.substring((fileName.lastIndexOf("."))) != ".zip") {
            _tisSpan.html("文件后缀名必须是.zip");
            _tisAlert.show();
            return;
          }
          if (summary.match(/\S+/) == null) {
            _tisSpan.html("版本更新描述不可为空");
            _tisAlert.show();
            return;
          }

          options = {
            type: "post",
            url: CREATE_NEWRESOURCE_VISIONURL,
            dataType: "json",
            beforeSubmit: function () {
              var validateVersion = 0,
                  message = "";
              $.ajax({
                type: "post",
                url: VALIDATE_RESOURCE_VERSION_URL,
                async: false,
                data: {version: version, resourceId: resourceId},
                dataType: "json",
                success: function (data) {
                  validateVersion = data.code;
                  message = data.message;
                }
              });
              if (validateVersion == 1) {
                _tisSpan.html(message);
                _tisAlert.show();
                return false;
              }
              _newResourceVision.attr("disabled", "disabled");
              _newResourceVision.css("background", "#D8D8D8");
              _newResourceVision.html("正在上传");
              return true;
            },
            success: _success,
            error: _error
          };
          _newResourceVersionForm.ajaxSubmit(options);
        });

      },
      _success = function (data) {
        if (data == 1) {
          wantong.frame.showPage(TO_UPDATE_RESOURCE_URL, {
            appId: appId,
            partnerId: partnerId
          });
        } else if (data == 2) {
          _tisSpan.html('文件转换失败');
          _tisAlert.show();
        } else if (data == 3) {
          _tisSpan.html('七牛上传失败');
          _tisAlert.show();
        } else if (data == 4) {
          _tisSpan.html('上传中,请勿重复...');
          _tisAlert.show();
        } else {
          _tisSpan.html('添加到数据库失败');
          _tisAlert.show();
        }
        _newResourceVision.removeAttr("disabled");
        _newResourceVision.css("background", "#E4A541");
        _newResourceVision.html("开始上传");
      },
      _error = function (data) {
        _tisSpan.html('出现异常,可能是网络原因,上传失败,请再次点击开始上传！');
        _tisAlert.show();
        _newResourceVision.removeAttr("disabled");
        _newResourceVision.css("background", "#E4A541");
        _newResourceVision.html("开始上传");
      },
      _backPrePage = function () {
        _root.find("#backPrePageBtn").click(function () {
          wantong.frame.showPage(GlobalVar.backPath, GlobalVar.data);
        });
      };

  return {
    init: function (conf) {
      _init(conf);
    }
  }
})();
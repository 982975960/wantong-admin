wantong.addCardGroup = (function () {
  var
      _cardUpload = null,
      _uploadContainer = null,
      _root = null,
      _coverImage = null,
      _uploadButtonIsShown = false,
      _conf = {
        UPLOAD_URL: "upload.do",
        LOAD_CARD_INFO: "/card/loadCardGroupInfo.do",
        SAVE_CARD_INFO: "/card/saveCardGroupInfo.do",
        PREVIEW_IMAGE: "downloadTempFile.do"
      },
      _init = function (conf) {
        $.extend(_conf, conf);
        _root = $("#createCardGroupDiv");
        _uploadContainer = _root.find("#uploadBtn");
        _initThumbnail();
        _inintButton();
        _initUploadBtn();
        if (_conf.groupId > 0) {
          _loadData();
          _initInputControls();
        }
      },
      _initThumbnail = function () {
        setTimeout(function () {
          _uploadContainer.hide();
        }, 100);
        _root.find("#thumbnail").mouseover(function () {
          _showUploadButton();
        });
        _uploadContainer.mouseover(function () {
          _showUploadButton();
        });
        _root.find("#thumbnail").mouseout(function () {
          _hideUploadButton();
        });
        _uploadContainer.mouseout(function () {
          _hideUploadButton();
        });
      },
      _showUploadButton = function () {
        if (!_uploadButtonIsShown) {
          _uploadContainer.show();
          _uploadButtonIsShown = true;
        }
      },
      _hideUploadButton = function () {
        if (_uploadButtonIsShown) {
          _uploadContainer.hide();
          _uploadButtonIsShown = false;
        }
      },
      _initUploadBtn = function () {
        _cardUpload = WebUploader.create({
          swf: GlobalVar.contextPath + '/js／uploader/Uploader.swf',
          server: _conf.UPLOAD_URL + "?check=" + true,
          fileSingleSizeLimit: 5 * 1024 * 1024,
          pick: {
            id: _root.find("#upload"),
            multiple: false
          },
          dnd: "#groupUploadDiv",
          accept: {
            title: 'JPG',
            extensions: 'jpg,jpeg',
            mimeTypes: 'image/jpeg'
          },
          auto: true,
          method: "POST",
          duplicate: true,
          disableGlobalDnd: false
        });
        _cardUpload.on('fileQueued', function (file) {
          console.log("1111");
        });
        _cardUpload.on('uploadSuccess', function (file, response) {
          console.log("1111");
          if (response.code == 0) {
            _coverImage = response.data.fileName;
            _root.find("#coverImage").attr("src",
                _conf.PREVIEW_IMAGE + "?fileName=" + _coverImage);
          } else {
            layer.msg(response.msg);
          }

        });
        _cardUpload.on("error", function (type) {
          console.log("1111");
          if (type == "Q_TYPE_DENIED") {
            layer.msg("请上传jpeg格式的文件，如img.jpg或img.jpeg等");
          } else if (type == "F_EXCEED_SIZE") {
            layer.msg("封面图大小不能超过5M");
          } else {
            layer.msg("请上传jpeg格式的文件，如img.jpg或img.jpeg等");
          }
        });
      },
      _inintButton = function () {
        //点击保存按钮
        _root.find("#saveCardInfoBtn").click(function () {
          _saveCardInfo($(this));
        });
      },
      _saveCardInfo = function (jqObj) {

        var btnTxt = jqObj.html();
        jqObj.html(
            "<img style='width:20px; height:20px' src='" + GlobalVar.contextPath
            + "/static/images/loading.gif'> &nbsp;正在保存中").attr('disabled',
            true);

        var parameters = _setUpParameters();

        if (parameters == false) {
          jqObj.html(btnTxt).attr('disabled', false);
          return;
        }
        console.log("saveCardInfo");
        $.ajax({
          type: "post",
          url: _conf.SAVE_CARD_INFO,
          data: parameters,
          dataType: "json",
          success: function (data) {
            if (data.code == 0) {
              _conf.groupId = data.data.groupId;
              _loadData(data.data.groupId);
              layer.msg("保存成功");
              _root.find("#saveAndNextBtn").attr("disabled", "disabled");
            } else {
              layer.msg(data.msg);
            }
          }
        }).fail(function () {
          layer.msg("服务无响应");
        }).always(function () {
          jqObj.html(btnTxt).attr('disabled', false);
        });

      },
      _loadData = function () {
        console.log("loadCard:" + _conf.groupId);
        $.ajax({
          url: _conf.LOAD_CARD_INFO,
          type: "GET",
          async: false,
          contentType: "application/json",
          data: {
            groupId: _conf.groupId
          },
          dataType: 'json',
          success: function (data) {
            if (data.code == 0) {
              _conf.initData = data.data;
            } else {
              console.log(data.msg);
              layer.msg(data.msg);
            }
          }
        });
      },
      _initInputControls = function () {
        if (_conf.initData) {
          var id = _root.find("#id");
          var name = _root.find("#name");
          var width = _root.find("#cardWidth");
          var height = _root.find("#cardHeight");
          id.text("groupId：" + _conf.initData.id);
          id.show();
          name.val(_conf.initData.name);
          width.val(_conf.initData.width);
          height.val(_conf.initData.height);

          _coverImage = _conf.initData.coverImage;
          _root.find("#coverImage").attr("src",
              GlobalVar.services.FDS + GlobalVar.services.CARDIMAGEPATH + "/"
              + _conf.modelId + "/" + _conf.initData.id
              + "/" + _coverImage);

        }
      },
      _setUpParameters = function () {
        var name = _root.find("#name").val();
        var width = _root.find("#cardWidth").val();
        var height = _root.find("#cardHeight").val();

        if (name == "") {
          layer.msg("请先填写套装名称");
          return false;
        }
        if (width == "") {
          layer.msg("请先填写卡片宽度");
          return false;
        }
        if (height == "") {
          layer.msg("请先填写卡片高度");
          return false;
        }
        if(isNaN(width)){
          layer.msg("请输入正确的宽度" );
          return false;
        }
        if(isNaN(height)){
          layer.msg("请输入正确的高度");
          return false;
        }
        var groupId = 0;
        if (_conf.initData) {
          groupId = _conf.groupId;
        }

        return {
          modelId: _conf.modelId,
          groupId: groupId,
          name: name,
          width: width,
          height: height,
          coverImage: _coverImage
        };
      };
  return {
    init: function (conf) {
      _init(conf);
    }
  }
})();
wantong.cardRecognitionCheck = (function () {
  var UPLOAD_URL = "upload.do",
      PREVIEW_IMAGE = "downloadTempFile.do",
      START_CHECK_URL = "card/startCheck.do",
      _conf = {},
      _root = null,
      _uploader = null,
      _uploadButton = null,
      _coverImage = null,
      _waitIndex = 0,
      _init = function (conf) {
        $.extend(_conf, conf);
        _root = $("#recognitionCheckDiv");
        _uploadButton = _root.find("#uploadBtn");
        _initUploadBtn();
        _initCheckBtn();
      },
      _initUploadBtn = function () {
        _uploader = WebUploader.create({
          swf: GlobalVar.contextPath + '/js／uploader/Uploader.swf',
          server: UPLOAD_URL + "?check=" + true,
          fileSingleSizeLimit: 5 * 1024 * 1024,
          pick: {
            id: _uploadButton,
            multiple: false
          },
          dnd: "#thumbnailContainer",
          accept: {
            title: 'JPG',
            extensions: 'jpg,jpeg',
            mimeTypes: 'image/jpg,image/jpeg'
          },
          auto: true,
          method: "POST",
          duplicate: true,
          disableGlobalDnd: false
        });
        _uploader.on('fileQueued', function (file) {
        });
        _uploader.on('uploadProgress', function (file, percentage) {

        });
        _uploader.on('uploadSuccess', function (file, response) {
          if (response.code == 0) {
            console.log("filename:" + response.data.fileName);
            _coverImage = response.data.fileName;
            _root.find("#coverImage").attr("src",
                PREVIEW_IMAGE + "?fileName=" + _coverImage);
          } else {
            layer.msg(response.msg);
          }

        });
        _uploader.on("error", function (type) {
          if (type == "Q_TYPE_DENIED") {
            /*layer.msg("请上传分辨率大于 640px * 480px 的JPG格式文件");*/
            layer.msg("请上传JPG格式的图片");
          } else if (type == "F_EXCEED_SIZE") {
            layer.msg("封面图大小不能超过5M");
          }
        });
      },
      _initCheckBtn = function () {
        _root.find("#startCheckBtn").click(function () {
          var width = _root.find("#cardWidth").val();
          var height = _root.find("#cardHeight").val();

          if ((_coverImage == null || _coverImage == "") && (width == ""
              || height == "")) {
            layer.msg("请上传图片及尺寸");
            return;
          }

          if ((_coverImage != null && _coverImage != "") && (width == ""
              || height == "" || parseInt(width) == 0 || parseInt(height) == 0)) {
            layer.msg("请完善图片尺寸信息");
            return;
          }

          if ((_coverImage == null || _coverImage == "") && (width != ""
              && height != "")) {
            layer.msg("请上传图片");
            return;
          }

          _showWaitPanel();
          $.post(START_CHECK_URL, {
            "coverImage": _coverImage,
            "width": width,
            "height": height
          }, function (data) {
            layer.close(_waitIndex);
            if (data.code == 0) {
              var index = layer.confirm('<div style="text-align:center;">'+data.msg+'</div>', {
                btn: ['确认'], title: '检测结果'
              }, function () {
                layer.close(index);
              });
            } else {
              layer.msg("系统错误");
            }
          });
        });
      },
      _showWaitPanel = function () {
        _waitIndex = layer.msg('正在检测中，请稍等....', {
          icon: 16
          , shade: 0.4,
          time: -1
        });
      };
  return {
    init: function (conf) {
      _init(conf);
    }
  }
})();

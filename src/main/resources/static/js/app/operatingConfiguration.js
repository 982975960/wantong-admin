//app的运营配置
wantong.config = (function () {
  var
      _root = null,
      _conf = {
        // 上传文件的URL
        UPLOAD_URL: GlobalVar.contextPath + "/upload.do",
        //打开配置弹窗URL
        SHOW_CONFIG_PANEL_URL: GlobalVar.contextPath
            + "/app/operatingConfig.do",
        //保存app的运营配置的URL
        SAVE_APP_CONFIG: GlobalVar.contextPath+"/app/saveOperatingConfig.do",
        //截取视频流图片
        GRAB_VIDEO_IMAGE_URL: GlobalVar.contextPath + "/grabVideoImage.do",

        UPLOAD_SWF_URL: GlobalVar.contextPath + '/js／uploader/Uploader.swf',

        //获取零时图片文件
        PREVIEW_IMAGE: GlobalVar.contextPath + "downloadTempFile.do",
        //获得app的配置数据
        GET_OPERATING_CONFIG_DATA: GlobalVar.contextPath
            + "/app/getOperatingConfigData.do",
        //配置文件路径
        OPERATING_RESOURCES_PATH: GlobalVar.services.FDS
            + GlobalVar.services.APPOPERATINGCONFIGPATH + "/"
      },
      //配置数据
      _config_data = {
        id: -1,
        appId: 0,
        videoFileName: "",
        videoImageFileName: "",
        imageFileName: "",
        customParameters: ""
      },
      //上传视频的按钮
      _uploadVideo = null,
      _uploadImage = null,
      _layerIndex = null,
      _init = function (conf) {
        $.extend(_conf, conf);

        //设置保存数据的appId
        _config_data.appId = conf.appId;

        _initPanel(_conf.appId, _conf.partnerId);
      },
      //初始化配置界面
      _initPanel = function (appId, partnerId) {
        _RequsetOperatingConfig(appId, partnerId, _openOperatingConfigPanel);
      },

      _loadAppOperatingData = function () {
        $.get(_conf.GET_OPERATING_CONFIG_DATA, {
          appId: _config_data.appId
        }, function (data) {
          if (data.code == 0) {

            _config_data.id = data.data.id;
            //  去加载界面
            _readerConfigPanel(data.data);
          } else {
            //  不做处理
          }
        });
      },

      //渲染界面上的参数
      _readerConfigPanel = function (data) {
        if (data.videoFileName != null && data.videoFileName != "") {
          _root.find("#video_url").val(
              _conf.OPERATING_RESOURCES_PATH + "app_" + _conf.appId
              + "/" + data.videoFileName);

          _config_data.videoFileName = data.videoFileName;
        }

        if (data.videoImageFileName != null && data.videoImageFileName != "") {
          _root.find("#video_btn label").css("background",
              "url(" + _conf.OPERATING_RESOURCES_PATH + "app_" + _conf.appId
              + "/" + data.videoImageFileName + ")");

          _config_data.videoImageFileName = data.videoImageFileName;
        }

        if (data.imageFileName != null && data.imageFileName != "") {
          _root.find("#image_btn label").css("background",
              "url(" + _conf.OPERATING_RESOURCES_PATH + "app_" + _conf.appId
              + "/" + data.imageFileName + ")");

          _root.find("#image_url").val(
              _conf.OPERATING_RESOURCES_PATH + "app_" + _conf.appId
              + "/" + data.imageFileName);

          _config_data.imageFileName = data.imageFileName;
        }

        if (data.customParameters != null && data.customParameters != "") {
          _root.find("#custom_text").val(data.customParameters);

          _config_data.customParameters = data.customParameters;
        }
      },
      //显示配置界面
      _openOperatingConfigPanel = function (data) {
        var content = data;
        if (content == false) {
          layer.msg("服务异常");
          return;
        }
        _layerIndex = layer.open({
          type: 1,
          title: "运营配置",
          shade: 0.4,
          area: ['930px', '630px'],
          content: content,
          success: function (layero) {
            _root = $(layero);
            _loadAppOperatingData()
            _initWebUploader();
            _initSaveAndCancelBtnEvent($(layero));

          },
          end: function () {

          }
        });
      },

      //请求获得界面 callback在请求结束后执行的回调
      _RequsetOperatingConfig = function (appId, partnerId, callback) {
        $.get(_conf.SHOW_CONFIG_PANEL_URL, {
          appId: appId,
          partnerId: partnerId
        }, function (data) {
          if (data.code == undefined) {
            if (callback != null) {
              callback(data);
            }
          } else {
            callback(false);
          }
        });
      },

      //初始化保存和取消按钮事件
      _initSaveAndCancelBtnEvent = function (jqObj) {
        //保存app运营配置事件
        jqObj.find("#save_app_config").off("click").on("click", function () {
          _saveOperatingConfig();
        });
        // 取消按钮事件
        jqObj.find("#cancel").off("click").on("click", function () {
            layer.close(_layerIndex);
        });
      },

      //保存app的运营配置
      _saveOperatingConfig = function () {

        _config_data.customParameters =  _root.find("#custom_text").val();

        if (_config_data.videoFileName == "" && _config_data.imageFileName == ""
            && _config_data.customParameters == "") {
          layer.msg("请上传配置文件，或者填入你需要的自定义配置参数！");
          return;
        }
        $.ajax({
          type: "POST",
          url: _conf.SAVE_APP_CONFIG,
          contentType: "application/json",
          dataType:"json",
          data:JSON.stringify(_config_data),
          success:function (data) {
            if(data.code == 0){
              layer.close(_layerIndex);
              layer.msg("保存成功");
            }else {
              layer.msg(data.msg);
            }
          },error:function () {
            
          }
        });
      },

      _addUploadBtn = function () {
        _uploadVideo.addButton({
          id: "#video_button"
        })
        _uploadImage.addButton({
          id: "#image_button"
        })
      },

      //初始化上传按钮 1、上传视频按钮 2、上传App弹窗广告
      _initWebUploader = function () {
        _uploadVideo = WebUploader.create({
          swf: _conf.UPLOAD_SWF_URL,
          server: _conf.UPLOAD_URL + "?isMp3=" + false + "&isVoice=" + false,
          duplicate: false,//不去重
          pick: {
            id: video_btn,//上传按钮的id
            multiple: false//是否可以批量上传
          },
          //允许上传的文件类型
          accept: {
            extensions: 'avi,wmv,rm,rmvb,mov,mkv,flv,mp4,f4v,3gp,ts,wma,wav,aac',
            mimeTypes: '.avi,.wmv,.rm,.rmvb,.mov,.mkv,.flv,.mp4,.f4v,.3gp,.ts,.wma,.wav,.aac'
          },
          fileSingleSizeLimit: 50 * 1024 * 1024,//单个视频文件最大
          chunk: true,//是否允许分片上传
          chunkSize: 10 * 1024 * 1024,//分片上传的分片大小
          chunkRetry: 3,//由于网络问题上传失败后允许几次自动上传
          thread: 5,//允许的最大并发数
          auto: true,//允许自动上传
          duplicate: true,//重复选择
          async: true,//异步处理
          method: "POST"//请求方式
        });
        //初始化上传图片按钮的webUploader
        _uploadImage = WebUploader.create({
          swf: _conf.UPLOAD_SWF_URL,
          server: _conf.UPLOAD_URL,
          duplicate: false,//不去重
          pick: {
            id: image_btn,//上传按钮的id
            multiple: false//是否可以批量上传
          },
          //允许上传的文件类型
          accept: {
            title: 'JPG',
            extensions: 'jpg,jpeg',
            mimeTypes: 'image/jpeg'
          },
          fileSingleSizeLimit: 10 * 1024 * 1024,//单个视频文件最大
          auto: true,//允许自动上传
          duplicate: true,//重复选择
          async: true,//异步处理
          method: "POST"//请求方式
        });
        _addUploadBtn();
        _changeUploaderBtnBackground();
        _uploaderVideoEvent();
        _uploaderImageEvent();
      },

      //视频上传事件
      _uploaderVideoEvent = function () {
        _root.find(".webuploader-pick").css("padding", "0");

        _uploadVideo.on("uploadSuccess", function (file, response) {
          if (response.code == 0) {

            _config_data.videoFileName = response.data.fileName;

            _grabVideoImage(response.data.fileName);

          } else {

          }
        });
        _uploadVideo.on("uploadError", function (type, max, file) {
          if (type == "F_EXCEED_SIZE") {
            layer.msg("文件大于50M不符合需求");
          } else if (type == "Q_TYPE_DENIED") {
            layer.msg("文件格式不符合需求");
          }
        });
      },

      //截取视频的image
      _grabVideoImage = function (videoFileName) {

        $.get(_conf.GRAB_VIDEO_IMAGE_URL, {
          videoFileName: videoFileName
        }, function (data) {
          if (data.code == 0) {
            _config_data.videoImageFileName = data.data;

            _setHtmlTempDIVImage(_root.find("#video_btn").find("label"),
                data.data);
            _root.find("#video_url").val(
                _conf.OPERATING_RESOURCES_PATH + "app_" + _conf.appId
                + "/" + videoFileName);

          } else {
            layer.msg(data.msg)
          }
        });
      },

      //设置图片
      _setHtmlTempDIVImage = function (imageItem, imageName) {
        var src = _conf.PREVIEW_IMAGE + "?fileName=" + imageName;

        imageItem.css("background", 'url(' + src + ')');
      },

      //图片上传事件
      _uploaderImageEvent = function () {
        //上传成功的回调
        _uploadImage.on("uploadSuccess", function (file, response) {
          if (response.code == 0) {
            _config_data.imageFileName = response.data.fileName;

            _setHtmlTempDIVImage(_root.find("#image_btn").find("label"),
                response.data.fileName);

            _root.find("#image_url").val(
                _conf.OPERATING_RESOURCES_PATH + "app_" + _conf.appId
                + "/" + response.data.fileName);

          } else {

            layer.msg(data.msg);
          }
        });
        //上传错误的回调
        _uploadImage.on("uploadError", function (type, max, file) {
          if (type == "F_EXCEED_SIZE") {
            layer.msg("图片大于10M不符合需求");
          } else if (type == "Q_TYPE_DENIED") {
            layer.msg("非图片格式");
          }
        });
      },

      _changeUploaderBtnBackground = function () {
        $(".webuploader-pick").each(function () {
          $(this).css("background", "#fff");
        })
      };

  return {
    init: function (conf) {
      _init(conf);
    }
  }
})();
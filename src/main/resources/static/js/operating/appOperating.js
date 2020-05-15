wantong.operating.appConfig = (function () {
  var _conf = {
        // 上传文件的URL
        UPLOAD_URL: GlobalVar.contextPath + "/upload.do",
        //截取视频流图片
        GRAB_VIDEO_IMAGE_URL: GlobalVar.contextPath + "/grabVideoImage.do",
        //获取零时图片文件
        PREVIEW_IMAGE: GlobalVar.contextPath + "downloadTempFile.do",

        OPERATING_CONFIG_URL: GlobalVar.contextPath
            + "/operating/appOperatingConfig.do",

        GET_COMMON_APP_OPERATING_CONFIG_URL: GlobalVar.contextPath
            + "/operating/getCommonAppOperatingConfig.do",

        SAVE_COMMON_APP_OPERATING_CONFIG_URL: GlobalVar.contextPath
            + "/operating/saveCommonAppOperatingConfig.do",

        CHECK_TASK_STATE_URL: GlobalVar.contextPath + "/operating/checkTaskState.do",

        DEL_APP_OPERATING_RES_URL: GlobalVar.contextPath+"/operating/delOperatingConfig.do"
      },
      //配置数据
      _config_data = {
        id: -1,
        appId: -1,
        videoFileName: "",
        videoImageFileName: "",
        imageFileName: "",
        customParameters: ""
      },
      //上传视频的按钮
      _uploadVideo = null,
      //上传图片的按钮
      _uploadImage = null,

      _waitLayerIndex = null,
      _root = null,
      _init = function (conf) {
        $.extend(_conf, conf)
        _root = conf.currentTab;
        _initPanel(_initWebUploader);
      },
      _initPanel = function (callBack) {
        $.get(_conf.OPERATING_CONFIG_URL, {}, function (data) {
          if (data.code == undefined) {
            _root.html(data);
            _initSaveAndCancelBtnEvent();
            _initMouseHoverEvent();
            if (callBack != null) {
              _loadAppOperatingData();
              callBack();
            }
          } else {
            layer.msg(data.data);
          }
        });
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
            extensions: 'mp4',
            mimeTypes: '.mp4'
          },
          fileSingleSizeLimit: 100 * 1024 * 1024,//单个视频文件最大
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
            title: 'Images',
            extensions: 'jpg,jpeg,png',
            mimeTypes: 'image/*'
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
      //给上传事件添加按钮
      _addUploadBtn = function () {
        _uploadVideo.addButton({
          id: "#video_button"
        })
        _uploadImage.addButton({
          id: "#image_button"
        })
      },
      //修改上传按钮的颜色
      _changeUploaderBtnBackground = function () {
        $(".webuploader-pick").each(function () {
          $(this).css("background", "#fff");
          $(this).css("width", "100%");
          $(this).css("height", "100%");
        })
      },
      //视频上传事件
      _uploaderVideoEvent = function () {
        _root.find(".webuploader-pick").css("padding", "0");

        //上传进度
        _uploadVideo.on('uploadProgress', function (file, percentage) {
          _setUploaderpercentage(_root.find("#video_upload_percent"),
              "上传中... " + parseInt(percentage * 100) + "%");
        });

        _uploadVideo.on("uploadSuccess", function (file, response) {
          if (response.code == 0) {

            _config_data.videoFileName = response.data.fileName;

            _grabVideoImage(response.data.fileName);

            _setUploaderpercentage(_root.find("#video_upload_percent"), "");

            layer.msg("上传成功!");
          } else {

          }
        });
        _uploadVideo.on("error", function (type, max, file) {
          if (type == "F_EXCEED_SIZE") {
            layer.msg("视频大小不超过100M");
          } else if (type == "Q_TYPE_DENIED") {
            layer.msg("文件格式不符合需求");
          }
        });
      },
      //图片上传事件
      _uploaderImageEvent = function () {
        //上传成功的回调
        _uploadImage.on("uploadSuccess", function (file, response) {
          if (response.code == 0) {
            _setUploaderpercentage(_root.find("#image_upload_percent"), "");
            layer.msg("上传成功!");
            _config_data.imageFileName = response.data.fileName;
            _root.find("#image_shade_image").css("display", "block");
            _setHtmlTempDIVImage(_root.find("#image_btn").find("#upload_image"),
                response.data.fileName);

          } else {

            layer.msg(data.msg);
          }
        });
        //上传进度
        _uploadImage.on('uploadProgress', function (file, percentage) {
          _setUploaderpercentage(_root.find("#image_upload_percent"),
              "上传中... " + parseInt(percentage * 100) + "%");
        });
        //上传错误的回调
        _uploadImage.on("error", function (type, max, file) {
          if (type == "F_EXCEED_SIZE") {
            layer.msg("图片大小不超过10M");
          } else if (type == "Q_TYPE_DENIED") {
            layer.msg("非图片格式");
          }
        });
      },

      //初始化保存和取消按钮事件
      _initSaveAndCancelBtnEvent = function () {
        //保存app运营配置事件
        _root.find("#save_app_config").off("click").on("click", function () {
          _saveOperatingConfig();
        });
      },
      _initMouseHoverEvent = function () {

        $("#video_item").mouseover(function (event) {
          console.log(event);
          if ($("#video_shade_image").css("display") != "none") {
            $("#delete_video_content").show();
          }
        }).mouseout(function (event) {
          $("#delete_video_content").hide();
        });

        $("#image_item").mouseover(function (event) {
          $("#delete_image_content").show();
        }).mouseout(function () {
          $("#delete_image_content").hide();
        });

        $("#delete_video_btn").on("click", function (e) {
          e.stopPropagation();
          _delResShowHintEvent(1);
        });

        $("#delete_image_btn").off("click").on("click", function (e) {
          e.stopPropagation();
          _delResShowHintEvent(2);
        });
      },
      //删除内容的提示界面 type =1 视频 2 图片
      _delResShowHintEvent  = function (type) {
        if (type == 1) {
          var index = layer.confirm('请问您确定要删除视频吗?',
              {btn: ['确认', '取消'], title: "提示"},
              function () {
                _deleResInService(1);
              }, function () {
                layer.close(index);
              });
        } else {
          var index = layer.confirm('请问您确定要删除图片吗?',
              {btn: ['确认', '取消'], title: '提示'}, function () {
                _deleResInService(2);
              }, function () {
                layer.close(index);
              });
        }
      },
      //删除资源
      _deleResInService = function(type){
          $.get(_conf.DEL_APP_OPERATING_RES_URL,{
            type:type
          },function (data) {
            if(data.code == 0){
              layer.msg("删除成功");
              _loadAppOperatingData();
            }else {
              layer.msg(data.msg);
            }
          });
      },
      //设置图片
      _setHtmlTempDIVImage = function (imageItem, imageName) {

        var src = _conf.PREVIEW_IMAGE + "?fileName=" + imageName;
        imageItem.attr("src", src);
      },
      //截取视频的image
      _grabVideoImage = function (videoFileName) {

        $.get(_conf.GRAB_VIDEO_IMAGE_URL, {
          videoFileName: videoFileName
        }, function (data) {
          if (data.code == 0) {
            _config_data.videoImageFileName = data.data;
            _root.find("#video_shade_image").css("display", "block");
            _setHtmlTempDIVImage(_root.find("#video_btn").find("#video_image"),
                data.data);
          } else {
            layer.msg(data.msg)
          }
        });
      },
      //保存app的运营配置
      _saveOperatingConfig = function () {
        _config_data.customParameters = _root.find("#custom_text").val();
        if (_config_data.videoFileName == "" && _config_data.imageFileName == ""
            && _config_data.customParameters == "") {
          layer.msg("请进行配置！");
          return;
        }
        _clearUploaderFile();
        $.ajax({
          type: "POST",
          url: _conf.SAVE_COMMON_APP_OPERATING_CONFIG_URL,
          contentType: "application/json",
          dataType: "json",
          data: JSON.stringify(_config_data),
          success: function (data) {
            if (data.code == 0) {

              if (data.data.taskUUID != undefined) {

                _saveResourcesWaitPanel();
                _checkTaskState(data.data.taskUUID)
              }
              // _setConfigData(data);
              // _readerConfigPanel(data.data);

            } else {
              layer.msg(data.msg);
            }
          }, error: function () {

          }
        });
      },

      _saveResourcesWaitPanel = function () {
        _waitLayerIndex = layer.msg('资源保存中，请稍等....', {
          icon: 16,
          shade: 0.4,
          time: -1
        })
      },
      _checkTaskState = function (taskUUID) {
        $.ajax({
          type: "get",
          url: _conf.CHECK_TASK_STATE_URL,
          data: "taskUUID=" + taskUUID,
          async: false,
          success: function (data) {
            if (data.code == 0) {
              var index = null;
              if (data.data == 0) {
                index = setTimeout(function () {
                  _checkTaskState(taskUUID);
                }, 3 * 1000);
              } else if (data.data == 1) {
                layer.close(_waitLayerIndex);
                if (index != null) {
                  clearTimeout(index);
                }
                layer.msg("保存成功");
                _loadAppOperatingData();
              } else if (data.data == -1) {
                layer.close(_waitLayerIndex);
                if (index != null) {
                  clearTimeout(index);
                }
                console.log("没有该任务Id:" + taskUUID);
              } else {
                //
                layer.close(_waitLayerIndex);
                if (index != null) {
                  clearTimeout(index);
                }
              }
            } else {
              layer.msg("错误");
            }
          },
          error: function () {
            layer.msg("服务异常")
          }
        })
      },
      _clearUploaderFile = function () {
        _uploadImage.reset();
        _uploadVideo.reset();
      },

      _setConfigData = function (data) {
        _config_data.id = data.data.id;
        _config_data.imageFileName = data.data.imageFileName;
        _config_data.customParameters = data.data.customParameters;
        _config_data.videoImageFileName = data.data.videoImageFileName;
        _config_data.videoFileName = data.data.videoFileName;
        _config_data.appId = data.data.appId;
      },

      _loadAppOperatingData = function () {
        $.get(_conf.GET_COMMON_APP_OPERATING_CONFIG_URL, {}, function (data) {
          if (data.code == 0) {

            _setConfigData(data);
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
          _root.find("#video_url").val(data.videoURL);

          _config_data.videoFileName = data.videoFileName;
        }else {
          _root.find("#video_url").val("");
          _config_data.videoFileName = "";
        }

        if (data.videoImageFileName != null && data.videoImageFileName != "") {
          _root.find("#video_shade_image").css("display", "block");
          _root.find("#video_image").attr("src", data.videoImageURL);
          _config_data.videoImageFileName = data.videoImageFileName;
        }else {
          _root.find("#video_shade_image").css("display", "none");
          _root.find("#video_image").attr("src", "/static/images/write.png");
          _config_data.videoImageFileName = "";
        }

        if (data.imageFileName != null && data.imageFileName != "") {
          _root.find("#image_shade_image").css("display", "block");
          _root.find("#image_url").val(data.imageURL);
          _root.find("#upload_image").attr("src", data.imageURL);
          _config_data.imageFileName = data.imageFileName;
        }else {
          _root.find("#image_shade_image").css("display", "none");
          _root.find("#image_url").val("");
          _root.find("#upload_image").attr("src", "/static/images/write.png");
          _config_data.imageFileName = "";
        }

        if (data.customParameters != null && data.customParameters != "") {
          _root.find("#custom_text").val(data.customParameters);

          _config_data.customParameters = data.customParameters;
        }else {
          _root.find("#custom_text").val("");
          _config_data.customParameters = "";
        }
      },

      _setUploaderpercentage = function (item, content) {
        item.text(content);
      },
      _clearUploaderContent = function () {
        _root.find("#video_upload_percent").text("");
        _root.find("#image_upload_percent").text("");
      };
  return {
    init: function (conf) {
      _init(conf);
    }
  }
})();
wantong.app = {};
wantong.app.sdkNewManage = (function () {
  var
      _conf = {
        LIST_SDK_URL: "/app/listSdk.do",
        GET_SDK_TYPE: "/app/getSdkType.do",
        SAVE_SDK_TYPE: "/app/saveSdkType.do",
        UPLOAD_URL: "/app/sdkUpload.do",
        GET_SDKVERSION_ALL: "/app/getSdkVersionAll.do",
        GET_HISTORY_VERSION: "/app/getHistoryVersion.do"
      },
      _root = null,

      _platform = 2,
      _index = null,
      _uploader = null,
      _fileList = new Array(),
      _fileIndex = 0,
      _sdkTypesDb = null,
      _sdkVersions = null,
      _waitSdkSaveIndex =null,
      _init = function (conf) {
        $.extend(_conf, conf);
        _root = $(".content-wrap-w");

        _iosClick();
        _AndroidClick();
        _LinuxClick();

        _refreshList();

        _initCreateSdk();
        _initSaveSdk();

        _initDownload();

        _underline();
      },

      _underline = function () {
        if(_platform == 2){
          _root.find("#a_ios").css("text-decoration","underline");

          _root.find("#a_android").css("text-decoration","none");
          _root.find("#a_linux").css("text-decoration","none");
        }else if(_platform == 0){
          _root.find("#a_android").css("text-decoration","underline");

          _root.find("#a_ios").css("text-decoration","none");
          _root.find("#a_linux").css("text-decoration","none");
        }else {
          _root.find("#a_linux").css("text-decoration","underline");

          _root.find("#a_ios").css("text-decoration","none");
          _root.find("#a_android").css("text-decoration","none");
        }
      },

      _iosClick = function () {
        _root.on("click","#a_ios",function () {
          _platform = 2;
          _underline();
          _refreshList();
        })
      },
      _AndroidClick = function () {
        _root.on("click","#a_android",function () {
          _platform = 0;
          _underline();
          _refreshList();
        })
      },
      _LinuxClick = function () {
        _root.on("click","#a_linux",function () {
          _platform = 1;
          _underline();
          _refreshList();

        })
      },

      _initSaveSdk = function(){
        $.get(_conf.GET_SDKVERSION_ALL,function (result) {
          _sdkVersions = result.data;
        });
        _root.on("click","#saveSdkBtn",function () {

          var sdkPlatform = _root.find("#createSdkPlatform").val();
          if(sdkPlatform == 'IOS'){
            sdkPlatform = 2;
          }else if(sdkPlatform == 'Android'){
            sdkPlatform = 0;
          }else {
            return;
          }

          var sdkVersion = _root.find("#sdkVersion").val();
          //var sdkLowVersion = _root.find("#sdkLowVersion").val();
          var description = _root.find("#description").val();


          if (sdkVersion.match(/^[0-9]+\.[0-9]+\.[0-9]+$/) == null) {
            layer.msg("版本号格式为错误，例如：1.1.0");
            return;
          }

          var oldVsersion = document.getElementById("oldVsersion").value;
          var oldStr = oldVsersion.split('.');  // 3.6.2
          var newStr = sdkVersion.split('.');   // 3.5.3

          if(oldStr[0] > newStr[0]){
            layer.msg("不能小于或等于当前版本号");
            return;
          }
          if(oldStr[0] = newStr[0]){
            if(oldStr[1] > newStr[1]){
              layer.msg("不能小于或等于当前版本号");
              return;
            }
            if(oldStr[1] = newStr[1]){
              if(oldStr[2] >= newStr[2]){
                layer.msg("不能小于或等于当前版本号");
                return;
              }
            }
          }


          //判断同一平台，同一SDK类型的版本号是否重复
          if (_sdkVersions.length > 0){
            for (var i = 0; i< _sdkVersions.length; i++){
              if (_sdkVersions[i].platform == sdkPlatform && _sdkVersions[i].version == sdkVersion) {
                layer.msg("版本号重复，请修改");
                return;
              }
            }
          }
          /*if (description.length > 200){
            layer.msg("更新说明不能超过200字");
            return;
          }*/
          if (_fileList.length < 1){
            layer.msg("请上传SDK文件");
            return;
          }

          _uploader.options.formData.platform = sdkPlatform + '';
          _uploader.options.formData.sdkVersion = sdkVersion;
          _uploader.options.formData.description = description;
          //_uploader.options.formData.sdkLowVersion = sdkLowVersion;
          _uploader.upload();
          _showWaitSdkSavePanel();
        });
        _root.on("click","#closeSdkBtn",function () {
          layer.close(_index);
        });
      },
      _initDownload = function(){
        _root.on("click","button[name='downloadSdk']",function () {
          var url = document.getElementById("downloadUrl").value;
          //alert(url);
          window.location.href = url;
        });
      },
      _showWaitSdkSavePanel = function () {
        _waitSdkSaveIndex = layer.msg('SDK正在保存，请稍等....', {
          icon: 16,
          shade: 0.4,
          time: -1
        });
      },
      _initUploaderSdk = function () {
        var _uploadFileList = _root.find("#uploadFileName");
        _uploader = WebUploader.create({
          swf: GlobalVar.contextPath + '/js／uploader/Uploader.swf',
          server: _conf.UPLOAD_URL,
          pick: "#uploadFilePicker",
          auto: false,
          method: 'POST',
          formData: {
            platform: '',
            sdkVersion: '',
            //sdkLowVersion:'',
            description: '',
          },
          accept: {
            title: 'APK',
            extensions: 'apk',
            mimeTypes: 'application/vnd.android.package-archive'
          }
        });
        _uploader.on('fileQueued', function (file) {
          _fileList.push(file.id);
          if (_fileList.length >= 2) {
            _uploader.removeFile(_uploader.getFile(_fileList[_fileIndex]));
            _fileIndex++;
          }
          _uploadFileList.html(file.name);
        });
        _uploader.on('uploadSuccess', function (file, response) {
          if (response.code == 0) {
            layer.msg("APK上传成功。");
            layer.close(_waitSdkSaveIndex);
            setTimeout(function () {
              layer.close(_index);
            }, 1000);

            if(_platform == 0){
              $("a[name='a_android']").click();
            }else if(_platform == 2){
              $("a[name='a_ios']").click();
            }
          } else {
            layer.msg(response.msg);
            layer.close(_waitSdkSaveIndex);
            setTimeout(function () {
              layer.close(_index);
            }, 1000);

            if(_platform == 0){
              $("a[name='a_android']").click();
            }else if(_platform == 2){
              $("a[name='a_ios']").click();
            }

          }

        });
        _uploader.on("error", function (type) {
          if (type == "Q_TYPE_DENIED") {
            layer.msg("请上传正确格式文件");
          }
        });
      },

      _initCreateSdk = function(){
        _root.on("click","button[name='createSdk']",function () {
          if(_platform == 0){
            _root.find("#createSdkPlatform").val('Android');
          }else if(_platform == 1){
            _root.find("#createSdkPlatform").val('Linux/Rtos');
          }else{
            _root.find("#createSdkPlatform").val('IOS');
          }

          var createSdkDom = _root.find("#createSdkDom");
          layer.open({
            title: "创建SDK",
            type: 1,
            maxmin: false,
            resize: false,
            area: ['860px', '550px'],
            scrollbar: false,
            content: createSdkDom,
            cancel: function () {
              _refreshList();
            },
            end:function () {
              layer.closeAll();
            },
            success: function (layero) {
              var mask = $(".layui-layer-shade");
              mask.appendTo(layero.parent());
              //其中：layero是弹层的DOM对象
            }
          });
          _index = layer.index;
          _initUploaderSdk();
        });
      },

      _refreshList = function () {
        $.get(_conf.LIST_SDK_URL, {
          platform: _platform,
        }, function (data) {
          var dom = $(data);;

          $("#sdkList").html(dom);
        });
      };

  return {
    init: function (conf) {
      _init(conf);
    }
  }
})();
wantong.app = {};
wantong.app.sdkManage = (function () {
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
      _platform = 100,
      _sdkType = null,
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

        _initPlatformSelector();
        _refreshList();

        _initSdkTypeManage();
        _initSdkTypeAdd();
        _initSdkTypeSave();

        _initCreateSdk();
        _initSaveSdk();

        _initDownload();
        _initInstructions();
        _initHistoryVersion();

        _initSearch();
        _initClear();
      },
      _initHistoryVersion = function(){
        _root.on("click","button[name='historyVersion']",function () {
          var tdDoms = $(this).parents("tr").find("td");

          var platform = $(this).attr("platform");
          var typeId = $(this).attr("typeId");

          $.post(_conf.GET_HISTORY_VERSION,{
            platform: platform,
            platformStr: tdDoms.eq(0).html(),
            typeId: typeId,
            type: tdDoms.eq(1).html()
          },function (result) {
            layer.open({
              title: "SDK历史版本",
              type: 1,
              maxmin: false,
              area: ['800px', '600px'],
              content: result,
              end: function () {
                layer.closeAll();
              },
              cancel: function () {
                _refreshList($("#pagination").attr("currentPage"));
              },
              error: function () {
                layer.msg("获取SDK历史版本失败");
              },
              success: function (layero) {
                var mask = $(".layui-layer-shade");
                mask.appendTo(layero.parent());
                //其中：layero是弹层的DOM对象
              }
            });
            _index = layer.index;
          })
        });
      },
      _initInstructions = function(){
        _root.on("click","button[name='instructions']",function () {
          var url = $(this).attr("url");
          if (url.substr(0,4) != "http"){
            window.open( "http://" + url,'_blank');
          } else {
            window.open(url,'_blank');
          }
        });
      },
      _initDownload = function(){
        _root.on("click","button[name='download']",function () {
          var url = $(this).attr("url");
          window.location.href = url;
        });
      },
      _initSaveSdk = function(){
        $.get(_conf.GET_SDKVERSION_ALL,function (result) {
          _sdkVersions = result.data;
        });
        _root.on("click","#saveSdkBtn",function () {

          var sdkPlatform = _root.find("#createSdkPlatform").val();
          var sdkType = _root.find("#sdkTypeSelect").val();
          var sdkVersion = _root.find("#sdkVersion").val();
          var description = _root.find("#description").val();
          var instructions = _root.find("#instructions").val();

          if (sdkVersion.match(/^[0-9]+\.[0-9]+\.[0-9]+$/) == null) {
            layer.msg("版本号格式为错误，例如：1.1.0");
            return;
          }
          //判断同一平台，同一SDK类型的版本号是否重复
          if (_sdkVersions.length > 0){
            for (var i = 0; i< _sdkVersions.length; i++){
              if (_sdkVersions[i].platform == sdkPlatform && _sdkVersions[i].typeId == sdkType && _sdkVersions[i].version == sdkVersion) {
                layer.msg("版本号重复，请修改");
                return;
              }
            }
          }

          if (description.length > 200){
            layer.msg("更新说明不能超过200字");
            return;
          }
          if (instructions != ""){
            if(instructions.match("[a-zA-z]+://[^\\s]*") == null){
              layer.msg("使用说明不是正确的url，请输入正确的url");
              return;
            }
          }

          if (_fileList.length < 1){
            layer.msg("请上传SDK文件");
            return;
          }

          _uploader.options.formData.platform = sdkPlatform + '';
          _uploader.options.formData.sdkType = sdkType + '';
          _uploader.options.formData.sdkVersion = sdkVersion;
          _uploader.options.formData.description = description;
          _uploader.options.formData.instructions = instructions;
          _uploader.upload();
          _showWaitSdkSavePanel();
        });
        _root.on("click","#closeSdkBtn",function () {
          layer.close(_index);
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
            type: '',
            version: '',
            description: '',
            instructions: ''
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
        /*_uploader.on('uploadProgress', function (file, percentage) {
          if (percentage > 0) {
            _progressBar.show();
          }
          _progressBar.find("div:first").css("width",
              parseInt(percentage * 100) + "%");
          if (parseInt(percentage * 100) >= 100) {
            _progressBar.hide();
            _uploadAPKDialog.find("#saveButton").attr("disabled",
                "disabled").html("上传成功，正在保存！");
            _uploadAPKDialog.find("#cancelBtn").css("display", "none");
          }
        });*/
        _uploader.on('uploadSuccess', function (file, response) {
          if (response.code == 0) {
            layer.msg("APK上传成功。");
            layer.close(_waitSdkSaveIndex);
            setTimeout(function () {
              layer.close(_index);
            }, 1000);
            $("a[name='SDK下载']").click();
          } else {
            layer.msg(response.msg);
            layer.close(_waitSdkSaveIndex);
            setTimeout(function () {
              layer.close(_index);
            }, 1000);
            $("a[name='SDK下载']").click();
          }

        });
        _uploader.on("error", function (type) {
          if (type == "Q_TYPE_DENIED") {
            layer.msg("请上传正确格式文件");
          }
        });
      },

      _initCreateSdk = function(){
        _root.find("#createSdk").click(function () {
          var createSdkDom = _root.find("#createSdkDom");
          layer.open({
            title: "创建SDK",
            type: 1,
            maxmin: false,
            resize: false,
            area: ['800px', '720px'],
            scrollbar: false,
            content: createSdkDom,
            cancel: function () {
              _refreshList($("#pagination").attr("currentPage"));
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
      _initSdkTypeSave = function(){
        // 获取已经存在的sdk类型
        $.get(_conf.GET_SDK_TYPE,function (result) {
          _sdkTypesDb = result.data;
        });
        _root.find("#saveSdkType").click(function () {
          var sdkTypes=[];
          var doms = _root.find("input[name='sdkType']");
          for (var i = 0; i < doms.length; i++){
            var value = doms.eq(i).val();
            if (value == ""){
              layer.msg("SDK类型不能为空");
              return;
            }
            if (value.length > 15){
              layer.msg("SDK类型不能超过15个字符");
              return;
            }
            //判断SDK类型新增加的是否重复
            for (var j = 0;j < sdkTypes.length;j++){
              if (value == sdkTypes[j]){
                layer.msg('SDK类型不能重复，"'+ value +'"重复');
                return;
              }
            }
            sdkTypes.push(value);
          }
          // 判断SDK类型在数据库中是否重复
          if (_sdkTypesDb.length > 0){
            for (var i = 0; i < _sdkTypesDb.length;i++){
              if (value == _sdkTypesDb[i].type){
                layer.msg('SDK类型不能重复，"'+ value +'"已存在');
                return;
              }
            }
          }

          $.ajax({
            url:_conf.SAVE_SDK_TYPE,
            type:'POST',
            async:false,
            data:JSON.stringify(sdkTypes),
            contentType: "application/json; charset=utf-8",
            success:function (result) {
              if (result.code == 0){
                layer.msg("保存成功");
                setTimeout(function () {
                  layer.close(_index);
                }, 500);
                $("a[name='SDK下载']").click();
              }else {
                layer.msg("保存失败");
              }
            }
          });
        });
        _root.on("click","input[value='取消']",function () {
          layer.close(_index);
        });
      },
      _initSdkTypeAdd = function(){
        _root.find("#addSdkType").click(function () {
          var htmlStr = '<div class="sdkTypeDiv"><input name="sdkType" type="text" maxlength="15" placeholder="输入SDK类型(15字以内)" class="popups-line p-width" />' +
              '<img src="/static/images/ico-gb.jpg" width="13" height="12" name="delImg" class="sdkTypeImg" /></div>';
          _root.find("#sdkTypeBox").append(htmlStr);
        });
        _root.on("click","img[name='delImg']",function () {
          $(this).parent().remove();
        });
      },
      _initSdkTypeManage = function(){
        _root.find("#sdkTypeManage").click(function () {
          var createSdkTypeDom = _root.find("#createSdkTypeDom");
          layer.open({
            title: "SDK类型管理",
            type: 1,
            maxmin: false,
            resize: false,
            area: ['440px', '300px'],
            scrollbar: false,
            content: createSdkTypeDom,
            cancel: function () {
              _refreshList($("#pagination").attr("currentPage"));
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
        });
      },
      _initPlatformSelector = function () {
        _root.find("#platform").change(function () {
          _platform = $(this).val();
          _refreshList();
        });
      },
      _refreshCurrentPage = function () {
        var page = $('#pagination').attr('currentpage');
        _refreshList(page);
      },
      _refreshList = function (page) {

        if (page == undefined) {
          page = 1;
        }

        $.get(_conf.LIST_SDK_URL, {
          sdkType: _sdkType,
          platform: _platform,
          currentPage: page
        }, function (data) {
          var dom = $(data);
          var pagination = dom.find("#pagination");
          if (pagination.length > 0) {
            _initPagination(pagination);
          }
          $("#sdkList").html(dom);
        });
      },
      _initSearch = function(){
        _root.find("#searchBtn").click(function () {
          _sdkType = _root.find("#sdkType").val();
          _refreshList();
        });
      },
      _initClear = function(){
        _root.find("#clearBtn").click(function () {
          _root.find("#sdkType").val("");
        });
      },

      _initPagination = function (paginationDom) {
        var currentPage = parseInt(paginationDom.attr("currentPage"));
        var totalPages = parseInt(paginationDom.attr("pages"));
        //初始化页码
        paginationDom.html('');
        if (0 == totalPages) {
          return;
        } else {
          var lastPageAppend = 0;
          for (var i = 1; i < totalPages + 1; i++) {
            if (totalPages > 4 && Math.abs(currentPage - i) > 1 && i != 1 && i
                != totalPages) {
              continue;
            }

            if (lastPageAppend + 1 != i) {
              paginationDom.append(
                  '<li class="page-back-b2" class="disabled"><a href="#" onclick="return false;">...</a></li>');
            }
            //&& currentPage != 1
            if (i == 1) {
              paginationDom.append(
                  '<li page="-1" class="page-back"><a href="#" aria-label="Previous"><img src="static/images/ico9_03.png"></a></li>');
            }

            if (i == currentPage) {
              paginationDom.append(
                  '<a href="#"><li class="active" page="' + i + '">' + i
                  + '</li></a>');
            } else {
              paginationDom.append(
                  '<li class="page-back-b2" page="' + i + '"><a href="#">' + i
                  + '</a></li>');
            }

            if (i == totalPages) {
              paginationDom.append(
                  '<li page="0" class="page-back"><a href="#" aria-label="Next"><img src="static/images/ico9_05.png"></a></li>');
            }
            lastPageAppend = i;
          }
          paginationDom.append(
              '<Li>到第</Li><Li><input type="text" id="jumpPage" class="page-box page-back"/></Li><Li>页</Li><button type="button" class="page-input" id="jumpButton">跳转</button>');
        }
        paginationDom.find("#jumpButton").on("click", function () {
          var jumpPage = paginationDom.find("#jumpPage").val();
          var jumpPage2 = parseInt(jumpPage);
          if (jumpPage2 != NaN && jumpPage2 > 0 && jumpPage2 <= totalPages) {
            $("html,body").animate({scrollTop: 0}, 10);
            _refreshList(jumpPage2);
          } else {
            layer.msg("请输入正确页数")
          }
        });
        paginationDom.keydown(function (event) {
          var i = event.keyCode;
          if (event.keyCode == 13) {
            paginationDom.find("#jumpButton").click();
          }
        });
        paginationDom.delegate("li", "click", function (event) {
          var paginationTag = $(event.currentTarget);
          var page = paginationTag.attr("page");
          var currentPage = parseInt(paginationDom.attr("currentPage"));
          var totalPages = parseInt(paginationDom.attr("pages"));
          if (page == "-1") {
            var prevPage = currentPage - 1;
            if (prevPage >= 1) {
              _refreshList(prevPage);
            }
          } else if (page == "0") {
            var nextPage = currentPage + 1;
            if (nextPage <= totalPages) {
              _refreshList(nextPage);
            }
          } else {
            if (page != undefined) {
              _refreshList(page);
            }
          }
        });
      };

  return {
    init: function (conf) {
      _init(conf);
    },
    refreshCurrentPage: function () {
      _refreshCurrentPage();
    }
  }
})();
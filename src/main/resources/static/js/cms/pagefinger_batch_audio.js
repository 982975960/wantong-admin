//手指点读批量上传音频JS0
wantong.cms.batchUploadFingerAudio = (function () {
  var _conf = {
        UPLOAD_URL: GlobalVar.contextPath + "/upload.do",
        LIST_PAGE_FINGERS_URL: GlobalVar.contextPath
            + "/cms/listPagesAndFingers.do",
        SAVE_PAGE_FINGERS_URL: GlobalVar.contextPath
            + "/cms/savePagesFingersAudios.do",
        CHECK_FINGER_UPLOAD_STATE:"/cms/checkBatchFingerAudiosState.do",
        pages: new Array(),
        bookId: 0,
      },
      //layer的index
      _layerIndex = {
        _tipLayerIndex: null,
        _confirmLayerIndex: null,
        _progressLayerIndex: null,
        _checkLayerRightLayerIndex: null,
        _checkErrorLayerIndex: null,
        _uploadResultLayerIndex: null,
        _errorUploadResultLayerIndex: null,
        _saveDataRightLayerIndex: null,
        _saveDataErrorLayerIndex: null
      },
      //上传自检和上传结果的显示内容的对象
      _commonResult = null,
      //进度条对象
      _progressObj = null,
      _root = null,
      isCheckOver = false,
      //文件数量
      _fileCount = 0,
      //所有文件大小
      _fileSize = 0,
      //已上传文件大小
      _haveUploadFileSize = 0,
      //webUploader对象
      _uploader = null,
      //上传是定时任务
      _upLoadTimeInval = null,
      //保存数据的定时任务
      _saveDataTimeInval = null,
      //文件名错误的文件
      errorFileNameArray = new Array(),
      //来记录所有文件错误和类型的Map数组
      errorArray = new Array(),
      //用来存放第一步文件名筛选的对象数组
      rightFileArray = new Array(),
      //匹配到书页上的数据
      matchingPageFingerFilesArray = new Array(),
      //上传成功文件的数据
      savePageFilesArray = new Array(),
      //用来存放上传成功的文件
      fileArray = new Array(),
      //上传文件失败的数据
      _uploadErrorFiles = new Array(),
      //书页的正则表达式 包含例：1-0-1 和1-0_1 的两张情况
      _reg = /^\d{1,3}\-\d\-\d{1,3}\.(?=\D)|^\d{1,3}\-\d\-\d{1,3}(?!\.)|^\d{1,3}\-\d\_\d{1,3}\.(?=\D)|^\d{1,3}\-\d\_\d{1,3}(?!\.)/,

      _init = function (conf) {
        $.extend(_conf, conf);

        // 初始化批量上传按钮事件和帮助按钮事件
        _initBtnClickEvent();
        _commonResult = $($("#fingerShowUploadProGroup").prop("outerHTML"));
      },
      //初始化按钮的点击事件
      _initBtnClickEvent = function () {
        $("#batchUploadFingerAudioBtn").off("click").on("click",
            function () {
              $(this).blur();
              //load 打开的书本的所有也的手指点读数据
              _loadPageFingers();

              _confirmShow();
            });
        $("#helpFingerBtn").off("click").on("click", function () {
          var _hintPanel = $("#fingerHelpContent").prop("outerHTML");
          _layerIndex._tipLayerIndex = layer.tips(
              _hintPanel,
              "#helpBtn",
              {
                tips: [4, '#ffffff'],
                area: ['560px', '690px'],
                time: 60000 * 10,
                shade: 0.01,
                shadeClose: true
              }
          );
        });
      },
      //获得书页的手指点读的数据
      _loadPageFingers = function () {
        $.get(_conf.LIST_PAGE_FINGERS_URL, {
          bookId: _conf.bookId,
        }, function (data) {
          if (data.code == 0) {
            _conf.pages = data.data;
          } else {
            layer.msg(data.msg);
          }
        })
      },
      //上传提示界面
      _confirmShow = function () {
        var content = $("#fingerUploadHint").prop("outerHTML");
        _layerIndex._confirmLayerIndex = layer.open({
          title: "提示",
          type: 1,
          area: ['600px', '260px'],
          scrollbar: false,
          content: content,
          success: function (layero) {
            _createUploader();
          },
          end: function () {

          },
          cancel: function () {
            if (_uploader != null) {
              _uploader.reset();
              _uploader.destroy();
            }
            _clearData();
          }
        })
      },
      //创建webUploader对象
      _createUploader = function () {
        _uploader = WebUploader.create({
          swf: GlobalVar.contextPath + '/js／uploader/Uploader.swf',
          server: _conf.UPLOAD_URL + "?isMp3=" + true + "&isVoice=" + true,
          duplicate: true,
          pick: {
            id: confirmFingerBtn,
            multiple: false,
            webkitdirectory: true
          },
          //允许上传的文件
          accept: {
            title: 'mp3',
            extensions: 'mp3',
            mimeTypes: 'audio/mpeg'
          },
          fileSingleSizeLimit: 8 * 1024 * 1024,//限制单个文件大小
          chunked: true,  // 分片上传大文件
          chunkSize: 8388608,//如果去要分片 分多大一片
          chunkRetry: 10, // 如果某个分片由于网络问题出错，允许自动重传多少次？
          thread: 10,// 最大上传并发数
          auto: false,
          duplicate: true,
          async: false,
          method: "POST"
        });
        _uploadEvent();
      },
      //webUploader文件上传文件事件
      _uploadEvent = function () {
        //开始上传文件的事件 只会执行一次
        _uploader.on("startUpload", function () {
          _showProgress("上传进度", '正在上传...<span id="proPrcent">0</span>%', true);
          _haveUploadFileSize = 0;
        });
        //把单个文件放入队列 在·startUpload事件之前
        _uploader.on("fileQueued", function (file) {
          //上传的所有文件数量和总文件大小
          _fileCount++;
          _fileSize += file.size;
        });
        //批量文件放入对列  是整个自检流程
        _uploader.on("filesQueued", function (files) {
          _checkAudioFile();

          //获得所有文件
          _matchingFileName(files);
          //传入所有格式正确的元素
          _matchingFileNameToPages(rightFileArray);
          //显示重复序号文件
          _checkMatchingPageFilesArrayRepeat(matchingPageFingerFilesArray);

          _checkFinishShowPage();
        });
        //单个文件上传成功的回调
        _uploader.on("uploadSuccess", function (file, response) {
          _haveUploadFileSize += file.size;
          _setProgressPercentage((_haveUploadFileSize / _fileSize).toFixed(2));
          var fileObject = {
            //UUID的文件名
            fileName: "",
            //用户上传的文件名，文件名没有格式化
            clientFileName: ""
          };
          var errorFlie = {errorType: "", fileName: ""};

          if (response.code == 0) {
            fileObject.fileName = response.data.fileName;
            fileObject.clientFileName = response.data.clientFileName;
            //设置文件
            for (var i = 0; i < matchingPageFingerFilesArray.length; i++) {
              for (var j = 0; j
              < matchingPageFingerFilesArray[i].audioFilesNameAndMatchText.length;
                  j++) {
                if (matchingPageFingerFilesArray[i].audioFilesNameAndMatchText[j].clientFileName
                    == response.data.clientFileName) {

                  matchingPageFingerFilesArray[i].audioFilesNameAndMatchText[j].tempFileName = response.data.fileName;

                  //所有正确的文件
                  savePageFilesArray.push(matchingPageFingerFilesArray[i]);
                }
              }
            }
          } else {
            //   上传文件异常
            errorFlie.fileName = file.name;
            errorFlie.errorType = response.msg;
          }
          if (fileObject.fileName != "" && fileObject.clientFileName != "") {
            fileArray.push(fileObject);
          }
          if (errorFlie.fileName != "" && errorFlie.errorType != "") {
            errorArray.push(errorFlie);
          }
        });
        //文件不是创建webuploader时定义的要求，报的异常
        _uploader.on("error", function (type, max, file) {
          var errorFlie = {errorType: "", fileName: ""};
          if (type == "F_EXCEED_SIZE") {

            errorFlie.errorType = "文件大小已超过8M";
            errorFlie.fileName = file.name;
          } else if (type == "Q_TYPE_DENIED") {
            if (file.name != ".DS_Store") {
              errorFlie.errorType = "文件非MP3格式";
              errorFlie.fileName = file.name;
            }
          }
          //错误文件异常的对象
          if (errorFlie.errorType != "" && errorFlie.fileName != "") {
            errorArray.push(errorFlie);
          }
        });
        //所有文件上传结束
        _uploader.on("uploadFinished", function () {
          layer.close(_layerIndex._progressLayerIndex);
          _finishUploadShowPage();
        });
        //文件上传错误
        _uploader.on("uploadError", function (file, response) {
          var errorFlie = {errorType: "", fileName: ""};

          errorFlie.fileName = file.name;
          errorFlie.errorType = "文件上传失败";
          _uploadErrorFiles.push(errorFlie);

          for (var i = 0; i < matchingPageFingerFilesArray.length; i++) {
            for (var j = 0; j
            < matchingPageFingerFilesArray[i].audioFilesNameAndMatchText.length;
                i++) {
              if (matchingPageFingerFilesArray[i].audioFilesNameAndMatchText[j].clientFileName
                  == file.name) {
                matchingPageFingerFilesArray[i].audioFilesNameAndMatchText[j].splice(
                    j, 1);
                return;
              }
            }

          }
        });
      },
      //显示进度条的公共方法
      _showProgress = function (title, pro_hint, isShow) {
        var content = $("#fingerFileProgress").prop("outerHTML");

        _layerIndex._progressLayerIndex = layer.open({
          title: title,
          type: 1,
          area: ['600px', '200px'],
          scrollbar: true,
          content: content,
          closeBtn: 0,
          success: function (layero) {
            layero.find("#fingerProHint span[type='text']").html(pro_hint);
            if (isShow) {
              layero.find(".finger-upload-hint").css("display", "inline-block");
            }
            //关闭确认界面的layer
            layer.close(_layerIndex._confirmLayerIndex);
            console.log("layerOPen")
            _progressObj = layero.find("#fingerFileProgress");
          },
          end: function () {

          }, cancel: function () {
            //重置上传
            _uploader.reset();
            _uploader.destroy();
            _clearData();
          },
        });
      },
      //文件自检开始
      _checkAudioFile = function () {
        //关闭确认界面
        layer.close(_layerIndex._confirmLayerIndex);
        _showProgress("文件自检", '正在自检...<span id="proPrcent">0</span>%');
        var precent = 0;
        _upLoadTimeInval = setInterval(function () {

          precent++;

          if (precent < 95) {
            _setProgressPercentage((precent).toFixed(0) / 100);
          }
          if (isCheckOver) {
            if (precent > 95) {
              _checkFinishShowPage();
              isCheckOver = false;
            }
          }
        }, 50);
      }, //设置进度条的进度 precent百分百

      _setProgressPercentage = function (precent) {
        console.log("precent:" + precent);
        _progressObj.find("#uploadProgress").css("width", precent * 100 + "%");
        _progressObj.find("#proPrcent").html((precent * 100).toFixed(0));
      },

      _checkFinishShowPage = function () {

        if (parseInt(_progressObj.find("#proPrcent").html()) < 20) {
          isCheckOver = true;
          return;
        }
        //先设置进度条为1
        _setProgressPercentage(1);
        layer.close(_layerIndex._progressLayerIndex);
        window.clearInterval(_upLoadTimeInval);
        //自检全部正常
        if (errorArray.length == 0) {
          _commonResult.find("#fingerFileCheck").html(
              '<img src="/static/images/ico_pic_right.jpg"  width="65" height="64" />');
          var content = $(_commonResult.prop("outerHTML"));
          content.append($("#fingerCheckResult").prop("outerHTML"));
          _layerIndex._checkLayerRightLayerIndex = layer.open({
            title: "文件自检结果",
            type: 1,
            area: ['600px', '330px'],
            content: content.prop("outerHTML"),
            success: function (layero) {
              layero.find("#fingerShowUploadProGroup").css("display",
                  "inline-block");
              //初始化按钮
              _checkConfrimEvent(layero);
            },
            end: function () {

            },
            cancel: function () {
              _uploader.reset();
              _uploader.destroy();
              _clearData();
            }
          });
        } else {
          //  自检异常

          _commonResult.find("#fingerFileCheck").html(
              '<img src="/static/images/ico_pic_error.jpg"  width="65" height="64" />');

          var content = $(_commonResult.prop("outerHTML")).append(
              _initFileExceptionPanel(
                  $("#fingerErrorUploadResult").prop("outerHTML"),
                  "自检完毕，以下音频文件存在异常，请检查！").prop("outerHTML"));

          _layerIndex._checkErrorLayerIndex = layer.open({
            title: "文件自检结果",
            type: 1,
            area: ['580px', '580px'],
            scrollbar: false,
            content: content.prop("outerHTML"),
            success: function (layero) {
              layero.find("#fingerShowUploadProGroup").css("display",
                  "inline-block");
            },
            end: function () {

            },
            cancel: function () {
              // 重置上传
              _uploader.reset();
              _uploader.destroy();
              _clearData();
            }
          });
        }

      },

      //先筛选文件名不符合规范的文件和符合的文件 满足
      _matchingFileName = function (files) {
        for (var i = 0; i < files.length; i++) {

          if (files[i].name.substr(0, 1) != "0") {
            //如果不匹配
            if (!_reg.test(files[i].name)) {
              //文件名不匹配的文件
              errorFileNameArray.push(files[i]);
              //错误文件和类型的对象
              var errorFlie = {errorType: "", fileName: ""};
              errorFlie.fileName = files[i].name;
              errorFlie.errorType = "文件命名不符合规范";
              //文件错误和类型放入数组
              errorArray.push(errorFlie);
            } else {
              var index = files[i].name.lastIndexOf("\_");
              var tmp = files[i].name.substring(index+1,files[i].name.length);
              tmp = tmp.replace(".mp3","");
              if(isNaN(tmp)){
                var index1 = files[i].name.lastIndexOf("\-");
                var tmp1 = files[i].name.substring(index1+1,files[i].name.length);
                tmp1 = tmp1.replace(".mp3","");
                if(tmp1.substring(0,1) != "0"){
                  //放入正确的文件到数组中
                  rightFileArray.push(files[i]);
                }else {
                  var errorFlie = {errorType: "", fileName: ""};
                  errorFlie.fileName = files[i].name;
                  errorFlie.errorType = "文件命名不符合规范";
                  //文件错误和类型放入数组
                  errorArray.push(errorFlie);
                }
              }else {
                if(tmp.substring(0,1) != "0"){
                  //放入正确的文件到数组中
                  rightFileArray.push(files[i]);
                }else {
                  var errorFlie = {errorType: "", fileName: ""};
                  errorFlie.fileName = files[i].name;
                  errorFlie.errorType = "文件命名不符合规范";
                  //文件错误和类型放入数组
                  errorArray.push(errorFlie);
                }
              }

            }
          } else {
            var errorFlie = {errorType: "", fileName: ""};
            errorFlie.fileName = files[i].name;
            errorFlie.errorType = "文件命名不符合规范";
            //文件错误和类型放入数组
            errorArray.push(errorFlie);
          }
        }
      },
      _matchingFileNameToPages = function (array) {
        for (var i = 0; i < _conf.pages.length; i++) {
          for (var j = 0; j < _conf.pages[i].fingerDatas.length; j++) {
            var fingersData = {
              fingerId: 0,
              audioFilesNameAndMatchText: new Array()
            }

            fingersData.fingerId = _conf.pages[i].fingerDatas[j].pageFingerInfo.id;
            var regText = "^" + _conf.pages[i].physicalIndex + "-"
                + _conf.pages[i].physicalState + "-" + (j + 1) + ".mp3|" + "^"
                + _conf.pages[i].physicalIndex + "-"
                + _conf.pages[i].physicalState + "_" + (j + 1)+".mp3";
            var headerReg = new RegExp(regText);
            for (var k = array.length - 1; k >= 0; k--) {
              var audioFilesObj = {
                matchText: "",
                clientFileName: "",
                tempFileName: "",
                duration: 0.00
              };
              if (headerReg.test(array[k].name)) {
                audioFilesObj.clientFileName = array[k].name;
                audioFilesObj.matchText = headerReg.exec(array[k].name)[0];
                var url = URL.createObjectURL(array[k].source.source);
                var audio = new Audio(url);
                _setMatchingPagesFilesArray(audioFilesObj, audio);
                fingersData.audioFilesNameAndMatchText.push(audioFilesObj);
                array.splice(k, 1);
              }
            }
            //音频放入匹配的页信息中
            if (fingersData.audioFilesNameAndMatchText.length > 0) {
              //有音频信息才放入数组中
              matchingPageFingerFilesArray.push(fingersData);
              console.log(matchingPageFingerFilesArray);
            }
          }
        }
        if (array.length != 0) {
          for (var i = 0; i < array.length; i++) {
            var errorFlie = {errorType: "", fileName: ""};
            errorFlie.errorType = "文件未找到可匹配的点读框";
            errorFlie.fileName = array[i].name;
            //错误对象放入元素中
            errorArray.push(errorFlie);
          }
        }
      },
      //工具方法 获得音频文件的时长
      _setMatchingPagesFilesArray = function (audioFilesObj, audio) {
        audio.addEventListener("loadedmetadata", function (event) {
          audioFilesObj.duration = audio.duration;
        });
      },
      //匹配内容是否重复
      _checkMatchingPageFilesArrayRepeat = function (matchPagesArray) {
        for (var i = 0; i < matchPagesArray.length; i++) {
          var tmp = new Array();
          if (Array.isArray(matchPagesArray[i].audioFilesNameAndMatchText)) {
            matchPagesArray[i].audioFilesNameAndMatchText.concat().sort().sort(
                function (a, b) {
                  if (a.matchText == b.matchText && tmp.indexOf(a) === -1) {
                    tmp.push(a);
                    tmp.push(b)
                  }
                });
          }

          tmp = _hashRemoveRepeat(tmp);

          for (var j = 0; j < tmp.length; j++) {
            var errorFlie = {errorType: "", fileName: ""};
            errorFlie.fileName = tmp[j].clientFileName;
            errorFlie.errorType = "文件命名不符合规范";

            errorArray.push(errorFlie);
          }
        }
      },
      //hash去重
      _hashRemoveRepeat = function (array) {
        var hash = {}, result = [], item;
        for (var i = 0; i < array.length; i++) {
          item = array[i].clientFileName;
          if (!hash[item]) {
            hash[item] = true;
            result.push(array[i]);
          }
        }
        return result;
      },
      _checkConfrimEvent = function (obj) {
        obj.find("#fingerCheckConfrimBtn").off("click").on("click",
            function () {

              this.blur();
              //关闭layer
              layer.close(_layerIndex._checkLayerRightLayerIndex);

              _uploader.upload();
            });
      },
      //设置错误文件界面上的显示
      _initFileExceptionPanel = function (html, hint) {
        //获得js对象
        var obj = $(html);
        obj.find("#hint").html(hint);
        var table = obj.find(".exception-file table");
        for (var i = 0; i < errorArray.length; i++) {
          var tempHtml = '<tr style="line-height: 40px">'
              + '<td title=' + errorArray[i].fileName.replace(/\s/g, "&nbsp;")
              + ' style="width: 274px;font-size: 16px;white-space: nowrap;text-overflow: ellipsis;overflow: hidden;display: block;float: left">'
              + errorArray[i].fileName + '</td>'
              + '<td style="width: 248px;color: red;font-size: 16px;">'
              + errorArray[i].errorType + '<td>'
              + '</tr>';
          table.append(tempHtml);
        }
        console.log()

        return obj;
      },

      _finishUploadShowPage = function () {
        //没有错误，说明所有文件上传都是成功的
        if (errorArray.length == 0) {
          _commonResult.find("#checkFingerFinish").attr("class",
              "upload-gules");
          _commonResult.find("#fingerFileUpload").html(
              '<img src="/static/images/ico_pic_right.jpg"  width="65" height="64" />');
          var content = $(_commonResult.prop("outerHTML")).append(
              $("#fingerUploadResult").prop("outerHTML"));
          _layerIndex._uploadResultLayerIndex = layer.open({
            title: "上传结果",
            type: 1,
            area: ['580px', '350px'],
            scrollbar: false,
            content: content.prop("outerHTML"),
            success: function (layero) {
              layero.find("#fingerShowUploadProGroup").css("display",
                  "inline-block");
              _saveDataBtnEvent(layero);
            },
            end: function () {

            },
            cancel: function () {
              _uploader.reset();
              _uploader.destroy();
              _clearData();
            },
          });
        } else {

          //上传文件全部做错
          if (savePageFilesArray.length == 0) {

            _commonResult.find("#checkFingerFinish").attr("class",
                "upload-gules");
            _commonResult.find("#fingerFileUpload").html(
                '<img src="/static/images/ico_pic_error.jpg"  width="65" height="64" />');

            var content = $(_commonResult.prop("outerHTML")).append(
                _initFileExceptionPanel(
                    $("#fingerErrorUploadResult").prop("outerHTML"),
                    "部分音频文件上传失败，请检查!").prop("outerHTML"));

            layer.open({
              title: "上传结果",
              type: 1,
              area: ['580px', '580px'],
              scrollbar: false,
              content: content.prop("outerHTML"),
              success: function (layero) {
                layero.find("#fingerShowUploadProGroup").css("display",
                    "inline-block");
              },
              end: function () {

              },
              cancel: function () {
                // 重置上传
                _uploader.reset();
                _uploader.destroy();
                _clearData();
              }
            });

          } else {

            //部分错误 还可以上传
            _commonResult.find("#checkFinish").attr("class", "upload-gules");
            _commonResult.find("#fingerFileUpload").html(
                '<img src="/static/images/ico_pic_waring.jpg"  width="65" height="64" />');
            var content = $(_commonResult.prop("outerHTML")).append(
                $("#fingerErrorUploadResult").prop("outerHTML"));
            _layerIndex._errorUploadResultLayerIndex = layer.open({
              title: "上传结果",
              type: 1,
              area: ['580px', '580px'],
              scrollbar: false,
              content: content.prop("outerHTML"),
              success: function (layero) {
                layero.find("#fingerShowUploadProGroup").css("display",
                    "inline-block");
                _confirmUpload(layero);
              },
              end: function () {

              },
              cancel: function () {
                // 重置上传
                _uploader.reset();
                _uploader.destroy();
                _clearData();
              }
            });

          }
        }
      },
      _saveDataBtnEvent = function (obj) {
        obj.find("#fingerUploadConfrimBtn").off("click").on("click",
            function () {

              console.log("click upload_confrim_bt");
              this.blur();
              layer.close(_layerIndex._uploadResultLayerIndex);

              var map = {};
              var isSaveOver = false;
              let taskId = "";
              let success = false;
              var precent = 0;
              //显示进度条
              _showProgress("写入保存进度",
                  '正在写入...<span id="proPrcent">0</span>%');

              _saveDataTimeInval = setInterval(function () {

                precent++;

                if (precent < 95) {
                  _setProgressPercentage((precent).toFixed(0) / 100);
                }
                if (isSaveOver) {
                  if (precent > 95) {
                    _saveFinishPage(map);
                    isSaveOver = false;
                  }
                }
              }, 50);

              //保存书页数据
              $.ajax({
                type: "post",
                url: _conf.SAVE_PAGE_FINGERS_URL + "?bookId=" + _conf.bookId,
                data: JSON.stringify(matchingPageFingerFilesArray),
                dataType: "json",
                contentType: "application/json",
                async: false,
                success: function (data) {
                  if(data.code == 0) {
                    if (data.data != undefined) {
                      taskId = data.data;
                      success = true;
                    }
                  }else {
                    layer.msg("服务异常");
                  }
                },
                error: function () {
                  layer.close(index);
                  layer.msg("网络异常");
                },
              });

              if(success){
                success = !success;
                var timeTask = setInterval(()=>{
                  $.ajax({
                    type: 'post',
                    url:_conf.CHECK_FINGER_UPLOAD_STATE+"?taskId=" +taskId,
                    data: JSON.stringify(matchingPageFingerFilesArray),
                    async:false,
                    dataType: "json",
                    contentType: "application/json",
                    success:function (data) {
                      if(data.code == 0){
                        if(!data.data.finish){
                          return;
                        }else {
                          console.log("--------------->>"+data.data.extra)
                          map = data.data.extra;
                        }
                        success = true;
                      }else {
                        layer.msg("服务异常");
                      }
                      success = true;
                    }
                  }).always(()=>{
                    if (success) {
                      clearInterval(timeTask);
                      isSaveOver = true;
                    }
                  })
                },500);
              }
              });

      },
      _saveFinishPage = function (errorMap) {
        layer.close(_layerIndex._progressLayerIndex);
        window.clearInterval(_saveDataTimeInval);
        if (_getMapLength(errorMap) > 0) {

          _commonResult.find("#fingerUploadFinish").attr("class",
              "upload-gules");
          _commonResult.find("#fingerDataSave").html(
              '<img src="/static/images/ico_pic_error.jpg"  width="65" height="64" />');
          var content = $(_commonResult.prop("outerHTML")).append(
              _initMapExceptionPanel(
                  $("#fingerErrorUploadResult").prop("outerHTML"),
                  "以下音频文件写入失败，请检查!", errorMap).prop("outerHTML"));
          _layerIndex._saveDataErrorLayerIndex = layer.open({
            title: "写入保存结果",
            type: 1,
            area: ['580px', '580px'],
            scrollbar: false,
            content: content.prop("outerHTML"),
            success: function (layero) {
              layero.find("#fingerShowUploadProGroup").css("display",
                  "inline-block");

              _clearData();
            },
            end: function () {
            },
            cancel: function () {
              // 重置上传
              _uploader.reset();
              _uploader.destroy();

            }
          });
        } else {
          _commonResult.find("#fingerUploadFinish").attr("class",
              "upload-gules");
          _commonResult.find("#fingerDataSave").html(
              '<img src="/static/images/ico_pic_right.jpg"  width="65" height="64" />');
          var content = $(_commonResult.prop("outerHTML")).append(
              $("#fingerSaveDataResult").prop("outerHTML"));
          _layerIndex._saveDataRightLayerIndex = layer.open({
            title: "写入保存结果",
            type: 1,
            area: ['580px', '350px'],
            scrollbar: false,
            content: content.prop("outerHTML"),
            success: function (layero) {
              layero.find("#fingerShowUploadProGroup").css("display",
                  "inline-block");
              _saveConfirmEvent(layero);

              wantong.cms.pageAdd.refresh();

              _clearData();
            },
            cancel: function () {

            },
            end: function () {
              _uploader.reset();
              _uploader.destroy();
            }
          });
        }
      },
      //获得map的长度
      _getMapLength = function (obj) {
        var count = 0;
        for (var i in obj) {
          count++;
        }
        return count;
      },
      _saveConfirmEvent = function (obj) {
        obj.find("#fingerSaveDataConfrimBtn").off("click").on("click",
            function () {
              this.blur();
              layer.close(_layerIndex._saveDataRightLayerIndex);
            });
      },

      _initMapExceptionPanel = function (html, hint, errorMap) {
        var obj = $(html);
        obj.find("#hint").html(hint);
        var table = obj.find(".exception-file table");
        for (var i in errorMap) {
          var tempHtml = '<tr style="line-height: 40px">'
              + '<td title=' + i.replace(/\s/g, "&nbsp;")
              + ' style="width: 274px;font-size: 16px;white-space: nowrap;text-overflow: ellipsis;overflow: hidden;display: block;float: left">'
              + i + '</td>'
              + '<td style="width: 248px;color: red;font-size: 16px;">'
              + errorMap[i] + '<td>'
              + '</tr>';
          table.append(tempHtml);
        }
        return obj;
      },

      _confirmUpload = function (obj) {
        obj.find("#fingerConfirmUpload").off("click").on("click", function () {
          this.blur();
          layer.close(_layerIndex._errorUploadResultLayerIndex);
        });
      },
      _clearData = function () {
        _fileSize = 0;
        _fileCount = 0;
        _haveUploadFileSize = 0;
        _commonResult = $($("#fingerShowUploadProGroup").prop("outerHTML"));
        errorArray.splice(0, errorArray.length);
        fileArray.splice(0, fileArray.length);
        errorFileNameArray.splice(0, errorFileNameArray.length);
        rightFileArray.splice(0, rightFileArray.length);
        matchingPageFingerFilesArray.splice(0,
            matchingPageFingerFilesArray.length);
        savePageFilesArray.splice(0, savePageFilesArray.length);
        _uploadErrorFiles.splice(0, _uploadErrorFiles.length);
      };
  return {
    init: function (conf) {
      _init(conf);
    }
  }
})();
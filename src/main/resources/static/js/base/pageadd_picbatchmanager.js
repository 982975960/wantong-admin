//批量上传图片
wantong.base.pageAdd.batchImage = (function () {

  var _conf = {
        UPLOAD_URL: GlobalVar.contextPath + "/upload.do",
        DELETE_PAGE_BY_BOOKID: GlobalVar.contextPath
            + "/base/deletePagesAccordingToBookId.do",
        SAVE_PAGES_DATA: GlobalVar.contextPath + "/base/savePagesData.do",
        CHECK_BATCH_UPLOAD_TASK_STATE:"/base/checkBatchUploadPictureTaskState.do",
        CHECK_STATE: GlobalVar.contextPath + "/base/checkDelBookPagesTaskState.do"
      },
      //自检进度条显示内容
      _checkFileProgrssHint = "正在自检...<span id='proPrcent'>0</span>%",
      //上传进度条显示的提示内容
      _uploadProgressHint = "正在上传...<span id='proPrcent'>0</span>%",
      //数据保存进度条提示内容
      _saveDataProgressHint = "正在写入...<span id='proPrcent'>0</span>%",
      //公共结果的临时dom对象
      _commonResult = null,
      //自检界面的定时任务
      _checkTimeInterval = null,
      //保存进度的定时任务
      _saveDataTimeInterval = null,
      //记录文件是否自检完成
      _isCheckFinish = false,
      //文件命名排序是否错误
      _isFileNameError = false,
      //书页规则的正则表达式
      _reg = /^\d{1,3}\-\d{1,3}\.jpg$/,

      _root = null,
      // 界面的进度条的对象
      _progress = null,
      //webUploader对象的实例
      _webUploader = null,
      //js里所有打开的layer的index
      layerIndexObj = {
        // 提示上传的layer的index
        CONFRIM_LAYER_INDEX: null,
        PROGRESS_LAYER_INDEX: null,
        CHECK_RESULT_LAYER_INDEX: null,
        CHECK_ERROR_LAYER_INDEX: null,
        UPLOAD_RESULT_LAYER_INDEX: null,
        SAVEDATE_RESULT_LAYER_INDEX: null
      },
      //上传文件大小
      _uploadFileSize = 0,
      //文件数量
      _fileCount = 0,
      //所有文件带下
      _allFilesSize = 0,
      //错误文件和类型的Map数组
      errorArray = new Array(),
      //正确的文件内容
      rightArray = new Array(),
      //匹配到书页上的数据
      matchingPageFilesArray = new Array(),
      //上传成功文件的数据
      savePageFilesArray = new Array(),
      //用来存放上传成功的文件
      fileArray = new Array(),

      _init = function (conf) {
        $.extend(_conf, conf);
        //操作的界面dom
        _root = $("#pageAdd");
        _commonResult = $($("#imageShowUploadProGroup").prop("outerHTML"));

        _initBacthAndHelpBtnEvent();
      },
      //初始化批量和帮助按钮的事件
      _initBacthAndHelpBtnEvent = function () {
        $(".batch-btn").off("mouseover").on("mouseover", function () {
          $(this).css("background", "#00a2d4")
        }).off("mouseout").on("mouseout", function () {
          $(this).css("background", "#42bcef")
        });
        // 注册批量上传按钮的事件
        $("#batchUploadImageBtn").off("click").on("click", function () {
          $(this).blur();
          //点击批量上传按钮后 打开界面的layer提示
          _confirmUploadPanel();
        });
        // 注册帮助按钮的事件
        $("#helpUploadImageBtn").off("click").on("click", function () {
          _batchHelpPanel();
        });
      },
      //点击书页上的批量上传按钮的提示界面
      _confirmUploadPanel = function () {
        //获得元素的html
        var content = $("#imageUploadHint").prop("outerHTML");
        layerIndexObj.CONFRIM_LAYER_INDEX = layer.open({
          title: '提示',
          type: 1,
          area: ['600px', '260px'],
          scrollbar: false,
          content: content,
          success: function () {
            _createWebUploader();
          }, cancel: function () {
            _clear();
          }
        });
      },
      //批量上传书页的操作帮助界面显示
      _batchHelpPanel = function () {
        var helpContent = $("#imageHelpContent").prop("outerHTML");
        layer.tips(helpContent, "#helpUploadImageBtn",
            {
              tips: [4, '#ffffff'],
              area: ['560px', '690px'],
              time: 60000 * 10,
              shade: 0.01,
              shadeClose: true
            }
        );
      },
      //创建webUploader 对象的实例
      _createWebUploader = function () {
        //创建webUploader的方法
        _webUploader = WebUploader.create({
          swf: GlobalVar.contextPath + '/js/uploader/Uploader.swf',
          server: _conf.UPLOAD_URL,
          duplicate: true,
          pick: {
            id: confirmUploadImageBtn,
            multiple: false,
            webkitdirectory: true
          },
          // 允许上传你文件格式
          accept: {
            title: 'Images',
            extensions: 'jpg',
            mimeType: 'image/*',
          },
          fileSingleSizeLimit: 5 * 1024 * 1024,// 图片单个文件大小限制为5M
          fileNumLimit: 150, //限制文件数量
          chunked: true,//允许分片上传
          chunkRetry: 5 * 1024 * 1024,
          thead: 10,//最大并发数
          auto: false,//非自动上传
          duplicate: true,
          async: false,
          method: "POST"
        });

        _initWebUploaderEvent();
      },
      //初始化webUploader上传 的相关事件回调
      _initWebUploaderEvent = function () {
        //开始上传文件的事件回调 只会执行一次
        _webUploader.on("startUpload", function () {
          //显示文件上传的提示界面
          _showProgress("上传进度", _uploadProgressHint, true);
          //初始化记录上传的文件数量的变量
          _uploadFileSize = 0;
        });
        //将需要上传的文件加入队列中 根据文件数量来执行回
        _webUploader.on("fileQueued", function (file) {
          _fileCount++;
          _allFilesSize += file.size;
        });

        //将批量的文件放入队里中 在改回调里执行文件自检流程
        _webUploader.on("filesQueued", function (files) {
          //  文件自检流程
          _showCheckHintPanel();
          if (errorArray.length == 0) {

            _checkFileNamingRules(files);
            let time = setInterval(() => {
              console.log(
                  "rightArray.length" + rightArray.length + "errorArray.length"
                  + errorArray.length + "files.length" + files.length)
              if (rightArray.length + errorArray.length == files.length) {
                clearTimeout(time);
                _matchingOldPageUpdateAndCreateNewPage(rightArray);
                if (matchingPageFilesArray.length == files.length) {
                  var classifyArray = _sortMatchDataByPhysicalIndex(
                      _filterPhysicalIndexClassification(
                          matchingPageFilesArray));
                  _isFileNameError = _checkFileSort(classifyArray);
                  if (_isFileNameError) {
                    _matchingFilesRemoveDuplication(matchingPageFilesArray);
                    _checkFileResultPanel();
                  } else {
                    //  检查文件名排序问题
                    _checkFileNameError();
                  }
                } else {
                  _isFileNameError = true;
                  _checkFileResultPanel();
                }
              }
            }, 50);
          } else {
            _isFileNameError = true;
            _checkFileResultPanel();
          }
        });

        //单个文件的回调 file 是上传成功的文件 response 是/upload.do 上传的回调结果
        _webUploader.on("uploadSuccess", function (file, response) {
          //  文件上传结果
          _uploadFileSize += file.size;
          //设置文件上传进度
          _updateProgressSchedule((_uploadFileSize / _allFilesSize).toFixed(2));
          _uploadFileHandle(file, response);
        });

        //文件异常的 type错误类型 F_EXCEED_SIZE超过文件限制带下 Q_TYPE_DENIED文件格式错误
        _webUploader.on("error", function (type, max, file) {
          _uploadErrorHandle(type, file);
        });

        //所有文件上传结束的回调
        _webUploader.on("uploadFinished", function () {
          layer.close(layerIndexObj.PROGRESS_LAYER_INDEX);
          _uploadResultPanel();
        });

        //文件上传异常
        _webUploader.on("uploadError", function (file, response) {

        })
      },
      //显示进度条的公共方法 @title title @hintContent 显示内容 @isShowUploadHint 是否显示上传的提示
      _showProgress = function (title, hintContent, isShowUploadHint) {
        //获得进度的条的HTML
        var content = $("#imageFileProgress").prop("outerHTML");
        //弹出进度显示层窗口
        layerIndexObj.PROGRESS_LAYER_INDEX = layer.open({
          title: title,
          type: 1,
          area: ['600px', '200px'],
          scrollbar: true,
          content: content,
          closeBtn: 0,
          success: function (layero) {
            //进度条显示提示内容
            layero.find("#imageUploadProHint span[type='text']").html(
                hintContent);
            isShowUploadHint ? layero.find("#image-upload-hint").css("display",
                "inline-block") : layero.find("#image-upload-hint").css(
                "display", "none");
            _progress = layero.find("#imageFileProgress");
          }, cancel: function () {
            //清除元素
            _clear();
          }
        });
      },
      //显示自检的提示界面内容
      _showCheckHintPanel = function () {
        //    先关闭上传确认界面
        layer.close(layerIndexObj.CONFRIM_LAYER_INDEX);
        _showProgress("文件自检", _checkFileProgrssHint, false);
        //进度条的值
        var percent = 0;
        _checkTimeInterval = setInterval(function () {
          percent++;
          if (percent < 98) {
            _updateProgressSchedule(percent.toFixed(2) / 100);
          }
          //判断文件是否都自检结束
          if (_isCheckFinish) {
            //当进度的值大于98时，才会进入
            if (percent > 98) {
              //显示自检结果
              if (!_isFileNameError) {
                _checkFileNameError();
                _isCheckFinish = false;

              } else {
                _checkFileResultPanel();
                _isCheckFinish = false;
                _isFileNameError = false;
              }
            }
          }
        }, 50);
      },
      //检测文件名称规则是否符合规范 @param files 所有文件
      _checkFileNamingRules = function (files) {
        for (var i = 0; i < files.length; i++) {

          _renderImage(files[i], files[i].source.source)
          //图片分辨率判断
        }
      },

      _renderImage = function (webUploaderFile, file) {

        let width = 1280; //默认可以上传图片，
        let height = 720;
        var render = new FileReader();
        render.onload = function (e) {
          var data = e.target.result;
          var image = new Image();
          image.onload = function () {
            width = image.width;
            height = image.height;
            _checkFileItem(width, height, webUploaderFile);
          };
          image.src = data;
        };
        render.readAsDataURL(file);
      },
      _checkFileItem = function (width, height, file) {
        let flag = wantong.base.booklist.validateImage(width, height,'a', false);
        if (false === flag) {
          let errorItem = {errorType: "", fileName: ""};
          errorItem.fileName = file.name;
          errorItem.errorType = "图片比例不符合要求";
          errorArray.push(errorItem);
        } else {
          if (!_reg.test(file.name)) {
            let errorItem = {errorType: "", fileName: ""};
            errorItem.fileName = file.name;
            errorItem.errorType = "文件命名不符合规范";
            errorArray.push(errorItem);
          } else {
            //匹配满足格式的文件对象 放入数组
            rightArray.push(file);
          }
        }
      },
      //文件匹配旧数据和创建新数据 @param fileArray 正确的文件数组
      _matchingOldPageUpdateAndCreateNewPage = function (fileArray) {
        //遍历文件数组
        for (let i = fileArray.length - 1; i >= 0; i--) {
          let imageData = {
            physicalIndex: 0,
            physicalState: 0,
            bookId: _conf.bookId,
            pageId: 0,
            modelId: _conf.modelId,
            imageType: 0,
            recType: 0,
            type: 0,
            pagination: 0,
            matchText: "",
            clientFileName: "",
            tempFileName: "",
          };
          imageData.matchText = fileArray[i].name.replace(".jpg", "");
          imageData.matchText.replace("/_/g", "-");
          imageData.clientFileName = fileArray[i].name;
          let tempArr = imageData.matchText.split("-");
          if (tempArr.length == 1) {
            let tempArr1 = imageData.matchText.split("_");
            //设置物理页
            imageData.physicalIndex = parseInt(tempArr1[0]);
            //设置物理页状态
            imageData.physicalState = parseInt(tempArr1[1]);

            imageData.matchText = parseInt(tempArr1[0]) + "-" + parseInt(
                tempArr1[1]);
          } else {

            //设置物理页
            imageData.physicalIndex = parseInt(tempArr[0]);
            //设置物理页状态
            imageData.physicalState = parseInt(tempArr[1]);

            imageData.matchText = parseInt(tempArr[0]) + "-" + parseInt(
                tempArr[1]);
          }

          if (imageData.matchText.length > 0) {
            matchingPageFilesArray.push(imageData);
          }
          fileArray.splice(i, 1);
        }

        //  todo 不确定会不会有文件未匹配上
      },
      //文件匹配去重  todo 后续测试重点
      _matchingFilesRemoveDuplication = function (matchFilesArray) {

        console.log(
            "******************** _matchingFilesRemoveDuplication 里去重前matchFiles大小"
            + matchFilesArray.length);
        for (let i = 0; i < matchFilesArray.length; i++) {
          let tmp = new Array();
          if (Array.isArray(matchFilesArray)) {
            matchFilesArray.concat().sort(function (a, b) {
              if (a.matchText == b.matchText && tmp.indexOf(a) === -1) {
                tmp.push(a);
                tmp.push(b);
              }
            });
          }
          tmp = _hashRemoveRepeat(tmp);
          for (var j = 0; j < tmp.length; j++) {
            var errorFlie = {errorType: "", fileName: ""};
            errorFlie.fileName = tmp[j].clientFileName;
            errorFlie.errorType = "重复书页文件";
            errorArray.push(errorFlie);
          }
        }
      },
      //自检文件命名排序异常
      _checkFileNameError = function () {
        if (parseInt(_progress.find("#proPrcent").html()) < 20) {
          _isCheckFinish = true;
          return;
        }
        //设置进度条为1
        _updateProgressSchedule(1);
        //关闭进度条的显示界面
        layer.close(layerIndexObj.PROGRESS_LAYER_INDEX);
        //清空自检定时任务
        window.clearInterval(_checkTimeInterval);
        var index = layer.confirm('文件存在不连续的书页，请检查', {
          title: '提示', btn: ['确定'], success: function (layero) {
            $(layero).find(".layui-layer-btn-").css("text-align", "center");
            $(layero).find(".layui-layer-content").css("text-align", "center");
          }, cancel: function () {
            _clear();
          }
        }, function () {
          layer.close(index);
          _clear();
        });
      },
      //显示自检结果界面
      _checkFileResultPanel = function () {
        //判断进度条的值
        if (parseInt(_progress.find("#proPrcent").html()) < 20) {
          _isCheckFinish = true;
          return;
        }
        //设置进度条为1
        _updateProgressSchedule(1);
        //关闭进度条的显示界面
        layer.close(layerIndexObj.PROGRESS_LAYER_INDEX);
        //清空自检定时任务
        window.clearInterval(_checkTimeInterval);
        //没有错误文件
        if (errorArray.length == 0) {
          //  动态添加图标
          _commonResult.find("#imageFileCheck").html(
              '<img src="/static/images/ico_pic_right.jpg"  width="65" height="64" />');
          //layer显示的内容
          var layerContent = $(_commonResult.prop("outerHTML")).append(
              $("#imageCheckResult").prop("outerHTML")).prop("outerHTML");
          layerIndexObj.CHECK_RESULT_LAYER_INDEX = layer.open({
            title: "文件自检结果",
            type: 1,
            area: ['600px', '330px'],
            content: layerContent,
            success: function (layero) {
              layero.find("#imageShowUploadProGroup").css("display",
                  "inline-block");
              //初始化自检结束后确定上传按钮的时间
              _checkFinishConfrimUploadBtnEvent(layero);
            }, cancel: function () {
              _clear();
            }
          });
        } else {
          _commonResult.find("#imageFileCheck").html(
              '<img src="/static/images/ico_pic_error.jpg"  width="65" height="64" />');
          let layerContent = $(_commonResult.prop("outerHTML")).append(
              _initFileErrorHTML($("#imageUploadErrorResult").prop("outerHTML"),
                  "自检完毕，以下图片文件存在异常，请检查！")).prop("outerHTML");
          layerIndexObj.CHECK_ERROR_LAYER_INDEX = layer.open({
            title: "文件自检结果",
            type: 1,
            area: ['580px', '580px'],
            scrollbar: false,
            content: layerContent,
            success: function (layero) {
              layero.find("#imageShowUploadProGroup").css("display",
                  "inline-block");
            }, cancel: function () {
              _clear();
            }
          });
        }
      },
      //更新进度条的进度
      _updateProgressSchedule = function (percent) {
        _progress.find("#imageUploadProgress").css("width",
            percent * 100 + "%");
        _progress.find("#proPrcent").html((percent * 100).toFixed(0));
      },
      // 自检后确认上传的按钮事件
      _checkFinishConfrimUploadBtnEvent = function (layero) {
        layero.find("#checkConfrimBtn").off("click").on("click", function () {
          $(this).blur();
          layer.close(layerIndexObj.CHECK_RESULT_LAYER_INDEX);
          //开始webUploader的上传
          _webUploader.upload();
        });
      },
      //文件上传的处理
      _uploadFileHandle = function (file, response) {
        let fileObject = {
          fileName: "",
          clientFileName: ""
        };
        let errorFile = {errorType: "", fileName: ""};
        if (response.code == 0) {
          fileObject.fileName = response.data.fileName;
          fileObject.clientFileName = response.data.clientFileName;
          for (let i = 0; i < matchingPageFilesArray.length; i++) {
            if (matchingPageFilesArray[i].clientFileName
                == response.data.clientFileName) {
              matchingPageFilesArray[i].clientFileName = response.data.clientFileName;
              matchingPageFilesArray[i].tempFileName = response.data.fileName;
              savePageFilesArray.push(matchingPageFilesArray[i]);
            }
          }
        } else {
          errorFile.fileName = file.name;
          errorFile.errorType = response.msg;
        }
        if (fileObject.fileName != "" && fileObject.clientFileName != "") {
          fileArray.push(fileObject);
        }
        if (errorFile.fileName != "" && errorFile.errorType != "") {
          errorArray.push(errorFile);
        }
      },
      //webUploadr的error事件回调的处理
      _uploadErrorHandle = function (type, file) {
        var errorFlie = {errorType: "", fileName: ""};
        if (type == "F_EXCEED_SIZE") {

          errorFlie.errorType = "文件大小已超过5M";
          errorFlie.fileName = file.name;
        } else if (type == "Q_TYPE_DENIED") {
          if (file.name != ".DS_Store") {
            errorFlie.errorType = "文件非JPG格式";
            errorFlie.fileName = file.name;
          }
        } else if (type == "Q_EXCEED_SIZE_LIMIT") {
          errorFlie.errorType = "超出文件限制数量";
          errorFlie.fileName = file.name;
        }
        //错误文件异常的对象
        if (errorFlie.errorType != "" && errorFlie.fileName != "") {
          errorArray.push(errorFlie);
        }
      },
      //显示上传结果界面
      _uploadResultPanel = function () {
        layer.close(layerIndexObj.PROGRESS_LAYER_INDEX);
        if (errorArray.length == 0) {
          //  所有文件都上传成功
          //  显示进度之间的线 upload-gules 。红色的线
          _commonResult.find("#imageCheckFinish").attr("class", "upload-gules");
          _commonResult.find("#imageFileUpload").html(
              '<img src="/static/images/ico_pic_right.jpg"  width="65" height="64" />');
          var layerContent = $(_commonResult.prop("outerHTML")).append(
              $("#imageUploadRightResult").prop("outerHTML")).prop("outerHTML");
          layerIndexObj.UPLOAD_RESULT_LAYER_INDEX = layer.open({
            title: "上传结果",
            type: 1,
            area: ['580px', '350px'],
            scrollbar: false,
            content: layerContent,
            success: function (layero) {
              layero.find("#imageShowUploadProGroup").css("display",
                  "inline-block");
              //  保存上传数据的确认按钮事件的初始化 todo
              _savePageDataBtnHandle(layero);
            }, cancel: function () {
              _clear();
            }
          });
        } else {
          //  上传文件有失败
          _commonResult.find("#imageUploadFinish").attr("class",
              "upload-gules");
          _commonResult.find("#imageFileUpload").html(
              savePageFilesArray.length > 0
                  ? '<img src="/static/images/ico_pic_waring.jpg"  width="65" height="64" />'
                  : '<img src="/static/images/ico_pic_error.jpg"  width="65" height="64" />');
          var layerContent = $(_commonResult.prop("outerHTML")).append(
              _initFileErrorHTML($("#imageUploadErrorResult").prop("outerHTML"),
                  savePageFilesArray.length > 0 ? "部分图片文件上传失败，请检查"
                      : "文件上传结果,以下图片文件存在异常,请检查!")).prop("outerHTML");
          layer.open({
            title: "上传结果",
            type: 1,
            area: ['580px', '580px'],
            scrollbar: false,
            content: layerContent,
            success: function (layero) {
              layero.find("#imageShowUploadProGroup").css("display",
                  "inline-block");
            }, cancel: function () {
              _clear();
            }
          })
        }
      },
      map = {},
      isSaveOver = false,
      //上传结束后确定保存按钮的处理
      _savePageDataBtnHandle = function (layero) {
        layero.find("#imageUploadNextBtn").off("click").on("click",
            function () {
              this.blur();
              layer.close(layerIndexObj.UPLOAD_RESULT_LAYER_INDEX);
              let percent = 0;
              _showProgress("写入保存进度", _saveDataProgressHint);
              _saveDataTimeInterval = setInterval(function () {
                percent++;
                if (percent < 98) {
                  _updateProgressSchedule(percent.toFixed(0) / 100);
                }
                if (isSaveOver) {
                  if (percent > 98) {
                    //  todo
                    isSaveOver = false;
                    _saveResultPanel(map);
                  }
                }
              }, 50);
              $.get(_conf.DELETE_PAGE_BY_BOOKID, {bookId: _conf.bookId},
                  function (data) {
                    if (data.code == 0) {
                      //保存书页数据
                      _checkDelBookPagesState(data.data);
                    } else {
                      layer.msg(data.msg);
                      layer.close(layerIndexObj.PROGRESS_LAYER_INDEX);
                      window.clearInterval(_saveDataTimeInterval);
                      _clear();
                    }
                  });

            });
      },
      _checkDelBookPagesState = function (taskId) {
        let uploadTaskId = "";
        let success = false;
        $.get(_conf.CHECK_STATE + "?taskId=" + taskId, {}, function (data) {
          if (data.code == 0) {
            var index = null;
            if (data.data == 0) {
              //任务执行中
              index = setTimeout(function () {
                _checkDelBookPagesState(taskId);
              }, 3000);
            } else if (data.data == 1) {
              if (index != null) {
                clearTimeout(index);
              }
              $.ajax({
                type: "post",
                url: _conf.SAVE_PAGES_DATA,
                data: JSON.stringify(matchingPageFilesArray),
                dataType: "json",
                contentType: "application/json",
                async: false,
                success: function (data) {
                  // map = data.data;
                  // isSaveOver = true;
                  if(data.code == 0){
                    if (data.data != undefined) {
                      uploadTaskId = data.data;
                      success = true;
                    }
                  }else {
                    layer.msg("服务异常");
                  }
                },
                error: function () {
                  layer.msg(data.msg);
                  layer.close(layerIndexObj.PROGRESS_LAYER_INDEX);
                  window.clearInterval(_saveDataTimeInterval);
                  layer.msg("服务异常");
                  _clear();
                },
              });
              if(success){
                success = !success;
                var timeTask = setInterval(()=>{
                  $.ajax({
                    type: 'post',
                    url: _conf.CHECK_BATCH_UPLOAD_TASK_STATE+"?taskId="+uploadTaskId,
                    data: JSON.stringify(matchingPageFilesArray),
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
                  });
                },500);
              }
            } else if (data.data == -1) {
              layer.close(layerIndexObj.PROGRESS_LAYER_INDEX);
              window.clearInterval(_saveDataTimeInterval);
              _clear();
              if (index != null) {
                clearTimeout(index);
              }
            } else {
              layer.msg("异常");
              if (index != null) {
                clearTimeout(index);
              }
              layer.close(layerIndexObj.PROGRESS_LAYER_INDEX);
              _clear();
            }
          } else {
            layer.msg("错误");
            layer.close(layerIndexObj.PROGRESS_LAYER_INDEX);
            _clear();
          }
        });
      },
      //保存结果的显示
      _saveResultPanel = function (errorMap) {
        layer.close(layerIndexObj.PROGRESS_LAYER_INDEX);
        window.clearInterval(_saveDataTimeInterval);
        //todo
        if (_getMapLength(errorMap) > 0) {
          //
          _commonResult.find("#imageUploadFinish")
          .attr("class", "upload-gules");
          _commonResult.find("#imageDataSave")
          .html(
              '<img src="/static/images/ico_pic_error.jpg"  width="65" height="64" />');
          let layerContent = $(_commonResult.prop("outerHTML")).append(
              _initSavaDataErrorMapHTML(
                  $("#imageUploadErrorResult").prop("outerHTML"),
                  "以下图片文件写入失败，请检查!", errorMap).prop("outerHTML")).prop(
              "outerHTML");
          layer.open({
            title: "写入保存结果",
            type: 1,
            area: ['580px', '580px'],
            scrollbar: false,
            content: layerContent,
            success: function (layero) {
              layero.find("#imageShowUploadProGroup").css("display",
                  "inline-block");
            }, cancel: function () {
              _clear();
            }
          });
        } else {
          _commonResult.find("#imageUploadFinish")
          .attr("class", "upload-gules");
          _commonResult.find("#imageDataSave")
          .html(
              '<img src="/static/images/ico_pic_right.jpg"  width="65" height="64" />');
          let layerContnt = $(_commonResult.prop("outerHTML")).append(
              $("#imageSaveDataResult").prop("outerHTML")).prop("outerHTML");
          layerIndexObj.SAVEDATE_RESULT_LAYER_INDEX = layer.open({
            title: "写入保存结果",
            type: 1,
            area: ['580px', '350px'],
            scrollbar: false,
            content: layerContnt,
            success: function (layero) {
              layero.find("#imageShowUploadProGroup").css("display",
                  "inline-block");

              _saveConfirmBtnEvent(layero);
              //  刷新列表
              wantong.base.pageAdd.pageList.refresh(_conf.bookId);
            }, end: function () {
              _clear();
            }
          });
        }
      },
      //保存成功之后的确认按钮绑定事件
      _saveConfirmBtnEvent = function (layero) {
        layero.find("#imageSaveDataConfrimBtn").off("click").on("click",
            function () {
              this.blur();
              layer.close(layerIndexObj.SAVEDATE_RESULT_LAYER_INDEX);
              wantong.base.pageAdd.similarBookByCover(_conf.bookId,1);
            });
      },

      _getMapLength = function (map) {
        let count = 0;
        for (let i in map) {
          count++;
        }
        return count;
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
      //生成错误文件记录的html
      _initFileErrorHTML = function (html, hint) {
        let tempObj = $(html);
        tempObj.find("#hint").html(hint);
        let table = tempObj.find(".exception-file table");
        for (let i = 0; i < errorArray.length; i++) {
          var tempHtml = '<tr style="line-height: 40px">'
              + '<td title=' + errorArray[i].fileName.replace(/\s/g, "&nbsp;")
              + ' style="width: 274px;font-size: 16px;white-space: nowrap;text-overflow: ellipsis;overflow: hidden;display: block;float: left">'
              + errorArray[i].fileName + '</td>'
              + '<td style="text-align:center;width: 248px;color: red;font-size: 16px;">'
              + errorArray[i].errorType + '<td>'
              + '</tr>';
          table.append(tempHtml);
        }
        return tempObj;
      },
      //保存文件时的错误写到html中
      _initSavaDataErrorMapHTML = function (html, hint, errorMap) {
        var tempObj = $(html);
        tempObj.find("#hint").html(hint);
        var table = tempObj.find(".exception-file table");
        for (var i in errorMap) {
          var tempHtml = '<tr style="line-height: 40px">'
              + '<td title=' + i.replace(/\s/g, "&nbsp;")
              + ' style="width: 274px;font-size: 16px;white-space: nowrap;text-overflow: ellipsis;overflow: hidden;display: block;float: left">'
              + i + '</td>'
              + '<td style="text-align:center;width: 248px;color: red;font-size: 16px;">'
              + errorMap[i] + '<td>'
              + '</tr>';
          table.append(tempHtml);
        }
        return tempObj;
      },
      // 根据物理页来进行分类
      _filterPhysicalIndexClassification = function (matchFileArray) {
        console.log(
            "--------------------- _filterPhysicalIndexClassification 长度"
            + matchFileArray.length);
        var hash = {}, array = new Array();
        for (var i in  matchFileArray) {
          if (!hash[matchFileArray[i].physicalIndex]) {
            let res = {physicalIndex: 0, item: new Array()};
            res.physicalIndex = matchFileArray[i].physicalIndex;
            res.item.push(matchFileArray[i])
            hash[matchFileArray[i].physicalIndex] = true;
            array.push(res);
          } else {
            for (var j in array) {
              if (array[j].physicalIndex == matchFileArray[i].physicalIndex) {
                array[j].item.push(matchFileArray[i]);
              }
            }
          }
        }
        return array;
      },
      //根据物理页进行排序
      _sortMatchDataByPhysicalIndex = function (array) {
        let test = array.sort((a, b) => {
          return a.physicalIndex - b.physicalIndex;
        });

        return _sortMatchDataByPhysicalState(test);
      },
      //根据物理状态排序
      _sortMatchDataByPhysicalState = function (array) {
        for (var i in array) {
          array[i].item = array[i].item.sort((a, b) => {
            return a.physicalState - b.physicalState;
          });
        }
        return array;
      },
      // 文件命名处理 1 物理页第一页错误 2 物理页不连续 3 物理页状态错误  4 正常
      _checkFileSort = function (array) {
        if (array.length == 0) {
          return true;
        }
        //如果第一个物理页不为1 则错误
        if (array[0].physicalIndex == 1) {
          //判断物理页是否连续
          if (_judgePhysicalIndexContinuous(array)) {
            //判断物理有状态是否正常和连续
            if (_judgePhysicalStatenormalAndContinuous(array)) {

              return true;
            } else {

              return false;
            }
          } else {
            // todo  物理页不连续
            return false;
          }
        } else {
          //  todo 处理文件命名不规范
          return false;
        }
      },
      //判断物理页是否是连续
      _judgePhysicalIndexContinuous = function (array) {
        if (array.length != 1) {
          for (var i = 0; i < array.length - 1; i++) {
            if (i == 0) {
              if (array[i].physicalIndex != (array[i + 1].physicalIndex - 1)) {
                return false;
              } else {
                continue;
              }
            } else {
              if (array[i].physicalIndex != array[i - 1].physicalIndex + 1
                  || array[i].physicalIndex != array[i + 1].physicalIndex - 1) {
                return false;
              } else {
                continue;
              }
            }
          }
        }
        return true;
      },
      //判断物理页状态是否满足正常和连续
      _judgePhysicalStatenormalAndContinuous = function (array) {
        //遍历上传的所有文件
        for (var i = 0; i < array.length - 1; i++) {
          //遍历某个物理页的元素
          if (array[i].item[0].physicalState == 0) {
            if (array[i].item.length > 1) {
              return false;
            } else {
              continue;
            }
          } else if (array[i].item[0].physicalState == 1) {
            if (_judgePhysicalStateContinuous(array[i].item)) {
              continue;
            } else {
              return false;
            }
          } else {
            return false;
          }
        }
        return true;
      },
      //检测物理页状态是否连续
      _judgePhysicalStateContinuous = function (array) {
        if (array.length != 0) {
          for (var i = 0; i < array.length - 1; i++) {
            if (i == 0) {
              if (array[i].physicalState != (array[i + 1].physicalState - 1)) {
                return false;
              } else {
                continue;
              }
            } else {
              if (array[i].physicalState != array[i - 1].physicalState + 1
                  || array[i].physicalState != array[i + 1].physicalState - 1) {
                return false;
              } else {
                continue;
              }
            }
          }

        }
        return true;
      },

      _clear = function () {
        if (_webUploader != null) {
          _webUploader.reset();
          _webUploader.destroy();
        }
        map = {};
        isSaveOver = false;
        _commonResult = $($("#imageShowUploadProGroup").prop("outerHTML"));
        _uploadFileSize = 0;
        _fileCount = 0;
        _allFilesSize = 0;
        errorArray.splice(0, errorArray.length);
        rightArray.splice(0, rightArray.length);
        matchingPageFilesArray.splice(0, matchingPageFilesArray.length);
        savePageFilesArray.splice(0, savePageFilesArray.length);
        fileArray.splice(0, fileArray.length);
      };

  return {
    init: function (conf) {
      _init(conf);
    }
  }
})();
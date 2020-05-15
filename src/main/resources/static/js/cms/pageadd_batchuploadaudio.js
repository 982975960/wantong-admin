wantong.cms.pageAdd.batchUploadAudio = (function () {
  var _conf = {
        UPLOAD_URL: "/upload.do",
        SAVE_PAGES_AUDIO:"/cms/savePagesAudios.do",
        CHECK_SAVEPAGES_STATE:"/cms/checkBatchAudiosState.do",
        pages: new Array()
      },

      isCheckOver = false,
      _upLoadTimeInval = null,
      _saveDataTimeInval = null,
      _uploader = null,
      _root = null,
      _progress = null,
      //文件数量
      _fileCount = 0,
      //所有文件大小
      _fileSize = 0,
      //已上传文件大小
      _haveUploadFileSize = 0,
      //进度条界面的layer的index
      _progressLayerIndex = null,
      //确认界面layer的index
      _comfirmLayerIndex = null,
      //上传完成的layer的index
      _uploadResultLayerIndex = null,
      //上传文件异常的layer的index
      _errorUploadResultLayerIndex = null,
      //检测的layer的提示
      _checkErrorLayerIndex = null,
      //检测文件确定上传
      _checkLayerRightLayerIndex = null,

      //保存数据成功
      _saveDataRightLayerIndex = null,
      //保存数据失败
      _saveDataErrorLayerIndex = null,

      _tipLayerIndex = null,

      // _reg = /\d\-\d\-\d{1,3}/,

       // _reg = /^\d{1,3}\-\d\.mp3$/,
      _reg = /^\d{1,3}\-\d\-\d{1,3}\.(?=\D)|^\d{1,3}\-\d\-\d{1,3}(?!\.)|^\d{1,3}\-\d\_\d{1,3}\.(?=\D)|^\d{1,3}\-\d\_\d{1,3}(?!\.)/,
       _regPage = '\\d{1,3}',

       //公共的头部上传状态的JQ对象
      _commonResult = null,


      //确认界面的提示
      _comfirmHtml = ' <div id="upload-hint" style="margin-top: 5%;margin-left: 15%;margin-right: 15%">\n'
          + '    <div class="hint-text">\n'
          + '       <span style="font-size: 15px;line-height: 24px">您确定批量上传真人录音吗？批量上传后，之前书页的语音将被全部覆盖。</span>\n'
          + '    </div>\n'
          + '    <div id="confirmBtn" class="button" style="margin-left: 40%;margin-top: 20%" >\n'
          + '     <span>确定</span>\n'
          + '    </div>\n'
          + '  </div>\n',

      //进度条的提示界面
      _progressHtml = '<div id="fileProgress">\n'
          + '      <div class="upload_hint" style="float: left;margin-top: -23px;margin-left: 15%;font-size: 16px;color: #c14a1a;display: none "><span>上传时间较长，请耐心等待</span></div>\n'
          + '    <div class="progress progress-striped active" style="width: 70%;margin-top: 50px;margin-left: 15%">\n'
          + '   <div id="uploadProgress" class="progress-bar progress-bar-success" role="progressbar"\n'
          + '           aria-valuenow="60" aria-valuemin="0" aria-valuemax="100"\n'
          + '           style="width: 0%;">\n'
          + '      </div>\n'
          + '    </div>\n'
          + '      <div id="pro-hint" style="margin-left: 15%">\n'
          + '        <span type="text">正在上传...<span id="pro-prcent">0</span>%</span>\n'
          + '      </div>\n'
          + '  </div>',



      //文件上传发现异常的界面的提示
      _errorCheckResultHtml = '<div id="error_upload_result">\n'
          + '  <div class="hint-title" >\n'
          + '    <span id="hint">文件上传结果,以下音频文件存在异常,请检查！</span>\n'
          + '  </div>\n'
          + '  <div class="exception-file">\n'
          + '   <table style="margin-left: 31px;width: 90%">\n'
          + '   </table>\n'
          + '  </div>\n'
          + '</div>',
      //所有文件自检正常的界面提示
      _checkFinishResultHtml ='<div id="check_result" >\n'
          + '  <div class="result-hint">\n'
          + '    <span type="text" style="font-size: 16px">全部文件自检成功！</span>\n'
          + '  </div>\n'
          + '  <div class="confirm-control">\n'
          + '    <button id="check_confrim_btn" type="button" class="btn btn-info">下一步</button>\n'
          + '  </div>\n'
          + '</div>',

      _uploadFinishResultHtml ='<div id="upload_result" >\n'
          + '  <div class="result-hint">\n'
          + '    <span type="text" style="font-size: 16px">全部文件上传成功！</span>\n'
          + '  </div>\n'
          + '  <div class="confirm-control">\n'
          + '    <button id="upload_confrim_btn" type="button" class="btn btn-info">下一步</button>\n'
          + '  </div>\n'
          + '</div>',
      _uploadErrorResultHtml = '<div id="error_upload_result">\n'
          + '  <div class="hint-title" >\n'
          + '    <span id="hint">文件上传结果,以下音频文件存在异常,请检查！</span>\n'
          + '  </div>\n'
          + '  <div class="exception-file">\n'
          + '   <table style="margin-left: 31px;width: 90%">\n'
          + '   </table>\n'
          + '  </div>\n'
          +'   <div class="btn-control">\n'
          +'   <button id="confirm_upload" type="button" class="btn btn-info">忽略,下一步</button>\n'
          +'   </> \n'
          + '</div>',

      _saveDataFinishResultHtml ='<div id="saveDataResult" >\n'
          + '  <div class="result-hint">\n'
          + '    <span type="text" style="font-size: 16px">写入成功，真人录音已全部完整上传！</span>\n'
          + '  </div>\n'
          + '  <div class="confirm-control">\n'
          + '    <button id="saveData_confrim_btn" type="button" class="btn btn-info">确定</button>\n'
          + '  </div>\n'
          + '</div>',

      _hintPanel = '<div class="text-box">\n'
          + '                             <h2>上传的音频文件，需符合以下标准：</h2>\n'
          + '                                <span>MP3格式、采样率24000HZ、比特率56kbps<br />\n'
          + '整个上传的文件夹的名称不做命名限制，只对里面的音频文件命名做规范。</span>\n'
          + '\n'
          + '                             <h2>音频命名规则：</h2>\n'
          + '                                <span>物理页-物理页状态-/_音频序号-音频文件名</span>\n'
          + '                                <span>\n'
          + '        用 – 来做分隔<br />\n'
          + '                                物理页：必填，1以上的整数<br />\n'
          + '                                物理页状态：必填，没有物理页状态，请用0来代替；有物理页状态，请用1以上整数<br />\n'
          + '                                音频序号：必填，1以上的整数<br />\n'
          + '                                音频文件内容名称：必填，任意字符即可，允许只填空格\n'
          + '                                </span>\n'
          + '                                <span>\n'
          + '                                整个音频文件名为：1-0-1-你好 或 1-0_1-你好<br />\n'
          + '                                第一个，数字1，代表物理页；<br />\n'
          + '                                第二个，数字0，代表这个物理页没有多个状态，写0即可；<br />\n'
          + '                                第三个，数字1，代表音频序号；<br />\n'
          + '                                第四个，你好，代表音频文件内容名称\n'
          + '                                </span>\n'
          + '                                <span>\n'
          + '                                当想导入整本书的真人录音音频，请在本地，先把音频全部按照规则命名，示例如图所示：</span>\n'
          + '                                <span><img src="/static/images/pic4.png" width="261" height="213" /></span>\n'
          + '                                <span>然后再点击批量导入真人录音按钮，在上传前会先进行文件自检，仅当文件全部符合规范方可上传。若遇到音频文件自检有上传失败的情况，请检查音频文件是否符合上传标准。</span>\n'
          + '                             <h2>批量下载：</h2>\n'
          + '                             <span>下载整本书的领读录音音频资源</span>\n'
          + '                             <span>下载的整本书的全部音频资源放置在文件夹中</span>\n'
          + '                             <span>文件夹以BookID命名</span>\n'
          + '                             <span>音频资源命名方式为"物理页-物理状态-音频序号",例如"1-0-1"</span>\n'
          + '        <h2>以上说明若仍然未帮助到您，请详见：操作说明手册链接<a href="https://www.showdoc.cc/bailubtr?page_id=2534328140152490" target="_blank">https://www.showdoc.cc/bailubtr?page_id=2534328140152490</a></h2>\n'
          + '                            </div>',

      //又来记录所有文件错误和类型的Map数组
      errorArray = new Array(),

      //用来存放上传成功的文件
      fileArray = new Array(),

      //文件名错误的文件
      errorFileNameArray = new Array(),

      //用来存放第一步文件名筛选的对象数组
      rightFileArray = new Array(),

      //匹配到书页上的数据
      matchingPageFilesArray  = new Array(),

      //上传成功文件的数据
      savePageFilesArray = new Array(),


      //上传文件失败的数据
      _uploadErrorFiles = new Array(),


      //初始化js
      _init = function (conf) {
        $.extend(_conf.pages, conf);
        _root = $("#pageAdd");
        //创建一个公共的文件状态
        _commonResult = $(_root.find("#showUploadProGroup").prop("outerHTML"));

        _initBtnClickEvent();


      },
      //初始化按钮的点击事件
      _initBtnClickEvent = function () {
        //点击批量上传音频按钮事件监听
        $("#batchUploadAudioBtn").off("click").on("click", function () {
          this.blur();
          _comfirmUploadShow();
        });

        $("#helpBtn").off("click").on("click",function () {
          _tipLayerIndex = layer.tips(
              _hintPanel,
              "#helpBtn",
              {tips: [2, '#ffffff'],area:['560px','690px'],time:60000*10,shade :0.01,shadeClose: true,success:function (layero) {
                 $(layero).find(".layui-layer-content").css("overflow-y","auto");
                }}

          );
        });

        // $("#helpBtn").off("mouseout").on("mouseout",function () {
        //    layer.close(_tipLayerIndex);
        // });
      },

      _checkConfrimEvent = function(obj){
       obj.find("#check_confrim_btn").off("click").on("click",function () {

          this.blur();
          //关闭layer
          layer.close(_checkLayerRightLayerIndex);

          _uploader.upload();
        });
      },
      _saveDataEvent = function(obj){
        obj.find("#upload_confrim_btn").off("click").on("click",function () {

          console.log("click upload_confrim_bt");
          this.blur();
          layer.close(_uploadResultLayerIndex);

          var map = {};
          var isSaveOver = false;
          let taskId = "";
          let success = false;
          var precent = 0;
          //显示进度条
          _startUploadShowProgress("写入保存进度",'正在写入...<span id="pro-prcent">0</span>%');

          _saveDataTimeInval =  setInterval(function () {

            precent++;

            if(precent<95) {
              _setProgressPercentage((precent).toFixed(0)/100);
            }
            if(isSaveOver){
              if(precent>95){
                _saveFinishPage(map);
                isSaveOver = false;
              }
            }
          },50);

          //保存书页数据
          $.ajax({
            type:"post",
            url:_conf.SAVE_PAGES_AUDIO+"?bookId="+_conf.pages[0].bookId,
            data:JSON.stringify(matchingPageFilesArray),
            dataType:"json",
            contentType:"application/json",
            async:false,
            success:function (data) {
              if(data.code == 0){
                if(data.data != undefined){
                  taskId = data.data;
                  success = true;
                }
              } else {
                layer.msg("服务异常");
              }
            },
            error:function () {
              layer.msg("网络异常");
            },
          });
          if(success){
            success = !success;
            var timeTask = setInterval(()=>{
              $.ajax({
                type: 'post',
                url: _conf.CHECK_SAVEPAGES_STATE + "?taskId=" + taskId,
                data: JSON.stringify(matchingPageFilesArray),
                dataType:"json",
                contentType:"application/json",
                async:false,
                success:function (data) {
                  if(data.code == 0){
                    if(!data.data.finish){
                      return;
                    }else {
                      map = data.data.extra;
                    }
                  }else {
                    layer.msg("服务异常")
                  }
                  success = true;
                }
              }).always(()=>{
                if(success){
                  clearInterval(timeTask);
                  isSaveOver = true;
                }
              })
            },500);

          }

        });
      },
      _saveConfrimEvent = function(obj){
        obj.find("#saveData_confrim_btn").off("click").on("click",function () {
            this.blur();
            layer.close(_saveDataRightLayerIndex);
          });
      },
      // _cancelUploadEvent = function(obj){
      //   obj.off("click","#cancel_upload").on("click","#cancel_upload",function () {
      //     this.blur();
      //     layer.close(_errorUploadResultLayerIndex);
      //   });
      // },

      _confirmUpload= function(obj){
        obj.find("#confirm_upload").off("click").on("click",function () {
          this.blur();
          layer.close(_errorUploadResultLayerIndex);
        });
      },

      //确认上传界面的提示界面
      _comfirmUploadShow = function () {
        var content = _comfirmHtml;
        _comfirmLayerIndex = layer.open({
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

          }
        });

      },
      //创建webuploader对象
      _createUploader = function () {
        _uploader = WebUploader.create({
          swf: GlobalVar.contextPath + '/js／uploader/Uploader.swf',
          server: _conf.UPLOAD_URL + "?isMp3=" + true + "&isVoice=" + true,
          duplicate: true,
          pick: {
            id: confirmBtn,
            multiple: false,
            webkitdirectory: true
          },
          //允许上传的文件
          accept: {
            title: 'mp3',
            extensions: 'mp3',
            mimeTypes: 'audio/mpeg'
          },
          fileSingleSizeLimit: 8 * 1024 * 1024,
          chunked: true,  // 分片上传大文件
          chunkSize: 8388608,//如果去要分片 分多大一片
          chunkRetry: 10, // 如果某个分片由于网络问题出错，允许自动重传多少次？
          thread: 10,// 最大上传并发数
          auto: false,
          duplicate: true,
          async:false,
          method: "POST"
        });
        _uploadEvent();
      },
      //上传文件的事件监听
      _uploadEvent = function () {

        //开始上传文件的事件 只会执行一次
        _uploader.on("startUpload", function () {
          console.log("*********startUpload文件总数**********"
              + _uploader.getFiles().length)
          //显示进度条
          _startUploadShowProgress("上传进度",'正在上传...<span id="pro-prcent">0</span>%',true);
          _haveUploadFileSize = 0;
        });
        //把单个文件放入队列 在·startUpload事件之前
        _uploader.on("fileQueued", function (file) {
          //上传的所有文件数量和总问价大小

          _fileCount++;
          _fileSize += file.size;
        });

        //批量文件放入对列  是整个自检流程
        _uploader.on("filesQueued",function (files) {

          console.log(files);


          _checkAudioFile();
          //获得所有文件
          _matchingFileName(files);
          //传入所有格式正确的元素
          _matchingFileNameToPages(rightFileArray);
          //显示重复序号文件
          _checkMatchingPageFilesArrayRepeat(matchingPageFilesArray);

          console.log(matchingPageFilesArray);
          _checkFinishShowPage();

        });


        //文件上传的进度的回调
        _uploader.on("uploadProgress", function (file, percentage) {

        });
        //单个文件上传成功的回调
        _uploader.on("uploadSuccess", function (file, response) {
          _haveUploadFileSize += file.size;
          //设置进度条
          _setProgressPercentage(
              (_haveUploadFileSize / _fileSize).toFixed(2));
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
            for(var i = 0; i<matchingPageFilesArray.length; i++) {
              for (var j = 0; j<matchingPageFilesArray[i].audioFilesNameAndMatchText.length; j++){
                if(matchingPageFilesArray[i].audioFilesNameAndMatchText[j].clientFileName == response.data.clientFileName){

                  matchingPageFilesArray[i].audioFilesNameAndMatchText[j].tempFileName = response.data.fileName;

                  //所有正确的文件
                  savePageFilesArray.push(matchingPageFilesArray[i]);
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
            if(file.name != ".DS_Store") {
              errorFlie.errorType = "文件非MP3格式";
              errorFlie.fileName = file.name;
            }
          }
          //错误文件异常的对象
          if(errorFlie.errorType != "" && errorFlie.fileName != "") {
            errorArray.push(errorFlie);
          }
        });
        //所有文件上传结束
        _uploader.on("uploadFinished", function () {
          layer.close(_progressLayerIndex);
          _finishUploadShowPage();
        });
        //文件上传是错误
        _uploader.on("uploadError",function (file,response) {
          var errorFlie = {errorType: "", fileName: ""};

          errorFlie.fileName = file.name;
          errorFlie.errorType = "文件上传失败";
          _uploadErrorFiles.push(errorFlie);

          for(var i = 0 ;i<matchingPageFilesArray.length;i++){
            for (var j = 0; j<matchingPageFilesArray[i].audioFilesNameAndMatchText.length; i++){
              if(matchingPageFilesArray[i].audioFilesNameAndMatchText[j].clientFileName ==file.name){
                matchingPageFilesArray[i].audioFilesNameAndMatchText[j].splice(j,1);
                return;
              }
            }

          }
        });
      },
      //自检文件 开始的界面显示 和精度操作
      _checkAudioFile = function(){

        //关闭确认界面
        layer.close(_comfirmLayerIndex);

        _startUploadShowProgress("文件自检",'正在自检...<span id="pro-prcent">0</span>%');

        var precent = 0;

        _upLoadTimeInval =  setInterval(function () {

          precent++;

          if(precent<95) {
            _setProgressPercentage((precent).toFixed(0)/100);
          }
          if(isCheckOver){
            if(precent>95){
              _checkFinishShowPage();
              isCheckOver = false;
            }
          }
        },50);

      },

      //开始上传 显示上传进度条
      _startUploadShowProgress = function (title,prohint,isShow) {
        var content = _progressHtml;
        // 上传进度弹窗的显示
        _progressLayerIndex = layer.open({
          title: title,
          type: 1,
          area: ['600px', '200px'],
          scrollbar: true,
          content: content,
          closeBtn:0,
          success: function (layero) {
            layero.find("#pro-hint span[type='text']").html(prohint);
            if(isShow) {
              layero.find(".upload_hint").css("display", "inline-block");
            }
            //关闭确认界面的layer
            layer.close(_comfirmLayerIndex);
            console.log("layerOPen")
            _progress = layero.find("#fileProgress");
          },
          end: function () {

          },
          cancel: function () {
             //重置上传
             _uploader.reset();
             _clearData();
          },
        });
      },
      //设置进度条的进度 precent百分百
      _setProgressPercentage = function (precent) {
        console.log("precent:"+precent);
        _progress.find("#uploadProgress").css("width", precent * 100 + "%");
        _progress.find("#pro-prcent").html((precent * 100).toFixed(0));
      },

      //检测结束的界面显示
      _checkFinishShowPage = function(){
       if(parseInt(_progress.find("#pro-prcent").html())<20){
         isCheckOver = true;
         return;
       }
       //先设置进度条为1
       _setProgressPercentage(1);
          //关闭检测界面的layer界面
       layer.close(_progressLayerIndex);
       //清空定时任务
       window.clearInterval(_upLoadTimeInval);

         if(errorArray.length == 0){

           //添加状态图标
           _commonResult.find("#file_check").html('<img src="/static/images/ico_pic_right.jpg"  width="65" height="64" />');

           //避免修改原来的状态
           var content =$(_commonResult.prop("outerHTML"));

           content.append(_checkFinishResultHtml);
           _checkLayerRightLayerIndex=layer.open({
             title:"文件自检结果",
             type:1,
             area:['600px','330px'],
             content:content.prop("outerHTML"),
             success:function(layero){
               layero.find("#showUploadProGroup").css("display","inline-block");
               //初始化按钮
               _checkConfrimEvent(layero);
             },
             end:function () {

             },
             cancel:function () {
               _uploader.reset();
               _clearData();
             }
           });
         }else {
           _commonResult.find("#file_check").html('<img src="/static/images/ico_pic_error.jpg"  width="65" height="64" />');

           var content = $(_commonResult.prop("outerHTML")).append(_initFileExceptionPanel(_errorCheckResultHtml,"自检完毕，以下音频文件存在异常，请检查！").prop("outerHTML"));
           _checkErrorLayerIndex = layer.open({
             title:"文件自检结果",
             type:1,
             area:['580px','580px'],
             scrollbar:false,
             content:content.prop("outerHTML"),
             success:function(layero){
               layero.find("#showUploadProGroup").css("display","inline-block");
             },
             end:function () {

             },
             cancel:function () {
              // 重置上传
              _uploader.reset();
              _clearData();
             }
           });
         }
      },
      //上传完成结果提示
      _finishUploadShowPage = function () {
        //没有错误，说明所有文件上传都是成功的
        if (errorArray.length == 0) {
          _commonResult.find("#checkFinish").attr("class","upload-gules");
          _commonResult.find("#file_upload").html('<img src="/static/images/ico_pic_right.jpg"  width="65" height="64" />');
          var content =$(_commonResult.prop("outerHTML")).append(_uploadFinishResultHtml);
          _uploadResultLayerIndex = layer.open({
            title: "上传结果",
            type: 1,
            area: ['580px', '350px'],
            scrollbar: false,
            content: content.prop("outerHTML"),
            success:function(layero){
              layero.find("#showUploadProGroup").css("display","inline-block");
              _saveDataEvent(layero);
            },
            end: function () {

            },
            cancel: function () {
              _uploader.reset();
              _clearData();
            },
          });
        } else {

          //上传文件全部做错
          if(savePageFilesArray.length == 0){

            _commonResult.find("#checkFinish").attr("class","upload-gules");
            _commonResult.find("#file_upload").html('<img src="/static/images/ico_pic_error.jpg"  width="65" height="64" />');

            var content = $(_commonResult.prop("outerHTML")).append(_initFileExceptionPanel(_errorCheckResultHtml,"部分音频文件上传失败，请检查!").prop("outerHTML"));

            layer.open({
              title:"上传结果",
              type:1,
              area:['580px','580px'],
              scrollbar:false,
              content:content.prop("outerHTML"),
              success:function(layero){
                layero.find("#showUploadProGroup").css("display","inline-block");
              },
              end:function () {

              },
              cancel:function () {
                // 重置上传
                _uploader.reset();
                _clearData();
              }
            });

          }else {

            //部分错误 还可以上传
            _commonResult.find("#checkFinish").attr("class","upload-gules");
            _commonResult.find("#file_upload").html('<img src="/static/images/ico_pic_waring.jpg"  width="65" height="64" />');
             var  content = $(_commonResult.prop("outerHTML")).append(_uploadErrorResultHtml);
            _errorUploadResultLayerIndex =  layer.open({
                title:"上传结果",
                type:1,
                area:['580px','580px'],
                scrollbar:false,
                content:content.prop("outerHTML"),
                success:function(layero){
                  layero.find("#showUploadProGroup").css("display","inline-block");
                  _confirmUpload(layero);
                },
                end:function () {

                },
                cancel:function () {
                  // 重置上传
                  _uploader.reset();
                  _clearData();
                }
              });

          }
        }
      },
      //设置错误文件界面上的显示
      _initFileExceptionPanel = function(html,hint){
         //获得js对象
         var obj = $(html);
         obj.find("#hint").html(hint);
         var table  = obj.find(".exception-file table");
        for(var i = 0;i<errorArray.length;i++){
               var tempHtml = '<tr style="line-height: 40px">'
               + '<td title='+errorArray[i].fileName.replace(/\s/g,"&nbsp;")+' style="width: 314px;font-size: 16px;white-space: nowrap;text-overflow: ellipsis;overflow: hidden;display: block;float: left">' + errorArray[i].fileName + '</td>'
               + '<td style="width: 208px;color: red;font-size: 16px;">' + errorArray[i].errorType + '<td>'
               + '</tr>';
               table.append(tempHtml);
        }
        console.log()

        return obj;
      },

      _initMapExceptionPanel = function(html,hint,errorMap){
          var obj =$(html);
          obj.find("#hint").html(hint);
          var table  = obj.find(".exception-file table");
        for(var i in errorMap){
          var tempHtml = '<tr style="line-height: 40px">'
              + '<td title='+i.replace(/\s/g,"&nbsp;")+' style="width: 314px;font-size: 16px;white-space: nowrap;text-overflow: ellipsis;overflow: hidden;display: block;float: left">' + i + '</td>'
              + '<td style="width: 208px;color: red;font-size: 16px;">' + errorMap[i] + '<td>'
              + '</tr>';
          table.append(tempHtml);
        }
        return obj;
      },

      //先筛选文件名不符合规范的文件和符合的文件 满足
      _matchingFileName = function(files){
          for(var i = 0;i<files.length;i++){

            //如果不匹配
            if(!_reg.test(files[i].name)){
              //文件名不匹配的文件
              errorFileNameArray.push(files[i]);
              //错误文件和类型的对象
              var errorFlie = {errorType: "", fileName: ""};
              errorFlie.fileName = files[i].name;
              errorFlie.errorType = "文件命名不符合规范";
              //文件错误和类型放入数组
              errorArray.push(errorFlie);
            }else {
              //放入正确的文件到数组中
              rightFileArray.push(files[i]);
            }
          }
      },
      //将文件匹配到所有页上   array 是筛选过一遍剩下的文件
      _matchingFileNameToPages = function(array){

         for (var i = 0;i < _conf.pages.length; i++ ){

           var pagesData = {
             pageId:0,
             audioFilesNameAndMatchText:new Array()
           };
           pagesData.pageId = _conf.pages[i].id;
           //头的匹配正则表达式
           var regText ="^"+ _conf.pages[i].physicalIndex+"-"+_conf.pages[i].physicalState+"-"+_regPage+"|"+"^"+ _conf.pages[i].physicalIndex+"-"+_conf.pages[i].physicalState+"_"+_regPage;

           var headerReg = new RegExp(regText);

           for(var j = array.length-1;j >= 0; j--){
             var audioFilesObj = {
               matchText:"",
               clientFileName:"",
               tempFileName:"",
               duration:0.00
             };
              if(headerReg.test(array[j].name)){
               // 设置匹配的元素对象

                audioFilesObj.clientFileName=array[j].name;
                audioFilesObj.matchText  = headerReg.exec(array[j].name)[0];

                var url = URL.createObjectURL(array[j].source.source);

                var audio = new Audio(url);
                var isLoadOver = false;

                _setMatchingPagesFilesArray(audioFilesObj,audio);

                pagesData.audioFilesNameAndMatchText.push(audioFilesObj);
               //放入匹配的内容中
                array.splice(j,1);

              }
           }
           //音频放入匹配的页信息中
           if(pagesData.audioFilesNameAndMatchText.length > 0) {
             //有音频信息才放入数组中
             matchingPageFilesArray.push(pagesData);
             console.log(matchingPageFilesArray);
           }
         }
         if(array.length != 0){
           for (var  i = 0 ;i<array.length;i++) {
             var errorFlie = {errorType: "", fileName: ""};
             errorFlie.errorType="文件未找到可匹配的书页";
             errorFlie.fileName=array[i].name;
             //错误对象放入元素中
             errorArray.push(errorFlie);
           }
         }
         console.log(matchingPageFilesArray);
      } ,

      _setMatchingPagesFilesArray = function(audioFilesObj,audio){
        audio.addEventListener("loadedmetadata", function (event) {
          audioFilesObj.duration = audio.duration;

        });
      },
      //匹配内容是否重复
      _checkMatchingPageFilesArrayRepeat = function(matchPagesArray){
         for (var i = 0; i<matchPagesArray.length; i++){
           var tmp = new Array();
           if(Array.isArray(matchPagesArray[i].audioFilesNameAndMatchText)) {
             matchPagesArray[i].audioFilesNameAndMatchText.concat().sort().sort(function(a,b) {
               if(a.matchText ==b.matchText && tmp.indexOf(a) === -1) {
                 tmp.push(a);
                 tmp.push(b)
               }
             });
           }

           tmp = _hashRemoveRepeat(tmp);

          for(var j = 0;j<tmp.length; j++){
            var errorFlie = {errorType: "", fileName: ""};
            errorFlie.fileName = tmp[j].clientFileName;
            errorFlie.errorType = "文件命名不符合规范";

            errorArray.push(errorFlie);
          }
         }
      },

      //保存数据
      _saveFinishPage = function(errorMap){



         layer.close(_progressLayerIndex);

         window.clearInterval(_saveDataTimeInval);

          if(_getMapLength(errorMap)>0){

            _commonResult.find("#uploadFinish").attr("class","upload-gules");
            _commonResult.find("#data_save").html('<img src="/static/images/ico_pic_error.jpg"  width="65" height="64" />');
            var content = $(_commonResult.prop("outerHTML")).append(_initMapExceptionPanel(_errorCheckResultHtml,"以下音频文件写入失败，请检查!",errorMap).prop("outerHTML"));
            _saveDataErrorLayerIndex = layer.open({
              title:"写入保存结果",
              type:1,
              area:['580px','580px'],
              scrollbar:false,
              content:content.prop("outerHTML"),
              success:function(layero){
                layero.find("#showUploadProGroup").css("display","inline-block");

                _clearData();
              },
              end:function () {
              },
              cancel:function () {
                // 重置上传
                _uploader.reset();

              }
            });
          }else {
            _commonResult.find("#uploadFinish").attr("class","upload-gules");
            _commonResult.find("#data_save").html('<img src="/static/images/ico_pic_right.jpg"  width="65" height="64" />');
            var content =$(_commonResult.prop("outerHTML")).append(_saveDataFinishResultHtml);
            _saveDataRightLayerIndex = layer.open({
              title: "写入保存结果",
              type: 1,
              area: ['580px', '350px'],
              scrollbar: false,
              content: content.prop("outerHTML"),
              success:function(layero){
                layero.find("#showUploadProGroup").css("display","inline-block");
                _saveConfrimEvent(layero);
                _clearData();
              },
              cancel:function(){

              },
              end:function () {
                _uploader.reset();

              }
            });
          }
      },


      //hash去重
      _hashRemoveRepeat = function(array){
        var hash = {}, result = [],item;
        for (var i = 0; i < array.length; i++) {
          item = array[i].clientFileName;
          if ( !hash[item] ) {
            hash[item] = true;
            result.push(array[i]);
          }
        }
        return result;
      },

      //获得map的长度
      _getMapLength = function(obj){
        var count = 0;
        for(var i in obj){
          count++;
        }
        return count;
      },
      //清空文件数量和所有数据大小
      _clearData = function () {

        _fileSize = 0;
        _fileCount = 0;
        _haveUploadFileSize = 0;
        _commonResult = $(_root.find("#showUploadProGroup").prop("outerHTML"));
        errorArray.splice(0,errorArray.length);
        fileArray.splice(0,fileArray.length);
        errorFileNameArray.splice(0,errorFileNameArray.length) ;
        rightFileArray.splice(0,rightFileArray.length);
        matchingPageFilesArray.splice(0,matchingPageFilesArray.length);
        savePageFilesArray .splice(0,savePageFilesArray.length);
        _uploadErrorFiles.splice(0,_uploadErrorFiles.length);
        wantong.cms.pageAdd.pageList.refresh(_conf.pages[0].bookId,function () {
          _root.find(".page-list-row .edit-btn:first").click();
        });
      };
  return {
    init: function (conf) {
      _init(conf);
    }
  }
})();
wantong.cms.pageAdd.voiceEditor = (function () {
  var
      URL_TTS_CONVERT = GlobalVar.contextPath + "/cms/ttsConvert.do",
      URL_DBTTS_CONVERT = GlobalVar.contextPath + "/cms/DBttsConvert.do",
      PREVIEW_VOICE = GlobalVar.contextPath + "/downloadTempFile.do",
      AUDITION_CONVERT_URL = GlobalVar.contextPath + "/cms/auditionConvert.do",
      PREVIEW_DBTTS = GlobalVar.contextPath + "/cms/convertMultiroleVoice.do",
      SAVE_TTS_ROLES = GlobalVar.contextPath + "/cms/saveBookAudioRoles.do",
      CHECK_CHANGE_AUDIO_TASK_STATE = GlobalVar.contextPath
          + "/cms/modifyAudioTaskState.do",
      _root = null,
      _lastLayerIndex = 0,
      _panelAudioRefresh = false,
      _toneLayerIndex = 0,
      _realManTab = null,
      _ttsTab = null,
      _multiRoleTab = null,
      _closeCallback = null,
      _audioControl = null,
      _maxFontSize = 150,
      _editor = null,
      _finger = false,
      _recordContent="",
      _checkAudioTaskPanelIndex = 0,
      _checkRolesPlayingAudioStatusHandler=null,
      _selectContent = null,
      _isDbTtsChange = false,
      _toneDom = null,
      _rolesObject=null,
      _mouseMoveClick = false,
      _playInterval = null,
      _currentTime = 0,
      _bookId = 0,
      _type = 0, //0 is real man voice, 1 is TTS voice 2is DBTTS 3.标贝合成
      _isVoice = false,
      _templateHtml='<span style="display: inline;"  class="audio-part"  contenteditable="false"></span>',
      _uploadMP3File = {
        tempFileName: "",
        originFileName: "",
        clientFileName: "点此上传文件"
      },
      _voiceAuthorityManager = {
        multiroleSpeechSynthesis :false,
        oneRoleSpeechSynthesis:false,
        realPersonVoiceUpload:false
      },
      _roles = new Array(),
      confAudio = null,
      _mouseMove = false,
      _ttsData = {
        tempFileName: "",
        clientFileName: "",
        text: "",
        chSpeaker: -1
      },
      _DbMergeAudioData = {
        voiceId: 0,
        text: "",
        file: "",
        rolesId: 0,
        isFileChange: false,
        audios: new Array()
      },
      _lastTTSData = {
        text: "",
        tone: -1
      },
      _conf = {
        UPLOAD_URL: "upload.do",
        ttsRoles: null ,
        partnerId: 0
      },
      _init = function (conf) {
        $.extend(_conf, conf);
        _panelAudioRefresh = false;
        _inputChange();
        _initPlayBar();

      },
      _initPlayBar = function() {

      },
      //获得角色语音编辑的权限
      _initVoiceAuthority = function(){
        if($("#voiceEditorTemplate").find("#tab_1").length != 0){
          _voiceAuthorityManager.oneRoleSpeechSynthesis = true;
        }
        if($("#voiceEditorTemplate").find("#tab_3").length != 0){
          _voiceAuthorityManager.multiroleSpeechSynthesis = true;
        }
        if($("#voiceEditorTemplate").find("#tab_0").length != 0){
          _voiceAuthorityManager.realPersonVoiceUpload = true;
        }
      },
      _initMultiMergePanel = function () {
        //删除书本角色
        console.log('_initMultiMergePanel');
        _multiRoleTabContent.find('.role-container .delete-button').on('click',
            function () {
              layer.msg('暂不支持删除');
            });

        $('body').prepend($('#contextMenu').prop("outerHTML"));
        $('body').prepend($("#audition").prop("outerHTML"));

        //添加书本角色
        _multiRoleTabContent.find('#addRole').off("click").on('click',
            function () {
              var $container = _multiRoleTabContent.find('.role-container');
              var $template = $container.find('#roleTemplate').clone();
              $template.css('display', 'inline-block');
              $template.attr('id', '');
              _multiRoleTabContent.find('.role-container').append($template);
              $template.find('input').focus();
              _openRoleSelect($template.find(".voice-name"), $template.find('input'));
              _initRightClickMenu();
            });
      },

      _setDbState = function (state) {
        _isDbTtsChange = state;
      },
      //标贝语音试听
      _initPreviewBtnClick = function () {
        _multiRoleTabContent.find("#previewBtn").click(function () {
          if ($(this).hasClass('glyphicon-pause')) {
            _setPreviewPlay();
            if (_audioControl) {
              _audioControl.pause();
              _currentTime = _audioControl.currentTime;
            }
            return;
          }

          if (_currentTime > 0) {
            _setPreviewLoadding(false);
            _audioControl.currentTime = _currentTime;
            _audioControl.play();
            _playInterval = window.setInterval(updatePlayBar);
            return;
          }

          if (_theWholeAudioIsChange()) {
            _generateMultiroleVoice();
          } else {
            //没有改变  和
            _playDbttsAudio();
          }
        });

        _multiRoleTabContent.find('#editorProgressBar .voice-editor-btn-stop').click(function () {
          if(_audioControl) {
            _currentTime = 0;
            _audioControl.pause();
            _audioControl.currentTime = 0;
            updatePlayBar();
            _setPreviewPlay();
          }
        });


        _multiRoleTabContent.find('#editorProgressBar .voice-editor-progress-bar').click(function() {
            var palyBtn = $("#editorProgressBar .voice-editor-btn");
            if (!palyBtn.hasClass("glyphicon-pause")) { //没有播放时，点击进度条不做反应
              return;
            }
            if (_audioControl) {
              var coordStart = this.getBoundingClientRect().left;
              var coordEnd = event.pageX;
              var p = (coordEnd - coordStart) / this.offsetWidth;
              $('#editroProcessBar .voice-test-now').css('width', (p * 100).toFixed(3) + '%');
              //_audioControl.pause();
              palyBtn.click(); //PAUSE
              var t  = (p * _audioControl.duration).toFixed(2);
              _currentTime = t;
              palyBtn.click(); //PLAY
              //_audioControl.play();
              console.log('_currentTime = ', _currentTime);
            }
        });
      },
      _initUploader = function(){
        $('#uploadButton').html($('#uploadTemplate').html());
        _uploader = WebUploader.create({
          swf: GlobalVar.contextPath + '/js／uploader/Uploader.swf',
          server: _conf.UPLOAD_URL+"?isMp3="+true+"&isVoice="+_isVoice,
          fileSizeLimit: 8 * 1024 * 1024,
          duplicate :true,
          pick: {
            id: uploadButton,
            multiple: false
          },
          accept: {
            title: 'mp3',
            extensions: 'mp3',
            mimeTypes: 'audio/mpeg'
          },
          auto: true,
          method: "POST"
        });
      },
      _setPreviewLoadding = function(val) {
        //播放图标旋转
        if (val) {
          $('#editorProgressBar .voice-editor-btn').removeClass('glyphicon-play').removeClass('glyphicon-pause')
          .addClass('glyphicon-refresh').addClass('rotate-loading');
        } else {
          $('#editorProgressBar .voice-editor-btn').removeClass('glyphicon-refresh').removeClass('rotate-loading')
          .removeClass('glyphicon-play').addClass('glyphicon-pause');
        }
      },
      _setPreviewPlay = function() {
        $('#editorProgressBar .voice-editor-btn').removeClass('glyphicon-refresh').removeClass('rotate-loading')
        .removeClass('glyphicon-pause').addClass('glyphicon-play');
        clearInterval(_playInterval);
      },
      _theWholeAudioIsChange = function () {
        var text = "";
        var audioArray = new Array();
        var tempData = {
          voiceId: 0
        };
        var record = 0;
        $("#voiceEditor").find(".text-form p span[voiceid]").each(function () {
          var temp = _initDomFromat($(this));
          text += _ContentFormatting(temp.text());
          var te = clone(tempData);
          if ($(this).attr("voiceid") == 0 || $(this).attr("voiceid")
              == undefined) {
            record = 1;
          } else {
            te.voiceId = $(this).attr("voiceid");
            audioArray.push(te);
          }
        });
        if (confAudio == null) {
          return false;
        }
        if (text != confAudio.ttsText) {
          $("#voiceEditor").find(".text-form p span[voiceid]").each(
              function () {
                $(this).attr("filename", "");
              });
          //有修改
          return true;
        }
        if (record == 1) {
          return true;
        }
        if (confAudio.audios == undefined) {
          return true;
        }
        if (audioArray.length != confAudio.audios.length) {
          return true;
        }
        for (var i = 0; i < confAudio.audios.length; i++) {
          if (confAudio.audios[i].voiceId != audioArray[i].voiceId) {
            return true;
          }
        }
        return false;
      },
      //标本语音保存
      _initSaveDbTtsBtnClick = function () {

        _multiRoleTabContent.find("#saveBtn").click(function () {
          if (_isDbTtsChange) {
            //_multiRoleTabContent.find("#previewBtn").text("试听");
            if (_audioControl) {
              _audioControl.pause();
            }
            layer.msg("保存前请先试听语音", {time: 1000});
            return;
          }
          $('#editorProgressBar .voice-editor-btn-stop').click();
          wantong.cms.pageAdd.voiceManager.drapAudio();
          if (_closeCallback) {
            var data = _getData();
            _closeCallback(false, data, _audioControl);
          }

          _clear();
          layer.close(_voiceEditorDialogIndex);

        });
        _multiRoleTabContent.find("#saveBtn").attr("disabled", "disabled");
      },
      _saveBookRoles = function (dom) {
        var roleData = {
          id: 0,
          bookId: 0,
          name: "",
          voiceId: 0,
        };
        var data = _clone(roleData);
        data.voiceId = dom.attr("voiceid");
        data.bookId = _bookId;
        data.id = dom.parents(".role-block").attr("id");
        data.name = dom.parents(".role-block").find(".role-name").text();
        $.ajax({
          type: "post",
          dataType: "json",
          url: SAVE_TTS_ROLES,
          contentType: "application/json",
          data: JSON.stringify(data),
          async: false,
          success: function (data) {
            if (data.code == 0) {
              console.log("保存角色成功");
              dom.parents(".role-block").attr("id", data.data.id);
              //开始执行
              if (data.data.taskIdUUID != undefined) {
                _showChangeAudioStateWaitPanel();
                _panelAudioRefresh = true;
                _checkChangeAudioTaskState(data.data.taskIdUUID,dom);

              }else {
                _initChangeRoleName(dom);
              }
            } else {
              layer.msg("数据保存失败");
              return;
            }
          },
          error: function () {
            layer.msg("服务器错误");
          }

        });
      },
      _showChangeAudioStateWaitPanel = function () {
        _checkAudioTaskPanelIndex = layer.msg('书本相关音色正在替换，请稍等....', {
          icon: 16
          , shade: 0.4,
          time: -1
        });
      },
      _checkChangeAudioTaskState = function (taskId,dom) {
        $.ajax({
          type: 'get',
          url: CHECK_CHANGE_AUDIO_TASK_STATE,
          data: "taskId=" + taskId,
          async: false,
          success: function (data) {
            if (data.code == 0) {
              var index=null;
              if (data.data == 0) {
                //任务执行中
                index=setTimeout(function (){
                  _checkChangeAudioTaskState(taskId,dom);
                }, 3000);

              } else if (data.data == 1) {
                //执行完成
                layer.close(_checkAudioTaskPanelIndex);
                if(index!=null) {
                  clearTimeout(index);
                }
                _initChangeRoleName(dom);
              }else if(data.data == -1){
                layer.close(_checkAudioTaskPanelIndex);
                if(index!=null) {
                  clearTimeout(index);
                }
                console.log("没有该任务Id:"+taskId);
              } else {
                //执行异常
                layer.close(_checkAudioTaskPanelIndex);
                if(index!=null) {
                  clearTimeout(index);
                }
              }
            } else {
              layer.msg("错误");
            }
          },
          error: function () {
            layer.msg("服务异常");
          }
        });
      },
      _playDbttsAudio = function () {
        var fileName = _ttsData.tempFileName;
        var previewURL = PREVIEW_VOICE + "?fileName=" + fileName;
        if (_audioControl) {
          _audioControl.pause();
        }
        _setPreviewLoadding(true);
        _audioControl = new Audio();
        console.log('play');
        _audioControl.addEventListener("durationchange", function() {
          _setPreviewLoadding(false);
          if (_audioControl.duration != null
              && _audioControl.duration > 0) {
            $('#editorProgressBar .voice-editor-end').text(_audioControl.duration.toFixed(2) + '\'\'')
          }
          _audioControl.play();
          _playInterval = window.setInterval(updatePlayBar);
          _multiRoleTabContent.find("#saveBtn").removeAttr("disabled");
          _recordContent=$(".w-e-text").html().replace(/contenteditable="false"/g,"").replace(/contenteditable="true"/g,"");
          _checkPlayingDbTTsStatusHandler = setInterval(_checkDbTTSAudio, 50);
        });

        _audioControl.addEventListener("error", function() {
          _setPreviewLoadding(false);
        });

        _audioControl.addEventListener("ended", function() {
          _setPreviewPlay();
          _currentTime = 0;
          _audioControl.currentTime = 0;
          updatePlayBar();
        });

        _audioControl.src = previewURL;
      },
      _conversion = function (value) { //秒 转换为 分:秒
        var minute = Math.floor(value / 60);
        minute = minute.toString().length === 1 ? ('0' + minute) : minute;
        var second = Math.round(value % 60);
        second = second.toString().length === 1 ? ('0' + second) : second;
        return minute + ":" + second;
      },
      updatePlayBar = function () {
        if (_audioControl.duration != null
            && _audioControl.duration > 0) {
          var cur = _audioControl.currentTime.toFixed(2);
          var duration = _audioControl.duration.toFixed(2);
          $('#editorProgressBar .voice-editor-start').text(_conversion(cur) + '\'\'');
          $('#editorProgressBar .voice-editor-end').text(_conversion(duration) + '\'\'');
          $('#editorProgressBar .voice-editor-now').css('width', (cur / duration) * 100 + "%");
        }
      },
      clone = function (obj) {
        let temp = null;
        if (obj instanceof Array) {
          temp = obj.concat();
        } else if (obj instanceof Function) {
          //函数是共享的是无所谓的，js也没有什么办法可以在定义后再修改函数内容
          temp = obj;
        } else {
          temp = new Object();
          for (let item in obj) {
            let val = obj[item];
            temp[item] = typeof val == 'object' ? clone(val) : val; //这里也没有判断是否为函数，因为对于函数，我们将它和一般值一样处理
          }
        }
        return temp;
      },
      // 初始化 多角色选择界面
      _initMultiRolePanel = function () {
        var roles = _conf.ttsRoles;
        var partnerId = _conf.partnerId;
        var $targetDom = _multiRoleTabContent.siblings('#roleSelect');
        var $manDom = $targetDom.find('.man-voice .type-select');
        var $womanDom = $targetDom.find('.woman-voice .type-select');
        var $childDom = $targetDom.find('.child-voice .type-select');
        var $specialDom = $targetDom.find('.special-voice .type-select');
        var $starDom = $targetDom.find('.star-voice .type-select');
        var $customerDom = $targetDom.find('.customer-voice .type-select');
        //公共的角色板块
        let highDom = $targetDom.find("#highTabContent .type-select");
        $manDom.html('');
        $womanDom.html('');
        $childDom.html('');
        $specialDom.html('');
        $starDom.html('');
        $customerDom.html('');
        highDom.html("");
        for (var i = 0; i < roles.length; i++) {
          var id = roles[i].voiceId;
          var name = roles[i].roleName;
          var color = roles[i].color;
          // 角色类型
          var type = roles[i].type;
          //男声
          if (type == "man"){
            $targetDom = $manDom;
          } else if (type == "woman"){
            //女声
            $targetDom = $womanDom;
          } else if (type == "child" ) {
            //儿童
            $targetDom = $childDom;
          } else if (type == "high" ) {
            //普通角色
            $targetDom = highDom;
          }else {
            continue;
          }
          let text = "";
          if($targetDom == highDom){
            text = '<label class="radio-inline" style="height: 77px;"><input type="radio" colorcontent='
                + color + ' + value="' + id + '" name="sex">' + name + '</label>';
          } else {
           text = '<label class="radio-inline"><input type="radio" colorcontent='
              + color + ' + value="' + id + '" name="sex">' + name + '</label>';
          }
          $targetDom.append(text);
        }
      },
      _inputChange = function () {
        $("#text").on("input propertychange", function () {
          var area = $(this);
          _val = area.val();
          if (_val.length > _maxFontSize) {
            area.val(_val.substring(0, _maxFontSize));
          }
        });
      },
      _clickInit = function () {
        _ttsTabContent.find("#useIntelligenceTTS").on("click", function () {
          _stopTTSAudio();
          if (_ttsTabContent.find("#useIntelligenceTTS").prop("checked")) {
            _ttsTabContent.find("#speakerArea").hide();
            _ttsTabContent.find("#DBspeakerArea").hide();
            _ttsTabContent.find("#useDBTTS").attr("checked", false);
            _ttsTabContent.find("#text").attr("placeholder", "文本不能超过256个字数");
            _ttsTabContent.find("#text").attr("maxlength", "256");
            _maxFontSize = 150;
            _ttsTabContent.find("#text").val(
                _ttsTabContent.find("#text").val().substring(0, 150));
            _ttsTabContent.find("#text").css("height", "432px");
          } else {
            _ttsTabContent.find("#speakerArea").show();
            _ttsTabContent.find("#DBspeakerArea").hide();
            _ttsTabContent.find("#text").attr("placeholder", "文本不能超过500个字数");
            _ttsTabContent.find("#text").attr("maxlength", "500");
            _maxFontSize = 500;
            _ttsTabContent.find("#text").css("height", "240px");
          }
        });
        _ttsTabContent.find("#useDBTTS").on("click", function () {
          _stopTTSAudio();
          if (_ttsTabContent.find("#useDBTTS").prop("checked")) {
            if (_ttsTabContent.find("#useIntelligenceTTS").prop("checked")) {
              _ttsTabContent.find("#useIntelligenceTTS").attr("checked", false);
            } else {
              _ttsTabContent.find("#speakerArea").hide();
            }
            _ttsTabContent.find("#DBspeakerArea").show();
            _ttsTabContent.find("#text").attr("placeholder", "文本不能超过256个字数");
            _ttsTabContent.find("#text").attr("maxlength", "256");
            _ttsTabContent.find("#text").val(
                _ttsTabContent.find("#text").val().substring(0, 256));
            _maxFontSize = 256;
            _ttsTabContent.find("#text").css("height", "313px");
          } else {
            _ttsTabContent.find("#speakerArea").show();
            _ttsTabContent.find("#DBspeakerArea").hide();
            _ttsTabContent.find("#text").attr("placeholder", "文本不能超过500个字数");
            _ttsTabContent.find("#text").attr("maxlength", "500");
            _maxFontSize = 500;
            _ttsTabContent.find("#text").css("height", "240px");
          }
        });
        _ttsTabContent.find("#speakerArea").hide();
        _ttsTabContent.find("#DBspeakerArea").hide();
        _ttsTabContent.find("#text").attr("placeholder", "文本不能超过256个字数");
        _ttsTabContent.find("#text").attr("maxlength", "256");
        _maxFontSize = 256;
        _ttsTabContent.find("#text").css("height", "432px");
      },
      _clickInitTTs = function () {
        _ttsTabContent.find("#chSpeakerRedio").click(function () {
          var all = _ttsTabContent.find("#chSpeaker");
          for (var i = 0; i < all.length; i++) {
            //当选中下面某一个时，才会让智能选项为空
            if ($(all[i]).prop("checked") == true) {
              _ttsTabContent.find("#useIntelligenceTTS").prop("checked", 0);
              _ttsTabContent.find("#useIntelligenceTTS").attr("checked", false);
            }
          }
        });
      },
      _clone = function (obj) {
        var newobj = {};
        for (var attr in obj) {
          newobj[attr] = obj[attr];
        }
        return newobj;
      },
      _createEditor = function () {
        var E = window.wangEditor;
        var inputEditor = $("#voiceEditor").find(".text-form");
        var editor = new E(inputEditor[0]);
        _editor = editor;
        editor.customConfig.pasteIgnoreImg = true
        editor.customConfig.pasteTextHandle = function (content) {

          if($(_editor.selection.getSelectionStartElem()[0]).prop("nodeName")=="P" &&  window.getSelection().toString()==$(_editor.selection.getSelectionStartElem()[0]).text()){
            editor.txt.clear();
          }
          if (content == '' && !content) {
            return ''
          }
          var str = content;
          str = str.replace(/<xml>[\s\S]*?<\/xml>/ig, '');
          str = str.replace(/<style>[\s\S]*?<\/style>/ig, '');
          str = str.replace(/<\/?[^>]*>/g, '');
          str = str.replace(/[ | ]*\n/g, '\n');
          str = str.replace(/&nbsp;/ig, '');
          str = str.replace(/^\s+/, "");
          return str;
        }
        editor.customConfig.onchangeTimeout=10;
        editor.customConfig.onchange = function (html) {
          if(html.replace(/contenteditable="false"/g,"").replace(/contenteditable="true"/g,"")!=_recordContent) {
            _multiRoleTabContent.find("#saveBtn").attr("disabled", "disabled");
          }
          if($(".w-e-text").find("p").html()=="<br>"){
            editor.txt.clear();
          }
        }
        editor.customConfig.onblur = function (html) {
          if($(".w-e-text").find("p").html()=="<br>"){
            $("#voiceEditor").find(".text-form").find(".w-e-text-container").css("display","none");
            _multiRoleTabContent.find("#roleTextId").css("display","");
          }
        }
        editor.create();
        $("#voiceEditor").find(".text-form").find(".w-e-menu").css("display",
            "none");
        $("#voiceEditor").find(".text-form").find(".w-e-text-container").css(
            "height", "320px").css("display","none");
        $("#voiceEditor").find(".text-form").find(".w-e-text-container").css(
            "font-size", "16px");
        $("#voiceEditor").find(".text-form").find(".w-e-text").css("overflow-y","auto");
        $("#voiceEditor").find(".text-form").find(".w-e-text-container").css("font-family","宋体");
        // $("#voiceEditor").find(".text-form").find(".w-e-text").off("paste");
        // $("#voiceEditor").find(".text-form").find(".w-e-text p").on("paste",function (e) {
        //   e.stopPropagation();
        // });
        _initEditorAudioBtn();
        _initSpanBtnDown();
      },
      _inputOnfocus=function(){
        _multiRoleTabContent.find("#roleTextId").on("focus",function () {
          _multiRoleTabContent.find("#roleTextId").css("display","none");
          $("#voiceEditor").find(".text-form").find(".w-e-text-container").css("display","");
          $("#voiceEditor").find(".text-form .w-e-text").focus();
        });
        _multiRoleTabContent.find("#roleTextId").find("input").on("focus",function () {
          _multiRoleTabContent.find("#roleTextId").css("display","none");
          $("#voiceEditor").find(".text-form").find(".w-e-text-container").css("display","");
          $("#voiceEditor").find(".text-form .w-e-text").focus();
        });
      },
      _open = function (conf) {
        console.log("pageAdd_voiceediotr");
        $('#editorProgressBar .voice-editor-start').text('00:00');
        $('#editorProgressBar .voice-editor-end').text('00:00');
        $('#editorProgressBar .voice-editor-now').css('width', '0');
        _clear();
        _initVoiceAuthority();
        _conf.ttsRoles = conf.ttsRoles;
        _conf.partnerId = conf.partnerId;
        _conf.finger = conf.finger;
        _bookId = conf.bookId;
        confAudio = _clone(conf.data);
        _isVoice = conf.enableTTS;
        _finger = conf.finger;
        if (conf.roles != undefined) {
          for (var i = 0; i < conf.roles.length; i++) {
            _roles.push(conf.roles[i]);
          }
        }
        if (confAudio != null) {
          confAudio.ttsText = "";
        }


        if (conf.type == 0) { //0表示是编辑真人语音、背景音乐、音效
          _type = 0;
          _uploadMP3File.clientFileName = conf.data.clientFileName;
          _uploadMP3File.originFileName = conf.data.tempFileName;	//已经存在的文件资源进行更改
          _uploadMP3File.tempFileName = conf.data.tempFileName;
        } else if (conf.type == 1) { //1表示是编辑或者新添加tts语音
          _type = 1;
          if (conf.data != undefined) { //非undefined表示是编辑tts语音，否则是新增tts语音
            //拷贝属性对象以免未保存而更改了原属性
            _ttsData = _clone(conf.data);
          }
        } else if (conf.type == 3) {
          //标贝合成
          _type = 3;
          if (conf.data != undefined) { //非undefined表示是编辑tts语音，否则是新增tts语音
            //拷贝属性对象以免未保存而更改了原属性
            if (conf.data.audios != undefined) {
              _DbMergeAudioData.audios = clone(conf.data.audios);
              _DbMergeAudioData.file = conf.data.tempFileName;
              _DbMergeAudioData.text = conf.data.ttsText;
            }
          }
          _ttsData = _clone(conf.data);

        } else { //其它表示是新添加（除朗读语音外的语音、音乐、音效）
          _type = 0;
        }

        var enableTTS = conf.enableTTS == undefined ? false : conf.enableTTS;
        var titleOfUploadPanel = conf.titleOfUploadPanel;
        var tatil = "";
        if (titleOfUploadPanel == "真人录音") {
          tatil = "编辑语音";
          $("#voiceEditorTemplate").find("#hint").text("(mp3格式、采样率24000HZ、比特率56kbps)");
        } else if (titleOfUploadPanel == "上传背景音乐") {
          tatil = "编辑背景音乐";
          $("#voiceEditorTemplate").find("#hint").text("(mp3格式、采样率8000HZ、比特率24kbps)");
        } else {
          tatil = "编辑音效";
          $("#voiceEditorTemplate").find("#hint").text("(mp3格式、采样率8000HZ、比特率24kbps)");
        }
        enableTTS = _checkUserVoicePanel(enableTTS,titleOfUploadPanel);
        _closeCallback = conf.close;
        _lastLayerIndex = layer.index;
        var contentHtml = $("#voiceEditorTemplate").prop('outerHTML');
        _voiceEditorDialogIndex = layer.open({
          title: tatil,
          type: 1,
          maxmin: false,
          resize: false,
          area: ['1100px', '750px'],
          scrollbar: false,
          content: contentHtml,
          success: function (layero, index) {
            layero.find("#voiceEditorTemplate").attr("id", "voiceEditor");
            _root = layero.find("#voiceEditor");
            _root.show();
            document.body.style.overflow = 'hidden';
            _initUploader();
            _initTabSwitch(enableTTS, titleOfUploadPanel);
            _initTab3Panel();
            _numReadKeyUpEvent();
            _inputOnfocus();
            _initUploadButton();
            _initTTSPreview();
            _initTTSSave();
            _initRealManSave();
            _clickInit();
            _clickInitTTs();
            _initLanguageTabSwitch();
            _initMultiRolePanel();
            _initPreviewBtnClick();
            _initSaveDbTtsBtnClick();
            _initMultiMergePanel();
            _initRightClickMenu();
            _initDeleteBtn();
            _forbidEnter();
            _initReverse();
            _mockUseDBTTS();
          },
          cancel: function () {
            _ttsTabContent.find("#text").val('');
            _ttsTabContent.find("#useIntelligenceTTS").prop("checked", 0);
            _ttsTabContent.find("#useIntelligenceTTS").attr("checked", true);
            $('#editorProgressBar .voice-editor-end').text('00:00\'\'');
            $('#editorProgressBar .voice-editor-btn-stop').click();
            _currentTime = 0;
            clearInterval(_playInterval);

            $("body").find("#contextMenu").remove();
            $("body").find("#audition").remove();
            if (_closeCallback) {
              _closeCallback(true, null, _audioControl, _conf.finger,_panelAudioRefresh);
            }
            _panelAudioRefresh = false;
          },
          end:function () {
            document.body.style.overflow = 'visible';
            if (_uploader) {
              _uploader.reset();
              _uploader.destroy();
            }
          }
        });
      },
      _recoveryBlockByColor = function() {
        var _textForm = _multiRoleTabContent.find('.text-form');
        _textForm.find('span').filter((index, e, array) => !$(e).hasClass('audio-part')).each((index, e) => {
          //console.log("属性丢失:" ,e);
          var targetColor = $(e).getHexBackgroundColor().toUpperCase();
          //console.log("颜色:", targetColor);
          _multiRoleTabContent.find('.role-container .role-block')
          .each((index, ele) => {
            var _tarRole = $(ele).find('.voice-name');
            var _roleColor = _tarRole.attr('colorcontent');
            if (!_roleColor) {
              return;
            }
            if (_roleColor.toUpperCase() != targetColor) {
              return;
            }
            $(e).attr('rolesid', $(ele).attr('id'));
            $(e).attr('voiceid', _tarRole.attr('voiceid'));
            $(e).attr('voicename', $(ele).find('.role-name').text());
          });
          if($(e).css("background-color") != "rgba(0, 0, 0, 0)") {
            $(e).addClass('audio-part');
          }
        });
      },
      _forbidEnter = function() {
        var _textForm = _multiRoleTabContent.find('.text-form');
        _textForm.on('keydown', e => {
          var theEvent = e || window.event;
          var code = theEvent.keyCode || theEvent.which || theEvent.charCode;
          if (code == 13) {
            e.cancelBubble=true;
            e.preventDefault();
            e.stopPropagation();
          }
        });
      },
      _initDeleteBtn = function() {
        var _textForm = _multiRoleTabContent.find('.text-form');
        _textForm.on('keyup', e => {
          var theEvent = e || window.event;
          var code = theEvent.keyCode || theEvent.which || theEvent.charCode;
          if (code == 8) {
            _recoveryBlockByColor();
            _textEditable();
            _editor.selection.restoreSelection();
          }
        });
        _textForm.on('keydown', e => {
          var theEvent = e || window.event;
          var code = theEvent.keyCode || theEvent.which || theEvent.charCode;
          if (code == 8) {
            _recoveryBlockByColor();
            _textEditable();
            _editor.selection.restoreSelection();
          }
        });
      },
      _mockUseDBTTS = function () {
        _ttsTabContent.find('#useIntelligenceTTS').attr('checked', false);
        _ttsTabContent.find('#useDBTTS').attr('checked', 'checked');
        _ttsTabContent.find('#checkDBtts').css('display', 'none');
        _ttsTabContent.find('#intelligenceTTS').css('display', 'none');
        _ttsTabContent.find('#speakerArea').css('display', 'none');
        _ttsTabContent.find("#DBspeakerArea").css('display', 'none');
        _ttsTabContent.find("#DBspeakerArea .speaker-container input[value='3']").click();
      },
      _initReverse = function () {
        _root.find('.w-e-text').keydown(function (event) {
          if (event.ctrlKey && event.keyCode == 90) {//ctrl+z
            if (_type = 3) {
              event.preventDefault();
              return false;
            }
          }
        });
      },
      _initRealManSave = function () {
        _realManTabContent.find("#saveBtn").click(function () {
          console.log('ddddddddddd');
          if (_closeCallback) {
            var data = _getData();
            if (data.tempFileName == "") {
              layer.msg("请上传mp3文件", {time: 1000});
              return false;
            }
            _closeCallback(false, _getData(), _audioControl);
            _clear();
            layer.close(_voiceEditorDialogIndex);
          }
          wantong.cms.pageAdd.voiceManager.drapAudio();
        });
      },
      _getData = function () {
        if (_type == 0) {
          return {
            type: _type,
            originFileName: _uploadMP3File.originFileName,
            clientFileName: _uploadMP3File.clientFileName,
            tempFileName: _uploadMP3File.tempFileName
          };
        } else if (_type == 1) {
          return {
            type: _type,
            tempFileName: _ttsData.tempFileName,
            clientFileName: _ttsData.clientFileName,
            ttsText: _ttsData.text,
            ttsParameters: JSON.stringify({
              chSpeaker: _ttsData.chSpeaker,
              useIntelligenceTTS: _ttsData.useIntelligenceTTS,
              useDBTTS: _ttsData.useDBTTS
            })
          };
        } else if (_type == 3) {
          var fileName = _ttsData.text.replace("<figure>","").replace("</figure type=ordinal>","")
          .replace("</figure type=digit>","").replace(/\<.*?\>/g,"");
          return {
            type: _type,
            tempFileName: _ttsData.tempFileName,
            //clientFileName: _ttsData.clientFileName,
            clientFileName: fileName.substr(0,4)+".mp3",
            ttsText: _ttsData.text,
            audios: _DbMergeAudioData.audios,
            ttsParameters: JSON.stringify({
              chSpeaker: _ttsData.chSpeaker,
              useIntelligenceTTS: _ttsData.useIntelligenceTTS,
              useDBTTS: _ttsData.useDBTTS
            })
          };
        }
      },
      _openRoleSelect = function (dom) {
        var contentHtml = _multiRoleTabContent.siblings("#roleSelect").prop(
            'innerHTML');
        _roleSelectContentIndex = layer.open({
          title: "添加角色",
          type: 1,
          maxmin: false,
          resize: false,
          area: ['650px', '600px'],
          scrollbar: false,
          fix:true,
          content: contentHtml,
          success: function (layero, index) {
            console.log(layero);
            _rolesObject=layero;
            _initChangeRoleMenu(dom, layero);
            _initChenckRolesPanel(dom, layero);
            _lisenterInputChechk();
            _initAddRolePanelAndEvent(layero);
          },
          cancel: function () {
            if (dom.attr("voiceid") == "") {
              dom.parents(".role-block").remove();
              console.log('cancle role');
            }
            // if (_audioControl) {
            //   _audioControl.pause();
            // }
            layer.close(_roleSelectContentIndex);
          }
        });
      },
      _initChenckRolesPanel = function (dom, layero) {
        var voiceid = 0;
        var name = "";
        let commonContent =  $(layero).find("#commonTabContent");
        let highContent = $(layero).find("#highTabContent");
        let highTab = $(layero).find("#highTab_1");
        let commonTab = $(layero).find("#commonTab_0");
        if (dom.attr("voiceid") != "") {
          name = dom.parents(".role-block").find(".role-name").attr("name");
          voiceid = dom.attr("voiceid");
          layero.find("#nameInput").val(name);
          if(parseInt(voiceid) > 3000){
            if(highTab.length > 0){
              commonTab.removeClass("active");
              highTab.addClass("active");
              highContent.css("display","");
              commonContent.css("display","none");
            }
          }
          layero.find(".select-wrapper input").each(function () {
            var tempvalue = $(this).attr("value");
            if (tempvalue == voiceid) {
              $(this).attr("checked", true);
            }
          });
        }
      },
      _initChangeRoleName = function (dom) {
        var id = dom.parents(".role-block").attr("id");
        if (id == undefined) {
          dom.attr("name", dom.val());
        } else {
          $(".w-e-text").find("span").each(function () {
            if ($(this).attr("rolesid") == id) {
              $(this).attr("voicename", dom.parents(".role-block").find(".role-name").text());
              $(this).attr("rolesid",id);
            }
          });
        }
      },
      _initAuditionHover = function () {
        var tabelShow = null;
        var tipShow = null;
        var delyTime = 200;
        $(".w-e-text").find("span").off("mouseleave").on("mouseleave",
            function () {
              tipShow = setTimeout(function () {
                $("#audition").css("display", "none");
              }, delyTime);
              _initaudioPlayHover(tipShow);
            });

        $(".w-e-text").on("mousewheel",function () {
          $("#audition").css("display", "none");
        });
        $(".w-e-text").on("keyup",function (e) {
          $("#audition").css("display", "none");
        });

        $(".w-e-text").find("span").off("mouseover").on("mouseover",
            function (e) {
              var seat = $(this);
              tabelShow = setTimeout(function () {
                showTip(seat, e);
                //设置选中的内容到全局变量
                _selectContent = seat;
              }, delyTime);
            });

      },
      showTip = function (seat, e) {
        var seatVoiceName = seat.attr("voicename");
        if(seatVoiceName == undefined){
          return;
        }
        var length = seatVoiceName.length;
        $("#audio_player").css("width",length*15);
        $("#audition").find("span")[0].innerHTML = seatVoiceName;
        $("#audition").css("display", "inline-block");
        $("#audition").css("top", e.clientY-35);
        $("#audition").css("left", e.clientX);
        $("#audition").css("z-index", "99999999");

        $("#audition").find(".audio-play").off("click").on("click",
            function () {
              if(_audioControl){
                _audioControl.pause();
              }
              var select = _initDomFromat(seat);
              if(select.text().length>256){
                layer.msg("单条角色的合成语音长度不能超过256个字");
                return;
              }
              var fileName = select.attr("filename");
              var voiceId = select.attr("voiceid");
              var content = _ContentFormatting(select.html());
              if (_aSingleVoiceIsChange(fileName, voiceId, content)) {
                fileName = "";
                content = content.replace(/&nbsp;/g, "");

                _generateAuditionTTS(voiceId, content, fileName, (e) => {
                  seat.attr("filename", e);
                  _playAuditionTTSAudio(e);
                })
              } else {
                _playAuditionTTSAudio(fileName);
              }

            });


      },
      _aSingleVoiceIsChange = function (file, voiceId, content) {
        if (file == undefined || file == "") {
          return true;
        } else {
          if (confAudio.audios == undefined) {
            return true;
          }
          for (var i = 0; i < confAudio.audios.length; i++) {
            if (confAudio.audios[i].file == file) {
              if (confAudio.audios[i].voiceId != voiceId
                  || confAudio.audios[i].text != content) {
                return true;
              }
            } else {
              if (confAudio.audios[i].voiceId != voiceId
                  || confAudio.audios[i].text != content) {
                return true;
              }
            }
          }
          return false;
        }
      },
      _initDomFromat = function (dom) {
        var temp = dom.clone();
        temp.find(".ordinal").each(function () {
          var temp = "[figure]" + $(this).text() + "[/figure type=ordinal]";
          $(this).replaceWith(temp);
        });
        temp.find(".cnphone").each(function () {
          var temp = $(this).text() + "[cnphone py=" + $(this).attr("tonevalue")
              + "]"
          $(this).replaceWith(temp);
        });
        temp.find(".digit").each(function () {
          var temp = "[figure]" + $(this).text() + "[/figure type=digit]";
          $(this).replaceWith(temp);
        });
        return temp;
      },
      _ContentFormatting = function (content) {
        // var temp = content.replace(/\[/g, "<").replace(/\]/g, ">").replace(
        //     /&nbsp;/g, "");
        var temp1=content.replace(/\[figure]/g,"<figure>");
        var temp2=temp1.replace(/\[\/figure type=digit]/g,"</figure type=digit>");
        var temp3=temp2.replace(/\[\/figure type=ordinal]/g,"</figure type=ordinal>");
        var temp4=temp3.replace(/\[cnphone py=(.*?)]/g ,function (match,p1) {
          return '<cnphone py='+p1+'>';
        });
        return temp4;
      },
      _initaudioPlayHover = function (tipShow) {
        var delyTime = 200;
        $("#audition").off("mouseover").on("mouseover", function () {
          console.log("clear");
          clearTimeout(tipShow);
        });
        $("#audition").off("mouseleave").on("mouseleave", function () {
          tipShow = setTimeout(function () {
            $("#audition").css("display", "none");
          }, delyTime);
        });
      },
      _initChangeRoleMenu = function (dom, layero) {
        $(".listen-form").find(".btn").off("click").on("click", function () {
          $(this).blur();
          var content = $(this).parents(".listen-form").find("span").text();
          var voiceId = $(this).parents(".select-wrapper").find(
              "input[name='sex']:checked").val();
          if (content.length == 0) {
            layer.msg("内容不能为空");
            return;
          }
          if(voiceId==undefined){
            layer.msg("请先选择发音角色");
            return;
          }
          if(_audioControl){
            _audioControl.pause();
          }
          _setSelectRolesPanelGenerateBtn();
          _generateAuditionTTS(voiceId, content, "",
              (e) => _playAuditionTTSAudio(e));
        });
        $(".btn-container").find("#notarize").on("click", function () {
          var voiceId = layero.find(".select-wrapper").find(
              "input[name='sex']:checked").val();
          var color = layero.find(".select-wrapper").find(
              "input[name='sex']:checked").attr("colorcontent");
          var roleLabelName = layero.find("#nameInput").val();

          if (roleLabelName == undefined || roleLabelName.replace(/^\s+$/,"") == "") {
            layer.msg("请输入角色名称");
            return;
          }
          if (voiceId == undefined) {
            layer.msg("请选择音色");
            return;
          }
          var name = layero.find(".select-wrapper").find(
              "input[name='sex']:checked")[0].nextSibling.nodeValue;


          //判断是不是第一个初始值
          if (dom.attr("voiceid") == "") {
            dom.text(name);
            dom.attr("voiceid", voiceId);
            dom.attr("colorcontent", color);
            dom.parents(".role-block").find(".role-name").html(roleLabelName);
            dom.parents(".role-block").find(".role-name").attr("name",
                roleLabelName);
            dom.parents(".role-block").find(".voice-color").css("background-color",color);
            //停掉试听的音频播放
            if (_audioControl) {
              $('.voice-editor-btn-stop').click();
            }
            _saveBookRoles(dom);
            layer.close(_roleSelectContentIndex);

          } else {
            if(voiceId==dom.attr("voiceid") && roleLabelName ==dom.parents(".role-block").find(".role-name").html() ){
              layer.close(_roleSelectContentIndex);
            } else if(voiceId==dom.attr("voiceid") && roleLabelName!=dom.parents(".role-block").find(".role-name").html()){
              dom.parents(".role-block").find(".role-name").text(roleLabelName);
              dom.parents(".role-block").find(".role-name").attr("name", roleLabelName);
              _saveBookRoles(dom);
            }else{
              _saveRolesHint(name, voiceId, color, roleLabelName, dom);
            }
            //停掉试听的音频播放
            if(_audioControl){
              $('.voice-editor-btn-stop').click();
            }
            layer.close(_roleSelectContentIndex);
          }

        });
        $(".btn-container").find("#cancel").off("click").on("click",
            function () {

              if (dom.attr("voiceid") == "") {
                dom.parents(".role-block").remove();
                if (_audioControl) {
                  _audioControl.pause();
                }
                layer.close(_roleSelectContentIndex);
              } else {
                layero.find(".select-wrapper").find(
                    "input[name='sex']:checked").attr("checked", false);
                if (_audioControl) {
                  _audioControl.pause();
                }
                layer.close(_roleSelectContentIndex);
              }

            });
      },
      _setSelectRolesPanelBtn=function(){
        if(_rolesObject != null) {
          var auditionBtn = _rolesObject.find(".listen-form .btn-primary");
          auditionBtn.html(
              "<img src='/static/images/soundplaying.gif' width='15' height='15'>播放中..");
          auditionBtn.find("img").css("display", "inline");
        }
        _checkRolesPlayingAudioStatusHandler= setInterval(_checkRolesAudio, 50)
      },
      _lisenterInputChechk = function(){
        $("input[type='radio']").on("click",function () {
          if(_audioControl){
            _audioControl.pause();
          }
          var auditionBtn = _rolesObject.find(".listen-form .btn-primary");
          auditionBtn.text("发音试听");
          auditionBtn.removeAttr("disabled");

        });
      },
      //初始化界面的选择音色的
      _initAddRolePanelAndEvent = function(dom){
          let highContent =  $(dom).find("#highTabContent");
          let commonContent = $(dom).find("#commonTabContent");
          let highTab = $(dom).find("#highTab_1");
          let commonTab = $(dom).find("#commonTab_0");
          $(dom).find("li").off("click").on("click",function () {
              let index = parseInt($(this).attr("index"));
              if(index === 0){
                $(this).addClass("active");
                if(highTab.length > 0) {
                  highTab.removeClass("active");
                }
                commonContent.css("display","");
                if(highContent.length > 0){
                  highContent.css("display","none");
                }
              } else {
                $(this).addClass("active");
                commonTab.removeClass("active");
                commonContent.css("display","none");
                if(highContent.length > 0){
                  highContent.css("display","");
                }
              }
          });
      },
      _setSelectRolesPanelGenerateBtn=function(){
        var auditionBtn=_rolesObject.find(".listen-form .btn-primary");
        auditionBtn.text("语音合成中...");
        auditionBtn.attr("disabled", "disabled");
      },
      _saveRolesHint=function(name,voiceId,color,roleLabelName,dom){
        layer.confirm('更换后，使用该发音的文本会被替换为新的音色，确定更换吗？', {
          btn: ['确定','取消'] //按钮
        }, function(){
          dom.text(name);
          dom.attr("voiceid", voiceId);
          dom.attr("colorcontent", color);
          var roleid = dom.parents(".role-block").attr("id");
          dom.parents(".role-block").find(".role-name").html(roleLabelName);
          dom.parents(".role-block").find(".role-name").attr("name",
              roleLabelName);
          dom.parents(".role-block").find(".voice-color").css("background-color",color);
          $(".w-e-text").find("span").each(function () {
            if ($(this).attr("rolesid") == roleid) {
              $(this).attr("voicename", roleLabelName);
              $(this).attr("voiceid", voiceId);
              $(this).css("background-color", color);
              $(this).attr("filename", "");
            }
          });
          _saveBookRoles(dom);
          if (_audioControl) {
            _audioControl.pause();
          }
        }, function(){

        });
      },
      _initRightClickMenu = function () {
        _hideAllPlayBtn = function () {
          $('.layui-layer').find('#roleText .audio-play').each(function () {
            $(this).css('display', 'none');
          });
        }
        $(".role-name").off("blur").on("blur", function () {
          _initChangeRoleName($(this));
        });
        $('.text-form').off("click").on('click', function () {
          _hideAllPlayBtn();
        });

        $('.text-form').off("blur").on('blur', function () {
          _hideAllPlayBtn();
        });

        $(".role-name").off("blur").on("blur", function () {
          var text = $(this).val();
          text = text.replace(/\s+/g, "");
          if (text == "") {
            $(this).focus();
            $(this).val("");
            return;
          }
          //先判断不能与其他名字相同

          var voiceid = $(this).parents(".role-block").find(".voice-name").attr(
              "voiceid");
          if (voiceid != "") {

          } else {
            console.log("voiceid" + voiceid);
          }
        });

        $('.voice-name').off("click").on('click', function () {
          _openRoleSelect($(this));
          if(_audioControl){
            _audioControl.pause();
          }
          //_multiRoleTabContent.find("#previewBtn").text("试听");
          _multiRoleTabContent.find("#previewBtn").removeAttr("disabled");
          _multiRoleTabContent.find("#saveBtn").attr("disabled","disabled");
        });

        $('.audio-play').off("click").on('click', function (e) {
          e.stopPropagation();
        });

        console.log($('body').find("#contextMenu").length + "length");
        //解决方案

        $('.layui-layer-content .audio-part').contextmenu({
          target: '#contextMenu',
          before: function (e) {

            console.log('audio-wake');
            var html = "";
            var roleId=0;
            var startDom= _editor.selection.getSelectionStartElem()[0];
            var endstartDom=_editor.selection.getSelectionEndElem()[0];
            if(startDom==endstartDom && $(startDom).prop("nodeName")!="P" && $(endstartDom).prop("nodeName")!="P"){
              roleId = $(startDom).attr("rolesid");
            }else {
              if(_checkDomSite(startDom,endstartDom)){
                if($(startDom).attr("class")=="audio-part"){
                  roleId=$(startDom).attr("rolesid")
                }else {
                  roleId=$(startDom).parents(".audio-part").attr("rolesid")
                }
              }
            }
            $("#voiceEditor").find(".role-block").each(function () {
              if ($(this).find(".voice-name").attr("voiceid") != "") {
                if(roleId!=$(this).attr("id")) {
                  html += '<li><a tabindex=-1 class="roles" id="role" colorcontent='
                      + $(this).find(".voice-name").attr("colorcontent")
                      + '  rolesid=' + $(this).attr("id")
                      + ' voiceId=' + $(this).find(".voice-name").attr(
                          "voiceid") + '>' + $(this).find(".role-name").text()
                      + '</a></li> ';
                }else {
                  html+='<li><a tabindex=-1 style="display: inline-block" class="roles" id="role" colorcontent='
                      + $(this).find(".voice-name").attr("colorcontent")
                      + '  rolesid=' + $(this).attr("id")
                      + ' voiceId=' + $(this).find(".voice-name").attr(
                          "voiceid") + '>' + $(this).find(".role-name").text()
                      +'<span class="glyphicon glyphicon-ok" style="margin-left: 14px"></span>'+'</a></li> ';
                }
              }
            });
            var selectVal = _editor.selection.getSelectionText();
            if (!isNaN(selectVal)) {
              if (selectVal != "") {
                $("#contextMenu").find("ul").remove();
                if ($("#contextMenu").find("ul").length == 0) {
                  $("#contextMenu").append('<ul class="dropdown-menu"></ul>');
                }
                $("#contextMenu").find("ul").find("li").remove();
                $("#contextMenu").find("ul").append(
                    '<li><a tabindex="-1" class="parentMenu" id="numRead" recordType="1">数字读法</a></li>'
                    + '<li><a tabindex="-1" class="parentMenu" id="telegram" recordType="1">电报读法</a></li>');
              } else {
                $("#contextMenu").find("ul").remove();
              }
            } else if (selectVal.length == 1) {
              $("#contextMenu").find("ul").remove();
              $("#contextMenu").append('<ul class="dropdown-menu" ></ul>');
              var tempHtml = "";
              if (html != "") {
                tempHtml = '<ul class="dropdown-menu" style="height:auto;max-height:300px;overflow-y:scroll">' + html + '</ul>';
              }
              var reg=/^((?![\u3000-\u303F])[\u2E80-\uFE4F]|\·)*(?![\u3000-\u303F])[\u2E80-\uFE4F](\·)*$/;
              var reg1= /[`!@#$%^&*()_+<>?:"{},.\/;'[\]]/;

              if($(_editor.selection.getSelectionStartElem()[0]).prop("nodeName")=="P" || !reg.test(selectVal)){
                if(!reg1.test(selectVal)) {
                  $("#contextMenu").find("ul").append(
                      '<li><a tabindex="-1" class="parentMenu" id="rolechange">发音角色   ></a>'
                      + tempHtml + '</li>');
                }else {
                  $("#contextMenu").find("ul").remove();
                  layer.msg("不能单独操作符号");
                  return;
                }
              }else {
                $("#contextMenu").find("ul").append(
                    '<li><a tabindex="-1" class="parentMenu" id="tone" >变音</a></li>'
                    + '                <li><a tabindex="-1" class="parentMenu" id="rolechange">发音角色   ></a>'
                    + tempHtml + '</li>');
              }
              console.log("2");

            } else {
              $("#contextMenu").find("ul").remove();

              $("#voiceEditor").find(".role-block").each(function () {
                if ($(this).find(".voice-name").attr("voiceid") != "") {
                  if ($("#contextMenu").find("ul").length == 0) {
                    $("#contextMenu").append('<ul class="dropdown-menu " style="height:auto;max-height:300px;overflow-y:scroll"></ul>');
                  }
                  var color = "";
                  var tempRoleId = $(this).find(".voice-name").attr("voiceid");

                  for (var i = 0; i < _conf.ttsRoles.length; i++) {
                    if (_conf.ttsRoles[i].voiceId == tempRoleId) {
                      color = _conf.ttsRoles[i].color;
                      break;
                    }
                  }
                  if(roleId!=$(this).attr("id")) {
                    $("#contextMenu").find("ul").append(
                        '<li><a tabindex=-1 id="role" class="roles" colorcontent='
                        + color
                        + '  rolesid=' + $(this).attr("id")
                        + ' voiceId=' + $(this).find(".voice-name").attr(
                        "voiceid") + '>' + $(this).find(".role-name").text()
                        + '</a></li> ')
                  }else {
                    $("#contextMenu").find("ul").append(
                        '<li><a tabindex=-1 style="display: inline-block" id="role" class="roles" colorcontent='
                        + color
                        + '  rolesid=' + $(this).attr("id")
                        + ' voiceId=' + $(this).find(".voice-name").attr(
                        "voiceid") + '>' + $(this).find(".role-name").text()
                        +'<span class="glyphicon glyphicon-ok" style="margin-left: 14px"></span>'+'</a></li> ')
                  }
                }
              });
            }
            _rightBtnContentEditable();
            _textEditable();
            _initReadNumTypeClick();
            _initContextToneMenuClick();
            _initContextRoleMenuClick(selectVal);
            _initMenuHover();
            console.log('text-wake');
            return true;
          },
          onItem: function (context, e) {
            console.log(context);
            this.closemenu();
          }
        });

        $('.layui-layer-content .text-form .w-e-text-container').contextmenu({
          target: '#contextMenu',
          before: function (e) {
            // var selectVal=window.getSelection().toString();
            var html = "";
            var roleId=0;
            var startDom= _editor.selection.getSelectionStartElem()[0];
            var endstartDom=_editor.selection.getSelectionEndElem()[0];
            if(startDom==endstartDom && $(startDom).prop("nodeName")!="P" && $(endstartDom).prop("nodeName")!="P"){

              roleId = $(startDom).attr("rolesid");

            }else{
              if(_checkDomSite(startDom,endstartDom)) {
                if($(startDom).attr("class")=="audio-part"){
                  roleId = $(startDom).attr("rolesid");
                }else {
                  roleId = $(startDom).parents(".audio-part").attr("rolesid");
                }
              }
            }
            $("#voiceEditor").find(".role-block").each(function () {
              if ($(this).find(".voice-name").attr("voiceid") != "") {
                if(roleId!=$(this).attr("id")) {
                  html += '<li><a tabindex=-1 class="roles" id="role" colorcontent='
                      + $(this).find(".voice-name").attr("colorcontent")
                      + '  rolesid=' + $(this).attr("id")
                      + ' voiceId=' + $(this).find(".voice-name").attr(
                          "voiceid") + '>' + $(this).find(".role-name").text()
                      + '</a></li> ';
                }else {
                  html += '<li><a tabindex=-1 style="display: inline-block" class="roles" id="role" colorcontent='
                      + $(this).find(".voice-name").attr("colorcontent")
                      + '  rolesid=' + $(this).attr("id")
                      + ' voiceId=' + $(this).find(".voice-name").attr(
                          "voiceid") + '>' + $(this).find(".role-name").text()
                      +'<span class="glyphicon glyphicon-ok" style="margin-left: 14px"></span>'+ '</a></li> ';
                }
              }
            });
            var selectVal = _editor.selection.getSelectionText();
            if (!isNaN(selectVal)) {
              if (selectVal != "") {
                $("#contextMenu").find("ul").remove();
                $("#contextMenu").append('<ul class="dropdown-menu"></ul>');
                $("#contextMenu").find("ul").append(
                    '<li><a tabindex="-1" class="parentMenu" id="numRead" recordType="1">数字读法</a></li>'
                    + '<li><a tabindex="-1" class="parentMenu" id="telegram" recordType="1">电报读法</a></li>');
              } else {
                $("#contextMenu").find("ul").remove();
              }
            } else if (selectVal.length == 1) {
              $("#contextMenu").find("ul").remove();
              $("#contextMenu").append('<ul class="dropdown-menu" ></ul>');
              var tempHtml = "";
              if (html != "") {
                tempHtml = '<ul class="dropdown-menu" style="height:auto;max-height:300px;overflow-y:scroll">' + html + '</ul>';
              }
              var reg=/^((?![\u3000-\u303F])[\u2E80-\uFE4F]|\·)*(?![\u3000-\u303F])[\u2E80-\uFE4F](\·)*$/;
              var reg1= /[`!@#$%^&*()_+<>?:"{},.\/;'[\]]/;
              if($(_editor.selection.getSelectionStartElem()[0]).prop("nodeName")=="P" || !reg.test(selectVal)){
                if(!reg1.test(selectVal)) {
                  $("#contextMenu").find("ul").append(
                      '<li><a tabindex="-1" class="parentMenu" id="rolechange">发音角色   ></a>'
                      + tempHtml + '</li>');
                }else {
                  $("#contextMenu").find("ul").remove();
                  layer.msg("不能单独操作符号");
                  return;
                }
              }else {

                $("#contextMenu").find("ul").append(
                    '<li><a tabindex="-1" class="parentMenu" id="tone" >变音</a></li>'
                    + '                <li><a tabindex="-1" class="parentMenu" id="rolechange">发音角色   ></a>'
                    + tempHtml + '</li>');
              }
              console.log("2");

            } else {
              $("#contextMenu").find("ul").remove();
              $("#voiceEditor").find(".role-block").each(function () {
                if ($(this).find(".voice-name").attr("voiceid") != "") {
                  if ($("#contextMenu").find("ul").length == 0) {
                    $("#contextMenu").append('<ul class="dropdown-menu" style="height:auto;max-height:300px;overflow-y:scroll"></ul>');
                  }
                  var color = "";
                  var tempRoleId = $(this).find(".voice-name").attr("voiceid");
                  for (var i = 0; i < _conf.ttsRoles.length; i++) {
                    if (_conf.ttsRoles[i].voiceId == tempRoleId) {
                      color = _conf.ttsRoles[i].color;
                      break;
                    }
                  }
                  if(roleId!=$(this).attr("id")) {
                    $("#contextMenu").find("ul").append(
                        '<li><a tabindex=-1 id="role" class="roles" colorcontent='
                        + color
                        + '  rolesid=' + $(this).attr("id")
                        + ' voiceId=' + $(this).find(".voice-name").attr(
                        "voiceid") + '>' + $(this).find(".role-name").text()
                        + '</a></li> ')
                  }else {
                    $("#contextMenu").find("ul").append(
                        '<li><a tabindex=-1 style="display: inline-block" id="role" class="roles" colorcontent='
                        + color
                        + '  rolesid=' + $(this).attr("id")
                        + ' voiceId=' + $(this).find(".voice-name").attr(
                        "voiceid") + '>' + $(this).find(".role-name").text()
                        +'<span class="glyphicon glyphicon-ok" style="margin-left: 14px"></span>'+'</a></li> ')
                  }
                }
              });
              // $("#contextMenu").append($("#recordMenu").find("ul").prop("outerHTML"));
            }
            _rightBtnContentEditable();
            _textEditable();
            _initReadNumTypeClick();
            _initContextToneMenuClick();
            _initContextRoleMenuClick(selectVal);
            _initMenuHover();
            console.log('text-wake');
            return true;
          },
          onItem: function (context, e) {
            console.log(context);
            this.closemenu();
          }
        });

      },
      _checkDomSite=function(start,end){
        if($(start).attr("class")=="audio-part"){
          if($(end).attr("class")=="cnphone" || $(end).attr("class")== "digit" || $(end).attr("class") =="ordinal"){

            if($(end).parents(".audio-part").prop("outerHTML")==$(start).prop("outerHTML")){
              return true;
            }else {
              return false;
            }
          }else {
            return false;
          }
        }else {
          if($(end).attr("class")=="audio-part"){
            if($(start).parents(".audio-part").prop("outerHTML")==$(end).prop("outerHTML")){
              return true;
            }else {
              return false;
            }
          }else {
            if($(start).parents(".audio-part").prop("outerHTML")==$(end).parents(".audio-part").prop("outerHTML")){
              return true;
            }else {
              return false;
            }
          }
        }
      },
      _initSpanBtnDown = function () {
        $(".w-e-text").on("mousedown", "span", function (e) {
          if (e.button == 0) {
            _mouseMove = true;
          }
        });
        $(".w-e-text").on("mousemove", "span", function () {
          if (_mouseMove) {
            if($(this).attr("class")!= "cnphone") {
              $(this).attr("contenteditable", "true");
            }
          }
        });
        $(".w-e-text").on("mouseup", function (e) {
          if (document.getSelection() != "") {
            _mouseMove = false;
            _textEditable();
            _mouseMoveClick = true;
          } else {
            _mouseMoveClick = false;
          }

        });
      },
      _initMenuHover = function () {
        var contentMenu = $("#contextMenu");
        contentMenu.find(".parentMenu").next(".dropdown-menu").css("display",
            "none");
        contentMenu.find(".parentMenu").mouseover(function () {
          contentMenu.find(".parentMenu").next(".dropdown-menu").css("display",
              "none");
          if ($(this).next(".dropdown-menu")) {
            $(this).next(".dropdown-menu").css("display", "block");
            $(this).next(".dropdown-menu").css("top", 22);
            $(this).next(".dropdown-menu").css("left", "100%");
          }
        });
      },
      _initReadNumTypeClick = function () {
        var contentMenu = $("#contextMenu");
        contentMenu.find("#numRead").off("click").on("click", function () {
          if (_editor.selection.getSelectionStartElem()[0]
              != _editor.selection.getSelectionEndElem()[0]) {
            layer.msg("只能操作一个角色的读法");
            return;
          }
          if ($(_editor.selection.getSelectionStartElem()[0]).parents().prop(
              "nodeName") == "DIV") {
            layer.msg("请给内容添加角色后再操作数字的读法");
            return;
          }
          var dom = _editor.selection.getSelectionStartElem()[0];
          if ($(dom).attr("class") == "digit") {
            _editor.cmd.do('underline');
            $(_editor.selection.getSelectionStartElem()[0]).css(
                "text-decoration-line", "");
          } else if ($(dom).attr("class") == "ordinal") {
            $(dom).attr("class", "digit");

          } else {
            _editor.cmd.do('underline');
            if($(_editor.selection.getSelectionStartElem()[0]).attr("class")=="audio-part"){
              var content=$(_editor.selection.getSelectionStartElem()[0]).text();
              var html='<span style="" class="digit" contenteditable="false">'+content+'</span>';
              $(_editor.selection.getSelectionStartElem()[0]).html(html);
              $(_editor.selection.getSelectionStartElem()[0]).css(
                  "text-decoration-line", "");
            }else {
              $(_editor.selection.getSelectionStartElem()[0]).css(
                  "text-decoration-line", "");
              _editor.selection.getSelectionStartElem()[0].setAttribute("class",
                  "digit");
            }

          }
          // _numReadKeyUpEvent($(_editor.selection.getSelectionStartElem()[0]));
          _editorBlur();
        });
        contentMenu.find("#telegram").off("click").on("click", function () {
          $(this).blur();

          if (_editor.selection.getSelectionStartElem()[0]
              != _editor.selection.getSelectionEndElem()[0]) {
            layer.msg("只能操作一个角色的读法");
            return;
          }
          if ($(_editor.selection.getSelectionStartElem()[0]).parents().prop(
              "nodeName") == "DIV") {
            layer.msg("请给内容添加角色后再操作数字的读法");
            return;
          }
          var dom = _editor.selection.getSelectionStartElem()[0];
          if ($(dom).attr("class") == "ordinal") {
            _editor.cmd.do('underline');
            $(_editor.selection.getSelectionStartElem()[0]).css(
                "text-decoration-line", "");

          } else if ($(dom).attr("class") == "digit") {
            $(dom).attr("class", "ordinal");
          } else {
            _editor.cmd.do('underline');
            if($(_editor.selection.getSelectionStartElem()[0]).attr("class")=="audio-part"){
              var content=$(_editor.selection.getSelectionStartElem()[0]).text();
              var html='<span style="" class="ordinal" contenteditable="false">'+content+'</span>';
              $(_editor.selection.getSelectionStartElem()[0]).html(html);
              $(_editor.selection.getSelectionStartElem()[0]).css(
                  "text-decoration-line", "");
            }else {
              $(_editor.selection.getSelectionStartElem()[0]).css(
                  "text-decoration-line", "");
              _editor.selection.getSelectionStartElem()[0].setAttribute("class",
                  "ordinal");
            }
          }
          // _numReadKeyUpEvent($(_editor.selection.getSelectionStartElem()[0]));
          _editorBlur();
        });

      },
      _numReadKeyUpEvent=function(){
        //监听digit class的span的输入
        $(".w-e-text").on('DOMCharacterDataModified',".digit", function (e) {
          var reg= /^\d+(\.\d+)?$/;
          var regNeg = /^(-(([0-9]+\.[0-9]*[1-9][0-9]*)|([0-9]*[1-9][0-9]*\.[0-9]+)|([0-9]*[1-9][0-9]*)))$/;
          if(!reg.test($(this).text()) && !regNeg.test($(this).text())) {
            layer.msg("请输入数字");
            var val = $(this).text().replace(/[^0-9]/ig, "");
            $(this).text(val);
          }
        });

        $(".w-e-text").on('DOMCharacterDataModified',".ordinal", function (e) {
          var reg= /^\d+(\.\d+)?$/;
          var regNeg = /^(-(([0-9]+\.[0-9]*[1-9][0-9]*)|([0-9]*[1-9][0-9]*\.[0-9]+)|([0-9]*[1-9][0-9]*)))$/;
          if(!reg.test($(this).text()) && !regNeg.test($(this).text())) {
            layer.msg("请输入数字");
            var val = $(this).text().replace(/[^0-9]/ig, "");
            $(this).text(val);
          }
        });

      },
      _editorBlur = function () {
        _editor.selection.collapseRange();
        $(".w-e-text").find("span").each(function () {
          $(this).attr("contenteditable", false);
        });
      },
      _textEditable = function () {
        $(".w-e-text").find("span").each(function () {
          if ($(this).attr("contenteditable") == "false" && $(this).attr("class") != "cnphone") {
            $(this).attr("contenteditable", true);
          }
        });
      },
      _initContextToneMenuClick = function () {
        var contentMenu = $("#contextMenu");

        contentMenu.find("#tone").off("blur").on("blur", function () {

          var content = _multiRoleTabContent.siblings("#toneSelect").prop(
              'innerHTML');
          _toneLayerIndex = layer.open({
            title: "变音",
            type: 1,
            maxmin: false,
            resize: false,
            area: ['400px', '200px'],
            scrollbar: false,
            content: content,
            success: function (layero, index) {
              _toneDom = layero;
              _initSaveToneBtnClick();

            },
            cancel: function () {
              console.log('cancle role');
              layer.close(_toneLayerIndex);
              _editorBlur();
            }
          });
        });
      },
      _initSaveToneBtnClick = function () {
        $(".layui-layer-content").find(".col-md-12").find("#saveTone").off(
            "click").on("click",
            function () {
              var toneVal = $(_toneDom).find("#toneval").val();
              var toneNum = $(_toneDom).find('#toneNum option:selected').attr(
                  "value");
              console.log("toneVal:" + toneVal + "toneNum" + toneNum);

              if (toneVal == "") {
                layer.msg("拼音不能为空");
                return;
              }
              if (toneNum == -1) {
                layer.msg("请选择声调");
                return;
              }
              if ($(_editor.selection.getSelectionContainerElem()[0]).attr(
                  "class") == "cnphone") {
                var dom = _editor.selection.getSelectionStartElem()[0];
                dom.setAttribute("class", "cnphone");
                if (toneNum != 0) {
                  dom.setAttribute("tonevalue", toneVal + toneNum);
                } else {
                  dom.setAttribute("tonevalue", toneVal + 5);
                }
              } else {
                _editor.cmd.do("bold");
                var dom = _editor.selection.getSelectionStartElem()[0];
                if($(dom).text().length==1 && $(dom).parents().prop("nodeName")=="P"){
                  $(dom).css("font-weight","");
                  $(dom).attr("class","audio-part");
                  var py="";
                  if (toneNum != 0) {
                    py=toneVal+toneNum;
                  } else {
                    py= toneVal + 5;
                  }
                  var text=$(dom).text();
                  $(dom).text("");
                  $(dom).append('<span style="font-weight: bold;" class="cnphone" tonevalue='+ py+' contenteditable="false">'+text+'</span>');

                }else {
                  dom.setAttribute("class", "cnphone");
                  if (toneNum != 0) {
                    dom.setAttribute("tonevalue", toneVal + toneNum);
                  } else {
                    dom.setAttribute("tonevalue", toneVal + 5);
                  }
                }
              }

              layer.close(_toneLayerIndex);
              _editorBlur();
            });
        $(".layui-layer-content").find(".col-md-12").find("#cancelTone").off(
            "click").on("click",
            function () {
              layer.close(_toneLayerIndex);
              _editorBlur();
            });
      },
      _initContextRoleMenuClick = function (selectText) {
        var contentMenu = $("#contextMenu");
        contentMenu.find(".roles").off("click").on("click", function () {
          $(this).blur();
          var isNumChange = false;
          _textEditable();
          var voiceId = $(this).attr("voiceid");
          var voiceName = $(this)[0].innerHTML.replace(/<span class="glyphicon glyphicon-ok" style="margin-left: 14px"><\/span>/,"");
          var rolesid = $(this).attr("rolesid");
          var color = $(this).attr("colorcontent");
          if(!_checkNumhandle()){
            layer.msg("暂不支持该操作");
            return;
          }
          _editor.cmd.do('backColor', $(this).attr("colorcontent"));
          // var selectDom = _editor.selection.getSelectionStartElem()[0];
          var tempSelectDom= _editor.selection.getSelectionContainerElem()[0];
          var resultObj = _setExceptionalCase(tempSelectDom,color,rolesid,voiceId,voiceName);
          if(resultObj != null){
            tempSelectDom = resultObj;
          }
          var selectDom = _setsElementAttributes(tempSelectDom,voiceId,voiceName,rolesid,color);
          _getsAdjacentIdenticalElements(selectDom,color,rolesid,voiceId,voiceName);
          _clearNullAudioPart();
          _editorBlur();
          _initAuditionHover();
        });
      },
      _ToRGB = function hexToRgb(hex) {
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return "rgb("+parseInt(result[1], 16)+", "+parseInt(result[2], 16)+", "+parseInt(result[3], 16)+")";
      },
      _rightBtnContentEditable = function(){
        _multiRoleTabContent.find(".w-e-text span .cnphone").each(function () {
          $(this).attr("contenteditable",true);
        });
      },
      _clearNullAudioPart=function(){
        _multiRoleTabContent.find(".w-e-text").find("span[class='audio-part']").each(function () {
          if($(this).text()==""){
            $(this).remove();
          }
        }) ;
      },
      _checkNumhandle=function(){
        if ($(_editor.selection.getSelectionStartElem()[0]).attr("class")
            == "digit" || $(_editor.selection.getSelectionEndElem()[0]).attr(
                "class") == "digit") {
          return false;
        }
        if ($(_editor.selection.getSelectionStartElem()[0]).attr("class")
            == "ordinal" || $(
                _editor.selection.getSelectionEndElem()[0]).attr("class")
            == "ordinal") {

          return false;
        }
        return true;
      },
      _checkSelectDomParent=function(selectDom,endSelectDom){
        if($(selectDom).attr("class")=="cnphone" && $(endSelectDom).attr("class")=="cnphone"){
          if($(selectDom).parents(".audio-part").attr("rolesid")==$(endSelectDom).parents(".audio-part").attr("rolesid")){
            if(selectDom!=endSelectDom) {
              return $(selectDom).parents(".audio-part")[0];
            }
          }
        }else if($(selectDom).attr("class")=="cnphone" && $(endSelectDom).attr("class")=="audio-part"){
          if($(selectDom).parents(".audio-part").attr("rolesid")==$(endSelectDom).attr("rolesid")){
            if(selectDom != endSelectDom) {
              return endSelectDom;
            }
          }
        }
        return selectDom;
      },
      _initEditorAudioBtn = function () {
        $(".w-e-text").on("click", "span", function (e) {
          if($(this).attr("class") != "cnphone") {
            $(this).attr("contenteditable", true);
          }
          e.stopPropagation();
        });
        $(".w-e-text").on("click", function (e) {
          if (!_mouseMoveClick && e.button != 2) {
            _editorBlur();
          }

          _mouseMoveClick = false;
        });
      },
      _initTabSwitch = function (enableTTS, titleOfUploadPanel) {
        _realManTab = _root.find("#tab_0");
        _realManTab.find("a").text(titleOfUploadPanel);
        _ttsTab = _root.find("#tab_1");
        _multiRoleTab = _root.find("#tab_3");
        //初始化语音状态
        // _initVoiceAuthority();
        if (!enableTTS) {
          _ttsTab.hide();
          _multiRoleTab.hide();
        }
        _realManTabContent = _root.find("#tab_0_content");
        _ttsTabContent = _root.find("#tab_1_content");
        _multiRoleTabContent = _root.find("#tab_3_content");

        function activeRealManTab() {
          stopTTSAudio();
          _realManTabContent.show();
          _ttsTabContent.hide();
          _multiRoleTabContent.hide();
          _realManTab.addClass("active");
          _ttsTab.removeClass("active");
          _multiRoleTab.removeClass("active");
          _type = 0;
          if(_uploader != null) {
            _uploader.refresh();
          }
        }

        function stopTTSAudio() {
          if (_audioControl) {
            _audioControl.pause();
            _ttsTabContent.find("#previewBtn").text("试听");
          }
        }

        function activeMultiRoleTab() {

          _realManTabContent.hide();
          _ttsTabContent.hide();
          _multiRoleTabContent.show();
          _ttsTab.removeClass("active");
          _realManTab.removeClass("active");
          _multiRoleTab.addClass("active");
          //初始化页面
          _type = 3;
        }

        function activeTTSTab() {
          console.log('tts active');
          _realManTabContent.hide();
          _multiRoleTabContent.hide();
          _ttsTabContent.show();
          _ttsTab.addClass("active");
          _realManTab.removeClass("active");
          _multiRoleTab.removeClass("active");
          _type = 1;
          _mockUseDBTTS();
            if ( _ttsData.type != 3) {
              _ttsTabContent.find("#saveBtn").attr("disabled", "disabled");
              _ttsTabContent.find("#text").val(_ttsData.ttsText);
              _ttsTabContent.find("#useDBTTS").prop("checked", true);
              _ttsTabContent.find("#speakerArea").hide();
              setTimeout(function () {
                  _ttsTabContent.find("#text").attr("placeholder",
                      "文本不能超过256个字数");
                  _ttsTabContent.find("#text").attr("maxlength", "256");
                  _maxFontSize = 256;
                }, 20);
            } else {
            }

          }


        function hideAllTab() {
          _realManTabContent.hide();
          _multiRoleTabContent.hide();
          _ttsTabContent.hide();
        }

        if (_type == 0) {
          _updateUploadFileName(_uploadMP3File.clientFileName);
          activeRealManTab();
        } else if (_type == 1) {
          activeTTSTab();
        } else if (_type == 3) {
          activeMultiRoleTab();
        } else if(_type == 4){
          hideAllTab();
        }

        _realManTab.on("click", function () {
          activeRealManTab();
        });

        _ttsTab.on("click", function () {
          if (_audioControl) {
            _audioControl.pause();
            //_multiRoleTabContent.find("#previewBtn").text("试听");
            _multiRoleTabContent.find("#previewBtn").removeAttr("disabled");
            _multiRoleTabContent.find("#saveBtn").attr("disabled", "disabled")

          }
          activeTTSTab();
        });

        _multiRoleTab.on("click", function () {
          if (_audioControl) {
            _audioControl.pause();
            _ttsTabContent.find("#previewBtn").text("试听");
            _ttsTabContent.find("#previewBtn").removeAttr("disabled");
            _ttsTabContent.find("#saveBtn").attr("disabled", "disabled");
          }
          activeMultiRoleTab();
        });
      },
      _initTab3Panel = function () {
        _createEditor();
        //如果角色不为空
        if (_roles.length != 0) {
          _multiRoleTabContent.find(".role-container").append(
              _roleTabActive(_roles));
          _multiRoleTabContent.find(".role-container").find(
              ".role-name").each(function () {
            if ($(this).attr("name") != undefined || $(this).attr("name")
                != "") {
              $(this).val($(this).attr("name"));
            }
          });
        }
        //如果内容不为空
        if (_DbMergeAudioData.audios != undefined) {
          _multiRoleTabContent.find(".w-e-text").find("p").prepend(
              _contentActive(_DbMergeAudioData.audios));
          _multiRoleTabContent.find(".w-e-text").find("p").attr("file",
              _DbMergeAudioData.file);
          _editorBlur();
          _initAuditionHover();
        }
      },
      _contentActive = function (array) {
        if(array.length != 0) {
          _multiRoleTabContent.find("#roleTextId").css("display", "none");
          $("#voiceEditor").find(".text-form").find(".w-e-text-container").css(
              "display", "");
        }
        var contentHtml = "";
        var count = 0;
        for (let k in array) {
          // console.log(array[k].content.format());
          //   console.log(array[k].content.replace(/<.+?>/,"*"));
          var color = "";
          var roleName = "";
          var name = "";

          _multiRoleTabContent.find(".role-block").each(function () {
            if ($(this).attr("id") == array[k].rolesId) {
              name = $(this).find(".role-name").val();
            }
          });
          var tempVoiceid = 0;
          for (var i = 0; i < _roles.length; i++) {
            if (_roles[i].id == array[k].rolesId) {
              tempVoiceid = _roles[i].roleId;
              break;
            }
          }
          for (var j = 0; j < _conf.ttsRoles.length; j++) {
            if (_conf.ttsRoles[j].voiceId == tempVoiceid) {
              color = _conf.ttsRoles[j].color;
              roleName = _conf.ttsRoles[j].roleName;
              break;
            }
          }

          var temp1 = array[k].text.replace(/\D<cnphone py=(.*?)>/g,
              function (match, p1) {
                return '<span style="font-weight: bold;" class="cnphone" tonevalue='
                    + p1 + '>' + match.substring(0, 1) + '</span>'
              });
          var temp2 = temp1.replace(
              /<figure>((-?\d+)(\.\d+)?)<\/figure type=ordinal>/g,
              function (match, p1) {
                return '<span style="text-decoration-line: ;" class="ordinal">'
                    + p1 + '</span>';
              });
          var temp3 = temp2.replace(
              /<figure>((-?\d+)(\.\d+)?)<\/figure type=digit>/g,
              function (match, p1) {
                return '<span style="text-decoration-line:;" class="digit">'
                    + p1 + '</span>'
              });

          contentHtml += '<span style = "background-color:' + color
              + '; display: inline;"' +
              'voiceid = ' + array[k].voiceId + '  rolesid=' + array[k].rolesId
              + '  fileName=' + array[k].file
              + ' class = "audio-part" voicename = ' + name
              + '>' + temp3 + '</span >'
          //FIXME 换行屏蔽
          //contentHtml += array[k].breakLine && ++count!=array.length ? '<br>' : '';
        }
        console.log(contentHtml);
        return contentHtml;
      },
      _roleTabActive = function (array) {
        var roleHtml = "";
        for (var i = 0; i < array.length; i++) {
          var color = "";
          var roleName = "";
          for (var j = 0; j < _conf.ttsRoles.length; j++) {
            if (_conf.ttsRoles[j].voiceId == array[i].roleId) {
              color = _conf.ttsRoles[j].color;
              roleName = _conf.ttsRoles[j].roleName;
              break;
            }
          }
          roleHtml += '<div id="' + array[i].id
              + '" class="role-block" style="display: inline-block;">'
              + '<span maxlength="10" class="role-name" value="" name='
              + array[i].roleName + '>' + array[i].roleName + '</span>'
              + '<label class="voice-name" voiceid=' + array[i].roleId
              + '    colorcontent =' + color + '>' + roleName + '</label>'
              + '<label class="voice-color" style="background-color:'+color+'"></label>'+
              '</div>';

        }
        return roleHtml;
      },
      _initLanguageTabSwitch = function () {

        var enSpeakerRedio = _root.find("#enSpeakerRedio");
        var chSpeakerRedio = _root.find("#chSpeakerRedio");
        var speaker_tab_0 = _root.find("#speaker_tab_0");
        var speaker_tab_1 = _root.find("#speaker_tab_1");

        function activeChTab() {
          speaker_tab_1.removeClass("active");
          speaker_tab_0.addClass("active");
          enSpeakerRedio.hide();
          chSpeakerRedio.show();
        }

        function activeEnTab() {
          speaker_tab_0.removeClass("active");
          speaker_tab_1.addClass("active");
          chSpeakerRedio.hide();
          enSpeakerRedio.show();
        }

        speaker_tab_0.on("click", function () {
          activeChTab();
        });
        speaker_tab_1.on("click", function () {
          activeEnTab();
        });
        activeChTab();
        if (_ttsData.ttsParameters != undefined && _ttsData.ttsParameters
            != null && _ttsData.ttsParameters != "") {
          var ttsParameters = JSON.parse(_ttsData.ttsParameters);
          if (ttsParameters.chSpeaker == 14 || ttsParameters.chSpeaker == 15) {
            activeEnTab();
          }
        }
      },
      _initUploadButton = function () {
        var uploadButton = _realManTabContent.find("#uploadButton");
        _uploader.on('beforeFileQueued', function (file) {
          _uploader.reset();
        });
        _uploader.on('fileQueued', function (file) {
        });
        _uploader.on('uploadProgress', function (file, percentage) {
          _updateUploadFileName("上传中... " + parseInt(percentage * 100) + "%");
        });
        _uploader.on('uploadSuccess', function (file, response) {
          if (response.code == 0) {
            _uploadMP3File.tempFileName = response.data.fileName;
            _uploadMP3File.clientFileName = response.data.clientFileName;
            _updateUploadFileName(_uploadMP3File.clientFileName);
          } else {
            layer.msg(response.msg, {time: 1000});
          }

        });
        _uploader.on("error", function (type) {
          if (type == "Q_TYPE_DENIED") {
            layer.msg("请上传mp3格式文件", {time: 1000});
          } else if (type == "Q_EXCEED_SIZE_LIMIT") {
            layer.msg("为保证故事播放效果，音频文件大小不要超过8M", {time: 1000});
          }
        });
        uploadButton.children().css('width', '100%');
        uploadButton.children().css('height', '100%');
        uploadButton.children().css('left', '0');
      },
      _updateUploadFileName = function (fileName) {
        _root.find("#uploadFileName").text(fileName);
      },
      _initTTSPreview = function () {
        _ttsTabContent.find("#previewBtn").click(function () {
          if (_isTTSDataChanged()) {
            if (_ttsTabContent.find("#useDBTTS").prop("checked")) {
              _generateDBTTSAudio();
            } else {
              _generateTTSAudio();
            }
          } else {
            _playTTSAudio();
          }
        });

      },
      _isTTSDataChanged = function () {
        var text = _ttsTabContent.find("#text").val();
        //标贝语音可以使用
        if (_ttsTabContent.find("#useDBTTS").length > 0) {
          if (_ttsTabContent.find("#useDBTTS").prop("checked") == false) {
            var chSpeaker = _ttsTabContent.find(
                "input[name='chSpeaker']:checked").val() == undefined ? -1
                : _ttsTabContent.find("input[name='chSpeaker']:checked").val();
            var useIntelligenceTTS = _ttsTabContent.find(
                "#useIntelligenceTTS").prop("checked");
            if (text != _ttsData.text || _ttsData.chSpeaker != chSpeaker
                || useIntelligenceTTS != _ttsData.useIntelligenceTTS) {
              return true;
            } else {
              return false;
            }
          } else {
            var cheSpe = _ttsTabContent.find(
                "input[name='chSpeak']:checked").val() == undefined ? -1
                : _ttsTabContent.find("input[name='chSpeak']:checked").val();
            var useDBTTS = _ttsTabContent.find("#useDBTTS").prop("checked");
            if (text != _ttsData.text || cheSpe != _ttsData.chSpeaker
                || useDBTTS != _ttsData.useDBTTS) {
              return true;
            } else {
              return false;
            }
          }
        } else {
          //标贝语音不可使用
          var chSpeaker = _ttsTabContent.find(
              "input[name='chSpeaker']:checked").val() == undefined ? -1
              : _ttsTabContent.find("input[name='chSpeaker']:checked").val();
          var useIntelligenceTTS = _ttsTabContent.find(
              "#useIntelligenceTTS").prop("checked");
          if (text != _ttsData.text || _ttsData.chSpeaker != chSpeaker
              || useIntelligenceTTS != _ttsData.useIntelligenceTTS) {
            return true;
          } else {
            return false;
          }
        }

      },
      _initTTSSave = function () {
        _ttsTabContent.find("#saveBtn").click(function () {
          if (_isTTSDataChanged()) {
            _ttsTabContent.find("#previewBtn").text("试听");

            if (_audioControl) {
              _audioControl.pause();
            }
            layer.msg("保存前请先试听TTS语音", {time: 1000});
            return;
          }
          wantong.cms.pageAdd.voiceManager.drapAudio();
          if (_closeCallback) {
            var data = _getData();
            _closeCallback(false, data, _audioControl);
          }
          _clear();
          layer.close(_voiceEditorDialogIndex);
        });
        _ttsTabContent.find("#saveBtn").attr("disabled", "disabled");
      },
      _generateDBTTSAudio = function () {
        var text = _ttsTabContent.find("#text").val();
        var chSpea = _ttsTabContent.find(
            "input[name='chSpeak']:checked").val();
        var useIntelligenceTTS = _ttsTabContent.find(
            "#useIntelligenceTTS").prop("checked");
        if (text == "") {
          layer.msg("请填写需要TTS合成的文本", {time: 1000});
          return false;
        }
        _ttsData.text = text;
        _ttsData.chSpeaker = chSpea;
        _ttsData.useIntelligenceTTS = useIntelligenceTTS;
        _ttsData.useDBTTS = true;
        var preViewBtn = _ttsTabContent.find("#previewBtn");
        preViewBtn.text("TTS合成中...");
        preViewBtn.attr("disabled", "disabled");
        _ttsTabContent.find("#saveBtn").attr("disabled", "disabled");
        $.post(URL_DBTTS_CONVERT, {
          text: text,
          tone: 3
        }, function (data) {
          preViewBtn.removeAttr("disabled");

          if (data.code != 0) {
            _ttsData = {
              tempFileName: "",
              clientFileName: "",
              text: "",
              chSpeaker: -1
            },
                preViewBtn.text("试听");
            layer.msg("标贝TTS合成失败，请重试或联系客服", {time: 1000});
            return false;
          }
          _ttsData.tempFileName = data.data.tempFileName;
          var clientFileName = text;
          if (clientFileName.length > 8) {
            clientFileName = clientFileName.substring(0, 8) + ".mp3";
          } else {
            clientFileName += ".mp3";
          }
          _ttsData.clientFileName = clientFileName;
          _playTTSAudio();
          _ttsTabContent.find("#saveBtn").removeAttr("disabled");
        }).fail(function () {
          layer.msg("标贝TTS语音合成不可用", {time: 1000});
          preViewBtn.text("试听");
        });
      },
      _generateTTSAudio = function () {
        var text = _ttsTabContent.find("#text").val();
        var useIntelligenceTTS = _ttsTabContent.find(
            "#useIntelligenceTTS").prop("checked");
        var chSpeaker = _ttsTabContent.find(
            "input[name='chSpeaker']:checked").val() == undefined ? -1
            : _ttsTabContent.find("input[name='chSpeaker']:checked").val();
        if (text == "") {
          layer.msg("请填写需要TTS合成的文本", {time: 1000});
          return false;
        }
        _ttsData.text = text;
        _ttsData.chSpeaker = chSpeaker;
        _ttsData.useIntelligenceTTS = useIntelligenceTTS;
        var previewBtn = _ttsTabContent.find("#previewBtn");
        previewBtn.text("TTS合成中...");
        previewBtn.attr("disabled", "disabled");
        _ttsTabContent.find("#saveBtn").attr("disabled", "disabled");
        $.post(URL_TTS_CONVERT, {
          text: text,
          tone: chSpeaker,
          useIntelligenceTTS: useIntelligenceTTS
        }, function (data) {
          previewBtn.removeAttr("disabled");
          if (data.code != 0) {
            _ttsData = {
              tempFileName: "",
              clientFileName: "",
              text: "",
              chSpeaker: -1
            },
                previewBtn.text("试听");
            layer.msg("TTS合成失败，请重试或联系客服", {time: 1000});
            return false;
          }
          _ttsData.tempFileName = data.data.tempFileName;
          var clientFileName = text;
          if (clientFileName.length > 8) {
            clientFileName = clientFileName.substring(0, 8) + ".mp3";
          } else {
            clientFileName += ".mp3";
          }
          _ttsData.clientFileName = clientFileName;
          _playTTSAudio();
          _ttsTabContent.find("#saveBtn").removeAttr("disabled");
        }).fail(function () {
          layer.msg("TTS 服务不可用", {time: 1000});
          previewBtn.text("试听");
        });
      },
      _playAuditionTTSAudio = function (fileName) {
        var previewURL = PREVIEW_VOICE + "?fileName=" + fileName + "&type=" + 1;
        if (_audioControl) {
          _audioControl.pause();
        }
        _pcm_wav(previewURL, 16000, 16, 1, function (e) {
          _audioControl = new Audio(e);
          _audioControl.play();
          _setSelectRolesPanelBtn();
        });

      },
      _playTTSAudio = function () {
        var fileName = _ttsData.tempFileName;
        var previewURL = PREVIEW_VOICE + "?fileName=" + fileName;
        if (_audioControl) {
          _audioControl.pause();
        }
        _audioControl = new Audio(previewURL);
        _audioControl.play();
        var previewBtn = _ttsTabContent.find("#previewBtn");
        _ttsTabContent.find("#saveBtn").removeAttr("disabled");
        previewBtn.html(
            "<img src='/static/images/soundplaying.gif' width='15' height='15'>播放中..");
        _checkPlayingStatusHandler = setInterval(_checkAudio, 50);
      },
      _stopTTSAudio = function () {
        var fileName = _ttsData.tempFileName;
        var previewURL = PREVIEW_VOICE + "?fileName=" + fileName;
        if (_audioControl) {
          _audioControl.pause();
          _checkAudio();
        }
        _ttsTabContent.find("#previewBtn").text("试听");
        _ttsTabContent.find("#saveBtn").attr("disabled", "disabled");
      },
      _setExceptionalCase = function(JSObject,color,targetRolesId,targetVoiceId,targetVoiceName){

        var obj =null;

        if(JSObject.nodeName != "P" && JSObject.parentNode.nodeName == "P") {
          var selectClassName = JSObject.className;
          if (selectClassName == "cnphone") {
            //说明选中的只有单个元素 切进行变音了
            if (JSObject.parentNode.className == "audio-part") {

              _editCnphoneHandle(JSObject, color, targetRolesId, targetVoiceId,
                  targetVoiceName);

            }
          }
        }else {

          var startElement = _editor.selection.getSelectionStartElem()[0];
          var endElement = _editor.selection.getSelectionEndElem()[0];
          var frontTemplateElements = $(_templateHtml);
          var backTemplateElements = $(_templateHtml);
          _setElementAttributes(frontTemplateElements, color, targetRolesId,
              targetVoiceId, targetVoiceName);
          _setElementAttributes(backTemplateElements, color, targetRolesId,
              targetVoiceId, targetVoiceName);
          // frontTemplateElements.insertAfter($(startElement).parents(".audio-part"));

          var frontHtml = "";

          if (($(startElement).parents(".audio-part")).is($(endElement).parents(".audio-part"))) {

            var parent = null;
            if(startElement == endElement.parentNode){
              frontHtml = $(startElement).html();
              frontTemplateElements.insertBefore($(startElement).parents(".audio-part"));
              parent = $(startElement).parents(".audio-part")[0];
              $(startElement).remove();
              frontTemplateElements.html(frontHtml);
            }else {

              var tempObj = $(startElement).parents(".audio-part").clone();
              tempObj.html("");
              var tempHtml = tempObj.prop("outerHTML");

              var frontFormerObj = $(tempHtml);
              frontFormerObj.insertBefore(
                  $(startElement).parents(".audio-part"));
              var frontFormerHtml = "";
              if(startElement == endElement){
                while (startElement.previousSibling != null) {
                  frontFormerHtml = $(
                      startElement.previousSibling).prop(
                      "outerHTML") + frontFormerHtml;
                  $(startElement.previousSibling).remove();
                }
              }else{
                while (startElement.parentNode.previousSibling != null) {
                  frontFormerHtml = $(
                      startElement.parentNode.previousSibling).prop(
                      "outerHTML") + frontFormerHtml;
                  $(startElement.parentNode.previousSibling).remove();
                }
              }
              frontFormerObj.html(frontFormerHtml);
              _changeElementStyle(frontFormerObj);

              var endFormerObj = $(tempHtml);
              endFormerObj.insertAfter(
                  $(startElement).parents(".audio-part"));
              var endFormerHtml = "";
              if(startElement == endElement){
                while (endElement.nextSibling != null) {
                  endFormerHtml += $(endElement.nextSibling).prop(
                      "outerHTML");
                  $(endElement.nextSibling).remove();
                }
              }else{
                while (endElement.parentNode.nextSibling != null) {
                  endFormerHtml += $(endElement.parentNode.nextSibling).prop(
                      "outerHTML");
                  $(endElement.parentNode.nextSibling).remove();
                }
              }
              endFormerObj.html(endFormerHtml);
              _changeElementStyle(endFormerObj);

              if(startElement == endElement){
                if($(startElement).attr("class") == undefined ) {
                  var html = $(startElement).html();
                }else {
                  var html = $(startElement).prop("outerHTML");
                }
              }else{
                var html = $(startElement.parentNode).html();
              }
              var combinationHtml = '<span style="background-color: '
                  + color
                  + '"><span class="audio-part">' + html + '</span></span>';

              obj = $(combinationHtml);
              obj.insertBefore($(startElement).parents(".audio-part"));
              $(startElement).parents(".audio-part").remove();
              if (parent != null) {
                _changeElementStyle(parent);
              }
            }



          } else {
            if ($(startElement).attr("class") == "audio-part") {
              if (startElement.parentNode.nodeName == "P") {

                frontTemplateElements.insertAfter($(startElement));

                frontHtml = $(startElement).html();
                $(startElement).remove();
              } else {

                frontTemplateElements.insertAfter(
                    $(startElement).parents(".audio-part"));

                while (startElement.nextSibling != null) {
                  frontHtml += $(startElement.nextSibling).html();
                  $(startElement.nextSibling).remove();
                }
                $(startElement.parentNode).remove();
              }
            } else {

              frontTemplateElements.insertAfter(
                  $(startElement).parents(".audio-part"));
              var parent = null;
              if ($(startElement.parentNode).attr("class") == "audio-part") {

                $(startElement).css("background-color", "");

                frontHtml = $(startElement).prop("outerHTML");
                parent = startElement.parentNode;
                $(startElement).remove();
              } else {

                frontHtml = $(startElement.parentNode).html();
                var parent = startElement.parentNode.parentNode;
                $(startElement.parentNode).remove();
              }
              _changeElementStyle(parent);

            }
            frontTemplateElements.html(frontHtml);

            var endHtml = "";

            if ($(endElement).attr("class") == "audio-part") {
              if (endElement.parentNode.nodeName == "P") {

                backTemplateElements.insertBefore($(endElement));

                endHtml = $(endElement).html();
                $(endElement).remove();
              } else {

                backTemplateElements.insertBefore(
                    $(endElement).parents(".audio-part"));

                while (endElement.previousSibling != null) {
                  endHtml = $(endElement.previousSibling).html() + endHtml;
                  $(endElement.previousSibling).remove();
                }
                $(endElement.parentNode).remove();
              }
            } else {
              var parent = null;
              backTemplateElements.insertBefore(
                  $(endElement).parents(".audio-part"));
              if ($(endElement.parentNode).attr("class") == "audio-part") {

                $(endElement).css("background-color", "");
                endHtml = $(endElement).prop("outerHTML");
                parent = endElement.parentNode;
                $(endElement).remove();
              } else {

                endHtml = $(endElement.parentNode).html();
                parent = endElement.parentNode.parentNode;
                $(endElement.parentNode).remove();
              }

              _changeElementStyle(parent);

            }

            backTemplateElements.html(endHtml);

            var combinationHtml = '<span style="background-color: ' + color
                + '"></span>';
            obj = $(combinationHtml);
            obj.insertBefore(frontTemplateElements);
            var recordHtml = "";
            while (frontTemplateElements[0].nextSibling != null
            && frontTemplateElements[0].nextSibling
            != backTemplateElements[0]) {

              recordHtml += $(frontTemplateElements[0].nextSibling).prop(
                  "outerHTML");
              $(frontTemplateElements[0].nextSibling).remove();
            }
            recordHtml = frontTemplateElements.prop("outerHTML") + recordHtml;
            recordHtml = recordHtml + backTemplateElements.prop("outerHTML");
            frontTemplateElements.remove();
            backTemplateElements.remove();

            if(obj[0].parentNode.nodeName != "P"){
              var htmlObj = obj.prop("outerHTML");
              var tempObj = $(htmlObj);
              tempObj .insertBefore($(obj[0].parentNode));
              $(obj[0].parentNode).remove();
              obj = tempObj;
            }

            obj.html(recordHtml);
          }
        }

        return obj == null ? obj : obj[0];
      },
      _changeElementStyle = function(parentDomObj){
        var color = "";
        var array  = new Array();

        if($(parentDomObj).html() == ""){
          $(parentDomObj).remove();
          return;
        }
        $(parentDomObj).find("span").each(function () {
          array.push($(this));
        });
        for(var i = 0;i < array.length;i++){
          if(array[i].attr("class") == undefined){
            if(color == ""){
              color = array[i].css("background-color");
            }
            array[i].replaceWith(array[i].html());
          }else {
            if(color == ""){
              color = array[i].css("background-color");
            }
            array[i].css("background-color","");
          }
        }
        $(parentDomObj).css("background-color",color);
      },
      _setsElementAttributes = function(JSObject,voiceId,voiceName,rolesid,color){
        var jsChild = JSObject.childNodes;
        var firstSelectDom = null;
        for(var i = 0;i<jsChild.length; i++ ) {
          if(jsChild[i].nodeName == "#text"){
            $(jsChild[i].parentNode).attr("voiceid", voiceId);
            $(jsChild[i].parentNode).attr("class", "audio-part");
            $(jsChild[i].parentNode).attr("voicename", voiceName);
            $(jsChild[i].parentNode).attr("contenteditable", false);
            $(jsChild[i].parentNode).attr("rolesid", rolesid);
            if(firstSelectDom == null){
              firstSelectDom = jsChild[i].parentNode;
            }
          }else {
            $(jsChild[i]).attr("voiceid", voiceId);
            $(jsChild[i]).attr("voicename", voiceName);
            $(jsChild[i]).attr("contenteditable", false);
            $(jsChild[i]).attr("rolesid", rolesid);
            $(jsChild[i]).css("background-color",color);
          }
        }
        //清空外层多余的背景颜色层
        if($(JSObject).attr("class") == undefined){

          var temp = $($(JSObject).html());
          temp.insertBefore($(JSObject));
          $(JSObject).remove();

          if(firstSelectDom == null){
            firstSelectDom = temp[0];
          }
        }
        return firstSelectDom;
      },
      _getsAdjacentIdenticalElements = function(JSObject,color,rolesid,voiceId,voiceName){
        //添加一个新元素
        var tempJqObject = _addNewAudioPart(color,rolesid,voiceId,voiceName);
        tempJqObject.insertBefore($(JSObject));
        var recordDom = tempJqObject[0];
        while (recordDom.nextSibling != null && recordDom.nextSibling.nodeName
        == "SPAN") {
          //同一个元素
          var _currentDom = recordDom.nextSibling;
          //rolesid相同时用一个元素
          if ($(_currentDom).attr("rolesid") == rolesid) {
            if ($(_currentDom).attr("class") == "digit" || $(_currentDom).attr(
                "class") == "ordinal" || $(_currentDom).attr("class")
                == "cnphone") {
              $(_currentDom).attr("voiceid", "");
              $(_currentDom).attr("voicename", "");
              $(_currentDom).attr("rolesid", "");
              $(_currentDom).css("background-color", "");
              // $(tempJqObject).append($(_currentDom).prop("outerHTML"));
              var html = $(tempJqObject).html()+$(_currentDom).html();
              $(tempJqObject).html(html);
              $(_currentDom).remove();
            } else {
              while($(_currentDom).find(".audio-part").length!=0){
                var ht= $(_currentDom).find(".audio-part").html();
                $(_currentDom).find(".audio-part")[0].outerHTML=ht;
              }
              //直接插入元素
              $(tempJqObject).append($(_currentDom).html());
              $(_currentDom).remove();
            }
          } else {
            break;
          }
        }
        while (recordDom.previousSibling != null && recordDom.previousSibling.nodeName == "SPAN"){
          var _currentDom = recordDom.previousSibling;
          if($(_currentDom).attr("rolesid") == rolesid){
            // $(tempJqObject).prepend($(_currentDom).html());
            var html = $(_currentDom).html()+$(tempJqObject).html()
            $(tempJqObject).html(html);
            $(_currentDom).remove();
          }else {
            break;
          }
        }
        if($(tempJqObject).html() == ""){
          $(tempJqObject).remove();
        }
      },
      _addNewAudioPart = function(color,rolesid,voiceId,voiceName){
        var tempJqObject = null;
        tempJqObject=$(_templateHtml);
        tempJqObject.css("background-color",color);
        tempJqObject.attr("rolesid",rolesid);
        tempJqObject.attr("voiceid",voiceId);
        tempJqObject.attr("voicename",voiceName);

        return tempJqObject;
      },
      //单个变音文字进行变音色
      _editCnphoneHandle = function(JSObject,color,targetRolesId,targetVoiceId,targetVoiceName){
        var parents =  $(JSObject).parents("span");

        var tempObject = parents.clone();
        tempObject.html("");

        var tempHtml = tempObject.prop("outerHTML");

        var frontElement = "";
        var backElement = "";
        var quondamColor = "" ;
        while (JSObject.previousSibling != null ){
          if($(JSObject.previousSibling).attr("class") == undefined){
            if(quondamColor == ""){
              quondamColor = $(JSObject.previousSibling).css("background-color");
            }
            frontElement = $(JSObject.previousSibling).html()+frontElement;
            $(JSObject.previousSibling).remove();
          }else {
            if(quondamColor == ""){
              quondamColor = $(JSObject.previousSibling).css("background-color");
            }
            $(JSObject.previousSibling).css("background-color");
            frontElement = $(JSObject.previousSibling).prop("outerHTML")+frontElement;
            $(JSObject.previousSibling).remove();
          }
        }

        var frontObj = $(tempHtml);
        frontObj.css("background-color",quondamColor);
        if(frontElement != "") {
          frontObj.insertBefore(parents);
          frontObj.html(frontElement);
        }

        //插入前面的元素

        var cnphoneObj = $(_templateHtml);
        _setElementAttributes(cnphoneObj,color,targetRolesId,targetVoiceId,targetVoiceName);
        cnphoneObj.insertBefore(parents);
        var tempCnphone = $(JSObject).clone();
        tempCnphone.css("background-color","");
        cnphoneObj.html($(tempCnphone).prop("outerHTML"));

        while (JSObject.nextSibling != null){
          if($(JSObject.nextSibling).attr("class") == undefined){
            if(quondamColor == ""){
              quondamColor = $(JSObject.nextSibling).css("background-color");
            }
            backElement += $(JSObject.nextSibling).html();
            $(JSObject.nextSibling).remove();
          }else {
            if(quondamColor == ""){
              quondamColor = $(JSObject.nextSibling).css("background-color");
            }
            $(JSObject.nextSibling).css("background-color");
            backElement += $(JSObject.nextSibling).prop("outerHTML");
            $(JSObject.nextSibling).remove();
          }
        }

        var backObj = $(tempHtml);
        backObj.css("background-color",quondamColor);
        //如果元素后面没有元素，则不需要添加
        if(backElement != "") {
          backObj.insertBefore(parents);
          backObj.html(backElement);
        }
        $(JSObject).parents("span").remove();
        return cnphoneObj;
      },
      _setElementAttributes = function(JqObj,color,rolesId,voiceId,voiceName){
        JqObj.attr("voiceid", voiceId);
        JqObj.attr("class", "audio-part");
        JqObj.attr("voicename", voiceName);
        JqObj.attr("contenteditable", false);
        JqObj.attr("rolesid", rolesId);
        JqObj.css("background-color",color);
      },
      _pcm_wav = function (pcm, sampleRateTmp, sampleBits, channelCount,
          callback) {
        var audioContext = new (window.AudioContext
            || window.webkitAudioContext)();
        var req = new XMLHttpRequest();
        req.open("GET", pcm, true); // grab our audio file
        req.responseType = "arraybuffer";   // needs to be specific type to work
        req.overrideMimeType('text/xml; charset = utf-8')
        req.onload = function () {
          if (this.status != 200) {
            alert("pcm文件不存在/文件格式错误！");
            return;
          }
          //根据pcm文件 填写 sampleRateTmp【采样率】（11025） 和sampleBits【采样精度】（16） channelCount【声道】（单声道1，双声道2）
          var fileResult = _addWavHeader(req.response, sampleRateTmp,
              sampleBits, channelCount);
          callback(fileResult);
        };
        req.send();
      },
      _addWavHeader = function (samples, sampleRateTmp, sampleBits,
          channelCount) {
        var dataLength = samples.byteLength;
        var buffer = new ArrayBuffer(44 + dataLength);
        var view = new DataView(buffer);

        function writeString(view, offset, string) {
          for (var i = 0; i < string.length; i++) {
            view.setUint8(offset + i, string.charCodeAt(i));
          }
        }

        var offset = 0;
        /* 资源交换文件标识符 */
        writeString(view, offset, 'RIFF');
        offset += 4;
        /* 下个地址开始到文件尾总字节数,即文件大小-8 */
        view.setUint32(offset, /*32*/ 36 + dataLength, true);
        offset += 4;
        /* WAV文件标志 */
        writeString(view, offset, 'WAVE');
        offset += 4;
        /* 波形格式标志 */
        writeString(view, offset, 'fmt ');
        offset += 4;
        /* 过滤字节,一般为 0x10 = 16 */
        view.setUint32(offset, 16, true);
        offset += 4;
        /* 格式类别 (PCM形式采样数据) */
        view.setUint16(offset, 1, true);
        offset += 2;
        /* 通道数 */
        view.setUint16(offset, channelCount, true);
        offset += 2;
        /* 采样率,每秒样本数,表示每个通道的播放速度 */
        view.setUint32(offset, sampleRateTmp, true);
        offset += 4;
        /* 波形数据传输率 (每秒平均字节数) 通道数×每秒数据位数×每样本数据位/8 */
        view.setUint32(offset, sampleRateTmp * channelCount * (sampleBits / 8),
            true);
        offset += 4;
        /* 快数据调整数 采样一次占用字节数 通道数×每样本的数据位数/8 */
        view.setUint16(offset, channelCount * (sampleBits / 8), true);
        offset += 2;
        /* 每样本数据位数 */
        view.setUint16(offset, sampleBits, true);
        offset += 2;
        /* 数据标识符 */
        writeString(view, offset, 'data');
        offset += 4;
        /* 采样数据总数,即数据总大小-44 */
        view.setUint32(offset, dataLength, true);
        offset += 4;

        function floatTo32BitPCM(output, offset, input) {
          input = new Int32Array(input);
          for (var i = 0; i < input.length; i++, offset += 4) {
            output.setInt32(offset, input[i], true);
          }
        }

        function floatTo16BitPCM(output, offset, input) {
          input = new Int16Array(input);
          for (var i = 0; i < input.length; i++, offset += 2) {
            output.setInt16(offset, input[i], true);
          }
        }

        function floatTo8BitPCM(output, offset, input) {
          input = new Int8Array(input);
          for (var i = 0; i < input.length; i++, offset++) {
            output.setInt8(offset, input[i], true);
          }
        }

        if (sampleBits == 16) {
          floatTo16BitPCM(view, 44, samples);
        } else if (sampleBits == 8) {
          floatTo8BitPCM(view, 44, samples);
        } else {
          floatTo32BitPCM(view, 44, samples);
        }
        var blob = new Blob([view.buffer], {type: 'autio/wave'});
        var src = URL.createObjectURL(blob);

        return src;
      },
      _clear = function () {
        _ttsData = '';
        _lastLayerIndex = 0;
        _realManTab = null;
        _ttsTab = null;
        _closeCallback = null,
            _type = 0;
        _roles = new Array();
        _uploadMP3File = {
          tempFileName: "",
          clientFileName: "点此上传配音文件"
        };
        _ttsData = {
          tempFileName: "",
          clientFileName: "",
          text: "",
          chSpeaker: -1
        };
        confAudio = null;
        _DbMergeAudioData = {
          voiceId: 0,
          content: "",
          fileName: "",
          isFileChange: false,
          audios: new Array()
        };
      },
      _generateMultiroleVoice = function () {
        var data = {
          voiceId: 0,
          text: "",
          file: "",
          breakLine: false,
          isFileChange: false,
          audios: new Array()
        };
        var tempData = clone(data);

        var tempJQ = $("#voiceEditor").find(".text-form p").clone();
        //FIXME 换行屏蔽
        //    tempJQ.find("br").each(function () {
        //      $(this).replaceWith("");
        //   });
        tempJQ.find("span").each(function () {
          $(this).replaceWith("");
        });
        if(_multiRoleTabContent.find(".role-container .role-block").length==1){
          layer.msg("请先添加角色");
          return;
        }
        console.log(tempJQ[0].innerHTML);
        if (tempJQ[0].innerHTML != "<br>" && tempJQ[0].innerHTML.length != 0) {
          layer.msg("有内容未选择上角色");
          return;
        }
        var state=0;
        var handleDom = $("#voiceEditor").find(".text-form .w-e-text").prop('outerHTML');
        handleDom = handleDom.replace(/<p>/g, '');
        handleDom = handleDom.replace(/<\/p>/g, '<br>');
        $(handleDom).find("span[voiceid]").each(function () {
          var dataClone = clone(tempData);
          var temp = _initDomFromat($(this));
          if(temp.text().length>256){

            state=1;
            return;
          }
          dataClone.voiceId = $(this).attr("voiceid");
          dataClone.text = _ContentFormatting(temp.text());
          dataClone.file = $(this).attr("filename");
          dataClone.rolesId = $(this).attr("rolesid");
          dataClone.breakLine = $(this).next().prop('outerHTML') == '<br>';
          data.audios.push(dataClone);

          //记录所有内容
          // _DbMergeAudioData.segmentationContent.push(dataClone);
        })
        if(state==1){
          layer.msg("单条角色的合成语音长度不能超过256个字");
          return;
        }
        _DbMergeAudioData = _clone(data);
        for (var i = 0; i < data.audios.length; i++) {
          _DbMergeAudioData.text += data.audios[i].text;
        }
        if($(".w-e-text").find("p").html()=="<br>"){
          layer.msg("请输入需要朗读的文本");
          return;
        }
        if (data.audios.length == 0) {
          layer.msg("请选择内容");
          return;
        }
        _ttsData.chSpeaker = 3;
        _ttsData.useIntelligenceTTS = false;
        _ttsData.useDBTTS = true;
        _ttsData.text="";
        for(var i=0;i<data.audios.length;i++){
          _ttsData.text += data.audios[i].text;
        }
        var preViewBtn = _multiRoleTabContent.find("#previewBtn");
        //preViewBtn.text("TTS合成中...");
        preViewBtn.attr("disabled", "disabled");
        _multiRoleTabContent.find("#saveBtn").attr("disabled", "disabled");
        _setPreviewLoadding(true);
        $.ajax({
          type: "POST",
          url: PREVIEW_DBTTS,
          contentType: "application/json",
          dataType: 'json',
          data: JSON.stringify(data),
          success: function (data) {
            if (data.code != 0) {
              _ttsData = {
                tempFileName: "",
                clientFileName: "",
                text: "",
                chSpeaker: -1
              },
              //_multiRoleTabContent.find("#previewBtn").text("试听");
              _multiRoleTabContent.find("#previewBtn").removeAttr("disabled")
              layer.msg("TTS合成失败，请重试或联系客服", {time: 1000});
              return false;
            }
            if (data.code == 0) {
              // callBack(data.data.fileName);
              // callBack(data.data.fileName);
              var clientFileName = _ttsData.text;
              if (_ttsData.text.length > 8) {
                clientFileName = clientFileName.substring(0, 8) + ".mp3";
              } else {
                clientFileName += ".mp3";
              }
              //设置所有内容的MP3

              for (var i = 0; i < data.data.childFile.length; i++) {
                _DbMergeAudioData.audios[i].file = data.data.childFile[i];
              }
              var i = 0;

              $("#voiceEditor").find(".text-form p span[voiceid]").each(
                  function () {
                    $(this).attr("filename", data.data.childFile[i]);
                    i++;
                  });

              _ttsData.clientFileName = clientFileName;
              _DbMergeAudioData.file = data.data.fileName;
              _setDbState(false);
              confAudio.text = _ttsData.text;
              confAudio.audios = data.data.childFile;

              _ttsData.tempFileName = data.data.fileName;
              $(".w-e-text").attr("file", data.data.fileName);
              _setPreviewLoadding(false);
              _playDbttsAudio();
              _multiRoleTabContent.find("#saveBtn").removeAttr("disabled");
            }
          },
          error: function () {
            layer.msg("TTS 服务不可用", {time: 1000});
            _setPreviewPlay();
          }
        });
      },
      _generateAuditionTTS = function (voiceId, content, fileName, callBack) {

        $.get(AUDITION_CONVERT_URL, {
          voiceId: voiceId,
          text: content,
          fileName: fileName
        }, function (data) {
          if (data.code == 0) {
            callBack(data.data.tempFileName);
          }
        });
      },
      _checkDbTTSAudio = function () {
        if (_audioControl.ended) {
          //_multiRoleTabContent.find("#previewBtn").text("试听");
          _multiRoleTabContent.find("#previewBtn").removeAttr("disabled");
          clearInterval(_checkPlayingDbTTsStatusHandler);
        }
      },
      _checkRolesAudio=function(){
        if(_audioControl.ended){
          _rolesObject.find(".listen-form .btn-primary").text("发音试听");
          _rolesObject.find(".listen-form .btn-primary").removeAttr("disabled");
          clearInterval(_checkRolesPlayingAudioStatusHandler);
        }

      },
      _checkUserVoicePanel = function(enableTTS,titleOfUploadPanel){
        if(_voiceAuthorityManager.realPersonVoiceUpload){
          if(_voiceAuthorityManager.oneRoleSpeechSynthesis){
            if(_voiceAuthorityManager.multiroleSpeechSynthesis){
              //3个权限都有，按照原来的逻辑
              return enableTTS;
            }else {
                //没有多角色的权限
              if(_type == 3){
                _type =1;
                return enableTTS;
              }
              return enableTTS;
            }
          }else {
            //没有单角色权限

            //有多角色权限
            if(_voiceAuthorityManager.multiroleSpeechSynthesis){
              if(_type == 1){
                _type = 3;
                return enableTTS;
              }
              return enableTTS;
            }else {
              _type = 0;
              enableTTS = false;
              return enableTTS;
            }
          }
        }else {
          //没有真人语音权限

          //有单角色权限
          if(_voiceAuthorityManager.oneRoleSpeechSynthesis){
            //有多角色权限
            if(_voiceAuthorityManager.multiroleSpeechSynthesis){
                if(_type == 0){

                  if(titleOfUploadPanel == "真人录音"){
                    _type = 3;
                    enableTTS = true;
                    return enableTTS;
                  }else {
                    _type = 4;
                    enableTTS = false;
                    return enableTTS;
                  }

                }
                return enableTTS;
            }else {
              if(titleOfUploadPanel == "真人录音") {
                _type = 1;
                enableTTS = true;
                return enableTTS;
              }else{
                _type = 4;
                return false;
              }
            }
          }else {
              if(_voiceAuthorityManager.multiroleSpeechSynthesis){
                if(titleOfUploadPanel == "真人录音") {
                  _type = 3;
                  return true;
                }else {
                  _type = 4;
                  return false;
                }
              }else {
                _type = 4;
                return false;
              }
          }

        }

      },
      _checkAudio = function () {
        if (_audioControl.ended) {
          _ttsTabContent.find("#previewBtn").text("试听");
          //停止周期事件
          if (_checkPlayingStatusHandler == null) {
            clearInterval(_checkPlayingStatusHandler);
          }
        }
      };

  return {
    init: function (conf) {
      _init(conf);
    },
    /*
    * attributes in conf:
    * enableTTS: true or false. Decide the TTS tab is shown or not.
    * titleOfUploadPanel： the title of upload panel.
    * type: indicate which tab is shown, type 0 is real man voice tab, 1 is TTS tab.
    * data: used to display existing data to controls under current open tab
    */
    open: function (conf) {
      _open(conf);
    }
  }
})();
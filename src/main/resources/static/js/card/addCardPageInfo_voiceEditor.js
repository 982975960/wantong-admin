wantong.addCardPageInfo.voiceEditor = (function () {
    let _conf = {
            UPLOAD_URL: "upload.do",
            URL_TTS_CONVERT : GlobalVar.contextPath + "/cms/ttsConvert.do",
            URL_DBTTS_CONVERT : GlobalVar.contextPath + "/cms/DBttsConvert.do",
            PREVIEW_VOICE : GlobalVar.contextPath + "/downloadTempFile.do",
            AUDITION_CONVERT_URL : GlobalVar.contextPath + "/cms/auditionConvert.do",
            COMPOUND_AUDIO_URL:"/card/compoundAudio.do",
            ttsRoles: null ,
            partnerId: 0
        },
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
        };
    function _init() {
        $.extend(_conf, conf);
        _panelAudioRefresh = false;
        _inputChange();
        _initPlayBar();
    };
    function _inputChange() {
        $("#text").on("input propertychange", function () {
            var area = $(this);
            _val = area.val();
            if (_val.length > _maxFontSize) {
                area.val(_val.substring(0, _maxFontSize));
            }
        });
    };
    function _initPlayBar() {

    };
    //获得角色语音编辑的权限
    function _initVoiceAuthority(){
        if($("#voiceEditorTemplate").find("#tab_1").length != 0){
            _voiceAuthorityManager.oneRoleSpeechSynthesis = true;
        }
        if($("#voiceEditorTemplate").find("#tab_3").length != 0){
            _voiceAuthorityManager.multiroleSpeechSynthesis = true;
        }
        if($("#voiceEditorTemplate").find("#tab_0").length != 0){
            _voiceAuthorityManager.realPersonVoiceUpload = true;
        }
    };
    function _initUploader(){
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
    };
    function _setPreviewLoadding(val) {
        //播放图标旋转
        if (val) {
            $('#editorProgressBar .voice-editor-btn').removeClass('glyphicon-play').removeClass('glyphicon-pause')
                .addClass('glyphicon-refresh').addClass('rotate-loading');
        } else {
            $('#editorProgressBar .voice-editor-btn').removeClass('glyphicon-refresh').removeClass('rotate-loading')
                .removeClass('glyphicon-play').addClass('glyphicon-pause');
        }
    };
    function _setPreviewPlay() {
        $('#editorProgressBar .voice-editor-btn').removeClass('glyphicon-refresh').removeClass('rotate-loading')
            .removeClass('glyphicon-pause').addClass('glyphicon-play');
        clearInterval(_playInterval);
    };
    function _conversion(value) { //秒 转换为 分:秒
        var minute = Math.floor(value / 60);
        minute = minute.toString().length === 1 ? ('0' + minute) : minute;
        var second = Math.round(value % 60);
        second = second.toString().length === 1 ? ('0' + second) : second;
        return minute + ":" + second;
    };
    function updatePlayBar() {
        if (_audioControl.duration != null
            && _audioControl.duration > 0) {
            var cur = _audioControl.currentTime.toFixed(2);
            var duration = _audioControl.duration.toFixed(2);
            $('#editorProgressBar .voice-editor-start').text(_conversion(cur) + '\'\'');
            $('#editorProgressBar .voice-editor-end').text(_conversion(duration) + '\'\'');
            $('#editorProgressBar .voice-editor-now').css('width', (cur / duration) * 100 + "%");
        }
    };
    function _open(conf) {
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
                _initTabSwitch(enableTTS,titleOfUploadPanel);
                _initUploadButton();
                _initTTSSave();
                _initTTSPreview();
                _initRealManSave();
                _initMultiRolePanel();
                _initAudioCheck();
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
    };
    function _checkUserVoicePanel(enableTTS,titleOfUploadPanel){
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

    };
    function _initAudioCheck() {
        if(_ttsData != undefined && _ttsData.type == 1){
            if(_ttsData.ttsParameters != undefined){
                var ttsParameters = JSON.parse(_ttsData.ttsParameters);
                activeEnTab(ttsParameters.chSpeaker);
            }
        }
        if(_ttsData.type == undefined){
            activeEnTab(2005);
        }
    };

    function activeEnTab(voiceId) {
        $(".radio-inline").find("#"+voiceId+"").attr("checked","checked");
    };
    function _clone(obj) {
        var newobj = {};
        for (var attr in obj) {
            newobj[attr] = obj[attr];
        }
        return newobj;
    };
    function _clear() {
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
    };

    function _initReverse() {
        _root.find('.w-e-text').keydown(function (event) {
            if (event.ctrlKey && event.keyCode == 90) {//ctrl+z
                if (_type = 3) {
                    event.preventDefault();
                    return false;
                }
            }
        });
    };
    function  _initRealManSave() {
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
            wantong.addCardPageInfo.voiceManager.drapAudio();
        });
    };
    function _getData() {
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
    };
    function _initTabSwitch (enableTTS, titleOfUploadPanel) {
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

        function activeRealManTab() {
            stopTTSAudio();
            _realManTabContent.show();
            _ttsTabContent.hide();
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
            _ttsTab.removeClass("active");
            _realManTab.removeClass("active");
            _multiRoleTab.addClass("active");
            //初始化页面
            _type = 3;
        }

        function activeTTSTab() {
            console.log('tts active');
            _realManTabContent.hide();
            _ttsTabContent.show();
            _ttsTab.addClass("active");
            _realManTab.removeClass("active");
            _multiRoleTab.removeClass("active");
            _type = 1;
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

        $(".listen-form").find(".btn").off("click").on("click", function () {
            $(this).blur();
            var content = $(this).parents(".listen-form").find("span").text();
            var voiceId = $(this).parents(".select-wrapper").find(
                "input[name='sex']:checked").val();
            if(voiceId==undefined){
                layer.msg("请先选择发音角色");
                return;
            }
            if(_audioControl){
                _audioControl.pause();
            }
            _setSelectRolesPanelGenerateBtn();
            _generatePreviewTTS(voiceId, content, "",
                (e) => _playAuditionTTSAudio(e));
        });
    };
    function _playAuditionTTSAudio (fileName) {
        var previewURL = _conf.PREVIEW_VOICE + "?fileName=" + fileName + "&type=" + 1;
        if (_audioControl) {
            _audioControl.pause();
        }
        _pcm_wav(previewURL, 16000, 16, 1, function (e) {
            _audioControl = new Audio(e);
            _audioControl.play();
            _setSelectRolesPanelBtn();
        });

    };
    function _setSelectRolesPanelBtn(){
        if(_rolesObject != null) {
            var auditionBtn = _ttsTabContent.find(".listen-form .btn-primary");
            auditionBtn.html(
                "<img src='/static/images/soundplaying.gif' width='15' height='15'>播放中..");
            auditionBtn.find("img").css("display", "inline");
        }
        _checkRolesPlayingAudioStatusHandler= setInterval(_checkRolesAudio, 50)
    };
    function _checkRolesAudio(){
        if(_audioControl.ended){
            _rolesObject.find(".listen-form .btn-primary").text("发音试听");
            _rolesObject.find(".listen-form .btn-primary").removeAttr("disabled");
            clearInterval(_checkRolesPlayingAudioStatusHandler);
        }
    };
    function _pcm_wav (pcm, sampleRateTmp, sampleBits, channelCount,
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
    };
    function _setSelectRolesPanelGenerateBtn(){
        var auditionBtn=_ttsTabContent.find(".listen-form .btn-primary");
        auditionBtn.text("语音合成中...");
        auditionBtn.attr("disabled", "disabled");
    };
    function _initUploadButton() {
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
    };
    function   _updateUploadFileName(fileName) {
        _root.find("#uploadFileName").text(fileName);
    };
    function _generatePreviewTTS(voiceId, content, fileName, callBack) {
        $.get(_conf.AUDITION_CONVERT_URL, {
            voiceId: voiceId,
            text: content,
            fileName: fileName
        }, function (data) {
            if (data.code == 0) {
                callBack(data.data.tempFileName);
            }
        });
    }
    function _initTTSPreview() {
        _ttsTabContent.find("#previewBtn").click(function () {
            if (_isTTSDataChanged()) {
                if (_ttsTabContent.find("#useDBTTS").prop("checked")) {

                } else {
                    _generateTTSAudio();
                }
            } else {
                _playTTSAudio();
            }
        });
    };
    function _initTTSSave() {
        _ttsTabContent.find("#saveBtn").click(function () {
            if (_isTTSDataChanged()) {
                _ttsTabContent.find("#previewBtn").text("试听");

                if (_audioControl) {
                    _audioControl.pause();
                }
                layer.msg("保存前请先试听TTS语音", {time: 1000});
                return;
            }
            wantong.addCardPageInfo.voiceManager.drapAudio();
            if (_closeCallback) {
                var data = _getData();
                _closeCallback(false, data, _audioControl);
            }
            _clear();
            layer.close(_voiceEditorDialogIndex);
        });
        _ttsTabContent.find("#saveBtn").attr("disabled", "disabled");
    };
    function _isTTSDataChanged() {
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
            var chSpeaker = $(".select-wrapper").find("input[name='sex']:checked").val();
            if (text != _ttsData.text || _ttsData.chSpeaker != chSpeaker
                || false != _ttsData.useIntelligenceTTS) {
                return true;
            } else {
                return false;
            }
        }

    };
    function _generateTTSAudio() {
        var text = _ttsTabContent.find("#text").val();
        var chSpeaker = $(".select-wrapper").find("input[name='sex']:checked").val();
        if (text == "") {
            layer.msg("请填写需要TTS合成的文本", {time: 1000});
            return false;
        }
        if(chSpeaker == undefined){
            layer.msg("请选择语音合成的角色");
        }
        _ttsData.text = text;
        _ttsData.chSpeaker = chSpeaker;
        _ttsData.useIntelligenceTTS = false;
        var previewBtn = _ttsTabContent.find("#previewBtn");
        previewBtn.text("TTS合成中...");
        previewBtn.attr("disabled", "disabled");
        _ttsTabContent.find("#saveBtn").attr("disabled", "disabled");
        $.post(_conf.COMPOUND_AUDIO_URL, {
            text: text,
            voiceId: chSpeaker,
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
            _ttsData.tempFileName = data.data;
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
    };
    function _playTTSAudio () {
        var fileName = _ttsData.tempFileName;
        var previewURL = _conf.PREVIEW_VOICE + "?fileName=" + fileName;
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
    };
    function _stopTTSAudio() {
        var fileName = _ttsData.tempFileName;
        var previewURL = PREVIEW_VOICE + "?fileName=" + fileName;
        if (_audioControl) {
            _audioControl.pause();
            _checkAudio();
        }
        _ttsTabContent.find("#previewBtn").text("试听");
        _ttsTabContent.find("#saveBtn").attr("disabled", "disabled");
    };
    function _checkAudio() {
        if (_audioControl.ended) {
            _ttsTabContent.find("#previewBtn").text("试听");
            //停止周期事件
            if (_checkPlayingStatusHandler == null) {
                clearInterval(_checkPlayingStatusHandler);
            }
        }
    };
    function _initMultiRolePanel() {
        var roles = _conf.ttsRoles;
        var $targetDom = _ttsTabContent.find('#DBspeakerArea');
        var $manDom = $targetDom.find('.man-voice .type-select');
        var $womanDom = $targetDom.find('.woman-voice .type-select');
        var $childDom = $targetDom.find('.child-voice .type-select');
        $manDom.html('');
        $womanDom.html('');
        $childDom.html('');
        for (var i = 0; i < roles.length; i++) {
            var id = roles[i].voiceId;
            var name = roles[i].roleName;

            // 角色类型
            var type = roles[i].type;
            //男声
            if (type == "man") {
                $targetDom = $manDom;
            } else if (type == "woman") {
                //女声
                $targetDom = $womanDom;
            } else if (type == "child") {
                //儿童
                $targetDom = $childDom;
            } else {
                continue;
            }
            let text = '<label class="radio-inline"><input type="radio" id="'+ id +'" value="' + id + '" name="sex">' + name + '</label>';
            $targetDom.append(text);
        }
    };
    function _addWavHeader(samples, sampleRateTmp, sampleBits,
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
    };
    return {
        init: function(conf) {
            _init(conf);
        },
        open:function(conf) {
            _open(conf);
        }
    }
})();
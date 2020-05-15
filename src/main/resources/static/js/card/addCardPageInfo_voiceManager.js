wantong.addCardPageInfo.voiceManager = (function () {
    let _conf = {
            LOAD_IMAGE_AUDIO_URL:"/card/loadImageAudio.do",
            PREVIEW_VOICE : GlobalVar.contextPath + "/downloadTempFile.do",
        },
        _isLoad = false,
        _isBgmLoop = false,
        _progressBarDisable = false,
        _chromeProgressBarDisable = false,
        //音频控制器
        _audioControl = null,
        _tabRoot = null,
        _currentEditingRow = null,
        _checkVoiceTestHandler = null,
        _checkPlayingStatusHandler = null,
        _examineCallBack = null,
        _voiceTestStartTime = 0,
        _voiceTestCurrentTime = 0,
        _voiceTestDuration = 0,
        _rows0 = [],
        _rows1 = [],
        _rows2 = [],
        _voiceTestSetTimeoutHandlers = [];

    function _init(conf) {
        $.extend(_conf, conf);
        _initTab();
        _tabRoot = $("#tab_0_content");
        _initAddNewVoiceBtn();
        _initPlayBtn();
        _tabRoot[0].initilized = true;
        _initVoiceTest();
        _initVoiceTestClick();
        _initLisenterKey();
    };
    function _initPlayBtn () {
        var onPlayBtnClicked = function (obj) {
            if ($(obj).attr('status') == 'playing') { //点击按钮时，如果正在播放该音频，则停止播放
                _stopAllAudio();
                $(obj).attr('status', "");
                return;
            }
            var data = $(obj).parents("li").first()[0].voiceData;
            var fileName = data.tempFileName;
            var previewURL = "";
            if (data.editingMode) {
                var subFolder = null;
                var tabId = _tabRoot.attr("id");

                if (tabId == "tab_0_content") {
                    subFolder = "voice";
                } else if (tabId == "tab_1_content") {
                    subFolder = "bgMusic";
                } else if (tabId == "tab_2_content") {
                    subFolder = "effectSound";
                }
                previewURL = data.audioURL;
            } else {
                previewURL = _conf.PREVIEW_VOICE + "?fileName=" + fileName;
            }
            _stopAllAudio();
            _audioControl = new Audio(previewURL);
            _audioControl.playingRow = obj;
            _audioControl.play();
            $(obj).attr('status', "playing");

            var playingIcon = $(obj).parents("li").first().find("#playingIcon");
            _audioControl.playingIcon = playingIcon;
            playingIcon.show();
            _checkPlayingStatusHandler = setInterval(function () {
                if (_audioControl.ended) {
                    _audioControl.playingIcon.hide();
                    _audioControl.playingIcon = undefined;
                    $(obj).attr('status', "");
                    window.clearInterval(_checkPlayingStatusHandler);
                    _checkPlayingStatusHandler = null;
                }
            }, 10);
        };
        var hideAllDeleteBtn = function (tabRoot) {
            tabRoot.find("li").find("#deleteButton").hide();
        }
        var showDeleteBtn = function (target) {
            $(target).find("#deleteButton").show();
        }
        $("#tab_0_content").
        delegate("#playBtn", "click", function (event) {
            _voiceTestStop();
            onPlayBtnClicked(event.currentTarget);
        }).delegate("li", "mouseover", function (event) {
            hideAllDeleteBtn($("#tab_0_content"));
            showDeleteBtn(event.currentTarget);
        }).delegate("li", "mouseout", function (event) {
            hideAllDeleteBtn($("#tab_0_content"));
        }).delegate("#deleteButton", "click", function (event) {
            var $target  = $(event.currentTarget);
            _voiceTestStop();
            layer.confirm('您确定要删除吗？',{btn:['确认','取消']},function () {
                $target.parents("li").first().remove();
                _renewRowIndex(); //删除一条语音之后需要重新计算序号
                _intervalToStart(); //删除一条之后需要重新计算开始时间
                layer.msg("删除成功");
            });

        });

        $("#tab_1_content").delegate("#playBtn", "click",
            function (event) {
                _voiceTestStop();
                onPlayBtnClicked(event.currentTarget);
            }).delegate("li", "mouseover", function (event) {
            hideAllDeleteBtn($("#tab_1_content"));
            showDeleteBtn(event.currentTarget);
        }).delegate("li", "mouseout", function (event) {
            hideAllDeleteBtn($("#tab_1_content"));
        }).delegate("#deleteButton", "click", function (event) {
            var $target  = $(event.currentTarget);
            _voiceTestStop();
            layer.confirm('您确定要删除吗？',{btn:['确认','取消']},function () {
                $target.parents("li").first().remove();
                _renewRowIndex();
                layer.msg("删除成功");
            });

        });

        $("#tab_2_content").delegate("#playBtn", "click",
            function (event) {
                _voiceTestStop();
                onPlayBtnClicked(event.currentTarget);
            }).delegate("li", "mouseover", function (event) {
            hideAllDeleteBtn($("#tab_2_content"));
            showDeleteBtn(event.currentTarget);
        }).delegate("li", "mouseout", function (event) {
            hideAllDeleteBtn($("#tab_2_content"));
        }).delegate("#deleteButton", "click", function (event) {
            var $target = $(event.currentTarget);
            _voiceTestStop();
            layer.confirm('您确定要删除吗？',{btn:['确认','取消']},function () {
                $target.parents("li").first().remove();
                _renewRowIndex();
                layer.msg("删除成功");
            });
        });
    };
    function _initVoiceTestClick() { //音乐试听总控制中心
        var progressBar = document.querySelector('.voice-test-progress-bar');
        var now = document.querySelector('.voice-test-now');
        var palyBtn = $(".voice-test-btn");
        var stopBtn = $(".voice-test-btn-stop");
        progressBar.addEventListener('click', function (event) {
            var palyBtn = $(".voice-test-btn");
            if (palyBtn.hasClass("glyphicon-play")) { //没有播放时，点击进度条不做反应
                return;
            }
            if (_progressBarDisable) { //给外界的接口，控制进度条能否拖动
                return;
            }
            if (_chromeProgressBarDisable) { //谷歌浏览器下，如果存在新增的语音，禁用进度条拖动
                layer.msg("保存书页之后再试听才能拖动进度条哦!");
                return;
            }
            var coordStart = this.getBoundingClientRect().left;
            var coordEnd = event.pageX;
            var p = (coordEnd - coordStart) / this.offsetWidth;
            now.style.width = (p * 100).toFixed(3) + '%';
            _voiceTestCurrentTime = p * _voiceTestDuration;
            _voiceTestPause();
            _voiceTestPlay();
        });
        palyBtn.on("click", function () {
            _voiceTestPlayBtnClick();
        });
        stopBtn.on("click", function () {
            _voiceTestStop();
        });
    };
    function _initLisenterKey() {
        $('#pageAdd').keydown(function (event) {
            if (event.keyCode == 32) {
                var isExtraDataFocus=$("#extraDataText").is(":focus");
                var isEvalText = $("#evalText").is(":focus");
                var isVideoText = $("#videoText").is(":focus");
                var isExtraData = $("#extraData").is(":focus");
                if(!isExtraDataFocus && !isEvalText && !isVideoText && !isExtraData&& !$('input').is(':focus')) {
                    _voiceTestPlayBtnClick();
                }
            }
        });
    };
    function _voiceTestPlayBtnClick() { //开始语音播放
        _stopAllAudio(); //停止单条语音试听
        var start = document.querySelector('.voice-test-start');
        var now = document.querySelector('.voice-test-now');
        var palyBtn = $(".voice-test-btn");
        if (palyBtn.hasClass("glyphicon-play")) { //试听入口
            if (!_isVoiceTestValidate()) { //播放之前要进行语音的“准备”和“检测”，检测不通过，则无法播放
                _doExamineCallBack();
                return;
            }
            palyBtn.removeClass("glyphicon-play");
            palyBtn.addClass("glyphicon-pause");
            _voiceTestPlay();
            _checkVoiceTestHandler = setInterval(function () { //播放后，进度条开始滑动
                var nowTime = new Date().getTime();
                var num = nowTime - _voiceTestStartTime;
                _voiceTestCurrentTime = num / 1000;
                start.innerHTML = _conversion(_voiceTestCurrentTime);
                now.style.width = (_voiceTestCurrentTime / _voiceTestDuration
                    * 100).toFixed(3) + '%';
                if (parseFloat(now.style.width.replace("%", "")) >= 100) { //进度条到100%时，恢复初始状态
                    window.clearInterval(_checkVoiceTestHandler);
                    _voiceTestStop();
                    _doExamineCallBack();
                }
            }, 10);
        } else {
            palyBtn.removeClass("glyphicon-pause");
            palyBtn.addClass("glyphicon-play");
            window.clearInterval(_checkVoiceTestHandler); //暂停时，进度条停止滑动
            _stopAllAudio(); //停止单条语音试听
            _voiceTestPause(true); //暂停
        }
    };
    function _voiceTestPlay() { //音频播放控制中心
        _clearSetTimeoutHander();
        _voiceTestStartTime = new Date().getTime() - _voiceTestCurrentTime
            * 1000;

        _rows0.each(function (index) { //注意，两个each不可以合并
            //添加结束事件，使得音乐可以顺序播放
            if (index < _rows0.length - 1) {
                this.voiceData.audio.onended = function () {
                    var setTimeoutHander = setTimeout(function () {
                        console.info(
                            "_rows0[index + 1].voiceData.startAt - _rows0[index].voiceData.endAt:"
                            + (_rows0[index + 1].voiceData.startAt
                            - _rows0[index].voiceData.endAt));
                        _rows0[index + 1].voiceData.audio.play();
                    }, (_rows0[index + 1].voiceData.startAt
                        - _rows0[index].voiceData.endAt) * 1000);
                    _voiceTestSetTimeoutHandlers.push(setTimeoutHander);
                };
            }
        });
        _rows0.each(function (index) {
            //根据当前时间点启动音乐播放
            if (_voiceTestCurrentTime < this.voiceData.startAt) {
                console.info("this.voiceData.startAt-_voiceTestCurrentTime:"
                    + (this.voiceData.startAt - _voiceTestCurrentTime));
                _voiceTestSetTimeoutHandlers.push(setTimeout(function () {
                    console.info(index + " _rows0 begin,sleeptime:"
                        + (_rows0[index].voiceData.startAt - _voiceTestCurrentTime));
                    _rows0[index].voiceData.audio.play();
                }, (_rows0[index].voiceData.startAt - _voiceTestCurrentTime)
                    * 1000));
                return false;
            } else if (_voiceTestCurrentTime >= this.voiceData.startAt
                && _voiceTestCurrentTime < this.voiceData.endAt) {
                if (!_chromeProgressBarDisable) { //谷歌浏览器不能设置currentTime
                    this.voiceData.audio.currentTime = this.voiceData.audio.duration
                        + _voiceTestCurrentTime - this.voiceData.endAt;
                }
                console.info("this.voiceData.audio.currentTime:"
                    + this.voiceData.audio.currentTime);
                this.voiceData.audio.play();
                return false;
            }
        });
        _rows1.each(function (index) {
            var isBgmLoop = $(this).find("#loop").prop("checked");
            if (isBgmLoop) { //添加循环播放
                _isBgmLoop = true;
                this.voiceData.audio.loop = "loop";
            } else {
                this.voiceData.audio.loop = "";
            }
            //添加结束事件，使得音乐可以顺序播放
            if (index < _rows1.length - 1) {
                this.voiceData.audio.onended = function () {
                    var setTimeoutHander = setTimeout(function () {
                        console.info(
                            "_rows1[index + 1].voiceData.startAt - _rows1[index].voiceData.endAt:"
                            + (_rows1[index + 1].voiceData.startAt
                            - _rows1[index].voiceData.endAt));
                        _rows1[index + 1].voiceData.audio.play();
                    }, (_rows1[index + 1].voiceData.startAt
                        - _rows1[index].voiceData.endAt) * 1000);
                    _voiceTestSetTimeoutHandlers.push(setTimeoutHander);
                };
            }
        });
        _rows1.each(function (index) {
            //根据当前时间点启动音乐播放
            if (_voiceTestCurrentTime < this.voiceData.startAt) {
                console.info("this.voiceData.startAt-_voiceTestCurrentTime:"
                    + (this.voiceData.startAt - _voiceTestCurrentTime));
                _voiceTestSetTimeoutHandlers.push(setTimeout(function () {
                    console.info(index + " _rows1 begin,sleeptime:"
                        + (_rows1[index].voiceData.startAt - _voiceTestCurrentTime));
                    _rows1[index].voiceData.audio.play();
                }, (_rows1[index].voiceData.startAt - _voiceTestCurrentTime)
                    * 1000));
                return false;
            } else if (_voiceTestCurrentTime >= this.voiceData.startAt
                && _voiceTestCurrentTime < this.voiceData.endAt) {
                if (!_chromeProgressBarDisable) { //谷歌浏览器不能设置currentTime
                    this.voiceData.audio.currentTime = this.voiceData.audio.duration
                        + _voiceTestCurrentTime - this.voiceData.endAt;
                }
                console.info("this.voiceData.audio.currentTime:"
                    + this.voiceData.audio.currentTime);
                this.voiceData.audio.play();
                return false;
            }
            if (_isBgmLoop && index == _rows1.length - 1 && _voiceTestCurrentTime
                > this.voiceData.endAt) { //背景音乐，最后一个音频还不能播放的话，就播放第一个音频。
                _rows1[0].voiceData.audio.currentTime = 0;
                _rows1[0].voiceData.audio.play();
                return false;
            }
        });
        _rows2.each(function (index) {
            //添加结束事件，使得音乐可以顺序播放
            if (index < _rows2.length - 1) {
                this.voiceData.audio.onended = function () {
                    var setTimeoutHander = setTimeout(function () {
                        console.info(
                            "_rows2[index + 1].voiceData.startAt - _rows2[index].voiceData.endAt:"
                            + (_rows2[index + 1].voiceData.startAt
                            - _rows2[index].voiceData.endAt));
                        _rows2[index + 1].voiceData.audio.play();
                    }, (_rows2[index + 1].voiceData.startAt
                        - _rows2[index].voiceData.endAt) * 1000);
                    _voiceTestSetTimeoutHandlers.push(setTimeoutHander);
                };
            }
        });
        _rows2.each(function (index) {
            //根据当前时间点启动音乐播放
            if (_voiceTestCurrentTime < this.voiceData.startAt) {
                console.info("this.voiceData.startAt-_voiceTestCurrentTime:"
                    + (this.voiceData.startAt - _voiceTestCurrentTime));
                _voiceTestSetTimeoutHandlers.push(setTimeout(function () {
                    console.info(index + " _rows2 begin,sleeptime:"
                        + (_rows2[index].voiceData.startAt - _voiceTestCurrentTime));
                    _rows2[index].voiceData.audio.play();
                }, (_rows2[index].voiceData.startAt - _voiceTestCurrentTime)
                    * 1000));
                return false;
            } else if (_voiceTestCurrentTime >= this.voiceData.startAt
                && _voiceTestCurrentTime < this.voiceData.endAt) {
                if (!_chromeProgressBarDisable) { //谷歌浏览器不能设置currentTime
                    this.voiceData.audio.currentTime = this.voiceData.audio.duration
                        + _voiceTestCurrentTime - this.voiceData.endAt;
                }
                console.info("this.voiceData.audio.currentTime:"
                    + this.voiceData.audio.currentTime);
                this.voiceData.audio.play();
                return false;
            }
        });
    };
    function _isVoiceTestValidate () { //播放之前要进行语音的准备和检测，检测不通过，则无法播放
        if (_voiceTestCurrentTime == 0) { //当前试听时间是0的话，说明是从停止状态开始播放，需要更新整个播放列表，不是0，说明是从暂停状态开始播放，不需要更新列表
            _updateRowArr();
        }
        if (_rows0.length < 1) {
            layer.msg("没有试听语音，不能试听!");
            return false;
        }

        _chromeProgressBarDisable = false;
        var isVoiceTestValidate = true;
        _rows0.each(function (index) {
            if (!this.voiceData.editingMode) { //谷歌浏览器下，如果有新增的音频，则禁用进度条
                _chromeProgressBarDisable = true;
            }
            if (this.voiceData.audio.duration != null
                && this.voiceData.audio.duration > 0) {
                this.voiceData.endAt = parseFloat(this.voiceData.startAt)
                    + this.voiceData.audio.duration;
            } else {
                layer.msg("语音没有加载完整，不能试听!");
                isVoiceTestValidate = false;
                return false;
            }
            if (index == _rows0.length - 1) {
                _voiceTestDuration = this.voiceData.endAt; //试听音乐时长以语音总时长为标准
                document.querySelector('.voice-test-end').innerHTML = _conversion(
                    _voiceTestDuration);
            }
            console.info("_voiceTestDuration:" + this.voiceData.endAt);
        });
        if (!isVoiceTestValidate) {
            return isVoiceTestValidate;
        }

        var time1 = 0;
        _rows1.each(function (index) {
            if (!this.voiceData.editingMode) { //谷歌浏览器下，如果有新增的音频，则禁用进度条
                _chromeProgressBarDisable = true;
            }
            if (this.voiceData.audio.duration != null
                && this.voiceData.audio.duration > 0) {
                if (parseFloat(this.voiceData.startAt) < time1) { //当前音乐的开始时间必须大于上一条音乐的结束时间，否则检测不通过
                    layer.msg("背景音乐播放顺序不正确，请重新设置背景音乐开始时间!");
                    isVoiceTestValidate = false;
                    return false;
                }
                time1 = this.voiceData.endAt = parseFloat(this.voiceData.startAt)
                    + this.voiceData.audio.duration;
            } else {
                layer.msg("背景音乐没有加载完整，不能试听!");
                isVoiceTestValidate = false;
                return false;
            }
        });
        if (!isVoiceTestValidate) {
            return isVoiceTestValidate;
        }

        var time2 = 0;
        _rows2.each(function (index) {
            if (!this.voiceData.editingMode) { //谷歌浏览器下，如果有新增的音频，则禁用进度条
                _chromeProgressBarDisable = true;
            }
            if (this.voiceData.audio.duration != null
                && this.voiceData.audio.duration > 0) {
                if (parseFloat(this.voiceData.startAt) < time2) {
                    layer.msg("音效播放顺序不正确，请重新设置音效开始时间!");
                    isVoiceTestValidate = false;
                    return false;
                }
                time2 = this.voiceData.endAt = parseFloat(this.voiceData.startAt)
                    + this.voiceData.audio.duration;
            } else {
                layer.msg("音效没有加载完整，不能试听!");
                isVoiceTestValidate = false;
                return false;
            }
        });

        var userAgent = navigator.userAgent; //取得浏览器的userAgent字符串
        var isChrome = userAgent.indexOf("Chrome") > -1 && userAgent.indexOf(
            "Safari") > -1 && userAgent.indexOf("Edge") == -1; //判断Chrome浏览器
        _chromeProgressBarDisable = _chromeProgressBarDisable && isChrome; //谷歌浏览器下，如果有新增的音频，则禁用进度条

        console.info("isVoiceTestValidate:" + isVoiceTestValidate);
        return isVoiceTestValidate;
    };
    function _updateRowArr() {
        function compare(value1, value2) {
            return value1.voiceData.index - value2.voiceData.index;
        }

        var rows0 = $("#tab_0_content").find(".item-valid");
        rows0.sort(compare); // 排序
        _rows0 = rows0;
        var rows1 = $("#tab_1_content").find(".item-valid");
        rows1.sort(compare); // 排序
        _rows1 = rows1;
        var rows2 = $("#tab_2_content").find(".item-valid");
        rows2.sort(compare); // 排序
        _rows2 = rows2;
    };
    function _doExamineCallBack() {
        if (_examineCallBack) { //音频播放完以后调用审核的某个事件
            _examineCallBack();
            _examineCallBack = null;
        }
    };
    function _initTab() {
        $(".voiceTabItem").on("click", function () {
            _stopAllAudio();
            let isError = false;
            $(".voiceTabItem").each(function () {
                var value = $(document.activeElement).val();
                if (!_startAtValidate(value) || !_checkValue(value)) {
                    isError = true;
                    return;
                }

                $(this).removeClass("active");
                var index = parseInt($(this).attr("index"));
                $("#tab_" + index + "_content").hide();
            });
            if (isError) {
                return;
            }
            if ($(this).hasClass('no-play-bar')) {
                $('.voice-progress-bar').css('visibility', 'hidden');
            } else {
                $('.voice-progress-bar').css('visibility', 'visible');
            }
            $(this).addClass("active");
            var index = parseInt($(this).attr("index"));
            _tabRoot = $("#tab_" + index + "_content");
            _tabRoot.show();
            if (!_tabRoot[0].initilized) {
                _tabRoot[0].initilized = true;
                _initAddNewVoiceBtn();
            }
        });
    };
    function _initAddNewVoiceBtn() {
        _tabRoot.find("#addNewVoiceBtn").on("click", function () { //给按钮“添加新语音”增加点击事件

            _stopAllAudio();
            _voiceTestStop();
            var value = $(document.activeElement).val();
            if (_startAtValidate(value) && _checkValue(value)) {
                _createNewRow();
                _openVoiceEditor();
            }

        });
    };
    function  _voiceTestStop(){ //停止试听: 先停止，再初始化
        _stopAllAudio();
        _voiceTestPause();
        _initVoiceTest();
    };
    function _voiceTestPause(pause) {
        console.info("_voiceTestCurrentTime.pause:" + _voiceTestCurrentTime);
        _clearSetTimeoutHander();

        if (_rows0.length > 0) {
            _rows0.each(function (index) {
                if (this.voiceData.audio) {
                    this.voiceData.audio.pause();
                    if (!pause) {
                        this.voiceData.audio.currentTime = 0;
                    }
                }
            });
        }
        if (_rows1.length > 0) {
            _rows1.each(function (index) {
                this.voiceData.audio.pause();
                if (!pause) {
                    this.voiceData.audio.currentTime = 0;
                }
            });
        }
        if (_rows2.length > 0) {
            _rows2.each(function (index) {
                this.voiceData.audio.pause();
                if (!pause) {
                    this.voiceData.audio.currentTime = 0;
                }
            });
        }
    };
    function _initVoiceTest() {
        var start = document.querySelector('.voice-test-start');
        var end = document.querySelector('.voice-test-end');
        var now = document.querySelector('.voice-test-now');
        var palyBtn = $(".voice-test-btn");
        _clearSetTimeoutHander();
        window.clearInterval(_checkVoiceTestHandler);
        _voiceTestStartTime = 0;
        _voiceTestCurrentTime = 0;
        _voiceTestDuration = 0;
        start.innerHTML = _conversion(_voiceTestCurrentTime);
        end.innerHTML = _conversion(_voiceTestDuration);
        now.style.width = 0;
        palyBtn.removeClass("glyphicon-pause");
        palyBtn.addClass("glyphicon-play");
        _rows0 = [];
        _rows1 = [];
        _rows2 = [];
    }
    function _stopAllAudio() {
        if (_audioControl) {
            _audioControl.pause();
            _audioControl.currentTime = 0;
            if (_audioControl.playingIcon) {
                _audioControl.playingIcon.hide();
            }
            if (_audioControl.playingRow) {
                $(_audioControl.playingRow).attr('status', "");
            }
            _audioControl.playingRow = undefined;
            _audioControl = null;
        }
        if (_checkPlayingStatusHandler != null) {
            window.clearInterval(_checkPlayingStatusHandler);
        }
    };
    function _startAtValidate(startAtValue) {
        console.log("startAtValue:" + startAtValue);
        if (startAtValue > 1500 || startAtValue < 0) {
            return false;
        }
        return true;
    };
    function _checkValue(value) {
        console.log("value" + value);
        if (isNaN(value)) {

            return false;
        }
        return true;
    };
    function _conversion(value) {
        let minute = Math.floor(value / 60);
        minute = minute.toString().length === 1 ? ('0' + minute) : minute;
        let second = Math.round(value % 60);
        second = second.toString().length === 1 ? ('0' + second) : second;
        return minute + ":" + second;
    };
    function _startAtValidateDecimals (startValue) {
        console.log("startAtValue:" + startValue);
        var reg = /^[0-9]+(\.[0-9]{1,2})?$/;
        if (!reg.test(startValue)) {
            return false;
        }
        return true;
    };
    function _clearSetTimeoutHander() {
        for (var i = 0; i < _voiceTestSetTimeoutHandlers.length; ++i) {
            window.clearTimeout(_voiceTestSetTimeoutHandlers[i]);
        }
        _voiceTestSetTimeoutHandlers = [];
    };
    function _createNewRow () {  //新添加一行语音
        _currentEditingRow = $(_tabRoot.find("#voiceItemTemplate").prop('outerHTML'));
        _currentEditingRow.isNew = true;
        _tabRoot.find("ul").find("li").first().after(_currentEditingRow);
        var intervalTime = _currentEditingRow.find("#intervalTime");
        intervalTime.on('blur', function () {
            var value = $(this).val();
            if (value == '') {
                $(this).val('0.00');
            } else if (!_checkValue(value)) {
                $(this).focus();
                layer.msg("请输入数字类型");
                return false;
            } else if (!_startAtValidate(value)) {
                $(this).focus();
                layer.msg("时间间隔请填写小于1500，少于两位小数的正整数字");
                $(this).val("0.00");
                return false;
            } else if (!_startAtValidateDecimals(value)) {
                var temp = parseFloat(value);
                var va = temp.toFixed(2);
                $(this).val(va);
                layer.msg("时间间隔的小数位数，最多为两位");
            }
            _voiceTestStop();
            _intervalToStart(); //每一次修改间隔时间，都要重新计算开始时间
            return true;
        });
        intervalTime.on('mouseleave', function () {
            var value = $(this).val();
            if (!_startAtValidate(value)) {
                layer.msg("时间间隔请填写小于1500，少于两位小数的正整数字");
                $(this).val("0.00");
            }
        });
        intervalTime.on('click', function () {
            var value = $(this).val();
            if (value <= 0) {
                $(this).val('');
            }
        });
        var startAt = _currentEditingRow.find("#startAt");
        startAt.on('blur', function () {
            var value = $(this).val();
            if (value == '') {
                $(this).val('0.00');
            } else if (!_checkValue(value)) {
                $(this).focus();
                layer.msg("请输入数字类型");
                return false;
            } else if (!_startAtValidate(value)) {
                $(this).focus();
                layer.msg("时间间隔请填写小于1500，少于两位小数的数字");
                return false;
            } else if (!_startAtValidateDecimals(value)) {
                var temp = parseFloat(value);
                var va = temp.toFixed(2);
                $(this).val(va);
                layer.msg("时间间隔的小数位数，最多为两位");
                return true;
            }
            _voiceTestStop();
            _intervalToStart(); //每一次修改开始时间，都要重新设置开始时间
            return true;
        });
        startAt.on('click', function () {
            var value = $(this).val();
            if (value <= 0) {
                $(this).val('');
            }
        });

        _currentEditingRow.show().attr("id", "").addClass("item-valid");
        if (_tabRoot.attr("id") == "tab_0_content" && _tabRoot.find(
            ".item-valid").length == 1) {  //第一条语音时间间隔默认0
            _currentEditingRow[0].voiceData = {intervalTime: 0.00};
            intervalTime.val("0.00");
        }
        _currentEditingRow.find("#editBtn").on("click", function () {
            _currentEditingRow = $(this).parents("li").first();
            _stopAllAudio();
            _voiceTestStop();
            var value = $(document.activeElement).val();
            if (_startAtValidate(value) && _checkValue(value)) {
                _openVoiceEditor();
            }
        });
    };
    function _intervalToStart() { //语音界面需要把"时间间隔"计算成"开始时间"
        function compare(value1, value2) {
            return value1.voiceData.index - value2.voiceData.index;
        }

        var rows = _tabRoot.find(".item-valid");
        rows.sort(compare); // 排序
        if (_tabRoot.attr("id") == "tab_0_content") {
            var time = 0;
            rows.each(function (index) { //按顺序计算每一行的开始时间
                this.voiceData.intervalTime = parseFloat(
                    $(this).find("#intervalTime").val());
                //判断输入的有问题
                if (this.voiceData.intervalTime == null || isNaN(
                    this.voiceData.intervalTime)) {
                    console.info(this.voiceData.intervalTime + "Type:******"
                        + typeof(this.voiceData.intervalTime));
                    this.voiceData.intervalTime = 0.00;

                }
                time += this.voiceData.intervalTime; //上一条的结束时间加上本条间隔时间等于本条audio开始时间
                this.voiceData.startAt = time;
                $(this).find("#startAt").val(time);
                time += this.voiceData.audio.duration; //时间点切换到本条音乐的结束时间
                console.info(
                    "_intervalToStart:" + index + ";  startAt:" + $(this).find(
                    "#startAt").val() + ";  time+=" + time);
            });
        } else { //非语音界面
            rows.each(function (index) { //按顺序获得每一行的开始时间
                this.voiceData.startAt = parseFloat($(this).find("#startAt").val());
            });
        }
    };
    function _openVoiceEditor() {
        let type = undefined;
        //有数据表示编辑，没数据表示是新增
        if (_currentEditingRow[0].voiceData) {
            type = parseInt(_currentEditingRow[0].voiceData.type);
        }
        var data = _currentEditingRow[0].voiceData;
        var isFirstTab = (_tabRoot.attr("id") == "tab_0_content");
        var isSecondTab = (_tabRoot.attr("id") == "tab_1_content");
        var title = "";
        if (isFirstTab) {
            title = "真人录音";
        } else if (isSecondTab) {
            title = "上传背景音乐";
        } else {
            title = "上传音效";
        }
        if (_currentEditingRow.isNew && isFirstTab) { //如果是新增语音，那么默认是显示TTS语音界面
            type = 1;
        }
        var imageId = 0;
        if(_conf.initData != undefined){
            imageId = _conf.initData.id;
        }
        wantong.addCardPageInfo.voiceEditor.open({
            enableTTS: isFirstTab,
            titleOfUploadPanel: title,
            type: type,
            data: data,
            ttsRoles: _conf.ttsRoles,
            cardId:_conf.cardId,
            close: function (isCancel, data, audio, finger, isRefresh) {
                $("#text").val('');
                $("li input [name='chSpeaker'][value='0']").attr("checked",
                    '');
                _audioControl = audio;
                if (_audioControl) {
                    _audioControl.pause();
                }
                if (isCancel) {
                    if (_currentEditingRow.isNew) {
                        _currentEditingRow.remove();
                    }
                    if(_conf.imageId != 0) {
                        if(isRefresh) {
                            console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
                            _loadImageAudio();
                        }
                    }
                    return;
                }

                if (data.originFileName != data.tempFileName) {
                    _updateCurrentEditingRow(data);
                }
                _currentEditingRow = null;
            }
        });
    };

    function  _loadImageAudio(){
        $.ajax({
            type:"get",
            url:_conf.LOAD_IMAGE_AUDIO_URL,
            data:{imageId:_conf.initData.imageId},
            async:false,
            success: function (data) {
                if(data.code==0 && data.data.voice!= null && data.data.voice.length!=0){
                    _setAudioFileData(data.data.voice);
                }
            },
            error:function (data) {

            }
        });
    };
    function _setAudioFileData(voice) {
        //重新加载当前界面
        wantong.cms.pageAdd.loadPageData(_conf.initData.id);
        _updateChangeAudioRow(voice);
    };
    function _updateChangeAudioRow(voice){
        $("#tab_0_content").find(".item-valid").each(function () {
            _currentEditingRow=$(this);
            var data = _currentEditingRow[0].voiceData;
            if(data != undefined) {
                for (var i = 0; i < voice.length; i++) {
                    if (data.clientFileName == voice[i].clientFileName
                        && data.startAt == voice[i].startAt && data.tempFileName
                        != voice[i].tempFileName) {
                        data.tempFileName = voice[i].tempFileName;
                        _updateCurrentEditingRow(data);
                    }
                }
            }
        });
    };
    function _loadData(data,containEditing) {
        _conf.initData = data;
        if(_conf.initData != undefined){
            _isLoad = true;
            let originalTab = _tabRoot;
            let voiceData = _conf.initData.voiceVO;
            if (voiceData != null && voiceData.voice && voiceData.voice.length > 0) {
                for (let i = 0; i < voiceData.voice.length; i++) {
                    _tabRoot = $("#tab_0_content");
                    _createNewRow();
                    if (!containEditing) {
                        voiceData.voice[i].editingMode = true;
                    }
                    voiceData.voice[i].index = i + 1;
                    _updateCurrentEditingRow(voiceData.voice[i]);
                }
            }
            if (voiceData != null && voiceData.bgMusic) {
                for (var i = 0; i < voiceData.bgMusic.length; i++) {
                    _tabRoot = $("#tab_1_content");
                    _createNewRow();
                    if (!containEditing) {
                        voiceData.bgMusic[i].editingMode = true;
                    }
                    voiceData.bgMusic[i].index = i + 1;
                    _updateCurrentEditingRow(voiceData.bgMusic[i]);
                }
            }
            if (voiceData != null && voiceData.effectSound) {
                for (var i = 0; i < voiceData.effectSound.length; i++) {
                    _tabRoot = $("#tab_2_content");
                    _createNewRow();
                    if (!containEditing) {
                        voiceData.effectSound[i].editingMode = true;
                    }
                    voiceData.effectSound[i].index = i + 1;
                    _updateCurrentEditingRow(voiceData.effectSound[i]);
                }
            }
            _tabRoot = originalTab;
            _isLoad = false;
        }
        _initVoiceDrag();
    };

    function _updateCurrentEditingRow(data) {
        _currentEditingRow[0].voiceData = data;
        let fileName = data.clientFileName;
        if (fileName.length > 15) {
            fileName = fileName.substring(0, 12) + "...";
        }
        if(data.type==0) {
            _currentEditingRow.find("#voiceType").text("真人");
            _currentEditingRow.find("#voiceType").css("display","inline-block");
            _currentEditingRow.find("#fileName").text(fileName);
            _currentEditingRow.find("#fileName").attr("title", data.clientFileName);
        }else {
            _currentEditingRow.find("#voiceType").text("合成");
            _currentEditingRow.find("#voiceType").css("display","inline-block");

            if (fileName.substr(-4) == ".mp3" ){
                fileName = fileName.substr(0,fileName.length-4);
            }
            _currentEditingRow.find("#fileName").text(fileName);
            _currentEditingRow.find("#fileName").attr("title", fileName);
        }

        if (_isLoad) { // 加载数据的时候才能给开始时间赋值
            if (_currentEditingRow[0].voiceData.startAt === undefined) {
                _currentEditingRow[0].voiceData.startAt = 0.00;
            }
            _currentEditingRow.find("#startAt").val(
                _currentEditingRow[0].voiceData.startAt);
        }
        if (data.loop == 0) {
            _currentEditingRow.find("#loop").attr("checked", false);
        }
        var previewURL = null;
        _renewRowIndex();
        _loadDuratinForAudio(_currentEditingRow[0]);
    };
    function _renewRowIndex() {
        let rows = _tabRoot.find(".item-valid");
        rows.each(function (index) {
            var rowIndex = rows.length - index;
            $(this).find("#rowIndex").text(rowIndex);
            this.voiceData.index = rowIndex;
            //为啥要赋值
            if (rowIndex == 1) {
                $(this).find("#intervalTime").val('0.00');
            }
        });
    };
    function _loadDuratinForAudio(row) {
        var data = row.voiceData;
        if (data.editingMode) {
            var subFolder = null;
            var tabId = _tabRoot.attr("id");

            if (tabId == "tab_0_content") {
                subFolder = "voice";
            } else if (tabId == "tab_1_content") {
                subFolder = "bgMusic";
            } else if (tabId == "tab_2_content") {
                subFolder = "effectSound";
            }
            previewURL = data.audioURL;
        } else {
            previewURL = _conf.PREVIEW_VOICE + "?fileName=" + data.tempFileName;
        }

        var loadingIcon = $(
            '<img id="durationErrorIcon" src="' + GlobalVar.contextPath
            + '/static/images/loading.gif" style="margin-top: 15px; width: 20px;height:20px">');
        $(row).find("#durationContainer").html(loadingIcon);

        var audioControl = new Audio(previewURL);
        row.voiceData.audio = audioControl;
        audioControl.row = row;
        var isload = _isLoad;
        audioControl.addEventListener('durationchange', function (e) {
            var updateDuration = function () {
                $(audioControl.row).find("#durationContainer").text(
                    audioControl.duration.toFixed(2) + '\'\'');
            };
            updateDuration();
            if (isload) {
                _startToInterval();
            } else {
                _intervalToStart();
            }
        }, false);
        audioControl.addEventListener('error', function (e) {
            var durationErrorIcon = $(
                '<img id="durationErrorIcon" src="' + GlobalVar.contextPath
                + '/static/images/warning.png" style="margin-top: 15px; width: 20px;height:20px">');
            $(audioControl.row).find("#durationContainer").html(
                durationErrorIcon);
            durationErrorIcon.click(function () {
                _loadDuratinForAudio(audioControl.row);
            });
        });
    };
    function _startToInterval() { //加载的时候语音界面需要把"开始时间"计算成"时间间隔"
        if (_tabRoot.attr("id") == "tab_0_content") {
            function compare(value1, value2) {
                return value1.voiceData.index - value2.voiceData.index;
            }

            var rows = _tabRoot.find(".item-valid");
            rows.sort(compare); // 排序
            var time = 0;
            rows.each(function (index) {
                this.voiceData.intervalTime = (parseFloat(this.voiceData.startAt)
                    - time);
                if (this.voiceData.intervalTime < 0 && this.voiceData.intervalTime
                    > -0.01) {
                    this.voiceData.intervalTime = 0.00;
                }
                $(this).find("#intervalTime").val(
                    this.voiceData.intervalTime.toFixed(2));
                time = this.voiceData.audio.duration + this.voiceData.startAt;
                console.info("_startToInterval time +=" + time);
            });
        }
    };
    function _initVoiceDrag() {
        $('#tab_0_content ul').sortable({
            animation: 150,
            draggable: '.item-valid',
            onUpdate: _dragUpdate
        });
        $('#tab_1_content ul').sortable({
            animation: 150,
            draggable: '.item-valid',
            onUpdate: _dragUpdate
        });
        $('#tab_2_content ul').sortable({
            animation: 150,
            draggable: '.item-valid',
            onUpdate: _dragUpdate
        });
    };
    function _dragUpdate (event) {
        console.log("drag to update voice.....");
        _voiceTestStop();
        _renewRowIndex(); //删除一条语音之后需要重新计算序号
        // _intervalToStart(); //删除一条之后需要重新计算开始时间
        _intervalToStart_1();
    };
    function _intervalToStart_1(){
        if (_tabRoot.attr("id") == "tab_0_content") {
            function compare(value1, value2) {
                return value1.voiceData.index - value2.voiceData.index;
            }
            var rows = _tabRoot.find(".item-valid");
            rows.sort(compare); // 排序
            var time = 0;

            rows.each(function (index) { //按顺序计算每一行的开始时间
                this.voiceData.intervalTime = parseFloat(
                    $(this).find("#intervalTime").val());
                //判断输入的有问题

                console.info(this.voiceData.intervalTime + "Type:******"
                    + typeof(this.voiceData.intervalTime));
                if(index==0)
                {
                    this.voiceData.intervalTime = 0.00;
                    $(this).find("#intervalTime").val(0.00.toFixed(2));
                }else {
                    this.voiceData.intervalTime = 0.70;
                    $(this).find("#intervalTime").val(0.70.toFixed(2));
                }

                time += this.voiceData.intervalTime; //上一条的结束时间加上本条间隔时间等于本条audio开始时间
                this.voiceData.startAt = time;
                $(this).find("#startAt").val(time);

                time += this.voiceData.audio.duration; //时间点切换到本条音乐的结束时间
                console.info(
                    "_intervalToStart:" + index + ";  startAt:" + $(this).find(
                    "#startAt").val() + ";  time+=" + time);
            });
        } else { //非语音界面
            rows.each(function (index) { //按顺序获得每一行的开始时间
                this.voiceData.startAt = parseFloat($(this).find("#startAt").val());
            });
        }
    };
    function _getData() {
        var error = false;
        var isErrorVoice = false;
        var data = {
            voice: [],
            bgMusic: [],
            effectSound: []
        };
        var partData={
            audios:[]
        }
        for (var i = 0; i < 3; i++) {
            var contentPanel = $("#tab_" + i + "_content");
            contentPanel.find(".item-valid").each(function () {
                if (this.voiceData.audio) {
                    if (!this.voiceData.audio.duration/*||this.voiceData.audio.duration == null||this.voiceData.audio.duration<=0*/) {
                        isErrorVoice = true;
                        return;
                    }
                }

                //this.voiceData.audio = null;
                var voiceData = this.voiceData;
                var startAtStr = $(this).find("#startAt").val();
                if (!_startAtValidate(startAtStr)) {
                    error = true;
                    return;
                }
                this.voiceData.startAt
                this.voiceData.intervalTime
                voiceData.startAt = parseFloat(startAtStr);
                voiceData.loop = $(this).find("#loop").prop("checked") ? 1 : 0;

                if (i == 0) {
                    data.voice.push(voiceData);
                } else if (i == 1) {
                    data.bgMusic.push(voiceData);
                } else if (i == 2) {
                    data.effectSound.push(voiceData);
                }
            });
        }
        if(data.effectSound.length>0 || data.bgMusic.length>0){
            if(data.voice.length<=0){
                return "4";
            }
        }

        if (data.voice.length == 0) {
            return "2";
        }
        if (isErrorVoice) {
            return "1";
        }
        if (data.voice.length > 1) {
            for (var i = 0; i < data.voice.length; i++) {

                if (i != (data.voice.length - 1) && data.voice[i].startAt == 0) {
                    return "3";
                }
            }
        }
        if (error) {
            return false;
        }
        data = _regroupVoiceData(data);
        return data;
    };
    function _regroupVoiceData(voicedata) {
        var data = {
            voice: [],
            bgMusic: [],
            effectSound: []
        };
        var voice = voicedata.voice;
        var bgMusic = voicedata.bgMusic;
        var effectSound = voicedata.effectSound;
        for (var i = 0; i < voice.length; i++) {
            voice[i].audio = null;
        }
        for (var i = 0; i < bgMusic.length; i++) {
            bgMusic[i].audio = null;
        }
        for (var i = 0; i < effectSound.length; i++) {
            effectSound[i].audio = null;
        }
        data.voice = voice;
        data.bgMusic = bgMusic;
        data.effectSound = effectSound;

        return data;
    };
    function _renewAll () {
        _stopAllAudio();
        _voiceTestStop();
        for (var i = 0; i < 3; i++) {
            var tabRoot = $("#tab_" + i + "_content");
            tabRoot.find("ul").find("li").each(function (index) {
                if (index > 0 && $(this).attr("id") != "voiceItemTemplate") {//do not delete the first add more button line
                    $(this).remove();
                }
            });
        }
       $(".voiceTabItem").first().click();  //保存一个书页之后，需要还原语音编辑界面。同时注意voiceTabItem也要回到第一个。
    };
    return{
        init : function(conf) {
            _init(conf)
        },
        getData:function(){
            return _getData();
        },
        renewAll: function () {
            _renewAll();
        },
        loadData:function(data,containEditing){
            _loadData(data,containEditing);
        },
        stopAllAudio: function () {
            _stopAllAudio();
        },
        drapAudio:function () {
            _initVoiceDrag();
        },
        voiceTestStop: function () {
            _voiceTestStop();
        },
    }
})();

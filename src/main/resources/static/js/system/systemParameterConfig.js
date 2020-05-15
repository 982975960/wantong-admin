wantong.systemParameterConfig = (function () {
    var SAVE_PARAMCONFIG_URL = GlobalVar.contextPath + "/system/saveParamConfig.do",
        GET_PARAMLIST_URL = GlobalVar.contextPath + "/system/systemParameterConfig.do",
        CHECK_WECHATPARAM = GlobalVar.contextPath + "/system/checkWechatParam.do",
        GET_WECHATPARAM = GlobalVar.contextPath + "/system/getWechatParam.do",
        CHANGE_DISPLAYBOX = GlobalVar.contextPath + "/system/changeDisplayBox.do",
        _paramForm = null,
        _root = null,
        _saveBtn = null,
        _closeBtn = null,
        _index = null,
        _serachForm = null,
        _openParamConfigDialog=null,
        _domainName = null,
        _paramId = null,
        _parentUrl = null,
        _account = null,
        _isCreate = 0, // 0创建，1编辑
        _conf = {},
        _init = function (conf) {
            $.extend(_conf, conf);
            _root = $("#systemParamConfig");
            _paramForm = _root.find("#paramForm");
            _saveBtn = _root.find("#saveBtn");
            _closeBtn = _root.find("#closeBtn");
            _serachForm = _root.find("#searchFrom");
            _openParamConfigDialog = _root.find("#paramConfigDialog");
            _serachForm.attr("action", GET_PARAMLIST_URL);
            _saveParamConfig();
            _openParamConfig();
            _updateParamConfig();
            _loadPageContent();
            _checkParentParam();
            _disableButton();
            _initHelp();
            _changeDisplayBox();
        },
        _initHelp = function () {
            _root.find("#helpImg").mouseover(function () {
                var that = this;
                layer.tips("玩瞳盒子是一项免费送书服务，用户每周可在家长端玩瞳盒子内免费领书一套。服务提供的图书均具有优质有声资源支持。",that,{
                    tips: [2, '#3595CC'],
                    time: 20000
                });
            });
            _root.find("#helpImg").mouseout(function () {
                $("div[type='tips']").remove();
            });
        };
        _changeDisplayBox = function () {
            _root.find("#displayBox").click(function () {
                if (_isCreate === 0){
                    return;
                }
                if (_paramId == null){
                    return;
                }
                var isDisplayBox = 0;
                if (_paramForm.find("#displayBox").prop("checked")) {
                    isDisplayBox = 1;
                }
                $.get(CHANGE_DISPLAYBOX,
                  {id: _paramId, displayBox: isDisplayBox},
                  function (data) {
                    if (data.code === 0){
                        layer.msg("修改成功");
                    }
                });
            });
        };
        _disableButton = function(){
            var partnerId = _root.find("#applyConfig").attr("partnerId");
            var totalCount = _root.find("#applyConfig").attr("totalCount");
            if (partnerId != 1 && totalCount > 0){
                _root.find("#applyConfig").css("display","none");
            }
        };
        _checkParentParam = function(){
            _root.find("#parentUrlBtn").click(function () {

                var appId = _root.find("#appId").val();
                var appSecret = _root.find("#appSecret").val();
                _root.find("#parentUrlBtn").attr("disabled","disabled");
                $.post(CHECK_WECHATPARAM,{
                    account: _account,
                    appId: appId,
                    appSecret: appSecret,
                    paramId:_paramId
                },function(data){
                    if (data.code == 0) {
                        _root.find("#qrCode").show();
                        _root.find("#parentUrlDiv").show();
                        _root.find("#parentUrlBtn").html("验证通过").attr("disabled","disabled").css("background-color","#eee").css("color","#000000").css("margin-left","43%");
                        _root.find("#qrImg").attr("src","https://open.weixin.qq.com/qr/code?username="+_account);
                        _root.find("#parentUrlP").empty().html("家长端链接:<br><br>" + _parentUrl );
                    } else {
                        layer.msg("验证失败：" + data.msg);
                        if (data.data.accountError == "accountError"){
                            _root.find("#accountDiv").append("<b style='color:red;font-size: large'>!</b>");
                        }
                        if (data.data.appIDError == "appIDError") {
                            _root.find("#appIdDiv").append("<b style='color:red;font-size: large'>!</b>");
                        }
                        if (data.data.appsecretError == "appsecretError") {
                            _root.find("#appSecretDiv").append("<b style='color:red;font-size: large'>!</b>");
                        }
                    }
                });
            });
        };
        _openParamConfig = function(){
            _root.find("#applyConfig").click(function () {
                _domainName = $(this).attr("domainName");
                _root.find("#domainName").val(_domainName);
                _root.find("#parentUrlBtn").remove();
                _root.find("#qrCode").remove();
                // _paramForm.find("#displayBox").prop("checked",true);
                layer.open({
                    title: "参数配置",
                    type: 1,
                    maxmin: false,
                    resize: false,
                    scrollbar: true,
                    area: ['800px', '700px'],
                    content: _openParamConfigDialog,
                    end: function () {
                        var currentPage = _root.find("#currentPage").val();
                        console.log("currentPage:" + currentPage);
                        wantong.frame.showPage(GlobalVar.backPath,
                            {currentPage: currentPage});
                        layer.closeAll();
                    },
                    cancel: function () {

                    },
                    success: function (layero) {
                        var mask = $(".layui-layer-shade");
                        mask.appendTo(layero.parent());
                        //其中：layero是弹层的DOM对象
                    }
                });
                _index = layer.index;
            });

        };
        _saveParamConfig = function () {
            _saveBtn.click(function () {
                var nickname = _paramForm.find("#nickname").val();
                var account = _paramForm.find("#account").val();
                var appId = _paramForm.find("#appId").val();
                var appSecret = _paramForm.find("#appSecret").val();
                var domainName = _root.find("#domainName").val();
                var isDisplayBox = 0;
                if (_paramForm.find("#displayBox").prop("checked")) {
                    isDisplayBox = 1;
                }

                var type = 0;
                var tabText = _root.find(".layui-this").text();
                if (tabText == "微信公众号参数") {
                    type = 0;
                }
                if (nickname.length>50 || account.length>50 || appId.length>50 || appSecret.length>50) {
                    layer.msg("文本框最多可输入50个字符");
                    return;
                }


                if (domainName == ""){
                    layer.msg("域名为空，不能配置");
                    return;
                }
                if (nickname == ""){
                    layer.msg("名称不能为空");
                    return;
                }
                if (account == ""){
                    layer.msg("微信号不能为空");
                    return;
                }
                if (appId == ""){
                    layer.msg("appID不能为空");
                    return;
                }
                if (appSecret == ""){
                    layer.msg("appsecret不能为空");
                    return;
                }
                _saveBtn.attr("disabled", "disabled");
                $.post(SAVE_PARAMCONFIG_URL, {
                    nickname: nickname,
                    account: account,
                    appId: appId,
                    appSecret: appSecret,
                    paramId:_paramId,
                    type:type,
                    isDisplayBox:isDisplayBox
                }, function (data) {
                    if (data.code == 0) {
                        layer.msg("保存成功");
                        setTimeout(function () {
                            layer.close(_index);
                         }, 1500);

                        /* setTimeout(function () {
                           wantong.frame.showPage(GlobalVar.backPath, GlobalVar.data);
                         }, 500);*/
                    } else {
                        layer.msg("保存失败：" + data.msg);
                        _saveBtn.removeAttr("disabled");
                    }
                });
            });
            _closeBtn.click(function () {
                layer.close(_index);
            });
        };
        _updateParamConfig = function () {
            _root.find("button[flag='flag']").click(function () {
                /*_domainName = $(this).attr("domainName");
                _root.find("#domainName").val(_domainName);*/

                _isCreate = 1;
                _paramId = $(this).attr("paramId");
                _parentUrl = $(this).attr("parentUrl");
                var partnerId = $(this).attr("partnerId");
                var status = $(this).attr("status");
                /*if (partnerId == 1){
                    _root.find("#displayBox").attr("disabled","disabled");
                }*/

                $.ajaxSettings.async = false;
                $.post(GET_WECHATPARAM,{
                    paramId:_paramId
                },function (data) {
                    _root.find("#nickname").val(data.data.nickname);
                    _root.find("#account").val(data.data.account);
                    _root.find("#appId").val(data.data.appId);
                    _root.find("#appSecret").val(data.data.appSecret);
                    _account = data.data.account;
                    if (data.data.displayBox==1){
                        _root.find("#displayBox").prop("checked",true);
                    }
                    /*if (data.data.displayBox==1 && partnerId == 1){
                        _root.find("#displayBox").css("background","url(/static/images/ico20.jpg)no-repeat 0 0").css("background-size","100%");
                    }*/

                });
                $.ajaxSettings.async = true;
                _displayParentUrlAndQrCode(_parentUrl,partnerId,status);
                layer.open({
                    title: "编辑参数配置",
                    type: 1,
                    maxmin: false,
                    resize: false,
                    scrollbar: true,
                    area: ['800px', '700px'],
                    content: _openParamConfigDialog,
                    end: function () {
                        var currentPage = _root.find("#currentPage").val();
                        console.log("currentPage:" + currentPage);
                        wantong.frame.showPage(GlobalVar.backPath,
                            {currentPage: currentPage});
                        layer.closeAll();
                    },
                    cancel: function () {

                    },
                    success: function (layero) {
                        var mask = $(".layui-layer-shade");
                        mask.appendTo(layero.parent());
                    }
                });
                _index = layer.index;
            });
            _closeBtn.click(function () {
                layer.close(_index);
            });
        };
        _displayParentUrlAndQrCode = function (parentUrl,partnerId,status) {
            if (partnerId == 1){
                _root.find("#saveAndCloseDiv").remove();
            }
            if (status ==0 && partnerId == 1 ) {
                _root.find("#qrCode").hide();
                _root.find("#parentUrlDiv").hide();
                _setInputReadonly();
            }else if (status ==1 && partnerId == 1) {
                _root.find("#parentUrlBtn").html("验证通过").attr("disabled","disabled").css("background-color","#eee").css("color","#000000").css("margin-left","43%");
                _root.find("#parentUrlP").empty().html("家长端链接：<br><br>" + _parentUrl );
                _root.find("#qrImg").attr("src","https://open.weixin.qq.com/qr/code?username=" + _account);
                _setInputReadonly();
            }
            if (status == 0 && partnerId != 1) {
                _root.find("#parentUrlBtnDiv").remove();
                _root.find("#qrCode").remove();
            }else if (status == 1 && partnerId != 1){
                _root.find("#parentUrlBtnDiv").remove();
                _root.find("#saveAndCloseDiv").remove();
                _root.find("#qrCode").remove();
                _root.find("#parentUrlP").empty().html("家长端链接：<br><br>" + parentUrl );
                _setInputReadonly();
            }
        };
        _setInputReadonly = function(){
            _root.find("#nickname").attr("readonly","readonly");
            _root.find("#account").attr("readonly","readonly");
            _root.find("#appId").attr("readonly","readonly");
            _root.find("#appSecret").attr("readonly","readonly");
        };
        _loadPageContent = function () {
            var _pageline = _root.find("#pageline");
            var _lis = _pageline.find("li");
            _lis.on("click", function () {
                var currentPage = $(this).find("a").attr("page");
                if (currentPage == null) {
                    return;
                }
                if (currentPage == 0) {
                    return;
                }
                _serachForm.find("#currentPage").val($(this).find("a").attr("page"));
                var option = {
                    dataType: "text",
                    success: function (data) {
                        $("#moduleBodyDiv").html(data);
                    },
                    error: function (data) {
                        layer.alert("error");
                    }
                };
                _serachForm.ajaxSubmit(option);
            });
            _root.find("#pageJump").click(function () {
                var totalPage = $(this).attr("totalPage");
                var page = _root.find("#pageText").val();
                if (parseInt(page) > parseInt(totalPage) || isNaN(page) || page <= 0) {
                    layer.msg("请输入正确页数");
                    return;
                }
                wantong.frame.showPage(GlobalVar.backPath,
                    {currentPage: page});
            });
        };
    return {
        init: function (conf) {
            _init(conf);
        }
    }
})();
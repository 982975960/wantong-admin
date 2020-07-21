wantong.partnerDetailPanel = (function () {

    var
        CREATE_APP_URL =
            GlobalVar.contextPath + "/app/createnew.do",
        UPDATE_LICENSE_AMOUNT_URL =
            GlobalVar.contextPath + "/app/updatelicenseamount.do",
        DOWNLOAD_LICENSE_URL =
            GlobalVar.contextPath + "/app/downloadlicense.do",
        UPLOAD_URL =
            GlobalVar.contextPath + "/app/uploadapk.do",
        UPLOAD_RESOURCE_URL =
            GlobalVar.contextPath + "/app/uploadresource.do",
        TO_UPDATE_RESOURCE_URL =
            GlobalVar.contextPath + "/app/toUpdateResourcePage.do",
        CHECK_APPNAME_EXISTS_URL =
            GlobalVar.contextPath + "/app/checkAppNameExists.do",
        VIEW_AUTHORIZATION_RECORD_URL =
            GlobalVar.contextPath + "/app/viewAuthrizationCodeRecord.do",
        SWITCH_PARTNER_URL =
            GlobalVar.contextPath + "/app/listpartners.do",
        GET_APP_PARAM_URL =
            GlobalVar.contextPath + "/app/getAppParam.do",
        UPDATE_APP_URL =
            GlobalVar.contextPath + "/app/updateApp.do",
        QRCODE_CONSUMPTION_DETAILS_URL =
            GlobalVar.contextPath + "/app/qrcodeConsumptionDetails.do",
        DOWNLOAD_NOSOURCEBOOK_URL =
            GlobalVar.contextPath + "/app/downloadNoSourceBook.do",
        UPDATE_iOS_LINK_URL = "/app/updateiOSLink.do",
        LOAD_iOS_LINK_URL = "/app/loadiOSLink.do",
        PREVIEW_IMAGE = "/downloadTempFile.do",
        UPLOAD_IMAGE_URL = "upload.do",
        GET_UPDATE_APP_INFO = "/app/getUpdateAppInfo.do",
        LOOK_RELATION_REPO = "/app/lookRelationRepo.do",
        APP_REPO_COUNT = "/app/appRepoCount.do",
        SHOW_BIND_DEVICEID_URL = "/app/showBindDeviceId.do",
        SHOW_LOGIN_EXCEPTION = "/app/showDeviceIdLoginException.do",
        SHOW_LEAD_DEVICE = "/app/showLeadDevice.do",
        _root = null,
        _createNewAppDialog = null,
        _uploadAPKDialog = null,
        _uploadResourceDialog = null,
        _modifyLicenseAmountDialog = null,
        _saveBtn = null,
        _uploadInitialized = false,
        _uploadResourceInitialized = false,
        _uploader = null,
        _uploaderImage = null,
        _waitAplSaveIndex = 0,
        _resourceUploader = null,
        _excelUploader = null,
        _fileList = new Array(),
        _excelFileList = new Array(),
        _fileIndex = 0,
        _filePath = null,
        _serachForm = null,
        _downloadApkUrl = GlobalVar.services.DOWNLOAD + "?_qaz=",
        _relation_index = 0,
        _init_z_index = 6,
        _conf = {
            URL_DOWNLOAD_NOSOURCEBOOK: "app/downloadNoSourceBook.do",
            URL_CHECK_NOSOURCEBOOK: "app/checkNoSourceBook.do",
            defaultCheckedRepos: [],
        },
        _layerIndex = 0,
        showType = 0, // 0 BOTH 1 client 2 wt
        _init = function (conf) {
            console.log(conf);
            $.extend(_conf, conf);
            _root = $("#partnerDetailPanel");
            _serachForm = _root.find("#searchFrom");
            _serachForm.attr("action", SWITCH_PARTNER_URL);
            _initLoadInfo();
            _initCreateNewDialog();
            _initModifyLicenseAmountDialog();
            _initDownloadLicense();
            _initUploadAPKDialog();
            _initUploadResourceDialog();
            _initToUpdateResourcePage();
            _initCreateNewApp();
            _lisenterAppType();
            _initTabToggle();
            _initDownloadAuthorizationQRCode();
            _initBindDeviceIdList();
            _initShowDownloadAPKQRCode();
            _initOperatingConfigEvent();
            _initLeadingDeviceId();
            _initLookRelationRepo();
            _initPartnerList();
            _jumpPage();
            _initUpdateApp();
            _initButton();
            _initQrCodeDetails();
            bindClickForAll();
            _selectCss();
            _initSelect();
            _initSortable();
            _initDownNoSourceBookList();
            _initImageUploadBtn();
        },
        _initPointReadToggle = function() {
            var normal = _root.find('#pointReadNormal');
            var high =  _root.find('#pointReadHigh');
            var ocrSupport = _root.find("#ocrSupport");
            var onlineDiv = _root.find("#onlineDiv");
            console.log('?????');
            normal.off('click').on('click', function() {
                //click 先checked事件触发
                if (normal.prop('checked')) {
                    high.removeAttr('checked');
                    ocrSupport.css("display","none");
                    $("input[name='online'][value='"+50+"']").prop("checked","checked");
                    $("input[name='online'][value='"+51+"']").removeAttr("checked");
                } else {
                    $("input[name='online'][value='"+50+"']").removeAttr("checked");
                    $("input[name='online'][value='"+51+"']").removeAttr("checked");
                }
            });

            high.off('click').on('click', function() {
                if (high.prop('checked')) {
                    normal.removeAttr('checked');
                    ocrSupport.css("display","inline-block");
                    $("input[name='online'][value='"+50+"']").prop("checked","checked");
                    $("input[name='online'][value='"+51+"']").removeAttr("checked");
                } else {
                    ocrSupport.css("display","none");
                    $("input[name='online'][value='"+50+"']").removeAttr("checked");
                    $("input[name='online'][value='"+51+"']").removeAttr("checked");
                }
            });

            _root.find('.radio-check').off('click').on('click', function() {
                $(this).parent().find('input').click();
            });

            ocrSupport.find(":checkbox").off("click").on("click",function() {
                ocrSupport.find(":checkbox").removeAttr("checked");
                $(this).prop("checked","checked");
            });

            onlineDiv.find(":checkbox").off("click").on("click",function() {
                if ($("#pointReadNormal").is(':checked')|| $("#pointReadHigh").is(':checked')){
                    console.log("dddddddd");
                    onlineDiv.find(":checkbox").removeAttr("checked");
                    $(this).prop("checked","checked");
                } else {
                    onlineDiv.find(":checkbox").removeAttr("checked");
                }

            });
        },
        _initTabToggle = function () {
            $('#appSettingToggle').on('click', function () {
                $('#appSetting').css('display', 'block');
                $('#repoPriorityDiv').css('display', 'none');
                $('.tab-toggle .tab-unit').removeClass('active');
                $('#appSettingToggle').addClass('active');
            });

            $('#repoSettingToggle').on('click', function () {
                $('#appSetting').css('display', 'none');
                $('#repoPriorityDiv').css('display', 'block');
                $('.tab-toggle .tab-unit').removeClass('active');
                $('#repoSettingToggle').addClass('active');
            });
        },
        _doRepoSetting = function (callback) {
            if (callback) {
                var repo = $('#repoPriorityDiv');
                if (repo.css('display') === 'none') {
                    repo.css('display', 'block');
                    callback();
                    repo.css('display', 'none');
                } else {
                    callback();
                }
            }
        },
        _initSortable = function () {
            _doRepoSetting(function () {
                $('#wantongRepoSet .container .repo-list').sortable({
                    animation: 150,
                    draggable: '.oneRepo',
                    onUpdate: _dragUpdateWT
                });
                $('#clientRepoSet .container .repo-list').sortable({
                    animation: 150,
                    draggable: '.oneRepo',
                    onUpdate: _dragUpdateClient
                });
                //吉美私库
               /* $('#jimeiRepoSet .container').sortable({
                    animation: 150,
                    draggable: '.oneRepo',
                    onUpdate: _dragUpdateJimei
                });*/
            });
        },
        _dragUpdate = function ($parentdom) {
            $list = $parentdom.find('div[repoid]:visible');
            console.log('drag', $parentdom, $list);
            var checkedList = [];
            for (var i = 0; i < $list.size(); i++) {
                var $current = $($list[i]);
                if ($current.find('.enableRepo input').hasClass("active")) {
                    checkedList.push($current.clone(true));
                    $current.remove();
                }
            }

            var title = $parentdom.find(".book-repo-list").find('.table-title');
            $(title).after(checkedList);
        },
        _dragUpdateWT = function (event) {
            _dragUpdate($('#wantongRepoSet'));
        },
        _dragUpdateClient = function (event) {
            _dragUpdate($('#clientRepoSet'));
        },
       /* _dragUpdateJimei =function(event){
            _dragUpdate($('#jimeiRepoSet'));
        }*/
        _initSelect = function () {
            _root.off("click", ".mr-selector-wrapper").on("click",
                ".mr-selector-wrapper", function (eve) {
                    eve.stopPropagation();
                });
            _root.off("click", ".mr-selector-wrapper .mr-selector").on("click",
                ".mr-selector-wrapper .mr-selector", function (eve) {
                    $(this).parent().find('.select').css('z-index', ++_init_z_index);
                    $(this).parent().find('.select').toggle();

                });
            _root.off("click", ".mr-selector-wrapper .img-selector").on("click",
                ".mr-selector-wrapper .img-selector", function (eve) {
                    $(this).parent().find('.select').css('z-index', ++_init_z_index);
                    $(this).parent().find('.select').toggle();
                    // console.l
                });
            // 只是技能表
            _root.off("click", ".skill-select #stateSureBtn").on("click",
                ".skill-select #stateSureBtn", function () {
                    _selectStrDisplay();
                    console.log('init ... skill');
                    $(this).parent().parent().hide();
                    _checkFunctionSelectDisplay();
                });
            //platform
            _root.off("click", ".platform-select #stateSureBtn").on("click",
                ".platform-select #stateSureBtn", function () {
                    _platformStrDisplay();
                    console.log('init ... platform');
                    $(this).parent().parent().hide();
                    _checkFunctionSelectDisplay();
                });

            //platform
            _root.off("click", ".function-select #stateSureBtn").on("click",
                ".function-select #stateSureBtn", function () {
                    _functionStrDisplay();
                    console.log('init ... func');
                    $(this).parent().parent().hide();
                });
            $("body").click(function () {
                $(".mr-selector-wrapper .select").hide();
            });
            _initPointReadToggle();
        },
        _platformStrDisplay = function() {
            console.log('choose str');
            var _selectStr = '';
            var selectDom = _root.find(".platform-select :checked");
            if (selectDom.length > 3) {
                _selectStr = $(selectDom.eq(0)).parent().text() + '、' + $(selectDom.eq(1)).parent().text()
                    + '、' + $(selectDom.eq(2)).parent().text() + '...';
            }else if (selectDom.length == 3) {
                _selectStr = $(selectDom.eq(0)).parent().text() + '、' + $(selectDom.eq(1)).parent().text()
                    + '、' + $(selectDom.eq(2)).parent().text();
            } else if (selectDom.length == 2) {
                _selectStr = $(selectDom.eq(0)).parent().text() + '、' + $(selectDom.eq(1)).parent().text();
            } else if (selectDom.length == 1) {
                _selectStr =  $(selectDom.eq(0)).parent().text();
            } else {
                _selectStr = '--请选择--';
            }
            var fullText = '';
            selectDom.each(function() {
                fullText += $(this).parent().text() + '、';
            })
            _root.find('#platformInput').attr('title', fullText.substr(0, fullText.length - 1));
            _root.find(".platform-select .mr-selector").html(_selectStr);
        },
        _functionStrDisplay = function() {
            console.log('choose str');
            var _selectStr = '';
            var selectDom = _root.find(".function-select :checked");
            if (selectDom.length > 3) {
                _selectStr = $(selectDom.eq(0)).parent().text() + '、' + $(selectDom.eq(1)).parent().text()
                    + '、' + $(selectDom.eq(2)).parent().text() + '...';
            }else if (selectDom.length == 3) {
                _selectStr = $(selectDom.eq(0)).parent().text() + '、' + $(selectDom.eq(1)).parent().text()
                    + '、' + $(selectDom.eq(2)).parent().text();
            } else if (selectDom.length == 2) {
                _selectStr = $(selectDom.eq(0)).parent().text() + '、' + $(selectDom.eq(1)).parent().text();
            } else if (selectDom.length == 1) {
                _selectStr =  $(selectDom.eq(0)).parent().text();
            } else {
                _selectStr = '--请选择--';
            }
            var fullText = '';
            selectDom.each(function() {
                fullText += $(this).parent().text() + '、';
            })
            _root.find('#functionInput').attr('title', fullText.substr(0, fullText.length - 1));
            _root.find(".function-select .mr-selector").html(_selectStr);
        },
        _selectStrDisplay = function () {
            console.log('choose str');
            var _selectStr = '';
            var selectDom = _root.find(".mr-selector-wrapper .product-skill:visible  input[name!='support']:checked");
            if (selectDom.length > 3) {
                _selectStr = $(selectDom.eq(0)).parent().text() + '、' + $(selectDom.eq(1)).parent().text()
                    + '、' + $(selectDom.eq(2)).parent().text() + '...';
            }else if (selectDom.length == 3) {
                _selectStr = $(selectDom.eq(0)).parent().text() + '、' + $(selectDom.eq(1)).parent().text()
                    + '、' + $(selectDom.eq(2)).parent().text();
            } else if (selectDom.length == 2) {
                _selectStr = $(selectDom.eq(0)).parent().text() + '、' + $(selectDom.eq(1)).parent().text();
            } else if (selectDom.length == 1) {
                _selectStr =  $(selectDom.eq(0)).parent().text();
            } else {
                _selectStr = '--请选择--';
            }
            var fullText = '';
            selectDom.each(function() {
                fullText += $(this).parent().text() + '、';
            })
            _root.find('#skillInput').attr('title', fullText.substr(0, fullText.length - 1));
            _root.find(".skill-select .mr-selector").html(_selectStr);
        },
        _checkFunctionSelectDisplay = function() {
          var appType = _root.find("#appTypeList").find("#appTypeName").val();
          //绘本K12  平台勾选android和IOS则出现
            var platformCheck = false;
            if (appType == 0 || appType == 10) {
              _root.find(".platform-select .select input:checked").each(function () {
                  var platform = $(this).val();
                  if (platform == 0 || platform == 2) {
                      platformCheck = true;
                  }
              });

          }
          $('#functionSelect').css('display', platformCheck ? 'inline' : 'none');
        },
        _selectCss = function () {
            /*$("a.chosen-single").css("border-radius", "0px")
            $("a.chosen-single").children("div").children("b").css("display",
                "none")
            // $("a.chosen-single").children("div.chosen-search::before").css("display","none")
            $(".chosen-search::before").css("display", "none")*/

        },
        _initLoadInfo = function () {
            var partnerId = _root.find("#partnerId").val();
            $("#partnerSelect").val(partnerId);
            var searchText = _root.find("#searchInput").val();
            _root.find("#searchSelect").val(searchText);
        },
        _initCreateNewDialog = function () {
            _createNewAppDialog = _root.find("#createNewAppDialog");
            _createNewAppDialog.find("#saveButton").click(function () {
                _saveApp();
            });
            _createNewAppDialog.find("#closeButton").click(function () {
                layer.close(_layerIndex);
            })
        },
        _initCreateNewApp = function () {
            var _createNewAppBtn = _root.find("#createNewAppBtn");
            _createNewAppBtn.click(function () {
                //K12 创建默认勾选领读技能
                $("#k12Skill input[type=checkbox][value='0']").attr('checked', 'checked');


                var error = _createNewAppDialog.find("#error");
                initCreation();
                _showDialog("创建应用", '750px', 'auto', _createNewAppDialog, function () {
                    var wtDom = $('#wantongRepoSet');

                    //授权禁用
                    wtDom.find('.oneRepo').each(function (index, elem) {
                        var oneRepo = $(elem);
                        oneRepo.children(".authorityTypeDiv").children("select").attr(
                            "disabled", "disabled");
                        oneRepo.children(".authorityTypeDiv").children("select").css(
                            "background-color", "#CDCCCC");
                    });

                    //默认勾选资源库
                    var wtCheckedList = [];
                    for (var i = 0; i < _conf.defaultCheckedRepos.length; i++) {//设置客户库界面
                        //_checkBoxClick
                        var repoId = _conf.defaultCheckedRepos[i];
                        var oneRepo = $(".oneRepo[repoId = " + repoId + "]");
                        console.log('enable repo', repoId);
                        enableOneRepo(oneRepo);
                        wtCheckedList.push(oneRepo.clone(true))
                        oneRepo.remove();
                    }

                    wtDom.find('.table-title').after(wtCheckedList);
                });
                _root.find(".layui-layer-content").css("height", "unset");
                _root.find(".layui-layer-page").css("top", "unset");
                _createNewAppDialog.attr("appId", "");
                error.hide();
                $("#name").val('');
                $("#name").focus();
                $("#amount").val('');
                _root.find("#shareTypeSelect").css("display", "none");
                _root.find("#authSelect").css("display", "none");
                document.getElementById('appTypeName').value = "-1";
                $("#appTypeName").removeAttr("disabled");
                $("#authorityTypeSelect").removeAttr("disabled");
                $("#platformSelect").removeAttr("disabled");
                $("#repoSettingToggle").css("display", "none");

                _createNewAppDialog.find("#saveButton").removeAttr("disabled");
            });
        },

        _initModifyLicenseAmountDialog = function () {
            var precapital;
            _modifyLicenseAmountDialog = _root.find("#modifyLicenseAmountDialog");
            var _authType = 0;
            _root.find("#partnersListPanel").delegate(".modify-license-button",
                "click", function () {
                    /*_modifyLicenseAmountDialog.modal(
                        {backdrop: false, keyboard: false});
                    _modifyLicenseAmountDialog.modal('show');*/
                    _showDialog("增加授权数量", '520px', 'auto',
                        _modifyLicenseAmountDialog);
                    _root.find(".layui-layer-content").css("height", "unset");
                    var error = _modifyLicenseAmountDialog.find("#error");
                    var amount = _modifyLicenseAmountDialog.find("#amount");
                    amount.val("");
                    amount.focus();
                    error.hide();
                    var usedAmount = parseInt($(this).attr("usedAmount"));
                    var unusedAmount = parseInt($(this).attr("unusedAmount"));
                    var authNum = $(this).attr("qrcodeNum");
                    var appId = $(this).attr("appId");
                    var authType = $(this).attr("authorityType");
                    _authType = authType;
                    if (authType == 1) {
                        $("#qrcodeAuth").css("display", "table");
                        _modifyLicenseAmountDialog.find("#authNum").val(authNum);
                    } else {
                        $("#qrcodeAuth").css("display", "none");
                    }
                    $("#setExp").css("display", "table");
                    $("#noLimit").attr("checked", "checked");
                    $("#limitExp").removeAttr("checked");
                    _modifyLicenseAmountDialog.find("#usedAmount").html(usedAmount);
                    _modifyLicenseAmountDialog.find("#unusedAmount").html(
                        unusedAmount);
                    _modifyLicenseAmountDialog.find("#totalAmount").html(
                        usedAmount + unusedAmount);
                    _modifyLicenseAmountDialog.find("#appId").val(appId);
                    if (usedAmount == 0 && unusedAmount == 0) {
                        _modifyLicenseAmountDialog.find("#authorizeAmount").html(
                            "授权数量");
                    } else {
                        _modifyLicenseAmountDialog.find("#authorizeAmount").html(
                            "再次授权数量");
                    }
                });
            _modifyLicenseAmountDialog.find("#saveButton").click(function () {
                _updateLicenseAmount(_authType);
            });
            _modifyLicenseAmountDialog.find("#payment").off("focus").on('focus',
                function () {
                    if (this.value == '0.00') {
                        this.value = '';
                    } else {
                        this.value = this.value.replace(/\.00/, '').replace(/(\.\d)0/,
                            '$1');
                    }
                    precapital = this.value;
                });
            _modifyLicenseAmountDialog.find("#payment").off("keyup").on('keyup',
                function () {

                    this.value = this.value.replace(/^[\.]/, '').replace(/[^\d.]/g,
                        '');
                    if (this.value.split(".").length - 1 > 1) {
                        this.value = precapital;
                    }
                    precapital = this.value;
                });
            _modifyLicenseAmountDialog.find("#payment").off("blur").on("blur",
                function () {
                    this.value = Number(this.value).toFixed(2);
                });

            _modifyLicenseAmountDialog.find("#closeButton").click(function () {
                layer.close(_layerIndex);
            });
            _modifyLicenseAmountDialog.find("#noLimit").click(function () {
                if ($(this).get(0).checked) {
                    _modifyLicenseAmountDialog.find("#limitCheck").prop("checked",
                        false);
                    _modifyLicenseAmountDialog.find("#openPay").prop("checked", false);
                    _modifyLicenseAmountDialog.find("#limitDiv").css("display",
                        "none");
                } else {
                    _modifyLicenseAmountDialog.find("#limitCheck").prop("checked",
                        true);
                    _modifyLicenseAmountDialog.find("#limitDiv").css("display",
                        "inline");

                }
            });
            _modifyLicenseAmountDialog.find("#limitCheck").click(function () {
                if ($(this).get(0).checked) {
                    _modifyLicenseAmountDialog.find("#noLimit").prop("checked", false);
                    _modifyLicenseAmountDialog.find("#limitDiv").css("display",
                        "inline");
                } else {
                    _modifyLicenseAmountDialog.find("#noLimit").prop("checked", true);
                    _modifyLicenseAmountDialog.find("#openPay").prop("checked", false);
                    _modifyLicenseAmountDialog.find("#limitDiv").css("display",
                        "none");
                }
            });
            _modifyLicenseAmountDialog.find("#openPay").click(function () {
                if ($(this).get(0).checked) {
                    _modifyLicenseAmountDialog.find("#payment").removeAttr("disabled");
                    _modifyLicenseAmountDialog.find("#extendYear").removeAttr(
                        "disabled");
                    _modifyLicenseAmountDialog.find("#extendMonth").removeAttr(
                        "disabled");
                    _modifyLicenseAmountDialog.find("#extendDay").removeAttr(
                        "disabled");
                    _modifyLicenseAmountDialog.find("#desc").removeAttr("disabled");
                } else {
                    _modifyLicenseAmountDialog.find("#payment").attr("disabled",
                        "disabled");
                    _modifyLicenseAmountDialog.find("#extendYear").attr("disabled",
                        "disabled");
                    _modifyLicenseAmountDialog.find("#extendMonth").attr("disabled",
                        "disabled");
                    _modifyLicenseAmountDialog.find("#extendDay").attr("disabled",
                        "disabled");
                    _modifyLicenseAmountDialog.find("#desc").attr("disabled",
                        "disabled");
                }
            });
        },
        _updateLicenseAmount = function (authType) {
            var amount = _modifyLicenseAmountDialog.find("#amount").val();
            var unusedAmount = parseInt(
                _modifyLicenseAmountDialog.find("#unusedAmount").html());
            var partnerId = _modifyLicenseAmountDialog.find("#partnerId").val();
            var authNum = _modifyLicenseAmountDialog.find("#authNum").val();
            var appId = _modifyLicenseAmountDialog.find("#appId").val();
            var limitExp = $("#noLimit").prop("checked") ? -1
                : _modifyLicenseAmountDialog.find("#limitDays").val();
            var openPay = _modifyLicenseAmountDialog.find("#openPay").prop(
                "checked");
            var payment = openPay ? _modifyLicenseAmountDialog.find(
                "#payment").val() : -1;
            var paymentValue = openPay ? 0 : -1;
            var desc = _modifyLicenseAmountDialog.find('#desc').val();
            console.log("保存授权数量");
            if (isNaN(amount)) {
                layer.msg("授权数量应填写为正/负整数");
                return;
            }
            if (amount.match(/^(-|\+)?\d+$/) == null) {
                layer.msg("授权数量应填写为正/负整数");
                return;
            }
            if (unusedAmount + parseInt(amount) < 0) {
                layer.msg("未授权数量小于要扣除的数量");
                return;
            }
            if (amount > 50000) {
                layer.msg("授权数量单次应不大于50000");
                return;
            }
            if (authNum == "") {
                authNum = 5;
            }
            var re = /^[1-9]+[0-9]*]*$/;
            if (!re.test(authNum)) {
                layer.msg("单个授权码对应设备数量应填写正整数");
                return;
            }
            if ("" == limitExp) {
                layer.msg("有效期请输入数字");
                return;
            }
            if (isNaN(limitExp)) {
                layer.msg("有效期请输入数字");
                return;
            }
            if (limitExp > 3650) {
                layer.msg("有效期不能超过3650天");
                return;
            }
            if (openPay) {
                if ("" == payment || payment <= 0) {
                    layer.msg("请输入付费金额");
                    return;
                }
                var year = _modifyLicenseAmountDialog.find("#extendYear").val();
                var month = _modifyLicenseAmountDialog.find("#extendMonth").val();
                var day = _modifyLicenseAmountDialog.find("#extendDay").val();
                if (year == 0 && month == 0 && day == 0) {
                    layer.msg("请输入付费延期时长");
                    return;
                }
                if (year > 88) {
                    layer.msg("延期年份不能大于88");
                    return;
                }
                if (month > 12) {
                    layer.msg("延期月份不能大于12");
                    return;
                }
                if (day > 31) {
                    layer.msg("延期日份不能大于31");
                    return;
                }
                paymentValue = year * 365 + month * 31 + day * 1;
            }
            _modifyLicenseAmountDialog.find("#saveButton").attr("disabled", "true");
            $.post(UPDATE_LICENSE_AMOUNT_URL, {
                appId: appId,
                amount: amount,
                partnerId: partnerId,
                authNum: authNum,
                limitDays: limitExp,
                payment: payment,
                authType: authType,
                paymentValue: paymentValue,
                desc: desc
            }, function (data) {
                if (data.code == 0) {
                    layer.msg("授权成功");
                    layer.close(_layerIndex);
                    _modifyLicenseAmountDialog.find("#saveButton").removeAttr(
                        "disabled");
                } else {
                    layer.msg("授权失败:" + data.msg);
                    _modifyLicenseAmountDialog.find("#saveButton").removeAttr(
                        "disabled");
                }
            });
        },
        _initDownloadAuthorizationQRCode = function () {
            _root.find("#partnersListPanel").delegate(".download-qrcode-button",
                "click", function () {
                    var thisBtn = $(this);
                    $.post(VIEW_AUTHORIZATION_RECORD_URL + "?appId=" + thisBtn.attr(
                        "appId"), {},
                        function (data) {
                            _showDialog("下载授权码", '800px', '600px', data);
                        });
                });
        },
        _initBindDeviceIdList= function () {
            _root.find("#partnersListPanel").delegate(".show-bind-deviceId",
                "click", function () {
                    var thisBtn = $(this);
                    $.post(SHOW_BIND_DEVICEID_URL + "?appId=" + thisBtn.attr(
                        "appId"), {},
                        function (data) {
                            _showDialog("查看导入设备ID", '800px', '600px', data);
                        });
                });
        },
        _initShowDownloadAPKQRCode = function () {
            var _downloadApkQrCode = _root.find("#downloadApkQrCode");
            _root.find("#partnersListPanel").delegate(
                ".show-download-qrcode-button", "click", function () {
                    var appId = $(this).attr("appId");
                    var appCode = $(this).attr("appCode");
                    var version = $(this).attr("version");
                    if (version == "未上传APK") {
                        layer.msg("请先上传apk");
                        return;
                    }
                    _showDialog("下载应用二维码", '400px', '380px', _downloadApkQrCode);
                    $('#qrcode').html("");
                    var qrcode = new QRCode('qrcode', {
                        text: _downloadApkUrl + appCode + "&&_wsx=0",
                        width: 256,
                        height: 256,
                        colorDark: '#000000',
                        colorLight: '#ffffff',
                        correctLevel: QRCode.CorrectLevel.L
                    });
                    $("#qrcode").attr("title", "");
                });
            _downloadApkQrCode.find("#closeButton").click(function () {
                layer.close(_layerIndex);
            });
        },
        _initDownloadLicense = function () {
            _root.find("#partnersListPanel").delegate(".download-license-button",
                "click", function () {
                    var appId = $(this).attr("appId");
                    var partnerId = $(this).attr("partnerId");
                    window.open(
                        DOWNLOAD_LICENSE_URL + "?appId=" + appId + "&partnerId="
                        + partnerId);

                    var partnerIdSelect = $("#partnerSelect").val();
                    var searchText = $("#searchSelect option:selected").val();
                    var currentPage = _root.find("#currentPage").val();

                    if (searchText == null || searchText == "") {
                        wantong.frame.showPage(SWITCH_PARTNER_URL, {
                            currentPage: currentPage,
                            partnerId: partnerIdSelect
                        });
                    } else {
                        wantong.frame.showPage(SWITCH_PARTNER_URL, {
                            currentPage: currentPage,
                            searchText: searchText,
                            partnerId: partnerIdSelect
                        });
                    }
                });
        },
        // 下载无资源书本清单列表
        /*_initDownNoSourceBookList = function () {
            _root.find("#partnersListPanel").delegate(".download-noSourceBook-button",
                "click", function () {
                    var appId = $(this).attr("appId");
                    var partnerId = $(this).attr("partnerId");
                    window.open(
                        DOWNLOAD_NOSOURCEBOOK_URL + "?appId=" + appId);

                    var partnerIdSelect = $("#partnerSelect").val();
                    var searchText = $("#searchSelect option:selected").val();
                    var currentPage = _root.find("#currentPage").val();

                    if (searchText == null || searchText == "") {
                        wantong.frame.showPage(SWITCH_PARTNER_URL, {
                            currentPage: currentPage,
                            partnerId: partnerIdSelect
                        });
                    } else {
                        wantong.frame.showPage(SWITCH_PARTNER_URL, {
                            currentPage: currentPage,
                            searchText: searchText,
                            partnerId: partnerIdSelect
                        });
                    }

                });
        };*/
        _initDownNoSourceBookList = function () {
            _root.find("#partnersListPanel").delegate(".download-noSourceBook-button",
                "click", function () {
                    var appId = $(this).attr("appId");
                    var partnerId = $(this).attr("partnerId");

                    var index = layer.msg('文件生成中...', {icon: 16,shade: [0.5, '#f5f5f5'],scrollbar: false,offset: 'auto', time: 1000000});
                    var taskId = '';
                    var success = false;

                    $.ajax({
                        type: "post",
                        url: _conf.URL_DOWNLOAD_NOSOURCEBOOK,
                        data: {"appId": appId},
                        async: false,
                        dataType: "json",
                        success: function (data) {
                            if (data.code == 0) {
                                taskId = data.data.taskId;
                                success = true;
                                return;
                            }
                            layer.close(index);
                            layer.msg("下载失败");
                        },
                        error: function (data) {
                            layer.close(index);
                            layer.msg("网络异常");
                        }
                    });

                    //是否可以轮询任务状态
                    if (success) {
                        success = !success;
                        var timeTask = setInterval(()=> {
                            $.ajax({
                                url: _conf.URL_CHECK_NOSOURCEBOOK,
                                type: "POST",
                                async: false,
                                data: {"taskId": taskId},
                                dataType: "json",
                                success: function (data) {
                                    if (data.code == 0) {
                                        if (!data.data.finish) {
                                            console.log('下载进度:' + data.data.progress + '%');
                                            return;
                                        }
                                        window.open(data.data.extra);
                                        success = true;
                                    } else {
                                        console.log(data);
                                        layer.msg("下载数据出现异常");
                                    }
                                    success = true;
                                }
                            }).always(()=>{
                                if (success) {
                                    clearInterval(timeTask);
                                    layer.close(index);
                                }
                            });
                        }, 500);
                    }

                    var partnerIdSelect = $("#partnerSelect").val();
                    var searchText = $("#searchSelect option:selected").val();
                    var currentPage = _root.find("#currentPage").val();

                    if (searchText == null || searchText == "") {
                        wantong.frame.showPage(SWITCH_PARTNER_URL, {
                            currentPage: currentPage,
                            partnerId: partnerIdSelect
                        });
                    } else {
                        wantong.frame.showPage(SWITCH_PARTNER_URL, {
                            currentPage: currentPage,
                            searchText: searchText,
                            partnerId: partnerIdSelect
                        });
                    }

                });
        };
    //初始化打开运营配置的按钮事件
    _initOperatingConfigEvent = function () {
        _root.find(".operating_config").off("click").on("click", function () {
            var appId = $(this).attr("appId");
            var partnerId = $(this).attr("partnerId");
            wantong.config.init({
                appId: appId,
                partnerId: partnerId
            });
        });
    },
      _initLookRelationRepo = function (){
          _root.find(".lookRelationRepo").off("click").on("click", function () {
              var appId = $(this).attr("appId");
              var repoCount = 0;
              $.ajaxSetup({async: false});
              $.get(APP_REPO_COUNT,{
                  appId: appId
              },function (data) {
                repoCount = data.data;
              });
              $.ajaxSetup({async: true});
              if (repoCount == 0){
                  layer.msg("该产品类型无关联信息!");
                  return;
              }
              $.post(LOOK_RELATION_REPO,{
                  appId: appId
              },function (data) {
                  if (data.msg) {
                      layer.msg(data.msg);
                      return;
                  }
                  var _index = layer.open({
                      title: "查看应用关联信息",
                      type: 1,
                      maxmin: false,
                      move: false,
                      resize: false,
                      area: ['800px', '600px'],
                      content: data
                  });
                  _relation_index = _index;

              });
          });
      },
        _initToUpdateResourcePage = function () {
            _root.find("#partnersListPanel").delegate(".to-update-resource",
                "click", function () {
                    var appId = $(this).attr("appId");
                    var partnerId = $(this).attr("partnerId");
                    wantong.frame.showPage(TO_UPDATE_RESOURCE_URL, {
                        appId: appId,
                        partnerId: partnerId
                    });
                });
        },
        _initUploadResourceDialog = function () {
            _uploadResourceDialog = _root.find("#uploadResourceDialog");
            _root.find("#partnersListPanel").delegate(".upload-resource-button",
                "click", function () {
                    var error = _uploadResourceDialog.find("#error");
                    error.hide();
                    var appId = $(this).attr("appId");
                    var partnerId = $(this).attr("partnerId");
                    var appVersionId = $(this).attr("appVersionId");
                    _uploadResourceDialog.find("#appId").val(appId);
                    _uploadResourceDialog.find("#appVersionId").val(appVersionId);
                    _uploadResourceDialog.modal('show');
                    if (!_uploadResourceInitialized) {
                        setTimeout(function () {
                            _initResourceUploader();
                        }, 500);
                        _uploadResourceInitialized = true;
                    }
                });

            _uploadResourceDialog.find("#cancelButton").click(function () {
                var _uploadFileList = _root.find("#uploadFileList");
                _uploadFileList.html("还没有选择任何资源包文件");
            });

            _uploadResourceDialog.find("#saveButton").click(function () {
                _uploadResourceAndSave();
            });
        },
        _uploadAPKReset = function () {
            var _progressBar = _uploadAPKDialog.find("#uploadProgress");
            var _uploadFileList = _uploadAPKDialog.find("#uploadFileList");
            _uploader.stop(true);
            _progressBar.hide();
            _progressBar.find("div:first").css("width", "0");
            _uploadFileList.html("还没有选择任何APK文件");
            _uploadAPKDialog.find("#saveButton").removeAttr("disabled").html("保存");
            _uploadAPKDialog.find("#uploadFilePicker").css("visibility", "inherit");
        },
        _uploadResourceAndSave = function () {
            var version = _uploadResourceDialog.find("#version").val();
            var summary = _uploadResourceDialog.find("#summary").val();
            var appId = _uploadResourceDialog.find("#appId").val();
            var appVersionId = _uploadResourceDialog.find("#appVersionId").val();
            var error = _uploadResourceDialog.find("#error");
            if (version.match(/^[0-9]+\.[0-9]+\.[0-9]+$/) == null) {
                /*error.html("Version格式为错误，例如：1.0.1");
                error.show();*/
                layer.msg("Version格式为错误，例如：1.0.1");
                return;
            }
            if (summary.match(/\S+/) == null) {
                /*error.html("版本更新内容不可为空");
                error.show();*/
                layer.msg("版本更新内容不可为空");
                return;
            }
            var txt = new RegExp(/[<>/|]/);
            if (txt.test(summary)) {
                layer.msg("版本更新内容不能含有非法字符");
                return;
            }
            _resourceUploader.option("formData", {
                version: version,
                summary: summary,
                appId: appId,
                appVersionId: appVersionId
            });
            _resourceUploader.upload();
        },
        _initResourceUploader = function () {
            var _progressBar = _uploadResourceDialog.find("#uploadProgress");
            var _uploadFileList = _uploadResourceDialog.find("#uploadFileList");
            _resourceUploader = WebUploader.create({
                swf: GlobalVar.contextPath + '/js／uploader/Uploader.swf',
                server: UPLOAD_RESOURCE_URL,
                pick: _uploadResourceDialog.find("#uploadFilePicker"),
                resize: false,
                accept: {
                    title: '资源包',
                    extensions: 'zip',
                    mimeTypes: 'application/vnd.android'
                }
            });
            _resourceUploader.on('fileQueued', function (file) {
                _uploadFileList.attr("fileId", file.id);
                _uploadFileList.html(file.name);
            });
            _resourceUploader.on('uploadProgress', function (file, percentage) {
                if (percentage > 0) {
                    _progressBar.show();
                }
                _progressBar.find("div:first").css("width",
                    parseInt(percentage * 100) + "%");
            });
            _resourceUploader.on('uploadSuccess', function (file, response) {
                _uploadResourceDialog.modal('hide');
                setTimeout(function () {
                    wantong.frame.refreshPage();
                }, 500);
            });
        },
        //用来监听当创建是选择绘本时候，会出现对绘本共享库的选择
        _lisenterAppType = function () {
            var type = _root.find("#appTypeList");
            type.on("click", function () {
                //绘本
                var typeVal = type.find("#appTypeSelect").find("option:selected").val();
                console.log('choose', typeVal);
                if (typeVal == 0 || typeVal == 10 || typeVal == 11 || typeVal == 12) {
                    console.log('display', '11111111111111111');
                    type.find("#shareTypeSelect").css("display", "inline");
                    _root.find("#authSelect").css("display", "inline");
                    _root.find("#platformSelect").css("display", "inline");
                    _root.find("#repoSettingToggle").css('display', "inline-block");
                    //_root.find(".layui-layer-content").css("height", "450px");
                    filterRepos(typeVal == 10, typeVal == 12);
                    _root.find(".product-skill").css('display', 'none');
                    if (typeVal == 0) {
                        //绘本
                        _root.find("#shareTypeSelect").css('display', 'inline');
                        _root.find("#bookSkill").css('display', 'block');
                    } else if (typeVal == 10) {
                        //k12
                        _root.find("#shareTypeSelect").css('display', 'inline');
                        _root.find("#k12Skill").css('display', 'block');
                    } else if (typeVal == 11) {
                        //查词
                        _root.find("#shareTypeSelect").css('display', 'none');
                        _root.find('#wordSearch').css('display', 'block');
                        _root.find("#repoSettingToggle").css('display', "none");
                    } else if (typeVal == 12) {
                        //卡片
                        _root.find("#shareTypeSelect").css('display', 'inline');
                        _root.find('#cardSkill').css('display', 'block');
                        _root.find("#shareTypeSelect").css('display', 'none');
                        _root.find("#shareTypeSelect").find("#shareType").val('1');
                        _root.find("#repoSettingToggle").css('display', "none");
                        openSingleClientRepoSet();
                    }
                    $(".mr-selector-wrapper .select").toggle();
                    _root.find('.mr-selector-wrapper #stateSureBtn').click();
                } else {
                    type.find("#shareTypeSelect").css("display", "none");
                    _root.find("#authSelect").css("display", "none");
                    _root.find("#platformSelect").css("display", "none");
                    _root.find("#repoSettingToggle").css('display', "none");
                    //_root.find(".layui-layer-content").css("height", "220px");
                }
            });
        },
        _initUploadAPKDialog = function () {
            var oldVersion = null;
            _uploadAPKDialog = _root.find("#uploadAPKDialog");
            _root.find("#partnersListPanel").delegate(".upload-apk-button", "click",
                function () {
                    var error = _uploadAPKDialog.find("#error");
                    var version = _uploadAPKDialog.find("#version");
                    var summary = _uploadAPKDialog.find("#summary");
                    var _progressBar = _uploadAPKDialog.find("#uploadProgress");
                    var _lowestVersion = _uploadAPKDialog.find("#lowestVersion");
                    var appId = $(this).attr("appId");
                    _initUpdateAppInfo(appId);
                    var partnerId = $(this).attr("partnerId");
                    oldVersion = $(this).attr("version");
                    error.hide();
                    version.val("");
                    // summary.val("");
                    _lowestVersion.val("");
                    _progressBar.hide();
                    _uploadAPKDialog.find("#appId").val(appId);
                    _loadiOSLink(appId);
                    _showDialog("管理应用下载", '650px', '710px', _uploadAPKDialog);
                    version.focus();
                    if (!_uploadInitialized) {
                        _initUploaderApk();
                        _uploadInitialized = true;
                    }
                });

            _uploadAPKDialog.find("#saveButton").click(function () {
                /*_uploadAPKDialog.find("#saveButton").attr("disabled",
                    "disabled").html("正在上传");
                _uploadAPKDialog.find("#uploadFilePicker").css("visibility",
                    "hidden");*/
                _uploadAPKAndSave(oldVersion);
            });

            _uploadAPKDialog.on('hidden.bs.modal', function () {
                wantong.frame.showPage(GlobalVar.backPath, GlobalVar.data);
                _uploadAPKReset();
                layer.close(_layerIndex);
            });
            _uploadAPKDialog.find("#closeButton").click(function () {
                layer.close(_layerIndex);
            });
            _uploadAPKDialog.find("#AndroidTab").click(function () {
                _changeUploadTab(true);
            });
            _uploadAPKDialog.find("#iOSTab").click(function () {
                _changeUploadTab(false);
            });

            _uploadAPKDialog.find("#saveButton2").click(function () {
                _uploadAPKDialog.find("#saveButton2").attr("disabled", "disabled");
                _updateiOSLink();
            });

            _uploadAPKDialog.find("#changeAppImageBtn").off("click").on("click", function () {
              _uploaderImage.upload();
            });
        },
      _initUpdateAppInfo = function (appId) {
        var summary = "";
        var introduceType = null;
        var vtSummary = _root.find("#summaryNew").val();
        var xmSummary = _root.find(".ximaSummary").val();
        var xmAppId = 0;

        $.ajaxSetup({async:false});
        $.get(GET_UPDATE_APP_INFO, {
          appId: appId
        }, function (data) {
          if (data.code == 0){
            var appInfo = data.data;
            _root.find("#updateAppName").val(appInfo.name);
            if (appInfo.imageName != ""){
              _root.find("#updateAppImage").attr("src", appInfo.url);
            }
            introduceType = appInfo.introduceType;
            summary = appInfo.summary;
            xmAppId = appInfo.xmAppId;
            _root.find("#updateAppImage").attr("imageName", appInfo.imageName);
          }else {
            layer.msg(data.msg);
          }
        });
        $.ajaxSetup({async:true});
        if (introduceType == 0){
            if (appId == xmAppId){
                _root.find("#summaryNew").val(xmSummary);
            }else {
                _root.find("#summaryNew").val(summary);
            }
            _root.find("#useVtIntroduce").prop("checked", false);
            _root.find("#summaryNew").removeAttr("readonly");
        }else {
          _root.find("#useVtIntroduce").prop("checked", true);
          _root.find("#summaryNew").attr("readonly", "readonly");
        }
          _root.find("#useVtIntroduce").off("click").on("click",function () {
              console.log("click test");
              var checked = $(this).prop("checked");
              if (!checked){
                  _root.find("#summaryNew").val("");
                  _root.find("#summaryNew").removeAttr("readonly");
              }else {
                  _root.find("#summaryNew").val(vtSummary);
                  _root.find("#summaryNew").attr("readonly", "readonly");
              }
          });
      },
      _initImageUploadBtn = function () {
        _uploaderImage = WebUploader.create({
          swf: GlobalVar.contextPath + '/js／uploader/Uploader.swf',
          server: UPLOAD_IMAGE_URL + "?check=" + true,
          fileSingleSizeLimit: 10 * 1024 * 1024,
          pick: {
            id: $("#changeAppImageBtn"),
            multiple: false
          },
          accept: {
            title: 'JPG',
            extensions: 'jpg,jpeg',
            mimeTypes: 'image/jpeg'
          },
          auto: true,
          method: "POST",
          duplicate: true,
          disableGlobalDnd: false
        });
        _uploaderImage.on('fileQueued', function (file) {
        });
        _uploaderImage.on('uploadProgress', function (file, percentage) {

        });
        _uploaderImage.on('uploadSuccess', function (file, response) {
          if (response.code == 0) {
            var imageName = response.data.fileName;
            _root.find("#updateAppImage").attr("imageName", imageName);
            _root.find("#updateAppImage").attr("src",
              PREVIEW_IMAGE + "?fileName=" + imageName);
          } else {
            layer.msg(response.msg);
          }

        });
        _uploaderImage.on("error", function (type) {
          if (type == "Q_TYPE_DENIED") {
            layer.msg("请上传jpeg格式的文件，如img.jpg或img.jpeg等");
          } else if (type == "F_EXCEED_SIZE") {
            layer.msg("封面图大小不能超过5M");
          } else {
            layer.msg("请上传jpeg格式的文件，如img.jpg或img.jpeg等");
          }
        });
      },
        _initLeadingDeviceId = function () {
            var appId = 0;
            _root.find("#partnersListPanel").delegate(".leadingin-deviceId-button",
                "click", function () {
                    appId = $(this).attr("appId");
                    $.get(SHOW_LEAD_DEVICE,{appId: appId},
                        function(data) {
                            content = data;
                        }).always(function(){
                        _showDialog("导入设备ID", '600px', '350px', content);
                    });
                });
            _root.find("#partnersListPanel").delegate(".show-bind-deviceId-excepition","click",function () {
                let appId = $(this).attr("appId");
                let content = "";
                $.get(SHOW_LOGIN_EXCEPTION,{appId: parseInt(appId)},
                    function(data) {
                    content = data;
                }).always(function(){
                    _showDialog("异常设备ID信息", '850px', '720px', content);
                });
            });
        },
        _uploadAPKAndSave = function (oldversion) {
            var version = _uploadAPKDialog.find("#version").val();
            var lowestVersion = _uploadAPKDialog.find("#lowestVersion").val();
            var summary = _uploadAPKDialog.find("#summaryNew").val();
            var appId = _uploadAPKDialog.find("#appId").val();
            var error = _uploadAPKDialog.find("#error");
            var updateAppName = _uploadAPKDialog.find("#updateAppName").val();
            var imageName = _uploadAPKDialog.find("#updateAppImage").attr("imageName");
            var introduceChecked = _uploadAPKDialog.find("#useVtIntroduce").prop("checked");
            var introduceType = 1;
            if(!introduceChecked){
              introduceType = 0;
            }
            if (updateAppName == ""){
              layer.msg("应用名称不能为空");
              return;
            }
            if (imageName == ""){
              layer.msg("请上传应用图标");
              return;
            }
            if (version == "") {
                /*error.html("版本号不能为空");
                error.show();*/
                layer.msg("版本号不能为空");
                _uploadAPKDialog.find("#saveButton").removeAttr("disabled").html(
                    "保存");
                _uploadAPKDialog.find("#uploadFilePicker").css("visibility",
                    "inherit");
                return;
            }
            if (version.match(/^[0-9]+\.[0-9]+\.[0-9]+$/) == null) {
                /*error.html("版本号格式错误，例如：1.0.1");
                error.show();*/
                layer.msg("版本号格式错误，例如：1.0.1");
                _uploadAPKDialog.find("#saveButton").removeAttr("disabled").html(
                    "保存");
                _uploadAPKDialog.find("#uploadFilePicker").css("visibility",
                    "inherit");
                return;
            }
            if (version.length > 15) {
                /*error.html("APP版本号不能大于15个字符");
                error.show();*/
                layer.msg("APP版本号不能大于15个字符");
                _uploadAPKDialog.find("#saveButton").removeAttr("disabled").html(
                    "保存");
                _uploadAPKDialog.find("#uploadFilePicker").css("visibility",
                    "inherit");
                return;
            }
            if (oldversion != "未上传APK") {
                if (!_compareVersion(version, oldversion)) {
                    /*error.html("请输入更大的版本号");
                    error.show();*/
                    layer.msg("请输入更大的版本号");
                    _uploadAPKDialog.find("#saveButton").removeAttr("disabled").html(
                        "保存");
                    _uploadAPKDialog.find("#uploadFilePicker").css("visibility",
                        "inherit");
                    return;
                }
            } else {
                if (parseFloat(version) == 0) {
                    /*error.html("请输入更大的版本号");
                    error.show();*/
                    layer.msg("请输入更大的版本号");
                    _uploadAPKDialog.find("#saveButton").removeAttr("disabled").html(
                        "保存");
                    _uploadAPKDialog.find("#uploadFilePicker").css("visibility",
                        "inherit");
                    return;
                }
            }
            if (lowestVersion == "") {
                /*error.html("所需最低版本号不能为空");
                error.show();*/
                layer.msg("所需最低版本号不能为空");
                _uploadAPKDialog.find("#saveButton").removeAttr("disabled").html(
                    "保存");
                _uploadAPKDialog.find("#uploadFilePicker").css("visibility",
                    "inherit");
                return;
            }
            if (lowestVersion.match(/^[0-9]+\.[0-9]+\.[0-9]+$/) == null) {
                /*error.html("所需最低版本号格式错误，例如：1.0.1");
                error.show();*/
                layer.msg("所需最低版本号格式错误，例如：1.0.1");
                _uploadAPKDialog.find("#saveButton").removeAttr("disabled").html(
                    "保存");
                _uploadAPKDialog.find("#uploadFilePicker").css("visibility",
                    "inherit");
                return;
            }
            if (lowestVersion.length > 15) {
                /*error.html("所需最低版本号不能大于15个字符");
                error.show();*/
                layer.msg("所需最低版本号不能大于15个字符");
                _uploadAPKDialog.find("#saveButton").removeAttr("disabled").html(
                    "保存");
                _uploadAPKDialog.find("#uploadFilePicker").css("visibility",
                    "inherit");
                return;
            }
            if (!_compareVersion(version, lowestVersion)) {
                /*error.html("请输入更大的版本号");
                error.show();*/
                layer.msg("版本号不能小于或等于所需最低版本号");
                _uploadAPKDialog.find("#saveButton").removeAttr("disabled").html(
                    "保存");
                _uploadAPKDialog.find("#uploadFilePicker").css("visibility",
                    "inherit");
                return;
            }

            if (summary.match(/\S+/) == null) {
                /*error.html("版本更新内容不可为空");
                error.show();*/
                layer.msg("版本更新内容不可为空");
                _uploadAPKDialog.find("#saveButton").removeAttr("disabled").html(
                    "保存");
                _uploadAPKDialog.find("#uploadFilePicker").css("visibility",
                    "inherit");
                return;
            }

            if (summary.length > 2000) {
                layer.msg("更新内容不能超过2000个字符");
                _uploadAPKDialog.find("#saveButton").removeAttr("disabled").html(
                    "保存");
                _uploadAPKDialog.find("#uploadFilePicker").css("visibility",
                    "inherit");
                return;
            }

            if (_fileList == null || _fileList.length == 0) {
                /*error.html("请添加apk文件");
                error.show();*/
                layer.msg("请添加apk文件");
                _uploadAPKDialog.find("#saveButton").removeAttr("disabled").html(
                    "保存");
                _uploadAPKDialog.find("#uploadFilePicker").css("visibility",
                    "inherit");
                return;
            }
            _uploadAPKDialog.find("#summaryNew").attr("readonly", "readonly");
            _uploadAPKDialog.find("#version").attr("readonly", "readonly");
            _uploadAPKDialog.find("#lowestVersion").attr("readonly", "readonly");
            error.hide();
            _uploader.option("formData", {
                version: version,
                summary: summary,
                appId: appId,
                lowestVersion: lowestVersion,
                updateAppName: updateAppName,
                imageName: imageName,
                introduceType: introduceType
            });
            _uploader.upload();
            _showWaitApkSavePanel();
        },
        _showWaitApkSavePanel = function () {
            _waitAplSaveIndex = layer.msg('Apk正在保存，请稍等....', {
                icon: 16
                , shade: 0.4,
                time: -1
            });
        },
        _initUploaderApk = function () {
            var _progressBar = _uploadAPKDialog.find("#uploadProgress");
            var _uploadFileList = _uploadAPKDialog.find("#uploadFileList");
            _uploader = WebUploader.create({
                swf: GlobalVar.contextPath + '/js／uploader/Uploader.swf',
                server: UPLOAD_URL,
                pick: {
                    id: _uploadAPKDialog.find("#uploadFilePicker"),
                    multiple: false
                },
                fileNumLimit: 2,
                resize: false,
                duplicate: true,
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
                _uploadFileList.attr("fileId", file.id);
                _uploadFileList.html(file.name);
            });
            _uploader.on('uploadProgress', function (file, percentage) {
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
            });
            _uploader.on('uploadSuccess', function (file, response) {
                if (response.code == 0) {
                    layer.msg("APK上传成功。");
                    layer.close(_waitAplSaveIndex);
                    setTimeout(function () {
                        layer.close(_layerIndex);
                    }, 500);
                    /*setTimeout(function () {
                      wantong.frame.refreshPage();
                    }, 500);*/
                } else {
                    layer.msg(response.msg);
                    layer.close(_waitAplSaveIndex);
                    setTimeout(function () {
                        layer.close(_layerIndex);
                    }, 500);
                }

            });
            _uploader.on("error", function (type) {
                if (type == "Q_TYPE_DENIED") {
                    layer.msg("请上传APK格式文件");
                }
            });
        },
        _saveApp = function () {
            console.log('create app');
            var name = _createNewAppDialog.find("#name").val();
            //var amount = _createNewAppDialog.find("#amount").val();
            var amount = 0;
            var partnerId = _createNewAppDialog.find("#partnerId").val();
            var appTypeId = _createNewAppDialog.find("#appTypeList").find(
                "#appTypeName").val();
            var shareType = _createNewAppDialog.find("#shareTypeSelect").find(
                "#shareType").val();
            var verifyType = _createNewAppDialog.find("#verifyTypeSelect").val();
            var authorityType = _createNewAppDialog.find(
                "#authorityTypeSelect").val();

            //技能
            var skills = [];
            //
            var ocrSupport = -1;
            var onLine = -1;
            if (appTypeId == 0) {
                _createNewAppDialog.find("#bookSkill input:checked").each(function () {
                    skills.push($(this).val());
                });
            } else if (appTypeId == 10) { // k12类型
                _createNewAppDialog.find("#k12Skill input[name!='support'][name!='online']:checked").each(function () {
                    skills.push($(this).val());
                });
                if(skills.indexOf("6")!= -1){
                    ocrSupport = parseInt(_root.find("#ocrSupport input[name='support']:checked").val());
                }

                if(skills.indexOf("6")!= -1 || skills.indexOf("1")!= -1){
                    onLine = parseInt(_root.find("#onlineDiv input[name='online']:checked").val());
                }

                console.log(ocrSupport);

            } else if (appTypeId == 11) {
                _createNewAppDialog.find("#wordSearch input:checked").each(function () {
                    skills.push($(this).val());
                });
            } else if (appTypeId == 12) {
                _createNewAppDialog.find("#cardSkill input:checked").each(function () {
                    skills.push($(this).val());
                });
            }
            var platforms = [];
            _createNewAppDialog.find(".platform-select .select input:checked").each(function () {
                platforms.push($(this).val());
            });

            var platform = platforms.length > 0 ? platforms[0] : '';

            var functions = [];
            _createNewAppDialog.find(".function-select input:checked").each(function () {
                functions.push($(this).val());
            });

            var nbeOpen = _createNewAppDialog.find('#nbeOpen').val();
            if (nbeOpen === '1') {
                //开启NBE
                functions.push(1);
            }

            //点读配置
            // var pointingReadDom = _createNewAppDialog.find(".mr-selector-wrapper").find(
            //     "input[value='点读']");
            // var pointingRead = 1;
            // if (pointingReadDom.prop("checked")) {
            //     pointingRead = 0;
            // }
            // //配音配置
            // var dubDom = _createNewAppDialog.find(".mr-selector-wrapper").find(
            //     "input[value='配音']");
            // var dubType = 0;
            // if (dubDom.prop("checked")) {
            //     dubType = 1;
            // }
            // //拍照配置
            // var photoDom = _createNewAppDialog.find(".mr-selector-wrapper").find(
            //     "input[value='拍照']");
            // var photo = 0;
            // if (photoDom.prop("checked")) {
            //     photo = 1;
            // }
            // //评测配置
            // var evaluationDom = _createNewAppDialog.find(".mr-selector-wrapper").find(
            //     "input[value='评测']");
            // var evaluation = 0;
            // if (evaluationDom.prop("checked")) {
            //     evaluation = 1;
            // }
            // //OCR
            // var ocrDom = _createNewAppDialog.find(".mr-selector-wrapper").find(
            //   "input[value='手指查词']");
            // var ocr = 0;
            // if (ocrDom.prop("checked")) {
            //     ocr = 1;
            // }

            if (name.match(/\S+/) == null) {
                layer.msg("应用名称不可为空");
                return;
            }

            if (name.length > 50) {
                layer.msg("APP名称不能大于50个字符");
                return;
            }

            if (appTypeId == -1) {
                layer.msg("请选择应用类型");
                return;
            }

            if (appTypeId == 0 || appTypeId == 10 || appTypeId == 11 || appTypeId == 12) {
                if (platforms.length <= 0) {
                    layer.msg("请选择开发系统");
                    return;
                }
            }

            var appTypeName = $("#appTypeName option:selected").text()

            if (appTypeName != "绘本") {
                disableBothRepoSet();
            }

            if(skills.indexOf("6") != -1 && ocrSupport == -1){
                layer.msg("请选择OCR服务提供方");
                return;
            }
            var repo = getAllData();
            /*if (appTypeName == "绘本" && repoPri.length == 0) {
              layer.msg("请至少选择一个资源库");
              return;
            }*/

            var isRepeated = checkRepeated();
            if (isRepeated) {
                layer.msg("优先级重复");
                return;
            }

            var repoPri = new Array();
            if (appTypeId != 0) {
                for (var i = 0; i < repo.length; i++) {
                    if (!_conf.defaultCheckedRepos.includes(repo[i].repoId)) {
                        console.log("123123123");
                        repoPri.push(repo[i]);
                    }
                }
            } else {
                repoPri = repo;
            }

            _createNewAppDialog.find("#saveButton").attr("disabled", "disabled");
            var appId = _createNewAppDialog.attr("appId");


            var appData = {
                appId: Number(appId),
                name: name,
                shareType: shareType,
                amount: amount,
                appTypeId: appTypeId,
                billingModel: 1,
                partnerId: partnerId,
                authorityType: authorityType,
                verifyType: verifyType,
                platform: platform,
                // pointingRead: pointingRead,
                // dubType: dubType,
                // photo: photo,
                // evaluation: evaluation,
                data: repoPri,
                skills: skills,
                platforms: platforms,
                functions: functions,
                ocrSupport: ocrSupport,
                onLine: onLine
                // ocr: ocr
            }

            if (appId == "") {
                //创建app
                var isExists = false;
                $.ajax({
                    type: "post",
                    url: CHECK_APPNAME_EXISTS_URL,
                    data: {name: name, partnerId: partnerId},
                    dataType: "json",
                    async: false,
                    success: function (data) {
                        if (data.code != 0) {
                            isExists = true;
                            return;
                        }
                    },
                    error: function (data) {
                        alert("error");
                    }
                });
                if (isExists) {
                    layer.msg("App名称已经存在");
                    _createNewAppDialog.find("#saveButton").removeAttr("disabled");
                    return;
                }
                $.ajax({
                    type: "POST",
                    contentType: "application/json; charset=utf-8",
                    url: CREATE_APP_URL,
                    dataType: "json",
                    data: JSON.stringify(appData),
                    success: function (data) {
                        if (data.code == 0) {
                            layer.msg("创建成功");
                            layer.close(_layerIndex);
                        } else {
                            layer.msg("创建失败，" + data.msg);
                            _createNewAppDialog.find("#saveButton").removeAttr("disabled");
                        }
                    }
                });
            } else {
                //更新app
                $.ajax({
                    type: "POST",
                    contentType: "application/json; charset=utf-8",
                    url: UPDATE_APP_URL,
                    dataType: "json",
                    data: JSON.stringify(appData),
                    success: function (data) {
                        if (data.code == 0) {
                            layer.msg("修改成功");
                            layer.close(_layerIndex);
                        } else {
                            if (data.code == 1) {
                                layer.msg(data.msg)
                            } else {
                                layer.msg("修改失败");
                            }
                            _createNewAppDialog.find("#saveButton").removeAttr("disabled");
                        }

                    }
                });
            }

        },
        _compareVersion = function (ver1, ver2) {
            var version1pre = parseFloat(ver1);
            var version2pre = parseFloat(ver2);
            var version1next = ver1.replace(version1pre + ".", "");
            var version2next = ver2.replace(version2pre + ".", "");
            if (version1pre > version2pre) {
                return true;
            } else if (version1pre < version2pre) {
                return false;
            } else {
                if (version1next > version2next) {
                    return true;
                } else {
                    return false;
                }
            }
        },
        _initPartnerList = function () {
            $('#partnerSelect').chosen({
                allow_single_deselect: true,
                search_contains: true,
                width: '100%'
            });

            _root.find("#partnerSelect").change(function () {

                var searchText = $("#partnerSelect option:selected").val()
                _root.find("#partnerInput").val(searchText);

                var partnerId = $("#partnerSelect").val();
                if (partnerId == "-1") {
                    return;
                }
                console.log("partnerId:" + partnerId);
                wantong.frame.showPage(SWITCH_PARTNER_URL, {
                    partnerId: partnerId
                });
            });

        },
        _jumpPage = function () {
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
                var partnerId = _serachForm.find("#currentPage").attr("partnerId");
                _serachForm.find("#currentPage").val($(this).find("a").attr("page"));
                console.log("partnerId:" + partnerId);
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
                var partnerId = _root.find("#partnerId").val();
                var page = _root.find("#pageText").val();
                totalPage = parseInt(totalPage);
                page = parseInt(page);
                if (page > totalPage || isNaN(page) || page <= 0) {
                    layer.msg("请输入正确页数");
                    return;
                }
                wantong.frame.showPage(SWITCH_PARTNER_URL, {
                    partnerId: partnerId,
                    currentPage: page
                });
            });
        },
        _initUpdateApp = function () {
            _root.find("#partnersListPanel").delegate(".glyphicon-edit", "click",
                function (e) {
                    var appId = $(this).attr("appId");
                    console.log("appId:" + appId);
                    $.post(GET_APP_PARAM_URL, {
                        appId: appId
                    }, function (data) {
                        if (data.code == 0) {
                            _showDialog("编辑应用", '750px', 'auto', _createNewAppDialog);
                            _createNewAppDialog.find("#saveButton").removeAttr(
                                "disabled");
                            _root.find(".layui-layer-content").css("height", "unset");
                            _root.find(".layui-layer-page").css("top", "unset");
                            if (data.data != null) {
                                console.log('load data finish');
                                _addAppParam(data.data);
                                initEdition(data.data);
                            }
                        } else {
                            layer.msg("获取App信息错误。");
                        }
                    })
                }
            );
        },
        _showDialog = function (title, width, height, dialog, recall) {
            layer.open({
                title: title,
                type: 1,
                maxmin: false,
                resize: false,
                area: [width, height],
                scrollbar: true,
                content: dialog,
                end: function () {
                    var currentPage = _root.find("#currentPage").val();
                    var partnerId = _root.find("#partnerId").val();
                    var searchText = _root.find("#searchInput").val();
                    wantong.frame.showPage(GlobalVar.backPath,
                        {
                            currentPage: currentPage,
                            partnerId: partnerId,
                            searchText: searchText
                        });
                },
                cancel: function () {
                },
                success: function (layero) {
                    var mask = $(".layui-layer-shade");
                    mask.appendTo(layero.parent());
                    //其中：layero是弹层的DOM对象
                    if (recall) recall();
                }
            });
            _layerIndex = layer.index;
        },
        _addAppParam = function (data) {
            var name = _createNewAppDialog.find("#name");
            var appTypeList = _createNewAppDialog.find("#appTypeName");
            var authorityTypeSelect = _createNewAppDialog.find(
                "#authorityTypeSelect");
            _createNewAppDialog.attr("appId", data.id);
            name.val(data.name);
            console.log("name:" + data.name);
            appTypeList.val(data.appTypeId);
            authorityTypeSelect.css("color", "#BBBBBB");
            appTypeList.css("color", "#BBBBBB");
            appTypeList.attr("disabled", "disabled");
            var typeVal = data.appTypeId;
            if (typeVal == 0 || typeVal == 10 || typeVal == 11 || typeVal == 12) {
                _root.find("#appTypeList").find("#shareTypeSelect").css(
                    "display",
                    "inline");
                _root.find("#authSelect").css("display", "inline");
                //_root.find(".layui-layer-content").css("height", "450px");
                _createNewAppDialog.find(".product-skill").css('display', 'none');
                if (typeVal == 0) {
                    _createNewAppDialog.find("#bookSkill").css('display', 'block');
                } else if (typeVal == 10) {
                    _createNewAppDialog.find("#k12Skill").css('display', 'block');
                    _root.find("#repoSettingToggle").css('display', "block");
                } else if (typeVal == 11) {
                    _createNewAppDialog.find('#wordSearch').css('display', 'block');
                    _root.find("#repoSettingToggle").css('display', "none");
                } else if (typeVal == 12) {
                    _createNewAppDialog.find('#cardSkill').css('display', 'block');
                }
            }

            authorityTypeSelect.val(data.authorityType);
            authorityTypeSelect.attr("disabled", "disabled");
            if(typeVal != 12) {
                _createNewAppDialog.find("#repoSettingToggle").css("display", "inline-block");
            }
            _createNewAppDialog.find("#verifyTypeSelect").val(data.verifyType);
            // _createNewAppDialog.find("#platform").val(data.platform);
            console.log('load app');
            //技能
            if(data.skills.indexOf(6) != -1){
                _createNewAppDialog.find("#ocrSupport input:checkbox").removeAttr("checked");
                data.functions.forEach(function (e) {
                    if(e >= 100){
                        _createNewAppDialog.find("#ocrSupport input[value='" + e + "']").prop( 'checked', true);
                    } else if (e >= 50){
                        _createNewAppDialog.find("#onlineDiv input[value='" + e + "']").prop( 'checked', true);
                    }
                });
                _createNewAppDialog.find("#ocrSupport").css("display","inline-block");
            }

            if (data.skills.indexOf(1) != -1){
                data.functions.forEach(function (e) {
                    if (e >= 50){
                        _createNewAppDialog.find("#onlineDiv input[value='" + e + "']").prop( 'checked', true);
                    }
                });
            }

            data.skills.forEach(function (e) {
                _createNewAppDialog.find(".product-skill input[value='" + e + "']").prop(
                    'checked', true);

            });
            _selectStrDisplay();

            //平台

            data.platforms.forEach(function (e) {
                _createNewAppDialog.find(".platform-select .select input[value='"+ e +"']").prop(
                    'checked', true);
            });

            _platformStrDisplay();

            _checkFunctionSelectDisplay();

            data.functions.forEach(function (e) {
                _createNewAppDialog.find(".function-select .select input[value='"+ e +"']").prop(
                    'checked', true);
            });

            _functionStrDisplay();

        },
        _initButton = function () {
            _root.delegate("#appNameSpan", "mouseover", function () {
                var buttonContainer = $(this).find("#buttonContainer");
                _showButtonContainer(buttonContainer);
            });
            _root.delegate("#appNameSpan", "mouseout", function () {
                var buttonContainer = $(this).find("#buttonContainer");
                _hideButtonContainer(buttonContainer);
            });
            $('#searchSelect').chosen({
                allow_single_deselect: true,
                search_contains: true,
                width: '100%'
            });
            _root.find("#searchSelect").change(function () {
                var searchText = $("#searchSelect option:selected").val()
                _root.find("#searchInput").val(searchText);
                var partnerId = $("#partnerSelect").val();
                if (searchText == null) {
                    layer.msg("请输入搜索内容");
                    return;
                }
                wantong.frame.showPage(SWITCH_PARTNER_URL, {
                    searchText: searchText,
                    partnerId: partnerId
                });
            })
        },
        _showButtonContainer = function (container) {
            var visiableValue = container.css("visibility");
            if (visiableValue == "hidden") {
                container.css("visibility", "visible");
            }
        },
        _hideButtonContainer = function (container) {
            var visiableValue = container.css("visibility");
            if (visiableValue != "hidden") {
                container.css("visibility", "hidden");
            }
        },
        _initQrCodeDetails = function () {
            _root.find("#partnersListPanel").delegate(".qrcode-consumption-details",
                "click", function () {
                    var appId = $(this).attr("appId");
                    var appName = $(this).attr("appName");
                    var searchText = _root.find("#searchInput").val();
                    var currentPage = parseInt(_root.find("#currentPage").val());
                    var authorityType = parseInt($(this).attr("authoritytype"));
                    wantong.frame.showPage(QRCODE_CONSUMPTION_DETAILS_URL, {
                        appId: appId,
                        appName: appName,
                        authType: authorityType,
                        parentPanelPage: currentPage,
                        parentSearchText: searchText
                    });
                });
        },

        initCreation = function () {

            disableBothRepoSet();

            $("#shareType option").removeAttr("selected");
            if ($("#partnerId").val() == 1) {
                $("#selectBoth").attr("hidden", true);
                $("#selectClient").attr("hidden", true);
                $("#selectWantong").attr("selected", true);
                openSingleWantongRepoSet()
            } else {
                $("#selectBoth").removeAttr("hidden");
                $("#selectClient").removeAttr("hidden");
                $("#selectBoth").attr("selected", true);
                openBothRepoSet();
            }

        },
        filterRepos = function (k12, card) {
            console.log('是否k12', k12, "是否 card" , card);
            if (card) {
                $(".book-repo-list").css('display','none');
                $(".card-repo-list").css('display','block');
            } else {
                $(".book-repo-list").css('display','block');
                $(".card-repo-list").css('display','none');

                $(".book-repo-list .oneRepo").each(function () {
                    if (k12) {
                        $(this).css('display', $(this).attr('model') == 29 ? 'block' : 'none');
                    } else {
                        $(this).css('display', $(this).attr('model') != 29 ? 'block' : 'none');
                    }
                });
            }
        },
        initEdition = function (data, createDialog) {
            var typeVal = data.appTypeId;
            console.log('init', typeVal, 'tttttttttttttt');
            //是否包含NBE
            $('#nbeOpen').val(data.functions.indexOf(1) === -1 ? 0 : 1);
            if (typeVal == 0 || typeVal == 10 || typeVal == 11 || typeVal == 12) {
                $("#repoDiv").removeAttr("hidden")
                $("#platformSelect").removeAttr("hidden");
                _createNewAppDialog.find("#platformSelect").css("display", "inline");
                if (typeVal == 11) {
                    _createNewAppDialog.find("#shareTypeSelect").css('display', 'none');
                    _createNewAppDialog.find("#repoSettingToggle").css('display', "none");
                } else {
                    if (typeVal == 12) {
                        _createNewAppDialog.find("#shareTypeSelect").css('display', 'none');
                    }

                    filterRepos(typeVal == 10, typeVal == 12);
                }
            } else {
                $('#repoSettingToggle').css('display', 'none');
                $("#repoDiv").attr("hidden", true)
                $("#platformSelect").attr("hidden", true)
            }

            //start 下方界面开关
            disableBothRepoSet();
            $("#shareType option").removeAttr("selected");
            console.log('显示资源库列表');
            if (typeVal == 12) {
                //卡片
                $("#selectClient").attr("selected", true);
                openSingleClientRepoSet();
            } else {
                if ($("#partnerId").val() == 1) {
                    $("#selectBoth").attr("hidden", true);
                    $("#selectClient").attr("hidden", true);
                    $("#selectWantong").attr("selected", true);
                    openSingleWantongRepoSet();
                } else {
                    $("#selectBoth").removeAttr("hidden");
                    $("#selectClient").removeAttr("hidden");
                    if (data.shareType == 2) {
                        $("#selectBoth").attr("selected", true);
                        openBothRepoSet();
                    } else if (data.shareType == 1) {
                        $("#selectClient").attr("selected", true);
                        openSingleClientRepoSet();
                    } else {
                        $("#selectWantong").attr("selected", true);
                        openSingleWantongRepoSet();
                    }
                }
            }

            //end

            //start 还原下方数据
            console.log('还原下方数据');
            _toggleRepoState($(".normalRepoCheck"));
            $('#repoPriorityDiv').css('display', 'block');

            var clientCheckedList = [];
            var wtCheckedList = [];
            var jimeiCheckedList = [];

            var array = data.appRepoList;
            var clientCount = 0;
            for (var i = 0; i < array.length; i++) {//设置客户库界面
                var id = array[i].id;
                var repoId = array[i].repoId ? array[i].repoId : array[i].modelId;
                var priority = array[i].priority;
                var oneRepo = $(".oneRepo[repoId = " + repoId + "]");
                if (oneRepo.parent().parent().parent().attr("id") == "clientRepoSet") {
                    oneRepo.attr('bid', id);
                    enableOneRepo(oneRepo);  //勾选
                    clientCheckedList.push(oneRepo.clone(true));
                    oneRepo.remove();
                    clientCount++;
                }
            }

            for (var i = 0; i < array.length; i++) {
                var id = array[i].id;
                var repoId = array[i].repoId;
                var priority = array[i].priority;
                var oneRepo = $(".oneRepo[repoId = " + repoId + "]");
                if (oneRepo.parent().parent().parent().attr("id") == "wantongRepoSet") {//设置玩瞳库界面
                    oneRepo.attr('bid', id);
                    enableOneRepo(oneRepo);  //勾选
                    wtCheckedList.push(oneRepo.clone(true));
                    oneRepo.remove();
                }
            }

            /*for (var i = 0; i < array.length; i++) {
                var id = array[i].id;
                var repoId = array[i].repoId;
                var priority = array[i].priority;
                var oneRepo = $(".oneRepo[repoId = " + repoId + "]");
                if (oneRepo.parent().parent().attr("id") == "jimeiRepoSet") {//设置吉美库界面
                    oneRepo.attr('bid', id);
                    enableOneRepo(oneRepo);  //勾选
                    jimeiCheckedList.push(oneRepo.clone(true));
                    oneRepo.remove();
                }
            }*/

            for (var i = 0; i < array.length; i++) { //设置 用户授权/应用授权 下拉框
                var repoId = array[i].repoId;
                var oneRepo = $(".oneRepo[repoId = " + repoId + "]");
                oneRepo.children(".authorityTypeDiv").children("select").val(
                    array[i].authType);
            }
            //end 还原下方数据
            console.log('resort');
            //_dragUpdate($('.repoSetDiv'));
            var wtDom = $('#wantongRepoSet');
            var clientDom = $('#clientRepoSet');
            /*var jimeiDom = $('#jimeiRepoSet');*/

            wtDom.find('.table-title').after(wtCheckedList);

            if (typeVal == 12){
                //卡片
                clientDom.find(".card-repo-list").find('.table-title').after(clientCheckedList);
            } else {
                //其他
                clientDom.find(".book-repo-list").find('.table-title').after(clientCheckedList);
            }

            //jimeiDom.find('.table-title').after(jimeiCheckedList);
            $('#repoPriorityDiv').css('display', 'none');

            _root.find(".mr-selector-wrapper .select").toggle();
            _root.find('.mr-selector-wrapper #stateSureBtn').click();
        },

        bindResourseMethodChanged = function () {

            $("#shareTypeSelect").on("change", function () {
                var i = $("#shareTypeSelect option:selected").val();
                if (i == 2) {
                    openBothRepoSet();
                } else if (i == 1) {
                    openSingleClientRepoSet();
                } else if (i == 3) {
                    openSingleWantongRepoSet();
                }

            })
        },

        bindProjectTypeChanged = function () {

            $("#appTypeName").on("change", function () {
                var val = $("#appTypeName option:selected").val();
                //是否隐藏repo列表
                if (val == 0 || val == 10 || val == 12) {
                    $("#repoDiv").removeAttr("hidden");
                } else {
                    $("#repoDiv").attr("hidden", true);
                }
            })
        },

        openSingleWantongRepoSet = function () {
            $("#clientRepoTag").attr("hidden", true);
            $("#wantongRepoTag").removeAttr("hidden");
            showWantongRepoSet();
            enableWantongRepoSet();

           /* showJimeiRepoSet();
            enableJimeiRepoSet();*/

            hidenClientRepoSet();
            disableClientRepoSet();

        },

        openBothRepoSet = function () {
            $("#wantongRepoTag").removeAttr("hidden");
            $("#clientRepoTag").removeAttr("hidden");
            showWantongRepoSet();
            //showJimeiRepoSet();
            showClientRepoSet();
            enableClientRepoSet();
            enableWantongRepoSet();
            //enableJimeiRepoSet();
        },

        openSingleClientRepoSet = function () {
            $("#wantongRepoTag").attr("hidden", true)
            $("#clientRepoTag").removeAttr("hidden")
            showClientRepoSet();
            enableClientRepoSet();

            hidenWantongRepoSet();
            disableWantongRepoSet();

           /* hidenJimeiRepoSet();
            disableJimeiRepoSet();*/
        },

        bindClickForAll = function () {
            bindClickForCicle();
            bindClickForEnableRepo();
            bindResourseMethodChanged();
            bindProjectTypeChanged();
            bindClickForTag();
        },

        blockWantongRepo = function () {
            blockRepoSet($("#wantongRepoSet"));
        },

        blockClientRepo = function () {
            blockRepoSet($("#clientRepoSet"));
        },
       /* blockJimeiRepo = function () {
            blockRepoSet($("#jimeiRepoSet"));
        },*/

        unBlockWantongRepo = function () {
            unBlockRepoSet($("#wantongRepoSet"));
        },

        unBlockClientRepo = function () {
            unBlockRepoSet($("#clientRepoSet"));
        },
       /* unBlockJimeiRepo = function () {
            unBlockRepoSet($("#jimeiRepoSet"));
        },*/

        blockRepoSet = function ($e) {
            $e.children(".oneRepo").each(function (index, elem) {
                disableOneRepo($(elem));
            });
            $e.children(".oneRepo").children(".enableRepo").children("input").attr(
                "disabled", "disabled");
        },

        unBlockRepoSet = function ($e) {
            $e.children("div.oneRepo").each(function (index, elem) {
                enableOneRepo($(elem));
            });
            var $input = $e.children(".oneRepo").children(".enableRepo").children(
                "input");
            $input.removeAttr("disabled");
            $input.prop("checked", true);
            $input.addClass('active');
        },

        showWantongRepoSet = function () {
            $("#wantongRepoSet").removeAttr("hidden");
            $("#wantongRepoTag").css("color", "#3DBEED");
            $("#clientRepoTag").css("color", "#737373");

        },

        showClientRepoSet = function () {
            $("#clientRepoSet").removeAttr("hidden");

            $("#clientRepoTag").css("color", "#3DBEED");
            $("#wantongRepoTag").css("color", "#737373")
        },

        /*showJimeiRepoSet = function(){
            $("#jimeiRepoSet").removeAttr("hidden");

          /!*  $("#clientRepoTag").css("color", "#3DBEED");
            $("#wantongRepoTag").css("color", "#737373")*!/
        }*/

        hidenWantongRepoSet = function () {
            $("#wantongRepoSet").attr("hidden", true)
        },

        hidenClientRepoSet = function () {
            $("#clientRepoSet").attr("hidden", true)
        },
        /*hidenJimeiRepoSet = function () {
            $("#jimeiRepoSet").attr("hidden", true)
        },*/


        enableWantongRepoSet = function () {
            unBlockWantongRepo();
        },

        enableClientRepoSet = function () {
            unBlockClientRepo();
        },
        /*enableJimeiRepoSet = function () {
            unBlockJimeiRepo();
        },*/


        disableWantongRepoSet = function () {
            blockWantongRepo();
        },

        disableClientRepoSet = function () {
            blockClientRepo();
        },
       /* disableJimeiRepoSet = function () {
            blockJimeiRepo();
        },*/

        disableBothRepoSet = function () {
            disableClientRepoSet();
            disableWantongRepoSet();
            //disableJimeiRepoSet();
        },

        bindClickForTag = function () {

            $("#wantongRepoTag").on("click", function () {
                if ($("#shareTypeSelect option:selected").val() == 2) {
                    showWantongRepoSet();
                    hidenClientRepoSet();

                }
            })

            $("#clientRepoTag").on("click", function () {
                if ($("#shareTypeSelect option:selected").val() == 2) {
                    hidenWantongRepoSet();
                    showClientRepoSet();
                }
            })

        },
        _toggleRepoState = function ($this) {
            var oneRepo = $this.parent().parent();
            if ($this.prop("checked")) {
                $this.addClass('active');
                oneRepo.children(".authorityTypeDiv").children("select").removeAttr(
                    "disabled");
                oneRepo.children(".authorityTypeDiv").children("select").css(
                    "background-color", "white");//勾选
            } else {
                $this.removeClass('active');
                oneRepo.children(".authorityTypeDiv").children("select").attr(
                    "disabled", "disabled");
                oneRepo.children(".authorityTypeDiv").children("select").css(
                    "background-color", "#CDCCCC"); //取消勾选
            }
        },
        bindClickForEnableRepo = function () {
            $(".normalRepoCheck").on('click', function (e) {
                var $this = $(this);
                _checkBoxClick($this);
            });
        },
        _checkBoxClick = function ($this) {
            _toggleRepoState($this);
            _dragUpdate($this.parent().parent().parent().parent().parent());
        },
        enableOneRepo = function (oneRepo) {
            var $input = oneRepo.children("div.enableRepo").children("input");
            $input.prop("checked", true);
            $input.addClass('active');
            oneRepo.removeAttr("disabled");
            oneRepo.children(".authorityTypeDiv").children("select").removeAttr(
                "disabled");
            oneRepo.children(".authorityTypeDiv").children("select").css(
                "background-color", "white");
        },

        disableOneRepo = function (oneRepo) {
            var $input = oneRepo.children("div.enableRepo").children("input");
            $input.prop("checked", false);
            $input.removeClass('active');
            oneRepo.attr("disabled", true);
            oneRepo.children(".authorityTypeDiv").children("select").attr(
                "disabled", "disabled");
            oneRepo.children(".authorityTypeDiv").children("select").css(
                "background-color", "#CDCCCC");
        },

        bindClickForCicle = function () {
            $('.cicle').on('click', function () {
                var $this = $(this);
                $this.siblings(".cicle").removeClass("cicle-clicked")
                $this.addClass("cicle-clicked");
                var oneRepo = $this.parent().parent().parent();
                oneRepo.attr("priority", $(this).text());
                // alert(oneRepo.attr("repoId")+" "+oneRepo.attr("priority"));
            });
        },

        getOneTagDataToArray = function (repoSetId) {
            var array = new Array();
            $(repoSetId).children(".oneRepo").each(function (index, elem) {
                addOneRepoDataToArray(elem, array, index)
            });
            console.log(array);
            return array;
        },

        addOneRepoDataToArray = function (elem, array, index) {
            var $elem = $(elem);
            var $input = $elem.children("div.enableRepo").children("input");
            if ($input.prop("checked") == true) {
                var one = new Object();
                one.id = Number($elem.attr('bid'));
                one.repoId = Number($elem.attr("repoId"));
                one.priority = Number(index);
                one.authType = Number(
                    $elem.children(".authorityTypeDiv").children("select").val());
                array.push(one);
            }
        },

        isRepeated = function (array) {
            if (array.length == 0) {
                return false;
            }

            for (var i = 0; i < array.length; i++) {
                var repeated = 0;
                for (var j = 0; j < array.length; j++) {
                    if (array[i].priority == array[j].priority) {
                        repeated++;
                    }
                }
                if (repeated > 1) {
                    return true;
                }
            }
            return false;
        },

        // ==========================================================================================

        checkRepeated = function () {

            var i = $("#shareTypeSelect option:selected").val();

            if (i == 2) {

                var array1 = getOneTagDataToArray("#clientRepoSet .container .repo-list")
                var bool1 = isRepeated(array1);

                var array2 = getOneTagDataToArray("#wantongRepoSet .container .repo-list")
                var bool2 = isRepeated(array2);

                /*var array3 = getOneTagDataToArray("#jimeiRepoSet")
                var bool3 = isRepeated(array3);*/

                return (bool1 || bool2)
            } else if (i == 1) {

                //var array = getAllTRepoDataAsArray()
                var array = getOneTagDataToArray("#clientRepoSet .container .repo-list")
                return isRepeated(array)

            } else if (i == 3) {
                // var array = getAllTRepoDataAsArray()
                var array = getOneTagDataToArray("#wantongRepoSet .container .repo-list")
                return isRepeated(array)

               /* var array2 = getOneTagDataToArray("#wantongRepoSet")
                var bool2 = isRepeated(array2);

                var array3 = getOneTagDataToArray("#jimeiRepoSet")
                var bool3 = isRepeated(array3);

                return (bool2 || bool3)*/
            }
        },

        getAllData = function () {
            var a1 = getOneTagDataToArray("#clientRepoSet .container .repo-list");
            var a2 = getOneTagDataToArray("#wantongRepoSet .container .repo-list");
            /*var a3 = getOneTagDataToArray("#jimeiRepoSet .container");*/

            for (i = 0; i < a2.length; i++) {
                a2[i].priority = a2[i].priority + 100
            }

            var shareType = $("#shareTypeSelect option:selected").val();
            if (shareType == 2) {
                var data = new Array;
                //return data.concat(a1).concat(a2)
                // 使用玩瞳资源库和仅使用玩瞳资源库时   要加入吉美私库
                return data.concat(a1).concat(a2)/*.concat(a3)*/
            } else if ($("#shareTypeSelect option:selected").val() == 1) {
                return a1
            } else {//if($("#shareTypeSelect option:selected").val() == 3)
                return a2;
                /*var data = new Array;
                return data.concat(a2).concat(a3)*/
            }
        },
        _changeUploadTab = function (isAndroid) {
            _uploadAPKDialog = _root.find("#uploadAPKDialog");
            if (isAndroid) {
                _uploadAPKDialog.find("#AndroidTab").addClass("layui-this");
                _uploadAPKDialog.find("#iOSTab").removeClass("layui-this");
                _uploadAPKDialog.find("#androidDiv").css("display", "inline");
                _uploadAPKDialog.find("#iOSDiv").css("display", "none");
            } else {
                _uploadAPKDialog.find("#AndroidTab").removeClass("layui-this");
                _uploadAPKDialog.find("#iOSTab").addClass("layui-this");
                _uploadAPKDialog.find("#androidDiv").css("display", "none");
                _uploadAPKDialog.find("#iOSDiv").css("display", "inline");
            }
        },
        _updateiOSLink = function () {
            var appId = _uploadAPKDialog.find("#appId").val();
            var link = _uploadAPKDialog.find("#iOSLink").val();
            $.get(UPDATE_iOS_LINK_URL + "?appId=" + appId + "&link="
                + link, {}, function (data) {
                if (data.code == 0) {
                    layer.msg("更新成功");
                    layer.close(_layerIndex);
                } else {
                    layer.msg("更新失败");
                }
            });
        },
        _loadiOSLink = function (appId) {
            $.get(LOAD_iOS_LINK_URL + "?appId=" + appId, {}, function (data) {
                if (data.code == 0) {
                    _uploadAPKDialog.find("#iOSLink").val(data.data);
                }
            });
        }
    ;

    return {
        init: function (conf) {
            _init(conf);
        },
        getRelationIndex: function() {
            return _relation_index;
        }
    };

})();

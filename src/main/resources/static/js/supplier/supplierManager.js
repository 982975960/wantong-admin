wantong.supplierManager = (function () {

  var CREATE_SUPPLIER_URL = GlobalVar.contextPath
      + "/supplier/createSupplier.do",
      UPDATE_SUPPLIER_URL = GlobalVar.contextPath
          + "/supplier/supplierAdmin.do",
      LIST_SUPPLIER_URL = GlobalVar.contextPath + "/supplier/Manager.do",
      SEND_EMAIL_URL = GlobalVar.contextPath + "/supplier/sendEmail.do",
      CHANGE_PARTNER_STATUS = GlobalVar.contextPath
          + "/supplier/changeSupplierStatus.do",
      UPLOAD_URL = "upload.do",
      PREVIEW_IMAGE = "downloadTempFile.do",
      GET_DOMAINNAME_URL = GlobalVar.contextPath + "/supplier/getDomainName.do",
      _root = null,
      _domainNameInput = null,
      _conf = {},
      _index = null,
      _serachForm = null,
      _uploader = null,
      _uploadButtonIsShown = false,
      _uploadButton = null,
      _domainNameAuto = null,
      _domainNameType = 0,
      _umask = null,
      _coverImage = null,
      _init = function (conf) {
        $.extend(_conf, conf);

        //console.log("supplierManager");
        _root = $("#supplierManager");
        _serachForm = _root.find("#searchFrom");
        _serachForm.attr("action", LIST_SUPPLIER_URL);
        _uploadButton = _root.find("#uploadBtn");
        _loadInfo();
        _initThumbnail();
        _initUploadBtn();
        _initCreateBtn();
        _initEditBtn();
        _handleAuthoritySelector();
        _showAndHide();
        _loadPageContent();

        _initChangeStatusBtn();
        _initUmask();
        _initZuiChosenSearch();
        if($("#moduleBodyDiv").find("#pagination").length>0){
          _initPagination($("#moduleBodyDiv").find("#pagination"));
        }
        // console.log("_sendBtn");
      },
      _initZuiChosenSearch = function () {
        //原来有点击事件绑定的方法，但不生效了
        $("#searchSupplierBtn").click(function () {
          var searchText = $("#searchInput").val();
          var status = $("#statusSelect").val();
          if (searchText == null) {
            layer.msg("请输入搜索内容");
            return;
          }
          wantong.frame.showPage(LIST_SUPPLIER_URL, {
            searchText: searchText,
            status: status
          });
        });

        $('.form-control-chosen').chosen({
          allow_single_deselect: true,
          search_contains: true,
          width: '100%'
        });

        $("#searchSelect").on("change", function () {
          var name = $("#searchSelect option:selected").val();
          console.log("name:" + name);
          $("#searchInput").val(name);
          $("#searchSupplierBtn").click();
        })

      },
      _initUmask = function () {
        _umask = new Array(
            "/role/createrole.do",
            "/role/updateRole.do",
            "/system/changeUserStatus.do",
            "/app/downloadlicense.do",
            "/app/uploadapk.do",
            "/app/showdownloadqrcode.do",
            "/feedback/listbookfeedback.do",
            "/feedback/exportAllBooks.do,/feedback/getbookfeedbackList.do",
            "/system/saveParamConfig.do",
            "/app/prepareAuthorizationCode.do,/app/checkAuthorizationCode.do,/app/downloadAuthorizationCode.do,/app/viewAuthrizationCodeRecord.do",
            "/system/createUser.do,/system/validateEmail.do",
            "/grantRole/excute.do,/grantRole/manager.do",
            "/grantAuth/manager.do,/grantAuth/excute.do",
            "/feedback/exportAllBooks.do",
            "/system/getWechatParam.do",
            "/cms/createLabel.do",
            "/cms/updateLabel.do",
            "/cms/deleteLabel.do",
            "/cms/checkBook.do,/cms/changePageExamine.do,/cms/publish.do,/cms/packUp.do",
            "/cms/createRepo.do",
            "/cms/editRepo.do",
            "/cms/discardAndRestoreLabel.do",
            "/virtual/bookEditor/editFinger.do,/cms/showEditFinger.do,/cms/perspectiveImg.do,/cms/loadPageFingerInfo.do,/cms/savePageFingerInfo.do,/cms/showAddPage.do,/cms/listPages.do,/cms/loadPageInfo.do",
            "/system/toBeDeveloper.do",
            "/feedback/listbookfeedback.do",
            "/feedback/listfeedback.do",
            "/virtual/cms/createRepo.do",
            "/page/cms/migration/main",
            "/operating/appOperatingConfigManager.do",
            "/api/cms/migration/cut",
            "/work/loadWorkOrders.do,/work/loadWorkOrderList.do","/work/loadWorkOrderBooks.do",
            "/work/lookBookProgress.do",
            "/app/lookRelationRepo.do",
            "/system/userEmail.do",
            "/cms/setRepoAdmin.do,/cms/handleRepoAdmin.do",
            "/app/showBindDeviceId.do",
            "/app/showDeviceIdLoginException.do,/app/getDeviceIdLoginException.do,/app/delLoginExceptionRecord.do"
            //---------------------资源制作的默认权限
            ,"/cms/deleteBookRepo.do,/cms/deleteBook.do"
            ,"/cms/pickUpBooks.do"
            ,"/cms/saveBookInfo.do"
            ,"/virtual/bookEditor/enterBook.do,/cms/showAddPage.do,/cms/listPages.do,/cms/loadPageInfo.do,/virtual/pageEditor/editingThePage.do"
            ,"/cms/checkBook.do,/cms/changePageExamine.do,/cms/publish.do,/cms/packUp.do,/cms/changeBookStatus.do"
            ,"/virtual/voiceEditor/oneRoleSpeechSynthesis.do,/cms/ttsConvert.do,/cms/DBttsConvert.do"
            ,"/virtual/voiceEditor/realPersonVoiceUpload.do"
            ,"/cms/forbiddenBook.do"
            ,"/virtual/bookEditor/editorBookLabel.do,/cms/addLabel.do,/cms/getLabelNames,/cms/saveBookLabel.do"
            ,"/virtual/cms/repoBooksCount.do"
            ,"/virtual/allowBookResourcesNull.do"
            ,"/cms/listRecordBooks.do,/cms/getBookChangeRecord.do,/cms/changeRecordBookState.do"
            ,"/virtual/pickupTips.do"
            //--------------------------
        );
        var _createSupplier = _root.find("#createSupplierContainer");
        // _createSupplier.find("input");
        _createSupplier.find("input[type=checkbox]").each(function () {
          var url = $(this).attr("url");
          var index = _umask.indexOf(url);
          if (index != -1) {
            $(this).click();
          }
        });
      },
      _initCreateBtn = function () {
        _root.find("#createSupplier").click(function () {
          _showCreateDialog();
        });
        _root.find("#sendEmail").click(function () {
          _showEamilDialog();
        });
        _root.find("#statusSelect").change(function () {
          var status = $("#statusSelect").val();
          if (status == "-1") {
            return;
          }
          console.log("status:" + status);
          wantong.frame.showPage(LIST_SUPPLIER_URL, {
            status: status
          });
        });
        // _root.find("#searchSupplierBtn").click(function () {
        //   alert(2)
        //   _searchSupplier();
        // });
      },
      _initEditBtn = function () {
        _root.find(".btn-edit").click(function () {
          var thisBtn = $(this);
          thisBtn.blur();
          var nowTime = new Date().getTime();
          var clickTime = thisBtn.attr("ctime");
          if (clickTime != 'undefined' && (nowTime - clickTime < 5000)) {
            return false;
          } else {
            thisBtn.attr("ctime", nowTime);
          }
          $.get(UPDATE_SUPPLIER_URL + "?id=" + thisBtn.attr("tid"), {},
              function (data) {
                layer.open({
                  title: "修改合作商",
                  type: 1,
                  maxmin: false,
                  area: ['970px', '850px'],
                  content: data,
                  end: function () {
                    var currentPage = _root.find("#currentPage").val();
                    var partnerStatus = _root.find("#partnerStatus").val();
                    var searchText = _root.find("#searchInput").val();
                    wantong.frame.showPage(GlobalVar.backPath,
                        {
                          currentPage: currentPage,
                          status: partnerStatus,
                          searchText: searchText
                        });
                  },
                  cancel: function () {
                  },
                  error: function () {
                    layer.msg("获取合作商信息失败");
                  },
                  success: function (layero) {
                    var mask = $(".layui-layer-shade");
                    mask.appendTo(layero.parent());
                    //其中：layero是弹层的DOM对象
                  }
                });
              });

        });
      },
      _initChangeStatusBtn = function () {
        _root.find(".btn-change").click(function () {
          var thisBtn = $(this);
          $(this).blur();
          var partnerId = thisBtn.attr("tid");
          var status = thisBtn.attr("tstatus");
          var currentPage = _root.find("#currentPage").val();
          var partnerStatus = _root.find("#partnerStatus").val();
          var searchText = _root.find("#searchInput").val();
          var str = status == 0 ? "确定要激活此用户吗？" :
              "确定要禁用此用户吗？";
          layer.confirm(str, {
            btn: ['确定', '取消'] //按钮
          }, function () {
            $.post(CHANGE_PARTNER_STATUS, {
              id: partnerId,
              status: status
            }, function (data) {
              if (data.code == 0) {
                if (status == 0) {
                  layer.msg("激活成功");
                } else {
                  layer.msg("禁用成功");
                }
                wantong.frame.showPage(GlobalVar.backPath,
                    {
                      currentPage: currentPage,
                      status: partnerStatus,
                      searchText: searchText
                    });
              } else {
                layer.msg("操作失败:" + data.msg);
              }
            });
          }, function () {

          });

        });
      },
      _createSubmit = function () {

        var _createSupplier = _root.find("#createSupplierContainer");
        var _saveBtn = _createSupplier.find("#saveBtn");
        var _createDialogRoot = _root.find("#createSupplierContainer");
        var name = _createDialogRoot.find("#name").val();
        var adminEmail = _createDialogRoot.find("#adminEmail").val();
        var phoneNum = _createDialogRoot.find("#phoneNumber").val();
        var domainName = _createDialogRoot.find("#domainName").val();
        var _allAuthoritiesCheckBox = _createDialogRoot.find(
            "input[type=checkbox]");
        var authJson = "[";
        _allAuthoritiesCheckBox.each(function () {
          var thisCheckBox = $(this);
          var authId = thisCheckBox.val();
          if (this.checked) {
            authJson += "{authId:'" + authId + "'},";
          }
        });
        authJson = authJson.substring(0, authJson.length - 1);
        authJson += ']';
        console.log("name:" + name);
        if (name == null || name == "") {
          layer.msg("合作商名称不能为空");
          return;
        }
        var regu = "^[ ]+$";
        var re = new RegExp(regu);
        if (re.test(name)) {
          layer.msg("合作商名称不能为空");
          return;
        }
        var txt = new RegExp(/[<>/|]/);
        if (txt.test(name)) {
          layer.msg("合作商名称不能含有非法字符");
          return;
        }

        if (name.length > 45) {
          layer.msg("合作商名称不能大于45个字符");
          return;
        }

        if (phoneNum == null || phoneNum == "") {
          layer.msg("请输入合作商负责人手机号");
          return;
        }
        var phoneReg = /^[1][0,1,2,3,4,5,6,7,8,9][0-9]{9}$/;
        if (!phoneReg.test(phoneNum) || phoneNum.length != 11) {
          layer.msg("请输入11位的手机号");
          return;
        }
        if (adminEmail == "") {
          layer.msg("管理员账户不能为空");
          return;
        }

        /*var reg = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+((.[a-zA-Z0-9_-]{2,3}){1,2})$/;
        if (!reg.test(adminEmail.toLowerCase())) {
          layer.msg("邮箱格式不正确");
          return;
        }*/
        if (adminEmail.length > 45) {
          layer.msg("邮箱长度不能大于45个字符");
          return;
        }

        var partnerType = _createSupplier.find("#partnerTypeSelect").val();


        _saveBtn.attr("disabled", "disabled");
        $.post(CREATE_SUPPLIER_URL, {
          name: name,
          adminEmail: adminEmail,
          authData: authJson,
          phone: phoneNum,
          image: _coverImage,
          partnerType: partnerType
        }, function (data) {
          if (data.code == 0) {
            layer.msg("保存成功");
            layer.close(_index);
            /* setTimeout(function () {
               wantong.frame.showPage(GlobalVar.backPath, GlobalVar.data);
             }, 500);*/
          } else {
            layer.msg("保存失败：" + data.msg);
            _saveBtn.removeAttr("disabled");
          }
        });
      },
      _showCreateDialog = function () {
        var _createSupplier = _root.find("#createSupplierContainer");
        var _saveBtn = _createSupplier.find("#saveBtn");
        var _closeBtn = _createSupplier.find("#closeBtn");
        _saveBtn.click(function () {
          _createSubmit();
        });
        _closeBtn.click(function () {
          //wantong.frame.refreshPage();
          _saveBtn.removeAttr("disabled");
          layer.close(_index);
        });
        layer.open({
          title: "新增合作商",
          type: 1,
          maxmin: false,
          resize: false,
          area: ['910px', '730px'],
          scrollbar: true,
          content: _createSupplier,
          end: function () {
            var currentPage = _root.find("#currentPage").val();
            var partnerStatus = _root.find("#partnerStatus").val();
            var searchText = _root.find("#searchInput").val();
            wantong.frame.showPage(GlobalVar.backPath,
                {
                  currentPage: currentPage,
                  status: partnerStatus,
                  searchText: searchText
                });
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
        _createSupplier.find("#name").focus();
      },
      _showEamilDialog = function () {
        var _emailDialog = _root.find("#emailContentContainer");
        var _sendBtn = _emailDialog.find("#sendBtn");
        var _closeBtn = _emailDialog.find("#closeBtn");
        _sendBtn.click(function () {
          _sendEmail();
        });
        _closeBtn.click(function () {
          _sendBtn.removeAttr("disabled");
          console.log("index:" + _index);
          layer.close(_index);
        });
        layer.open({
          title: "编辑邮件内容",
          type: 1,
          maxmin: false,
          resize: false,
          area: ['800px', '800px'],
          scrollbar: true,
          content: _emailDialog,
          end: function () {
            /*var currentPage = _root.find("#currentPage").val();
            var partnerStatus = _root.find("#partnerStatus").val();
            var searchText = _root.find("#searchInput").val();
            wantong.frame.showPage(GlobalVar.backPath,
                {
                  currentPage: currentPage,
                  status: partnerStatus,
                  searchText: searchText
                });*/
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
        _root.find("#editor").css("width", "auto");
        _root.find("#editor").find(".re-editor").css("height", "95%");
        _root.find("#editor").find(".re-editor").focus();
        _emailDialog.find(".re-editor").html("");
        _index = layer.index;
      },
      _sendEmail = function () {

        var _emailDialog = _root.find("#emailContentForm");
        var _emailContent = _emailDialog.find(".re-editor").html();
        var _sendBtn = _emailDialog.find("#sendBtn");
        _emailContent = _emailContent.replace("www.", "http://www.");
        if (_emailContent == null || _emailContent == "") {
          layer.msg("邮件内容不能为空");
          return;
        }
        console.log("length:" + _emailContent.length);
        /*if (_emailContent.length > 8000) {
          layer.msg("邮件内容不能超过8000字");
          return;
        }*/
        _sendBtn.attr("disabled", "disabled");
        $.post(SEND_EMAIL_URL, {
          content: _emailContent
        }, function (data) {
          if (data.code == 0) {
            layer.msg("发送成功");
            layer.close(_index);
          } else {
            layer.msg("发送失败：" + data.msg);
            _saveBtn.removeAttr("disabled");
          }
        });
      },
      _showAndHide = function () {
        _root.delegate("input[type=button]", "click", function () {
          var curImage = $(this);
          var order = curImage.attr("order");
          var id = curImage.attr("authid");
          if (order == 0) {
            var second = $(".secondLevel_" + id);
            if (second.css("display") == "none") {
              second.css("display", "inline");
              curImage.css("background-image", "url(static/images/hide.png)")
            } else {
              second.css("display", "none");
              curImage.css("background-image", "url(static/images/show.png)")
            }
          } else {
            var third = $(".thirdLevel_" + id);
            if (third.css("display") == "none") {
              third.css("display", "inline");
              curImage.css("background-image", "url(static/images/hide.png)")
            } else {
              third.css("display", "none");
              curImage.css("background-image", "url(static/images/show.png)")
            }
          }
        });
      },
      _handleAuthoritySelector = function () {
        _root.delegate("input[type=checkbox]", "click", function () {
          var currentCheckBox = $(this);
          var currentType = currentCheckBox.attr("levelType");
          var levelId = currentCheckBox.attr("value");
          if (currentType == "topLevel") {
            var subLevels = _root.find(".secondLevel_" + levelId).find(
                "input[type=checkbox]");
            if (currentCheckBox.get(0).checked) {
              subLevels.prop("checked", true);
              for (var i = 0; i < subLevels.length; i++) {
                var thirdLevelInput = _root.find(
                    ".thirdLevel_" + subLevels[i].value).find(
                    "input[type=checkbox]");
                thirdLevelInput.prop("checked", true);
              }
            } else {
              subLevels.prop("checked", false);
              for (var i = 0; i < subLevels.length; i++) {
                var thirdLevelInput = _root.find(
                    ".thirdLevel_" + subLevels[i].value).find(
                    "input[type=checkbox]");
                thirdLevelInput.prop("checked", false);
              }
            }
          } else if (currentType == "secondLevel") {
            var parentId = currentCheckBox.attr("topId");
            var parentLevel = _root.find(".topLevel_" + parentId).find(
                ".panel-heading").find("input[type=checkbox]");
            var allSameLevels = _root.find(".secondLevel_" + parentId).find(
                ".second").find("input[type=checkbox]");
            var thirdLevel = _root.find(".thirdLevel_" + levelId).find(
                "input[type=checkbox]");
            if (currentCheckBox.get(0).checked) {
              parentLevel.prop("checked", true);
              thirdLevel.prop("checked", true);
            } else {
              var allSubLevelUnselected = true;
              allSameLevels.each(function (index, item) {
                if (item.checked) {
                  allSubLevelUnselected = false;
                }
              });
              if (allSubLevelUnselected) {
                parentLevel.prop("checked", false);
              }
              thirdLevel.prop("checked", false);
            }
          } else {
            var topId = currentCheckBox.attr("topid");
            var secondId = currentCheckBox.attr("secondid");
            var secondLevel = _root.find(".level_" + secondId).find(
                "input[type=checkbox]");
            var topLevel = _root.find(".topLevel_" + topId).find(
                ".panel-heading").find("input[type=checkbox]");
            if (currentCheckBox.get(0).checked) {
              topLevel.prop("checked", true);
              secondLevel.prop("checked", true);
            } else {
              var allThirdLevelUnselected = true;
              var allThirdLevel = _root.find(".thirdLevel_" + secondId).find(
                  "input[type=checkbox]");
              allThirdLevel.each(function (index, item) {
                if (item.checked) {
                  allThirdLevelUnselected = false;
                }
              });
              if (allThirdLevelUnselected) {
                secondLevel.prop("checked", false);
                var allSecondLevelUnselected = true;
                var allSecondLevel = _root.find(".secondLevel_" + topId).find(
                    ".second").find("input[type=checkbox]");
                allSecondLevel.each(function (index, item) {
                  if (item.checked) {
                    allSecondLevelUnselected = false;
                  }
                });
                if (allSecondLevelUnselected) {
                  topLevel.prop("checked", false);
                }
              }
            }
          }
        });
      },

      _loadPageContent = function () {
        var status = _root.find("#partnerStatus").val();
        $("#statusSelect").val(status);
        var search = _root.find("#searchInput").val();
        $("#searchText").val(search);
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
          var partnerStatus = _root.find("#partnerStatus").val();

          var page = _root.find("#pageText").val();
          if (parseInt(page) > parseInt(totalPage) || isNaN(page) || page <= 0) {
            layer.msg("请输入正确页数");
            return;
          }
          wantong.frame.showPage(GlobalVar.backPath,
              {
                currentPage: page,
                status: partnerStatus
              });
        });
      },

      _refreshList = function(page){
        if(page == undefined){
          page = 1;
        }
        var state = _root.find("#partnerStatus").val();
        var searchText = _root.find("#searchInput").val();
        $.get(LIST_SUPPLIER_URL,{
          currentPage:page,
          status:state,
          searchText:searchText
        },function (data) {
          var obj = $(data);
          // var pagation = obj.find("#pagination");
          // if(pagation.length > 0){
          //   _initPagination(pagation);
          // }
          $("#moduleBodyDiv").html(data);
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
      },

      _initThumbnail = function () {
        //must hide upload button after a while, otherwise the uploder cannot be init successful.
        setTimeout(function () {
          _uploadButton.hide();
        }, 100);
        _root.find("#thumbnail").mouseover(function () {
          _showUploadButton();
        });
        _uploadButton.mouseover(function () {
          _showUploadButton();
        });
        _root.find("#thumbnail").mouseout(function () {
          _hideUploadButton();
        });
        _uploadButton.mouseout(function () {
          _hideUploadButton();
        });
      },
      _showUploadButton = function () {
        if (!_uploadButtonIsShown) {
          _uploadButton.show();
          _uploadButtonIsShown = true;
        }
      },
      _hideUploadButton = function () {
        if (_uploadButtonIsShown) {
          _uploadButton.hide();
          _uploadButtonIsShown = false;
        }
      },
      _initUploadBtn = function () {
        _uploader = WebUploader.create({
          swf: GlobalVar.contextPath + '/js／uploader/Uploader.swf',
          server: UPLOAD_URL,
          fileSingleSizeLimit: 5 * 1024 * 1024,
          pick: {
            id: _uploadButton,
            multiple: false
          },
          dnd: "#thumbnailContainer",
          accept: {
            title: 'JPG',
            extensions: 'jpg,jpeg',
            mimeTypes: 'image/jpg,image/jpeg'
          },
          auto: true,
          method: "POST",
          duplicate: true,
          disableGlobalDnd: false
        });
        _uploader.on('fileQueued', function (file) {
        });
        _uploader.on('uploadProgress', function (file, percentage) {
          /*var width = file._info.width;
          var height = file._info.height;
          var fileSize = file.size;
          if (width < 640 || height < 480) {
            layer.msg("请上传分辨率大于 640px * 480px 的JPG格式文件");
            _uploader.cancelFile(file);
            return;
          }*/
        });
        _uploader.on('uploadSuccess', function (file, response) {
          if (response.code == 0) {
            console.log("filename:" + response.data.fileName);
            _coverImage = response.data.fileName;
            _root.find("#coverImage").attr("src",
                PREVIEW_IMAGE + "?fileName=" + _coverImage);
          } else {
            layer.msg("上传图片失败");
          }

        });
        _uploader.on("error", function (type) {
          if (type == "Q_TYPE_DENIED") {
            /*layer.msg("请上传分辨率大于 640px * 480px 的JPG格式文件");*/
            layer.msg("请上传JPG格式的图片");
          } else if (type == "F_EXCEED_SIZE") {
            layer.msg("封面图大小不能超过5M");
          }
        });
      },
      _searchSupplier = function () {
        var searchText = _root.find("#searchInput").val();
        var status = $("#statusSelect").val();
        if (searchText == null) {
          layer.msg("请输入搜索内容");
          return;
        }
        wantong.frame.showPage(LIST_SUPPLIER_URL, {
          searchText: searchText,
          status: status
        });
      },
      _loadInfo = function () {
        var searchText = _root.find("#searchInput").val();
        console.log("searchText:" + searchText);
        _root.find("#searchSelect").val(searchText);
      };
  return {
    init: function (conf) {
      _init(conf);
    }
  }
})();

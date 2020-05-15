wantong.userManage = (function () {
  var CHANGE_USER_STATUS_URL = GlobalVar.contextPath
      + "/system/changeUserStatus.do",
      CREATE_USER_URL = GlobalVar.contextPath + "/system/createUser.do",
      VALIDATE_EMAIL_URL = GlobalVar.contextPath + "/system/validateEmail.do",
      TO_GRANTROLE_URL = GlobalVar.contextPath + "/grantRole/manager.do",
      GET_USERLIST_URL = GlobalVar.contextPath + "/system/toUserManager.do",
      _userForm = null,
      _root = null,
      _saveBtn = null,
      _closeBtn = null,
      _serachForm = null,
      _layerIndex = null,
      _conf = {},
      _init = function (conf) {
        $.extend(_conf, conf);
        _root = $("#userManager");
        _userForm = _root.find("#userForm");
        _saveBtn = _root.find("#saveBtn");
        _closeBtn = _root.find("#closeBtn");
        _serachForm = _root.find("#searchFrom");
        _serachForm.attr("action", GET_USERLIST_URL);
        _loadInfo();
        _initSearch();
        _changeUserStatus();
        _createUser();
        _toGrantRole();
        _createRoleBtnClick();
        _loadPageContent();
      },
      _loadInfo = function () {
        var searchText = _root.find("#searchInput").val();
        console.log("searchText:" + searchText);
        _root.find("#searchSelect").val(searchText);
      },
      _initSearch = function () {
        $('.form-control-chosen').chosen({
          allow_single_deselect: true,
          search_contains: true,
          width: '100%'
        });

        $("#searchSelect").on("change", function () {
          var email = $("#searchSelect option:selected").val();
          $("#searchInput").val(email);
          wantong.frame.showPage(GlobalVar.backPath,
              {currentPage: 1, searchText: email});
          /*wantong.frame.showPage(GET_USERLIST_URL, {
            currentPage: 1, searchText: email
          });*/
        })
      },
      _createRoleBtnClick = function () {
        var _createUserDialog = _root.find("#createUser");
        _root.find("#createRoleBtn").click(function () {
          $("#email").val('');
          layer.open({
            title: "创建新用户",
            type: 1,
            maxmin: false,
            resize: false,
            scrollbar: true,
            area: ['600px', '200px'],
            content: _createUserDialog,
            end: function () {
              var currentPage = _root.find("#currentPage").val();
              console.log("currentPage:" + currentPage);
              wantong.frame.showPage(GlobalVar.backPath,
                  {currentPage: currentPage});
              setTimeout(function () {
                layer.closeAll();
              }, 100);
            },
            cancel: function () {

            },
            success: function (layero) {
              var mask = $(".layui-layer-shade");
              mask.appendTo(layero.parent());
              //其中：layero是弹层的DOM对象
            }
          });
          _layerIndex = layer.index;
          _createUserDialog.find("#email").focus();
        });
      },
      _changeUserStatus = function () {
        _root.find(".btn-status").click(function () {
          var btn = $(this);
          layer.confirm('确定' + btn.html().trim() + '吗?', {btn: ['确定', '取消']},
              function () {
                btn.attr("disabled", "disabled");
                var btnSts = btn.parent().parent().find(".status");
                var status = btn.attr("status"),
                    id = btn.attr("tid");
                $.post(CHANGE_USER_STATUS_URL, {
                  status: status,
                  id: id
                }, function (data) {
                  if (data.code == 0) {
                    layer.msg('已' + btn.html().trim());
                    setTimeout(function () {
                      var currentPage = _root.find("#currentPage").val();
                      wantong.frame.showPage(GlobalVar.backPath,
                          {
                            currentPage: currentPage
                          });
                    }, 1000);
                  } else {
                    btn.removeAttr("disabled");
                  }
                });
              }, function () {

              });

        });
      },
      _createUser = function () {
        var _prompt = _root.find("#prompt");
        var emailNode = _root.find("input[name='email']");
        var partnerIdNode = _root.find("select[name='partnerId']");
        _saveBtn.click(function () {
          _saveBtn.attr("disabled", "disabled");
          var email = emailNode.val();
          if (email == "") {
            layer.msg("邮箱不能为空。");
            _saveBtn.removeAttr("disabled");
            return;
          }
          /*var reg = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+((.[a-zA-Z0-9_-]{2,3}){1,2})$/;
          if (!reg.test(email.toLowerCase())) {
            layer.msg("邮箱格式不正确。");
            _saveBtn.removeAttr("disabled");
            return;
          }*/
          if (email.length > 45) {
            layer.msg("邮箱长度不能大于45字符。");
            _saveBtn.removeAttr("disabled");
            return;
          }
          var option = {
            type: "post",
            url: CREATE_USER_URL,
            dataType: "json",
            beforeSubmit: function () {
              var flag = true;
              $.ajax({
                type: "post",
                url: VALIDATE_EMAIL_URL,
                async: false,
                data: {
                  email: email,
                  partnerId: partnerIdNode.val()
                },
                dataType: "json",
                success: function (data) {
                  if (data.code == 1) {
                    flag = false;
                    layer.msg(data.msg);
                    _saveBtn.removeAttr("disabled");
                    _prompt.html(data.msg);
                  }
                }
              });
              return flag;
            },
            success: function (data) {
              if (data.code == 0) {
                layer.msg("创建成功！");
                layer.close(_layerIndex);
              } else if (data.code == 1) {
                //layer.msg("创建失败，邮箱已存在！");
                layer.msg(data.msg);
                _saveBtn.removeAttr("disabled");
              } else {
                _prompt.html(data.msg);
                _saveBtn.removeAttr("disabled");
              }

            },
            error: function (data) {
              layer.msg("系统异常，创建用户失败");
            }
          };
          _userForm.ajaxSubmit(option);

        });
        _closeBtn.click(function () {
          layer.close(_layerIndex);
        });
      },
      _toGrantRole = function () {
        var grantRoleBtns = _root.find(".btn-grantRole");
        grantRoleBtns.on("click", function () {
          var thisBtn = $(this);
          $(this).blur();
          layer.open({
            title: "分配角色",
            type: 2,
            maxmin: false,
            area: ['700px', '500px'],
            content: TO_GRANTROLE_URL + "?id=" + thisBtn.attr("tid"),
            end: function () {
              var currentPage = _root.find("#currentPage").val();
              console.log("currentPage:" + currentPage);
              wantong.frame.showPage(GlobalVar.backPath,
                  {currentPage: currentPage});
              setTimeout(function () {
                layer.closeAll();
              }, 100);
            },
            success: function (layero) {
              var mask = $(".layui-layer-shade");
              mask.appendTo(layero.parent());
              //其中：layero是弹层的DOM对象
            }
          });
          _layerIndex = layer.index;
        });
      },
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
          var totalPage = parseInt($(this).attr("totalPage"));
          var page = parseInt(_root.find("#pageText").val());
          if (page > totalPage || isNaN(page) || page <= 0) {
            console.log("page:" + page);
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
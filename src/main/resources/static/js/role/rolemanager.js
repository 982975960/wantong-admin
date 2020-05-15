wantong.rolemanager = (function () {
  var CREATE_ROLE_URL = GlobalVar.contextPath + "/role/createrole.do",
      UPDATE_ROLE_URL = GlobalVar.contextPath + "/role/updateRole.do",
      TO_GRANTAUTH_URL = GlobalVar.contextPath + "/grantAuth/manager.do",
      GET_ROLELIST_URL = GlobalVar.contextPath + "/role/rolemanager.do",
      _root = null,
      _layerIndex = 0,
      _serachForm = null,
      _conf = {},
      _init = function (conf) {
        $.extend(_conf, conf);
        _root = $("#rolemanager");
        _serachForm = _root.find("#searchFrom");
        _serachForm.attr("action", GET_ROLELIST_URL);
        _createRoleBtn();
        _editRoleBtn();
        _updateRole();
        _toGrantAuthority();
        _initButton();
        _loadPageContent();
      },
      _initButton = function () {
        _root.find("#createRoleBtn").click(function () {
          var _createRoleDialog = _root.find("#createRole");
          layer.open({
            title: "创建新角色",
            type: 1,
            maxmin: false,
            resize: false,
            scrollbar: true,
            area: ['600px', '200px'],
            content: _createRoleDialog,
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
          _layerIndex = layer.index;
          _createRoleDialog.find("#describe").focus();
        });
      },
      _createRoleBtn = function () {
        var _saveBtn = _root.find("#saveBtn"),
            _closeBtn = _root.find("#closeBtn"),
            _createRoleForm = _root.find("#createRoleForm"),
            _describe = _root.find("#describe"),
            _createRoleSuccess = function (data) {
              if (data.code == 0) {
                layer.close(_layerIndex);
                layer.msg("创建成功!");
                /*setTimeout(function () {
                  wantong.frame.showPageGet(GlobalVar.backPath, GlobalVar.data);
                }, 1000);*/
              } else {
                layer.msg(data.msg);
                _undisabled(_saveBtn);
              }
            },
            _createRoleError = function (data) {
              layer.msg("error");
            };
        _saveBtn.on("click", function () {
          _disabled(_saveBtn);
          var describe = _describe.val().trim();
          if (describe == null || describe.length < 1) {
            layer.msg("角色名称不可为空");
            _undisabled(_saveBtn);
            return;
          }
          if (describe.length > 15) {
            layer.msg("角色名称不能大于15个字符");
            _undisabled(_saveBtn);
            return;
          }
          var option = {
            url: CREATE_ROLE_URL,
            type: "post",
            dataType: "json",
            success: _createRoleSuccess,
            error: _createRoleError
          }
          _createRoleForm.ajaxSubmit(option);
        });
        _closeBtn.click(function () {
          layer.close(_layerIndex);
        });
      },
      _disabled = function (btn) {
        btn.attr("disabled", "disabled");
      },
      _undisabled = function (btn) {
        btn.removeAttr("disabled");
      },
      _editRoleBtn = function () {
        var _btnEdits = _root.find(".btn-edit"),
            _editRole = _root.find("#editRole");
        var _id = _editRole.find("#id"),
            _partnerId = _editRole.find("#partnerId"),
            _name = _editRole.find("#name"),
            _status = _editRole.find("input[name='status']");
        _btnEdits.on("click", function () {
          layer.open({
            title: "修改角色",
            type: 1,
            maxmin: false,
            resize: false,
            scrollbar: true,
            area: ['600px', '200px'],
            content: _editRole,
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
          _layerIndex = layer.index;
          var _currentBtnEdit = $(this);
          _id.val(_currentBtnEdit.attr("tid"));
          _partnerId.val(_currentBtnEdit.attr("tpartnerId"));
          _name.val(_currentBtnEdit.attr("tname"));
          _status.each(function () {
            var _currentStatus = $(this);
            if (_currentStatus.val() == _currentBtnEdit.attr("tstatus")) {
              _currentStatus.attr("checked", "checked");
              return;
            }
          });
        });
},
      _updateRole = function () {
        var _editRoleForm = _root.find("#editRoleForm"),
            _editRole = _root.find("#editRole");
        var _name = _editRole.find("#name"),
            _saveBtn = _editRole.find("#saveBtn"),
            _closeBtn = _editRole.find("#closeBtn"),
            _updateRoleSuccess = function (data) {
              if (data.code == 0) {
                layer.close(_layerIndex);
                layer.msg("修改成功！");
                /*setTimeout(function () {
                  wantong.frame.showPageGet(GlobalVar.backPath, GlobalVar.data);
                }, 1000);*/
              } else {
                layer.msg(data.msg);
              }
            },
            updateRoleError = function (data) {
              layer.alert("error");
            };
        _saveBtn.on("click", function () {
          _disabled(_saveBtn);
          var name = _name.val();
          if (name == null || name.length < 1) {
            layer.msg("角色名称不可为空");
            _undisabled(_saveBtn);
            return;
          }
          var regu = "^[ ]+$";
          var re = new RegExp(regu);
          if (re.test(name)) {
            layer.msg("角色名称不可为空");
            return;
          }
          if (name.length > 15) {
            layer.msg("角色名称不能大于15个字符");
            _undisabled(_saveBtn);
            return;
          }
          var option = {
            url: UPDATE_ROLE_URL,
            dataType: "json",
            success: _updateRoleSuccess,
            error: updateRoleError
          };
          _editRoleForm.ajaxSubmit(option);
        });
        _closeBtn.click(function () {
          layer.close(_layerIndex);
        });
      },
      _toGrantAuthority = function () {
        var grantAuthBtns = _root.find(".btn-grantAuth");
        grantAuthBtns.on("click", function () {
          var thisBtn = $(this);
          thisBtn.blur();
          var name = thisBtn.attr("tname");
          $.get(TO_GRANTAUTH_URL + "?id=" + thisBtn.attr("tid"), {},
              function (data) {
                layer.open({
                  title: "分配权限-" + name,
                  type: 1,
                  maxmin: false,
                  area: ['970px', '600px'],
                  content: data,
                  end: function () {
                    var currentPage = _root.find("#currentPage").val();
                    console.log("currentPage:" + currentPage);
                    wantong.frame.showPage(GlobalVar.backPath,
                        {currentPage: currentPage});
                    layer.closeAll();
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
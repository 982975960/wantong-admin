wantong.authority = (function () {
  var CREATE_AUTHORITY_URL = GlobalVar.contextPath + "/auth/create.do",
      UPDATE_AUTHORITY_URL = GlobalVar.contextPath + "/auth/update.do",
      DELETE_AUTHORITY_URL = GlobalVar.contextPath + "/auth/delete.do",
      SEARCH_AUTHORITY_URL = GlobalVar.contextPath + "/auth/authmanager.do",
      _root = null,
      _serachForm = null,
      _conf = {},
      _init = function (conf) {
        $.extend(_conf, conf);
        _root = $("#authorityManager");
        _serachForm = _root.find("#serachForm");
        _serachForm.attr("action", SEARCH_AUTHORITY_URL);
        _createAuthority();
        _editAuthority();
        _updateAuthority();
        _deleteAuthority();
        _initButton();
        _loadPageContent();
      },
      _initButton=function(){
        var _createAuthority = _root.find("#createAuthority");
    _root.find("#createAuthBtn").click(function () {
      layer.open({
        title: "创建新权限",
        type: 1,
        maxmin: false,
        resize: false,
        scrollbar: true,
        area: ['500px', '400px'],
        content: _createAuthority,
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
      _createAuthority.find("#name").focus();
    });
      },
      _createAuthority = function () {
        var _createAuthority = _root.find("#createAuthority");
        var _name = _createAuthority.find("#name"),
            _url = _createAuthority.find("#url"),
            _describe = _createAuthority.find("#describe"),
            _saveBtn = _createAuthority.find("#saveBtn"),
            _closeBtn = _createAuthority.find("#closeBtn");
        _saveBtn.on("click", function () {
          _saveBtn.attr("disabled", "disabled");
          var name = _name.val(),
              url = _url.val(),
              describe = _describe.val();
          if (name == null || name.length < 1) {
            _saveBtn.removeAttr("disabled");
            layer.msg("权限名不能为空!", {icon: 2});
            return;
          }
          if (url == null || url.length < 1) {
            _saveBtn.removeAttr("disabled");
            layer.msg("权限路径不可为空!", {icon: 2});
            return;
          }
          if (describe == null || describe.length < 1) {
            _saveBtn.removeAttr("disabled");
            layer.msg("描述不可为空!", {icon: 2});
            return;
          }
          if(describe.length>15)
          {
            _saveBtn.removeAttr("disabled");
            layer.msg("权限名称不能大于15个字符!", {icon: 2});
            return;
          }
          var option = {
            url: CREATE_AUTHORITY_URL,
            dataType: "json",
            success: function (data) {
              if (data.code == 0) {
                layer.close(layer.index);
                layer.msg("添加成功!", {icon: 1});
                setTimeout(function () {
                  wantong.frame.showPageGet(GlobalVar.backPath, GlobalVar.data);
                }, 1000);
              }
              else {
                layer.msg(data.msg, {icon: 2});
                _saveBtn.attr("disabled", "disabled");
              }
            },
            error: function (data) {
              layer.msg("错误", {icon: 2});
              _saveBtn.attr("disabled", "disabled");
            }
          };
          _createAuthority.ajaxSubmit(option);
        });
        _closeBtn.click(function () {
          layer.close(layer.index);
        });
      },
      _editAuthority = function () {
        var _editBtns = _root.find(".btn-edit"),
            _editAuthority = _root.find("#editAuthority");
        var _id = _editAuthority.find("#id"),
            _name = _editAuthority.find("#name"),
            _url = _editAuthority.find("#url"),
            _fatherId = _editAuthority.find("#fatherId"),
            _fatherName = _editAuthority.find("#fatherName"),
            _describe = _editAuthority.find("#describe"),
            _status = _editAuthority.find("input[name='status']");

        _editBtns.on("click", function () {
          var thisBtn = $(this);
          _id.val(thisBtn.attr("tid"));
          _name.val(thisBtn.attr("tname"));
          _url.val(thisBtn.attr("turl"));
          _fatherId.val(thisBtn.attr("tfatherId"));
          _fatherName.val(thisBtn.attr("tfatherName"));
          _describe.val(thisBtn.attr("tdescribe"));
          _status.each(function () {
            var _currentStatus = $(this);
            if (_currentStatus.val() == thisBtn.attr("tstatus")) {
              _currentStatus.attr("checked", "checked");
              return;
            }
          });
        });
      },
      _updateAuthority = function () {
        var _editAuthority = _root.find("#editAuthority"),
            _editAuthorityForm = _root.find("#editAuthorityForm");
        var _name = _editAuthority.find("#name"),
            _url = _editAuthority.find("#url"),
            _describe = _editAuthority.find("#describe"),
            _saveBtn = _editAuthority.find("#saveBtn"),
            _closeBtn = _editAuthority.find("#closeBtn");
        _saveBtn.on("click", function () {
          _saveBtn.attr("disabled", "disabled");
          if (_name.val() == null || _name.length < 1) {
            _saveBtn.removeAttr("disabled");
            layer.msg("权限名不可为空!", {icon: 2});
            return;
          }
          if (_url.val() == null || _url.length < 1) {
            _saveBtn.removeAttr("disabled");
            layer.msg("权限路径不可为空!", {icon: 2});
            return;
          }
          if (_describe.val() == null || _describe.length < 1) {
            _saveBtn.removeAttr("disabled");
            layer.msg("描述不可为空!", {icon: 2});
            return;
          }
          var option = {
            url: UPDATE_AUTHORITY_URL,
            dataType: "json",
            success: function (data) {
              if (data.code == 1) {
                layer.close(layer.index);
                layer.msg("修改成功!", {icon: 1});
                setTimeout(function () {
                  wantong.frame.showPageGet(GlobalVar.backPath, GlobalVar.data);
                }, 1000);
              } else {
                layer.msg(data.msg, {icon: 2});
                _saveBtn.removeAttr("disabled");
              }
            },
            error: function (data) {
              layer.alert("error");
            }
          };
          _editAuthorityForm.ajaxSubmit(option);
        });
        _closeBtn.click(function () {
          layer.close(layer.index);
        });
      },
      _deleteAuthority = function () {
        var delBtns = _root.find(".btn-del");
        delBtns.on("click", function () {
          var btn = $(this);

          layer.confirm('删掉该权限和子权限,确定' + btn.html().trim() + '吗?',
              {btn: ['确定', '取消']}, function () {
                btn.attr("disabled", "disabled");
                var id = btn.attr("tid");
                $.ajax({
                  type: "get",
                  url: DELETE_AUTHORITY_URL,
                  data: {id: id},
                  dataType: "json",
                  success: function (data) {
                    if (data.code == 1) {
                      layer.msg("已删除！");
                      btn.parents("tr").remove();
                    } else {
                      layer.alert(data.msg);
                    }
                  },
                  error: function (data) {
                    layer.alert("error");
                  }
                });
              }, function () {

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
wantong.grantrole = (function () {
  var GRANTROLE_EXCUTE_URL = GlobalVar.contextPath + "/grantRole/excute.do";
  _root = null,
      _closeBtn = null,
      _saveBtn = null,
      _grantRoleFrom = null,
      _conf = {},
      _init = function (conf) {
        $.extend(_conf, conf);
        _root = $("#grantRole");
        _GrantRoleLoad();
      },
      _GrantRoleLoad = function () {
        _saveBtn = _root.find("#saveBtn");
        _closeBtn = _root.find("#closeBtn");
        _grantRoleFrom = _root.find("#grantRoleFrom");
        _closeBtn.on("click", function () {
          parent.layer.close(parent.layer.getFrameIndex(window.name));
        });
        _saveBtn.on("click", _grantFromSubmit);
      },
      _grantFromSubmit = function () {
        _lock(_saveBtn);
        var option = {
          url: GRANTROLE_EXCUTE_URL,
          dataType: "json",
          success: _grantRoleSuccess,
          error: _grantRoleError
        };
        _grantRoleFrom.ajaxSubmit(option);
      },
      _lock = function (btn) {
        btn.attr("disabled", "disabled");
      },
      _unlock = function (btn) {
        btn.removeAttr("disabled");
      },
        _grantRoleSuccess = function (data) {
        if (data.code == 0) {
          layer.msg("保存成功");
          setTimeout(function () {
            parent.layer.close(parent.layer.getFrameIndex(window.name));
          }, 500);
        }
        else {
          layer.msg(data.msg);
          _unlock(_saveBtn);
        }
      },
      _grantRoleError = function (data) {
        layer.alert("error");
      };

  return {
    init: function (conf) {
      _init(conf);
    }
  };
})();
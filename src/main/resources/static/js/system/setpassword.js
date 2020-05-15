var wantong = wantong || {};
wantong.setpassword = (function () {
  var _root = null,
      SET_PASSWORD_URL = GlobalVar.contextPath + "/system/setpassword.do",
      USER_LOGIN_URL = GlobalVar.contextPath + "/showLogin.do",
      _password = null,
      _cfpassword = null,
      _prompt = null,
      _saveBtn = null,
      _form = null,
      _alertMsg = null
  _conf = {},
      _init = function (conf) {
        $.extend(_conf, conf);
        _root = $("#setPassword");
        _password = _root.find("input[name='password']");
        _cfpassword = _root.find("input[name='cfpassword']");
        _saveBtn = _root.find("#saveBtn");
        _form = _root.find("#form");
        _setpassword();
      },
      _setpassword = function () {
        _saveBtn.click(function () {
          var password = _password.val(),
              cfpassword = _cfpassword.val();
          console.log("password:"+password);
          //密码基本验证
          if (password.length < 6) {
            layer.msg("密码长度不能低于6位");
            return;
          }
          if (password.length > 20) {
            layer.msg("密码长度不能大于20位");
            return;
          }
          if (password != cfpassword) {
            layer.msg("两次输入的密码不一致");
            return;
          }
          //密码正则校验
          var reg1 = /([a-zA-Z0-9!@#$%^&*()_?<>{}])/;
          var reg2 = /[a-zA-Z]/;
          var reg3 = /[0-9]/;
          if (!reg1.test(password)) {
            layer.msg("密码不能包含汉字和其它一些特殊字符");
            return false;
          }
          if (!reg2.test(password)) {
            layer.msg("密码必须包含字母");
            return false;
          }
          if (!reg3.test(password)) {
            layer.msg("密码必须包含数字");
            return false;
          }

          var option = {
            type: "post",
            url: SET_PASSWORD_URL,
            dataType: "json",
            success: _success,
            error: _error
          };
          _form.ajaxSubmit(option);
        });

      },
      _success = function (data) {
        if (data.code == 0) {
          layer.msg("激活成功！");
          setTimeout(function () {
            window.location.href = USER_LOGIN_URL;
          }, 1500);
        } else {
          layer.msg(data.msg);
        }
      },
      _error = function (data) {
        layer.msg("error");
      };

  return {
    init: function (conf) {
      _init(conf);
    }
  }
})();
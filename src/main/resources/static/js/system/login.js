var tis = tis || {};
tis.login = (function () {

  var
      LOGIN_URL = GlobalVar.contextPath + "/login.do",
      DASHBOARD_URL = GlobalVar.contextPath + "/main.do",
      FORGET_PASSWORD_URL = GlobalVar.contextPath + "/system/forgetpasword.do",
      USER_LOGIN_URL = GlobalVar.contextPath + "/showLogin.do",
      CHECK_ADMIN_PROTOCOL_STATE = GlobalVar.contextPath+"/checkProtocolState.do",
      CHANGE_ADMIN_PROTOCOL_STATE = GlobalVar.contextPath + "/changeProtocolState.do",
      _protocolLayerIndex = null,
      _conf = {},
      _init = function (conf) {

        _loginListener();
        // 登陆超时的时候会返回登陆页面，包含此js文件，需判断上层是否还有父窗口，有的话直接重新定向URL到登录页。
        // 避免登录页出现在小窗口里面
        if (document.getElementById("topMenu")) {
          window.location.href = USER_LOGIN_URL;
          return;
        }

        $("#signinButton").click(function () {
          var email = $("#email").val();
          var password = $("#password").val();
          if (email == "" || password == "") {  //输入不能为空
            _showError("账号或者密码不能为空!");
            return false;
          }
          /*var reg = new RegExp(
              "^[a-z0-9]+([._\\-]*[a-z0-9])*@([a-z0-9]+[-a-z0-9]*[a-z0-9]+.){1,63}[a-z0-9]+$"); //邮箱正则表达式
          if (!reg.test(email.toLowerCase())) { //正则验证不通过，格式不对
            _showError("请填写正确的邮箱账号格式!");
            return false;
          }*/
          _checkProtocol(email,password);

        });
        _forgetpassword();
      },

      _login = function(email,password){
        $.post(LOGIN_URL, {
          "email": email,
          "password": password
        }, function (data) {
          if (data.code == 0) {
            $.cookie("isbnIp",null);
            location.href = DASHBOARD_URL;
          } else {
            _showError(data.msg);
          }
        });
      },
      //检测用户是否同意协议
      _checkProtocol = function(email,password){
          $.post(CHECK_ADMIN_PROTOCOL_STATE,{
            "email": email,
            "password": password
          },function (data) {
            if(data.code == 0){
              if(data.data.state == 0){
              //  显示协议
                _showProtocol(email,password,data.data.id);
              }else {
              //  直接登录
                _login(email,password);
              }
            }else {
              _showError(data.msg);
            }
          });
      },
      _showProtocol = function(email,password,id){
        var content = $("#ptotocol_content").html();
        _protocolLayerIndex = layer.open({
          title:"玩瞳科技慧读平台用户协议",
          area:['780px','680px'],
          scrollbar:true,
          btn:['取消','同意'],
          content:content,
          yes:function(index,layero){
            //关闭
            layer.close(_protocolLayerIndex);

          },btn2:function(index,layero){
            layer.close(_protocolLayerIndex);
            _changeProtocolState(id,_login(email,password));
          },
          success:function (layero) {
            layero.find(".layui-layer-btn").css("text-align","center");
            layero.find(".layui-layer-title").css("background-color"," #f5f5f5");
            layero.find(".layui-layer-btn0").css("background-color","#fff");
            layero.find(".layui-layer-btn0").css("color","#333");
            layero.find(".layui-layer-btn0").css("border","1px solid #dedede");
            layero.find(".layui-layer-btn1").css("background-color","#ea3434");
          },end:function () {
            
          }
        })
      },
      _changeProtocolState = function(id,callBack){
        $.post(CHANGE_ADMIN_PROTOCOL_STATE,{
          id:id
        },function (data) {
          if(data.code == 0){
            if(callBack != null){
              callBack();
            }
          }
        });
      },
      _loginListener=function () {
          $("body").keydown(function (event) {
            if(event.keyCode==13) {
              var email = $("#email").val();
              var password = $("#password").val();
              if (email == "" || password == "") {  //输入不能为空
                _showError("账号或者密码不能为空!");
                return false;
              }
              /*var reg = new RegExp(
                  "^[a-z0-9]+([._\\-]*[a-z0-9])*@([a-z0-9]+[-a-z0-9]*[a-z0-9]+.){1,63}[a-z0-9]+$"); //邮箱正则表达式
              if (!reg.test(email.toLowerCase())) { //正则验证不通过，格式不对
                _showError("请填写正确的邮箱账号格式!");
                return false;
              }*/
              // $.post(LOGIN_URL, {
              //   "email": email,
              //   "password": password
              // }, function (data) {
              //   if (data.code == 0) {
              //     $.cookie("isbnIp",null);
              //     location.href = DASHBOARD_URL;
              //   } else {
              //     _showError(data.msg);
              //   }
              // });
              _checkProtocol(email,password);
            }
          });
      },
      _showError = function (error) {
        $("#prompt").html(error);
      },
      _forgetpassword = function () {
        var forgetpassword = $("#forgetpassword");
        forgetpassword.click(function () {
          var email = $("#email").val();
          if (email == "") {
            _showError("请先输入需要找回密码的邮箱账号!");
            return;
          }
          /*var reg = new RegExp(
              "^[a-z0-9]+([._\\-]*[a-z0-9])*@([a-z0-9]+[-a-z0-9]*[a-z0-9]+.){1,63}[a-z0-9]+$"); //邮箱正则表达式
          if (!reg.test(email.toLowerCase())) {
            _showError("邮箱格式不正确,请检查!");
            return;
          }*/
          forgetpassword.hide();
          $.ajax({
            type: "post",
            url: FORGET_PASSWORD_URL,
            data: {"email": email},
            dataType: "json",

            success: function (data) {
              if (data.code == 0) {
                forgetpassword.show();
              }
              if (data.msg != undefined && data.msg != '') {
                _showError("发送成功");
              }
            },
            error: function (data) {
              forgetpassword.show();
              _showError("错误:" + data.msg);
            }
          });
          _showError("正在向您的邮箱发送密码重置链接，请稍候...");
        });
      };

  return {
    init: function (conf) {
      _init(conf);
    }
  };

})();

var wantong = {};
wantong.frame = (function () {
  var
      _bodyDiv = null,
      AUTH_TIP_PATH = "/app/authorizedQuantity.do",
      _currntModule = {
        name: null,
        url: null,
        postData: null
      },
      _currentMenu = {
        name: null,
        url: null,
        postData: null
      },
      _currentBodyDiv = null,
      _init = function () {
        _bodyDiv = $("#moduleBodyDiv");
        _initTopMenu();
        $('.list-title').click();
        _initAssisCenter();
        _initAuthTip();
        _event();
      },
      _event = function(){
        $("body").on("contextmenu","img",function(e) {
           return false;
        });
      },
      _initAssisCenter = function () {
        $(".assis-nav li").has("ul").mouseover(function () {
          $(this).children("a").children('.nav-more').addClass('nav-mored');
          $(this).children("ul").css("display", "block");
        }).mouseout(function () {
          $(this).children("a").children('.nav-more').removeClass('nav-mored');
          $(this).children("ul").css("display", "none");
        });
      },
      _initTopMenu = function () {
        $(".main-w-nav").delegate(".direct-menu", "click", function () {
          $(this).parents("ul").children("li").removeClass("active");
          $(this).parent("li").addClass("active");
          var url = $(this).attr("url");
          var moduleName = $(this).attr("name");
          _switchModule(moduleName, url);
          $(this).attr('url', _removeURLParameter($(this).attr('url')));
        });
        $(".topMenuItem:first").click();
      },
      _removeURLParameter = function (url) {
        var urlparts = url.split('?');
        if (urlparts.length >= 2) {
          return urlparts[0];
        }
        return url;
      },
      _switchModule = function (moduleName, url) {
        _currntModule.name = moduleName;
        _currntModule.url = url;
        var loginOutUrl = "/system/loginOut.do";
        GlobalVar.backPath = url;
        GlobalVar.data = {};
        if (url.length > loginOutUrl.length) {
          if (url.substring(url.length - loginOutUrl.length) == loginOutUrl) {
            window.location.href = url;
            return;
          }
        }
        $.get(url, function (data) {
          _bodyDiv.html(data);
          _currentBodyDiv = _bodyDiv;
          _initForModule(_bodyDiv);
        });
      },
      _initForModule = function (bodyDiv) {
        bodyDiv.find("#menu").delegate(".menuItem", "click", function () {
          var url = $(this).attr("url");
          var menuName = $(this).attr("name");
          GlobalVar.backPath = url;
          GlobalVar.data = {};
          _switchMenu(menuName, url);
        });
        bodyDiv.find(".menuItem:first").click();
      },
      _switchMenu = function (menuName, url) {
        if (url === undefined) {
          url = $("#menu > li > a[name='" + menuName + "']").attr("url");
        }

        if (url === undefined) {
          return;
        }

        _currentMenu.name = menuName;
        _currentMenu.url = url;
        $("#menu > li").removeClass("active");
        $("#menu > li > a[name='" + menuName + "']").parent().addClass(
            "active");
        _showPage(url);
      },
      _showPage = function (url, postData) {
        _currentMenu.url = url;
        _currentMenu.postData = postData;
        if (postData !== undefined) {
          $.post(url, postData, function (data) {
            $("#bodyDiv").html(data);
            $("#moduleBodyDiv").html(data);
          });
        } else {
          $.get(url, function (data) {
            $("#bodyDiv").html(data);
            $("#moduleBodyDiv").html(data);

          });
        }

      },
      _showPageGet = function (url, getData) {
        _currentMenu.url = url;
        _currentMenu.postData = getData;
        $.get(url, function (data) {
          $("#bodyDiv").html(data);
          $("#moduleBodyDiv").html(data);
        });
      },
      _refreshPage = function () {
        if (_currentMenu.postData !== undefined) {
          $.post(_currentMenu.url, _currentMenu.postData, function (data) {
            $("#bodyDiv").html(data);
            $("#moduleBodyDiv").html(data);
          });
        } else {
          $.get(_currentMenu.url, function (data) {
            $("#bodyDiv").html(data);
            $("#moduleBodyDiv").html(data);
          });
        }
      },
      _initAuthTip = function () {
        $.post(AUTH_TIP_PATH, {
          "flag": true
        }, function (data) {
          if (data.code == 0) {
            if (data.data.flag) {
              layer.confirm('您的授权数量不足500，为了不影响您正常业务发展，请尽快联系玩瞳商务。', {
                btn: ['不再提醒', '关闭'] //按钮
              }, function (index) {
                layer.close(index);
                $.post(AUTH_TIP_PATH, {
                  "flag": false
                }, function (data) {

                });
              }, function (index) {
                layer.close(index);
              });
            }
          } else {

          }
        });
      };
  return {
    init: function () {
      _init();
    },
    switchModule: function (moduleName, url) {
      _switchModule(moduleName, url);
    },
    switchMenu: function (menuName) {
      _switchMenu(menuName);
    },
    showPage: function (url, postData) {
      _showPage(url, postData);
    },
    refreshPage: function () {
      _refreshPage();
    },
    showPageGet: function (url, getData) {
      _showPageGet(url, getData);
    }

  };
})();

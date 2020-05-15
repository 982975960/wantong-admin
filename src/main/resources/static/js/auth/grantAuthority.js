wantong.grantAuthority = (function () {
  var GRANTAUTH_EXCUTE_URL = GlobalVar.contextPath + "/grantAuth/excute.do";
  _root = null,
      _closeBtn = null,
      _saveBtn = null,
      _grantAuthFrom = null,
      _authIds = null,
      _index = null,
      _conf = {},
      _init = function (conf) {
        $.extend(_conf, conf);
        _root = $("#grantAuth");
        _GrantAuthLoad();
        _handleAuthoritySelector();
        _showAndHide();
        _showInitialLevel();
        _index = layer.index;
      },
      _GrantAuthLoad = function () {
        _saveBtn = _root.find("#saveBtn");
        _closeBtn = _root.find("#closeBtn");
        _grantAuthFrom = _root.find("#grantAuthFrom");
        _authIds = _root.find("input[class='authIds']");
        _closeBtn.on("click", function () {
          //parent.layer.close(parent.layer.getFrameIndex(window.name));
          layer.close(_index);
        });
        _saveBtn.on("click", _grantFromSubmit);
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
                ".panel").find(".panel-heading").find("input[type=checkbox]");
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
            var topLevel = _root.find(".topLevel_" + topId).find(".panel").find(
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
      _grantFromSubmit = function () {
        var _allAuthoritiesCheckBox = _root.find("input[type=checkbox]");
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
        _lock(_saveBtn);
        var requestData = {
          roleId: _root.find("input[name='roleId']").val(),
          authList: authJson
        };
        $.ajax({
          type: "post",
          url: GRANTAUTH_EXCUTE_URL,
          dataType: "json",
          data: requestData,
          success: _grantAuthSuccess,
          error: _grantAuthError
        });
      },
      _lock = function (btn) {
        btn.attr("disabled", "disabled");
      },
      _unlock = function (btn) {
        btn.removeAttr("disabled");
      },
      _grantAuthSuccess = function (data) {
        if (data.code == 0) {
          layer.msg("授权成功！");
          setTimeout(function () {
            _closeBtn.click();
          }, 1000);
        }
        else {
          layer.msg(data.msg);
          _unlock(_saveBtn);
        }
      },
      _grantAuthError = function (data) {
        layer.msg("error");
        _unlock(_saveBtn);
      };
  _showInitialLevel = function () {
    var top = _root.find(".top").find("input");
    var second = _root.find(".second").find("input");
    var third = _root.find(".third").find("input");
    var noneTop = true;
    for (var i = 0; i < top.length; i++) {
      if (top[i].checked) {
        noneTop = false;
        if ($(top[i]).attr("order") == 1) {
          var secondLevel = _root.find(".secondLevel_" + top[i].value);
          secondLevel.css("display", "inline");
        } else if ($(top[i]).attr("order") == 2) {
          var thirdLevel = _root.find(
              ".thirdLevel_" + $(top[i]).attr("secondid"));
          thirdLevel.css("display", "inline");
        }

      }
    }
    /*var  noneThird=true;
    debugger;
    for (var i=0;i<third.length;i++){
      if (third[i].checked){
        noneThird=false;
        var thirdLevel=_root.find(".thirdLevel_"+$(third[i]).attr("secondid"));
        thirdLevel.css("display","inline");
      }
    }
    if (noneTop){
      var secondLevel=_root.find(".secondLevel_"+top[0].value);
      secondLevel.css("display","inline");
    }*
    if (noneThird){
      _root.find(".third").css("overflow-y","hidden");
    }*/

  }

  return {
    init: function (conf) {
      _init(conf);
    }
  }
})();
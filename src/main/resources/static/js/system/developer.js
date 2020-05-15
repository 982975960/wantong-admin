wantong.developer = (function () {
      var CREATE_DEVEPOLER_URL = GlobalVar.contextPath
          + "/system/createDeveloper.do",
          _conf = {},
          _index = 0,
          _init = function (conf) {
            $.extend(_conf, conf);
            _root = $("#developerManager");
            _initButton();
          },
          _initButton = function () {
            _root.find("#toBeBtn").click(function () {
              _createDeveloper(0);
              _root.find("#resetDiv").css("display", "inline");
            });
            _root.find("#resetBtn").click(function () {
              var _tipDiv = _root.find("#tipDiv");
              layer.open({
                title: "温馨提示",
                type: 1,
                maxmin: false,
                resize: false,
                area: ['580px', '262px'],
                scrollbar: true,
                content: _tipDiv,
                end: function () {

                },
                cancel: function () {
                },
                success: function (layero) {
                  var mask = $(".layui-layer-shade");
                  mask.appendTo(layero.parent());
                  //其中：layero是弹层的DOM对象
                  _index = layer.index;
                }
              });
            });
            _root.find("#closeBtn").click(function () {
              layer.close(_index);
            });
            _root.find("#saveBtn").click(function () {
              _createDeveloper(1);
            });
          },
          _createDeveloper = function (type) {
            var _appkey = _root.find("#appkey");
            var _appsecret = _root.find("#appsecret");
            var _toBeBtn = _root.find("#toBeBtn");
            $.ajax({
              type: "post",
              dataType: "json",
              url: CREATE_DEVEPOLER_URL,
              async: false,
              success: function (data) {
                if (data.code == 0) {
                  _appkey.val(data.data.appkey || "");
                  _appsecret.val(data.data.appsecret || "");
                }
                if (type == 1) {
                  layer.msg("重置成功");
                  layer.close(_index);
                } else {
                  _toBeBtn.attr("disabled", "disabled");
                  _toBeBtn.css("background-color", "#CCCCCC");
                }
              },
              error: function () {

              }
            });
          };
      return {
        init: function (conf) {
          _init(conf);
        }
      }
    }
)
();
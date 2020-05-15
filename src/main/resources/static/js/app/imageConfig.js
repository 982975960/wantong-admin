wantong.imageConfig = (function () {
      var LOAD_IMAGE_CONFIG_PARAM = GlobalVar.contextPath
          + "/image/loadImageConfigParam.do",
          SAVE_IMAGE_CONFIG_PARAM = GlobalVar.contextPath
              + "/image/saveImageConfigParam.do",
          _index = 0,
          _conf = {},
          _init = function (conf) {
            $.extend(_conf, conf);
            _root = $("#imageConfigManager");
            _initButton();
          },
          _initButton = function () {
            _root.find(".btn-edit").click(function () {
              var thisbtn = $(this);
              var deviceId = thisbtn.attr("tid");
              var name = thisbtn.attr("tname");
              var note = thisbtn.attr("tnote");
              thisbtn.blur();
              $.post(LOAD_IMAGE_CONFIG_PARAM, {
                deviceId: deviceId,
                name: name,
                note: note
              }, function (data) {
                if (data.code == 0) {
                  var _editImageConfig = _root.find(
                      "#editImageConfig");
                  layer.open({
                    title: "修改图像类型参数",
                    type: 1,
                    maxmin: false,
                    resize: false,
                    area: ['1000px', '700px'],
                    scrollbar: true,
                    content: _editImageConfig,
                    end: function () {
                      layer.closeAll();
                      wantong.frame.showPage(GlobalVar.backPath);
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
                  _loadImageConfigParam(data.data);
                }
              });
            });

          },
          _loadImageConfigParam = function (data) {
            var _editContainer = _root.find("#editImageConfig");
            var _name = _editContainer.find("#name");
            var _param = _editContainer.find("#configParam");
            var _note = _editContainer.find("#note");
            var _deviceId = data.deviceId;
            _name.val(data.name || "");
            _param.val(data.configParam || "");
            _note.val(data.note || "");
            _editContainer.find("#saveBtn").click(function () {
              _saveImageConfigParam(_deviceId);
            });
            _editContainer.find("#closeBtn").click(function () {
              layer.close(_index);
            });
          },
          _saveImageConfigParam = function (deviceId) {
            var _editContainer = _root.find("#editImageConfig");
            var name = _editContainer.find("#name").val();
            var param = _editContainer.find("#configParam").val();
            var note = _editContainer.find("#note").val();
            var _saveBtn = _editContainer.find("#saveBtn");
            _saveBtn.attr("disabled", "disabled");
            $.post(SAVE_IMAGE_CONFIG_PARAM, {
              deviceId: deviceId,
              name: name,
              param: param,
              note: note
            }, function (data) {
              if (data.code == 0) {
                layer.msg("保存成功");
                layer.close(_index);
                _saveBtn.removeAttr("disabled");
              } else {
                layer.msg("保存失败：" + data.msg);
                _saveBtn.removeAttr("disabled");
              }
            });
          }
      ;
      return {
        init: function (conf) {
          _init(conf);
        }
      }
    }
)
();
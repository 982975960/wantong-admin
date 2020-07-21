wantong.bindDeviceIdRecord = (function () {
  var
      SHOW_DEVICEID_LIST_URL = GlobalVar.contextPath + "/app/showDeivceIdList.do",
      SHOW_LEAD_DEVICE = "/app/showLeadDevice.do",
      _root = null,
      _index = 0,
      _conf = {},
      _init = function (conf) {
        $.extend(_conf, conf);
        _root = $("#bindDeviceIdRecordDiv");
        _initButton();
        _index = layer.index;
      },
      _initButton = function () {
        _root.delegate(".show-device-btn", "click", function () {
          var thisBtn = $(this);
          var _recordId = thisBtn.attr("recordId");
          $.get(SHOW_DEVICEID_LIST_URL + "?recordId=" + _recordId, {},
              function (data) {
                layer.open({
                  title: "查看导入设备ID",
                  type: 1,
                  maxmin: false,
                  area: ['800px', '600px'],
                  content: data,
                  end: function () {

                  },
                  cancel: function () {

                  },
                  error: function () {

                  }
                });
              });
        });
        _root.delegate(".add-device-btn", "click", function () {
          var thisBtn = $(this);
          var _recordId = thisBtn.attr("recordId");
          var _appId = thisBtn.attr("appId");
          console.log("_recordId:"+_recordId);
          console.log("_appId:"+_appId);
          $.get(SHOW_LEAD_DEVICE,{appId: _appId,recordId: _recordId},
              function(data) {
                content = data;
              }).always(function(){
            _showDialog("导入设备ID", '600px', '350px', content);
          });
        });
      },
      _showDialog = function (title, width, height, dialog, recall) {
        layer.open({
          title: title,
          type: 1,
          maxmin: false,
          resize: false,
          area: [width, height],
          scrollbar: true,
          content: dialog,
          end: function () {
          },
          cancel: function () {
          },
          success: function (layero) {
            var mask = $(".layui-layer-shade");
            mask.appendTo(layero.parent());
            //其中：layero是弹层的DOM对象
            if (recall) recall();
          }
        });
        _index = layer.index;
      };

  return {
    init: function (conf) {
      _init(conf);
    }
  };

})();

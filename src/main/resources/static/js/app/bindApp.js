wantong.bindApp = (function () {
  var
      GET_PARTNER_APP_URL = GlobalVar.contextPath
          + "/app/getPartnerApp.do",
      BIND_APP_URL = GlobalVar.contextPath + "/app/bindApp.do",
      _allApps = null,
      _layerIndex = 0,
      _conf = {},
      _init = function (conf) {
        $.extend(_conf, conf);
        _root = $("#bindCustomerAppDialog");
        _layerIndex = layer.index;
        _initBtn();
      },
      _initBtn = function () {
        _allApps = _conf.allApps;
        _root.find("#partnerSelect1").change(function () {
          var partnerId = $("#partnerSelect1").val();
          if (partnerId == -1) {
            document.getElementById("appSelect").options.length = 0;
            document.getElementById("appSelect").options.add(
                new Option("请选择", -1));
            return;
          }
          $.ajax({
            type: "post",
            url: GET_PARTNER_APP_URL,
            data: {
              partnerId: partnerId
            },
            dataType: "json",
            async: true,
            success: function (data) {
              if (data.code == 0) {
                document.getElementById("appSelect").options.length = 0;
                for (var i = 0; i < data.data.length; i++) {
                  document.getElementById("appSelect").options.add(
                      new Option(data.data[i].name,
                          data.data[i].id));
                }
                $("#appSelect").removeAttr("disabled");
              } else {
                document.getElementById("appSelect").options.length = 0;
                document.getElementById("appSelect").options.add(
                    new Option("请选择", -1));
              }
            },
            error: function (data) {

            }
          });
        });
        _root.find("#bindBtn").click(function () {
          var appId = $("#appSelect").val();
          var recordId = $(this).attr("recordId");
          console.log("appId:" + appId);
          if (appId <= 0) {
            layer.msg("请先选择合作商,再选择合作商应用");
            return;
          }
          $.ajax({
            type: "post",
            url: BIND_APP_URL,
            data: {
              appId: appId,
              recordId: recordId
            },
            dataType: "json",
            async: true,
            success: function (data) {
              if (data.code == 0) {
                layer.msg("绑定成功");
                wantong.viewAuthQrCodeRecord.removeFirstOption(recordId);
                layer.close(_layerIndex);

              } else {
                layer.msg(data.msg);
              }
            },
            error: function (data) {

            }
          });
        });
        _root.find("#closeButton").click(function () {
          layer.close(_layerIndex);
        });
      }
  ;

  return {
    init: function (conf) {
      _init(conf);
    }
  };

})();

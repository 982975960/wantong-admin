wantong.viewAuthQrCodeRecord = (function () {
  var
      PREPARE_AUTHORIZATION_CODE = GlobalVar.contextPath
          + "/app/prepareAuthorizationCode.do",
      CHECK_AUTHORIZATION_CODE = GlobalVar.contextPath
          + "/app/checkAuthorizationCode.do",
      DOWNLOAD_AUTHORIZATION_CODE = GlobalVar.contextPath
          + "/app/downloadAuthorizationCode.do",
      GET_PARTNER_URL = GlobalVar.contextPath + "/app/getPartner.do",
      _root = null,
      _filePath = null,
      _index = 0,
      _conf = {},
      _init = function (conf) {
        $.extend(_conf, conf);
        _root = $("#authorizationCodeRecord");
        _initDownloadAuthorizationQRCode();
        _downloadRecordClick();
        _bindCustomerAppClick();
        _index = layer.index;
      },
      _initDownloadAuthorizationQRCode = function () {
        _root.delegate(".download-new-qrcode", "click", function () {
          var startWait = false;
          var thisBtn = $(this);
          var fileName = thisBtn.attr("fileName");
          var appId = thisBtn.attr("appId");
          $(this).attr("disabled", true);
          $.ajax({
            type: "post",
            url: PREPARE_AUTHORIZATION_CODE,
            data: {
              appId: appId,
              fileName: fileName
            },
            dataType: "json",
            async: false,
            success: function (data) {
              if (data.code == 0) {
                _filePath = data.data.fileName;
                startWait = true;
              }
            },
            error: function (data) {
            }
          });
          if (startWait) {
            var int = setInterval(function () {
              $.ajax({
                type: "post",
                url: CHECK_AUTHORIZATION_CODE,
                data: {appId: appId, filePath: _filePath},
                dataType: "json",
                async: true,
                success: function (data) {
                  if (data.code == 0) {
                    //检测到文件可以下载
                    clearInterval(int);
                    window.open(DOWNLOAD_AUTHORIZATION_CODE + "?appId=" + appId
                        + "&filePath=" + _filePath);
                    layer.close(_index);
                    setTimeout(function () {
                      wantong.frame.refreshPage();
                    }, 500);
                  } else if (data.code == 1) {
                    //未检测到文件
                  }
                },
                error: function (data) {
                }
              });
            }, 1000);
          }
        });
      },
      _downloadRecordClick = function () {
        _root.delegate(".Download-Record-Btn", "click", function () {
          $(this).attr("disabled", true);
          var thisBtn = $(this);
          var fileName = thisBtn.attr("fileName");
          var appId = thisBtn.attr("appId");
          window.open(
              DOWNLOAD_AUTHORIZATION_CODE + "?appId=" + appId + "&filePath="
              + fileName);
          layer.close(_index);
        })
      },
      _bindCustomerAppClick = function () {
        _root.delegate(".Bind-Customer-App-Btn", "click", function () {
          var thisBtn = $(this);
          var _recordId = thisBtn.attr("recordId");
          $.get(GET_PARTNER_URL + "?recordId=" + _recordId, {},
              function (data) {
                layer.open({
                  title: "绑定应用",
                  type: 1,
                  maxmin: false,
                  area: ['600px', '300px'],
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
      }, _removeFirstOption = function (recordId) {
        var tab = document.getElementById("downloadQrCodeTable");
        var deleteIndex = 0;
        var record = "recordId:" + recordId;
        for (var i = 0; i < tab.rows.length; i++) {
          for (var j = 0; j < tab.rows[i].cells.length; j++) {
            var _recordId = tab.rows[i].cells[j].innerText;
            if (_recordId == record) {
              deleteIndex = i;
              break;
            }
          }
        }
        tab.deleteRow(deleteIndex);
      }
  ;

  return {
    init: function (conf) {
      _init(conf);
    },
    removeFirstOption: function (recordId) {
      _removeFirstOption(recordId);
    }
  };

})();

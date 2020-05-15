wantong.cardFingerBook = (function () {
  var _root = null,
      _conf = {},
      FINGER_POSITION_URL = GlobalVar.contextPath
          + "/card/saveFingerPosition.do",
      _position = '{"x":1,"y":1,"w":1,"h":1}',
      _index = 0,
      _init = function (conf) {
        $.extend(_conf, conf);
        _root = $("#fingerBookDiv");
        _index = layer.index;
        _loadImageData();
        _loadButton();
      },
      _loadImageData = function () {
        console.log("imageId:" + _conf.sampleImageId);
        wantong.cardFingerAdd.init(_conf);
        //var fingerImg = document.getElementById("fingerImage");
        //fingerImg.src = "/cms/perspectiveImg.do?" + "bookId=" + _conf.bookId + "&imageId=" + _conf.imageId + "&modelId=" + _conf.modelId;
      },
      _loadButton = function () {
        _root.find("#saveBtn").click(function () {
          var layers = wantong.cardFingerAdd.getData();
          if (!layers || layers.length == 0) {
            layer.msg("请先按住鼠标左键拖拉标定区域后保存。");
            return;
          }
          _position = layers[0];
          console.log("_conf.imageId:"+_conf.imageId);
          $.ajax({
            url: FINGER_POSITION_URL,
            type: "GET",
            contentType: "application/json",
            data: {
              imageId: _conf.imageId,
              position: JSON.stringify(_position)
            },
            dataType: 'json',
            success: function (data) {
              if (data.code == 0) {
                layer.msg("保存成功");
                layer.close(_index);
              }
            }
          });
        });
        $('body',document).on('keyup', function (e) {
          if (e.which === 27) {
             layer.close(_index);
             }
        });

      }
  ;
  return {
    init: function (conf) {
      _init(conf);
    }
  }
})();
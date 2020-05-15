wantong.operating = (function () {
  var _conf = {},
      _root = null,
      _currentTab = null,
      _init = function (conf) {
        $.extend(_conf,conf);
        _root = $("#operating_config_manager");
        _root.appOperatingPanel = $("#app_config");
        _initTab();
      },
      _initTab = function () {
        _root.find("#listTab").find("li").click(function () {
          $(this).siblings("li").removeClass("active");
          $(this).addClass("active");
          var index = parseInt($(this).attr("index"));
          _hideAllTab();
          if(index == 0){
            _root.appOperatingPanel.show();
            _currentTab = _root.appOperatingPanel;

            wantong.operating.appConfig.init({
              currentTab:_currentTab
            })
            //设置导航栏标题
            $('#curContentTab').html($('#listTab .active a').html());
          }
        });
        _root.find("#listTab li[index='0']").click();
      },
      // 影藏界面
      _hideAllTab = function () {
        _root.appOperatingPanel.hide();
      };

      return {
        init:function (conf) {
          _init(conf);
        }
      }
})();
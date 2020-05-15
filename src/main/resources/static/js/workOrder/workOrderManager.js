wantong.workOrderManager = (function () {
  var _conf = {},
      _root = null,
      _currentTab = null,
      _init = function (conf) {
        $.extend(_conf, conf);
        _root = $("#workOrderManager");
        _root.workOrderList = $("#workOrderListManager");
        _root.bookProgressList = $("#bookProgressListManager");
        _root.addWorkOrderBookList = $("#addWorkOrderBookListManageer");

        _root.tabHead = $("#tab_head");
        _root.callbackHead = $("#callbackWorkOrder");

        var partnerId = _conf.partnerId;
        _initTab(partnerId);

        _initCallbackWorkOrderBtnEvent();
        _initHelpTip();
      },
      _initHelpTip = function () {
        _root.find("#workOrderHelpImg").mouseover(function () {
          var that = this;
          layer.tips("该模块是贵公司向玩瞳提出制作书本需求的进度。玩瞳会为您的需求创建一个名称，您可以按名称查看本书的制作进度。",that,{
            tips: [2, '#3595CC'],
            time: 60000
          });
        }).mouseout(function () {
          $("div[type='tips']").remove();
        });
        _root.find("#progressHelpImg").mouseover(function () {
          var that = this;
          layer.tips("该模块显示的为玩瞳图像库所有书本图片制作进度，您可以根据书本的信息及书本状态，来制定资源制作计划。（图片已发布的书本可以被领取制作资源）。",that,{
            tips: [2, '#3595CC'],
            time: 60000
          });
        }).mouseout(function () {
          $("div[type='tips']").remove();
        });
      },
      _initTab = function (partnerId) {
        _root.find("#listTab").find("li").click(function () {
          $(this).siblings("li").removeClass("active");
          $(this).addClass("active");
          var index = parseInt($(this).attr("index"));
          _hideAllTab();
          _hideAllHead();
          if (index == 0) {
            //工单管理
            _root.workOrderList.show();
            _currentTab = _root.workOrderList;
            _root.tabHead.show();
            wantong.workOrderManager.workOrder.init({
              currentTab: _currentTab,
              modelId: $("#modelId").val(),
              partnerId: partnerId
            });
          } else if (index == 1) {
            console.log("2222222222222");
            //书本进度管理
            _root.bookProgressList.show();
            _root.tabHead.show();
            _currentTab = _root.bookProgressList;
            wantong.bookProgressManager.init({
              modelId:$("#modelId").val(),
              currentTab: _currentTab
            });
          }
          //设置导航栏标题
          if (partnerId == 1){
            $('#curContentTab').html($('#listTab .active a').html());
          }else {
            var text = $('#listTab .active a').text();
            if (text == '我的书本'){
              $('#tab_head').text("图书管理 / 做书进度 / " + text);
            }else {
              $('#tab_head').text("图书管理 / 做书进度 / 玩瞳图片进度");
            }
          }

        });
        _root.find("#listTab li[index='0']").click();
      },
      //声明点击返回工单管理的事件
      _initCallbackWorkOrderBtnEvent = function () {
        _root.find("#callbackWorkOrder").off("click").on("click", function () {
          _hideAllHead();
          //隐藏Tab
           _hideAllTab();
           //显示
           _root.workOrderList.show();
           //显示
           _root.tabHead.show();
        });
      },
      _workOrderBookListEvent = function(){
          _hideAllTab();
          _hideAllHead();
          _root.addWorkOrderBookList.show();
          _root.callbackHead.show();

      },
      _hideAllHead = function(){
        _root.tabHead.hide();
        _root.callbackHead.hide();
      },
      _hideAllTab = function () {
        _root.workOrderList.hide();
        _root.bookProgressList.hide();
        _root.addWorkOrderBookList.hide();
      };
  return {
    init: function (conf) {
      _init(conf);
    },
    workOrderBookListEvent: function () {
      _workOrderBookListEvent();
    }
  }
})();
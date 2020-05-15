wantong.partnerListPanel = (function () {

  var
      //VIEW_DETAIL_URL = GlobalVar.contextPath + "/app/viewpartnerdetail.do",
      SWITCH_PARTNER_URL = GlobalVar.contextPath + "/app/listpartners.do",
      _root = null,
      _conf = {},
      _init = function (conf) {
        $.extend(_conf, conf);
        _root = $("#partnersListPanel");
        _initUpdateEvent();
        _initPartnerList();
        _initCreateNewBtn();
      },
      _initUpdateEvent = function () {
        _root.find("#appListTable").delegate(".view-button", "click",
            function () {
              _doViewDetail($(this));
            });
      },
      _initPartnerList = function () {
        _root.find("#partnerList").delegate("a", "click", function (e) {
          e.stopPropagation();
          var partnerId = $(this).attr("partnerId");
          if (partnerId == "-1") {
            return;
          }
          wantong.frame.showPage(SWITCH_PARTNER_URL, {
            partnerId: partnerId
          });
        });
      },
      _initCreateNewBtn = function () {
        _root.find("#createNewBtn").click(function () {
          _doViewDetail($(this));
        });
      },
      _doViewDetail = function (viewBtn) {
        /*var partnerId = viewBtn.attr("partnerId");
        GlobalVar.backPath = VIEW_DETAIL_URL;
        GlobalVar.data = {partnerId: partnerId};
        wantong.frame.showPage(VIEW_DETAIL_URL, {
          partnerId: partnerId
        });*/
      };

  return {
    init: function (conf) {
      _init(conf);
    }
  };

})();

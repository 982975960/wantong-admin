wantong.assFrame = (function () {
  var
      SEARCH_LOG_URL = GlobalVar.contextPath + "/ass/recognitionLogsSearch.do",
      FILTER_LOG_URL = GlobalVar.contextPath + "/ass/recognitionLogsFilter.do",
      _module = 0,
      _root = null,
      _searchTab = null,
      _filterTab = null,
      _init = function () {
        _initDom();
        _initTab();
        _root.find("#listTab").find('li').first().click();
      },
      _initDom = function () {
        _root = $("#logFrame");
        _searchTab = _root.find('#logSearch');
        _filterTab = _root.find('#logFilter');
      },
      _initTab = function () {
        _root.find("#listTab").find("li").click(function () {
          $(this).siblings("li").removeClass("active");
          $(this).addClass("active");
          var index = parseInt($(this).attr("index"));
          _module = index;
          console.log('init');
          if (index == 0) {
            _searchTab.css('display', 'block');
            _filterTab.css('display', 'none');
            _loadSearch();
          } else if (index == 1) {
            _searchTab.css('display', 'none');
            _filterTab.css('display', 'block');
            $("#partnerSelector").val('0');
            $("#appSelector").val('0');
            _loadFilter();
          }

          //设置导航栏标题
          $('#curContentTab').html($('#listTab .active a').html());
        });
        //默认激活第一个
        _root.find("#listTab").find("li").first().click();
      },
      _loadSearch = function() {
        _loadContent(SEARCH_LOG_URL, _searchTab, function () {
          console.log('load search');
        });
      },
      _loadFilter = function (page) {
        var partnerId = $("#partnerSelector").val();
        var appId = $("#appSelector").val();
        partnerId = partnerId ? partnerId : 0;
        appId = appId ? appId : 0;
        page = page ? page : 1;
        _loadContent(FILTER_LOG_URL + '?partnerId=' + partnerId + '&appId=' + appId + '&page=' + page, _filterTab, function (dom) {
          //初始化pagination
          wantong.assLogFilter.initPagination(dom.find('#pagination'));
        });
      },
      _loadContent = function(url, targetDom, callback) {
        $.ajax({
          url: url,
          type: 'GET',
          async: false,
          success: function (data) {
            var dom = $(data);
            targetDom.html(dom);
            if (callback) {
              callback(dom);
            }
          }
        });
      }
  ;

  return {
    init: function () {
      _init();
    },
    loadFilter: function (page) {
      _loadFilter(page);
    }
  };
})();
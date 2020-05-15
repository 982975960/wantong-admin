wantong.similar = (function () {
  var
      SIMILAR_PAGE_URL = GlobalVar.contextPath + "/base/similarSet.do",
      BOOK_PAGE_URL = GlobalVar.contextPath + "/base/openSimilarSet.do",
      SET_CREATE_URL = GlobalVar.contextPath + "/base/addSimilarSet.do",
      SET_UPDATE_URL = GlobalVar.contextPath + "/base/updateSimilarSet.do",
      SET_DELETE_URL = GlobalVar.contextPath + "/base/deleteSimilarSet.do",
      SET_GET_URL = GlobalVar.contextPath + "/base/getSimilarSet.do",
      _modelId = 0,
      _root = null,
      _setListTab = null,
      _detailListTab = null,
      _setCreateWindow = null,
      page = null,
      _init = function () {
        console.log('wantong.similar');
        _modelId = $('#bookNavi').find("#modelId").val();
        _initDom();
        _initComponent();
      },
      _showSetList = function() {
        _setListTab.css('display', 'block');
        _detailListTab.css('display', 'none');
      },
      _loadPage = function(page) {
          if (page === undefined) {
            page = 1;
          }

          var name = _root.find('#similarSetSelector').val();
          _modelId = $('#bookNavi').find("#modelId").val();

          $.ajax({
            url: SIMILAR_PAGE_URL + "?modelId=" + _modelId +"&page=" + page + "&name=" + name,
            type: 'GET',
            async: false,
            success: function (data) {
              var dom = $(data);
              $("#similarBookSet").html(dom);
              _init();
            }
          });
      },
      _initDom = function () {
        _root = $(".similar-set-container");
        _setListTab = _root.find('.similar-set');
        _detailListTab = _root.find('.similar-set-detail');
        _setCreateWindow = _root.find('#setCreateTemplate');
      },
      _initComponent = function () {
        //selector
        var selector = _root.find('#similarSetSelector');
        selector.chosen({
          allow_single_deselect: true,
          search_contains: true,
          width: '100%'
        }).change(function() {
          console.log('change', $(this).val());
          _loadPage(1);
        });

        selector.val(selector.attr('name'));
        selector.trigger("chosen:updated");

        //createBtn
        _root.find('.set-create-btn').off('click').click(function() {
          var obj = _setCreateWindow.html();
          var index = layer.open({
            title: "创建书组",
            type: 1,
            scrollbar: false,
            area: ["500px", "230px"],
            content: obj,
            end: function () {

            },
            cancel: function () {
              _loadPage(1);
            },
            success: function (dom) {
              _initCreateDom(dom);
            }
          });
        });

        //edit btn
        _root.find('.set-edit-btn').off('click').click(function() {
          var sid = $(this).attr('sid');
          var obj = _setCreateWindow.html();
          var index = layer.open({
            title: "编辑书组",
            type: 1,
            scrollbar: false,
            area: ["500px", "230px"],
            content: obj,
            end: function () {

            },
            cancel: function () {
              _loadPage(1);
            },
            success: function (dom) {
              _initUpdateDom(dom, sid);
            }
          });
        });


        //delete btn
        _root.find('.set-del-btn').off('click').click(function() {
          var sid = $(this).attr('sid');
          layer.confirm('您确定要删除这组相似书本吗？', {
            btn: ['确定', '取消'] //按钮
          }, (index) => {
            $.ajax({
              url: SET_DELETE_URL,
              type: 'POST',
              data: {
                id: sid
              },
              success: function (data) {
                console.log(data);
                layer.close(index);
                if (data.code == 0) {
                  _loadPage(1);
                  return;
                }

                layer.msg(data.msg);
              }
            });

          }, () => {
          });
        });

        //open btn
        _root.find('.set-open-btn').off('click').click(function() {
          _setListTab.css('display', 'none');
          _detailListTab.css('display', 'block');
          var sid = $(this).attr('sid');
          $.ajax({
            url: BOOK_PAGE_URL + "?sid=" + sid +"&page=1",
            type: 'GET',
            async: false,
            success: function (data) {
              var dom = $(data);
              _detailListTab.html(dom);
            }
          });
        });

        _initPagination(_setListTab.find('#pagination'), _loadPage);
      },
      _initCreateDom = function(dom){
        dom.find('#saveBtn').click(function(){
          var name = dom.find('#setName').val();
          console.log('create set ', name, _modelId);
          if (name == undefined || name == '' ) {
            layer.msg('请输入书组名称');
            return;
          }
          $.ajax({
            url: SET_CREATE_URL,
            type: 'POST',
            data: {
              modelId: _modelId,
              name: name
            },
            success: function (data) {
              console.log(data);
              if (data.code == 0) {
                layer.closeAll();
                _loadPage(1);
                return;
              }
              if (data.code == 20710) {
                layer.msg('名称不合法');
                return;
              }
              if (data.code == 20713) {
                layer.msg('书组名称已存在');
                return;
              }

              layer.msg(data.msg);
            }
          });
        });
        dom.find('#closeBtn').click(function() {
          layer.closeAll();
          _loadPage(1);
        });
      },
      _initUpdateDom = function(dom, sid){
        $.ajax({
          url: SET_GET_URL,
          type: 'POST',
          async: true,
          data: {
            sid: sid
          },
          success: function (data) {
            console.log(data);
            if (data.code == 0) {
              dom.find('#setName').val(data.data.name);
              return;
            }

            layer.msg(data.msg);
          }
        });

        dom.find('#saveBtn').click(function(){
          var name = dom.find('#setName').val();
          if (name == undefined || name == '' ) {
            layer.msg('请输入书组名称');
            return;
          }
          $.ajax({
            url: SET_UPDATE_URL,
            type: 'POST',
            data: {
              id: sid,
              name: name
            },
            success: function (data) {
              console.log(data);
              if (data.code == 0) {
                layer.closeAll();
                _loadPage(1);
                return;
              }
              if (data.code == 20710) {
                layer.msg('名称不合法');
                return;
              }

              if (data.code == 20713) {
                layer.msg('书组名称已存在');
                return;
              }

              layer.msg(data.msg);
            }
          });
        });
        dom.find('#closeBtn').click(function() {
          layer.closeAll();
          _loadPage(1);
        });
      },
      _initPagination = function (paginationDom, jumpFunc) {
        var currentPage = parseInt(paginationDom.attr("currentPage"));
        var totalPages = parseInt(paginationDom.attr("pages"));
        //初始化页码
        paginationDom.html('');
        if (0 == totalPages) {
          return;
        } else {
          var lastPageAppend = 0;
          for (var i = 1; i < totalPages + 1; i++) {
            if (totalPages > 4 && Math.abs(currentPage - i) > 1 && i != 1 && i
                != totalPages) {
              continue;
            }

            if (lastPageAppend + 1 != i) {
              paginationDom.append(
                  '<li class="page-back-b2" class="disabled"><a href="#" onclick="return false;">...</a></li>');
            }
            //&& currentPage != 1
            if (i == 1) {
              paginationDom.append(
                  '<li page="-1" class="page-back"><a href="#" aria-label="Previous"><img src="static/images/ico9_03.png"></a></li>');
            }

            if (i == currentPage) {
              paginationDom.append(
                  '<a href="#"><li class="active" page="' + i + '">' + i
                  + '</li></a>');
            } else {
              paginationDom.append(
                  '<li class="page-back-b2" page="' + i + '"><a href="#">' + i
                  + '</a></li>');
            }

            if (i == totalPages) {
              paginationDom.append(
                  '<li page="0" class="page-back"><a href="#" aria-label="Next"><img src="static/images/ico9_05.png"></a></li>');
            }
            lastPageAppend = i;
          }
          paginationDom.append(
              '<Li>到第</Li><Li><input type="text" id="jumpPage" class="page-box page-back"/></Li><Li>页</Li><button type="button" class="page-input" id="jumpButton">跳转</button>');
        }
        paginationDom.find("#jumpButton").on("click", function () {
          var jumpPage = paginationDom.find("#jumpPage").val();
          var jumpPage2 = parseInt(jumpPage);
          if (jumpPage2 != NaN && jumpPage2 > 0 && jumpPage2 <= totalPages) {
            $("html,body").animate({scrollTop: 0}, 10);
            jumpFunc(jumpPage2);
          } else {
            layer.msg("请输入正确页数")
          }
        });
        paginationDom.keydown(function (event) {
          var i = event.keyCode;
          if (event.keyCode == 13) {
            if (!$('#div').is(':hidden')) {
              paginationDom.find("#jumpButton").click();
            }
          }
        });
        paginationDom.delegate("li", "click", function (event) {
          var paginationTag = $(event.currentTarget);
          var page = paginationTag.attr("page");
          var currentPage = parseInt(paginationDom.attr("currentPage"));
          var totalPages = parseInt(paginationDom.attr("pages"));
          if (page == "-1") {
            var prevPage = currentPage - 1;
            if (prevPage >= 1) {
              jumpFunc(prevPage);
            }
          } else if (page == "0") {
            var nextPage = currentPage + 1;
            if (nextPage <= totalPages) {
              jumpFunc(nextPage);
            }
          } else {
            if (page != undefined) {
              jumpFunc(page);
            }
          }
        });
      }
  ;

  return {
    init: function () {
      _init();
    },
    showSetList: function() {
      _showSetList();
    }
  };
})();
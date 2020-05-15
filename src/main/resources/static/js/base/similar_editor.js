wantong.similardetail = (function () {
  var
      BOOK_PAGE_URL = GlobalVar.contextPath + "/base/openSimilarSet.do",
      SET_CREATE_URL = GlobalVar.contextPath + "/base/addSimilarBook.do",
      SET_UPDATE_URL = GlobalVar.contextPath + "/base/updateSimilarBook.do",
      SET_DELETE_URL = GlobalVar.contextPath + "/base/deleteSimilarBook.do",
      SET_GET_URL = GlobalVar.contextPath + "/base/getSimilarBook.do",
      _sid = 0,
      _root = null,
      _setCreateWindow = null,
      _initializationLayer = true,
      _coverImageLayerIndex = null,
      _init = function () {
        console.log('wantong.similardetail');
        _sid = $('.similar-set-detail-container').attr('sid');
        _initDom();
        _initComponent();
      },
      _loadPage = function (page) {
        if (page === undefined) {
          page = 1;
        }
        $('.similar-set-detail').html('');
        $.ajax({
          url: BOOK_PAGE_URL + "?sid=" + _sid + "&page=" + page,
          type: 'GET',
          async: false,
          success: function (data) {
            var dom = $(data);
            $('.similar-set-detail').html(dom);
            _init();
          }
        });
      },
      _initDom = function () {
        _root = $(".similar-set-detail-container");
        _setCreateWindow = _root.find('#setCreateTemplate');
      },
      _initComponent = function () {
        //back
        _root.find('#backToHome').off('click').click(function () {
          wantong.similar.showSetList();
        });

        //createBtn
        _root.find('.book-create-btn').off('click').click(function () {
          var obj = _setCreateWindow.html();
          var index = layer.open({
            title: "添加书本",
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
        _root.find('.book-edit-btn').off('click').click(function () {
          var bid = $(this).attr('bid');
          var obj = _setCreateWindow.html();
          var index = layer.open({
            title: "编辑书本",
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
              _initUpdateDom(dom, bid);
            }
          });
        });

        //delete btn
        _root.find('.book-del-btn').off('click').click(function () {
          var bid = $(this).attr('bid');
          layer.confirm('您确定要删除这条书本信息吗？', {
            btn: ['确定', '取消'] //按钮
          }, (index) => {
            $.ajax({
              url: SET_DELETE_URL,
              type: 'POST',
              data: {
                id: bid
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
        _root.find('.book-cover-btn').off('click').click(function () {
          var dom = $(this).parent().find('.img-container');
          console.log('img open');
          $(this).blur();
          if (!_initializationLayer) {
            return;
          }
          _initializationLayer = false;

          _coverImageLayerIndex =  layer.open({
            type: 1,
            title: false,
            closeBtn: 0,
            area: '1280px 700px',
            skin: 'layui-layer-nobg', //没有背景色
            shadeClose: true,
            scrollbar: false,
            resize: false,
            content: dom,
            success: function (layero) {
              var mask = $(".layui-layer-shade");
              mask.appendTo(layero.parent());
              //其中：layero是弹层的DOM对象
            },
            end: function () {
              _initializationLayer = true;
            }
          });
        });
        _initPagination(_root.find('#pagination'), _loadPage);

        //clickImage Close
        $(document).on('click',".layui-layer-content",function(e) {
            layer.close(_coverImageLayerIndex);
        });
      },
      _initCreateDom = function (dom) {
        dom.find('#saveBtn').click(function () {
          var bookId = dom.find('#bookId').val();
          console.log('create book ', _sid, bookId);
          if (bookId == undefined || bookId == '') {
            layer.msg('请输入BookId');
            return;
          }
          var r = /^\+?[1-9][0-9]*$/;
          if (bookId.length > 8 || !r.test(bookId)) {
            layer.msg('请输入有效的BookId');
            return;
          }

           $.ajax({
            url: SET_CREATE_URL,
            type: 'POST',
            data: {
              sid: _sid,
              bookId: bookId
            },
            success: function (data) {
              console.log(data);
              if (data.code == 0) {
                layer.closeAll();
                _loadPage(1);
                return;
              }
              if (data.code == 20711) {
                layer.msg('该书已和其他书本关联相似！');
                return;
              }

              if (data.code == 20712) {
                layer.msg('相似书不存在当前图库已发布模块');
                return;
              }

              if (data.code == 20714) {
                layer.msg('书本已存在');
                return;
              }

              layer.msg(data.msg);
            }
          });
        });
        dom.find('#closeBtn').click(function () {
          layer.closeAll();
          _loadPage(1);
        });
      },
      _initUpdateDom = function (dom, bid) {
        $.ajax({
          url: SET_GET_URL,
          type: 'POST',
          async: true,
          data: {
            bid: bid
          },
          success: function (data) {
            console.log(data);
            if (data.code == 0) {
              dom.find('#bookId').val(data.data.bookId);
              return;
            }

            layer.msg(data.msg);
          }
        });

        dom.find('#saveBtn').click(function () {
          var bookId = dom.find('#bookId').val();
          if (bookId == undefined || bookId == '') {
            layer.msg('请输入BookId');
            return;
          }
          var r = /^\+?[1-9][0-9]*$/;
          if (bookId.length > 8 || !r.test(bookId)) {
            layer.msg('请输入有效的BookId');
            return;
          }
          $.ajax({
            url: SET_UPDATE_URL,
            type: 'POST',
            data: {
              id: bid,
              bookId: bookId
            },
            success: function (data) {
              console.log(data);
              if (data.code == 0) {
                layer.closeAll();
                _loadPage(1);
                return;
              }
              if (data.code == 20711) {
                layer.msg('该书已和其他书本关联相似!');
                return;
              }

              if (data.code == 20712) {
                layer.msg('相似书不存在当前图库已发布模块');
                return;
              }

              if (data.code == 20714) {
                layer.msg('书本已存在');
                return;
              }

              layer.msg(data.msg);
            }
          });
        });
        dom.find('#closeBtn').click(function () {
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
    }
  };
})();
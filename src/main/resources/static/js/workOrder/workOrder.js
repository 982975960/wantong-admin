//
wantong.workOrderManager.workOrder = (function () {
  var _conf = {
        //获得工单列表的URL 参数 Integer-modelId int-currentPage int-pageSize(可不填) 返回界面
        LOAD_WORK_ORDERS: "/work/loadWorkOrderList.do",
        //创建工单的URL 参数String-name Integer-modelId  返回APIResponse
        CREATE_WORK_ORDER: "/work/createWorkOrder.do",
        //更新工单的URL  long-id String-name  返回APIResponse
        UPDATE_WORK_ORDER: "/work/updateWorkOrder.do",
        LOAD_SEARCHDOM_URL: "/work/loadWorkOrders.do",
        DELETE_WORKORDER_URL: "/work/deleteWorkOrder.do",
        OPEN_CREATE_WORK_ORDER: "/work/openCreateWorkOrder.do"
      },
      _root = null,
      _modelId = 0,
      _count = 0,
      _partnerId = 0;
  _createAndUpdateIndex = null,
      //脚本初始化
      _init = function (conf) {
        $.extend(_conf, conf);
        _count = 0;
        //获得脚本控制的块元素的对象
        _root = conf.currentTab;
        //获得当前图像库的ID
        _modelId = conf.modelId;
        //初始界面
        _initWorkOrderList();
        _initEvent();
      },
      //初始化workOrder界面
      _initWorkOrderList = function (partnerId) {
        _count = 0;
        _initSearchDom(partnerId);
      },
      _initSearchDom = function (partnerId) {
        console.log("modelId:" + _conf.modelId);
        if (partnerId === "" || partnerId === undefined) {
          partnerId = 0;
        }
        $.get(_conf.LOAD_SEARCHDOM_URL, {
              modelId: _modelId,
              partnerId: partnerId
            },
            function (data) {
              var dom = $(data);
              _root.html(dom);
              if (partnerId != 0) {
                _root.find("#partnerSelect").val(partnerId).trigger(
                    "chosen:updated");
              }
              _refreshList();
            }
        );
      },
      _initSearchSelect = function () {
        $("#partnerSelect").chosen({
          allow_single_deselect: true,
          search_contains: true,
          width: '100%'
        });
        $("#partnerSelect").on("change", function () {
          var partnerId = _root.find("#partnerSelect option:selected").val();

          _initWorkOrderList(partnerId);
        });
        $("#select_item").chosen({
          allow_single_deselect: true,
          search_contains: true,
          width: '100%'
        });
        $("#select_item").on("change", function () {
          _refreshList(1);
        });

        $("#modelId").off("change").on("change", function () {
          _modelId = parseInt($(this).find("option:selected").val());
          _conf.modelId = _modelId;
          //_root.find("#partnerSelect").val(0);
          _initWorkOrderList(0);
        });

        $(".chosen-search::before").css("display", "none")
        $(".chosen-single").css("color", "#aab2bd");

        $(".chosen-select").css("line-height", "20px");
        _count++;
      },
      //事件的注册
      _initEvent = function () {
        //给创建工单按钮绑定事件
        _root.off("click", "#createWordOrderBtn").on("click",
            "#createWordOrderBtn", function () {
              _openCreateAndUpdateLayer(true);
            });
        //编辑工单信息的按钮事件
        _root.off("click", ".edit-work-order").on("click", ".edit-work-order",
            function () {
              var id = $(this).attr("tid");
              var name = $(this).attr("name");
              var partnerId = $(this).attr("partnerId");
              _openCreateAndUpdateLayer(false, name, id, partnerId);
            });
        _root.off("click", "#delete_work_order").on("click",
            "#delete_work_order",
            function () {
              //防止连续点击
              var thisBtn = $(this);
              thisBtn.blur();
              var nowTime = new Date().getTime();
              var clickTime = thisBtn.attr("ctime");
              if (clickTime != 'undefined' && (nowTime - clickTime
                  < 5000)) {
                return false;
              } else {
                thisBtn.attr("ctime", nowTime);
              }

              var id = $(this).attr("tid");
              _deleteWorkOrder(id);
            });
        //添加信息的按钮
        _root.off("click", ".add-books").on("click", ".add-books", function () {
          var id = $(this).attr("tid");
          var name = $(this).attr("name");

          $(this).parents(".work-order").addClass("check-work-order");
          $(this).parents(".work-order").siblings(".work-order").removeClass(
              "check-work-order");
          wantong.workOrderManager.workOrderBookListEvent();

          wantong.workOrderManager.workOrderBookList.init({
            workOrderName: name,
            workOrderId: id,
            currentTab: $("#addWorkOrderBookListManageer"),
            modelId: _modelId
          });
        });
      },
      //创建界面元素的按钮事件绑定
      _createWorkOrderBtnEvent = function (obj) {
        var comfirmBtn = obj.find(".confirm-button");
        var cancelBtn = obj.find(".cancel-button");
        var workOrderInput = obj.find(".work-order-name");
        //取消按钮事件
        cancelBtn.off("click").on("click", function () {
          layer.close(_createAndUpdateIndex);
        });
        //确认按钮事件
        comfirmBtn.off("click").on("click", function () {
          var thisBtn = $(this);
          thisBtn.blur();
          var nowTime = new Date().getTime();
          var clickTime = thisBtn.attr("ctime");
          if (clickTime != 'undefined' && (nowTime - clickTime
              < 5000)) {
            return false;
          } else {
            thisBtn.attr("ctime", nowTime);
          }
          var name = workOrderInput.val();
          if (name == "" || name == undefined) {
            layer.msg("请输入工单名称");
            return;
          }
          $.get(_conf.CREATE_WORK_ORDER, {
            name: name,
            modelId: _modelId
          }, function (data) {
            if (data.code == 0) {
              _initWorkOrderList();
              //关闭layer
              layer.close(_createAndUpdateIndex);
            } else {

              layer.msg(data.msg);
            }
          })
        });
      },
      //编辑工单的按钮的时间绑定
      _updateWorkOrderBtnEvent = function (obj, name, id) {
        obj.find(".work-order-name").val(name);
        obj.find(".work-order-name").attr("name", name);
        obj.find(".confirm-button").attr("tid", id);

        obj.find(".confirm-button").off("click").on("click", function () {

          var thisBtn = $(this);
          thisBtn.blur();
          var nowTime = new Date().getTime();
          var clickTime = thisBtn.attr("ctime");
          if (clickTime != 'undefined' && (nowTime - clickTime
              < 5000)) {
            return false;
          } else {
            thisBtn.attr("ctime", nowTime);
          }

          var name = obj.find(".work-order-name").val();
          var historyName = obj.find(".work-order-name").attr("name");

          if (name == "") {
            layer.msg("请填入工单名称");
            return;
          }
          if (name == historyName) {
            layer.close(_createAndUpdateIndex);
            return;
          }
          $.get(_conf.UPDATE_WORK_ORDER, {
            id: parseInt($(this).attr("tid")),
            name: name,
          }, function (data) {
            if (data.code == 0) {
              layer.close(_createAndUpdateIndex);
              _refreshCurrentPage();
            } else {
              layer.msg(data.msg);
            }
          })
        });
        obj.find(".cancel-button").off("click").on("click", function () {

          layer.close(_createAndUpdateIndex);
        });
      },
      //打开创建和更新界面的窗口
      _openCreateAndUpdateLayer = function (isCreate, name, id, partnerId) {
        $.get(_conf.OPEN_CREATE_WORK_ORDER, {
          name: name,
          id: id,
          partnerId: partnerId,
          modelId: _modelId
        }, function (data) {
          layer.open({
            title: isCreate ? "创建工单" : "编辑工单",
            type: 1,
            shade: 0.2,
            area: ['400px', '230px'],
            content: data,
            end: function () {
              layer.closeAll();
            },
            cancel: function () {

            },
            success: function (layero) {
              var mask = $(".layui-layer-shade");
              mask.appendTo(layero.parent());
              //其中：layero是弹层的DOM对象
            }
          });
        });
        //找到弹出框的内容
        /*var content = _root.find(".layer-1").html();
        _createAndUpdateIndex = layer.open({
          title: isCreate ? "创建工单" : "编辑工单",
          type: 1,
          shade: 0.2,
          area: ['400px', '300px'],
          content: content,
          end: function () {

          },
          cancel: function () {

          },
          success: function (layero) {

            $(layero).find(".layui-layer-content").css("height","");
            if (isCreate) {
              _createWorkOrderBtnEvent($(layero));
            } else {
              _updateWorkOrderBtnEvent($(layero), name, id);
            }
          }
        });*/
      },

      //刷新界面
      _refreshList = function (page) {
        if (page === undefined) {
          page = 1;
        }
        var partnerId = _root.find("#partnerSelect option:selected").val();
        if (partnerId === "" || partnerId === undefined) {
          partnerId = 0;
        }
        _root.find("#partnerSelect").attr("partnerId", partnerId);

        var name = _root.find("#select_item option:selected").val();

        $.get(_conf.LOAD_WORK_ORDERS, {
          modelId: _modelId,
          currentPage: page,
          name: name,
          partnerId: partnerId
        }, function (data) {
          //获得返回界面的JQ对象
          var jqObj = $(data);
          //在界面对象里获得分页对象
          var pagination = jqObj.find("#pagination");
          //判断分页对象存不存在
          if (pagination.length > 0) {
            //初始化分页
            _initPagination(pagination);
          }
          //将对象内容放入界面
          _root.find("#workOrderListDiv").html(jqObj);
          if (_count == 0) {
            _initSearchSelect();
          }
        });
      },
      //刷新当前页
      _refreshCurrentPage = function () {
        //获得当前页的页码
        var currentPage = _root.find("#pagination").attr("currentpage");
        //刷新页
        _refreshList(currentPage);
      },
      //初始化分页
      _initPagination = function (paginationDom) {
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
            _refreshList(jumpPage2);
          } else {
            layer.msg("请输入正确页数")
          }
        });
        paginationDom.keydown(function (event) {
          var i = event.keyCode;
          if (event.keyCode == 13) {
            paginationDom.find("#jumpButton").click();
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
              _refreshList(prevPage);
            }
          } else if (page == "0") {
            var nextPage = currentPage + 1;
            if (nextPage <= totalPages) {
              _refreshList(nextPage);
            }
          } else {
            if (page != undefined) {
              _refreshList(page);
            }
          }
        });
      },
      _deleteWorkOrder = function (orderId) {
        layer.confirm("您确定要删除此工单吗？", {
          btn: ['确定', '取消'] //按钮
        }, function () {
          $.get(_conf.DELETE_WORKORDER_URL, {
            id: orderId
          }, function (data) {
            if (data.code == 0) {
              layer.msg("删除成功");
              _initWorkOrderList();
            } else {
              layer.msg(data.msg);
            }
          })
        });
      }
  ;

  return {
    init: function (conf) {
      _init(conf);
    },
    refreshCurrentPage: function () {
      _refreshCurrentPage();
    },
    initWorkOrderList: function () {
      _initWorkOrderList();
    }
  }

})();
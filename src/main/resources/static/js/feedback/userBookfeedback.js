wantong.feedBackListPanel=(function () {

    var
        SEARCH_FEEDBACK_URL=GlobalVar.contextPath + "/feedback/listbookfeedback.do",
        GET_BOOKFEEDBACKLIST=GlobalVar.contextPath + "/feedback/getbookfeedbackList.do",
        GET_APPLIST = GlobalVar.contextPath + "/feedback/getAppList.do",
        SEARCH_ALl = GlobalVar.contextPath + "/feedback/exportAllBooks.do",
        ADD_REMARK = GlobalVar.contextPath + "/feedback/addRemark.do",
        ADD_TO_WORK_ORDER = GlobalVar.contextPath + "/feedback/addToWorkOrder.do",
        SAVE_TO_WORK_ORDER = GlobalVar.contextPath + "/feedback/saveToWorkOrder.do",

    _root=null,
    _serachForm = null,
    _conf={},
    _initializationLayer = true,
    _index = 0;
    _init=function (conf) {
       $.extend(_conf,conf);
       _root=$("#feedBackDetailPanel");
       _serachForm=_root.find("#searchFrom");
       _serachForm.attr("action",SEARCH_FEEDBACK_URL);
        _refreshList();
        _clickhref();
        // _searchUserFeedBack();
        _root.find("#export_btn").click(_exportBooks);
        _initBtn();
        _initSearchSelect();
        _initSelect();
    },
      _initSelect = function () {
        _root.off("click", "#selector").on("click",
          "#selector", function (eve) {
            eve.stopPropagation();
          });
        _root.off("click", "#selector .mr-selector").on("click",
          "#selector .mr-selector", function (eve) {
            $("#selector .select").toggle();
          });
        _root.off("click", "#selector .img-selector").on("click",
          "#selector .img-selector", function (eve) {
            $("#selector .select").toggle();
          });
        _root.off("click", "input[type=checkbox]").on("click",
          "input[type=checkbox]", function () {
            var _this = $(this);
            var state = _this.val();
            if (state == -1) {
              if (_this.get(0).checked) {
                var allSelect = _root.find(".select").find(
                  "input[type=checkbox]");
                allSelect.prop("checked", true);
              } else {
                var allSelect = _root.find(".select").find(
                  "input[type=checkbox]");
                allSelect.prop("checked", false);
              }
            }
        });
        _root.off("click", "#stateSureBtn").on("click",
          "#stateSureBtn", function () {
            var allSelect = _root.find(".select").find(
              "input[type=checkbox]");
            var allState = "";
            allSelect.each(function () {
              var thisCheckBox = $(this);
              var _state = thisCheckBox.val();
              if (this.checked && _state != -1) {
                allState += thisCheckBox.get(0).name + ",";
              }
            });
            if (allState == "") {
              allState = "请选择书本状态";
            } else {
              allState = allState.substring(0, allState.length - 1);
            }
            _root.find(".mr-selector").text(allState);
            _root.find(".mr-selector").attr("title", allState);
            $("#selector .select").hide();
            _refreshList(1);
          });

        $("body").click(function () {
          $("#selector .select").hide();
        });
        _root.find(".select").find("input[type=checkbox]").prop("checked", true);
      },
      _initSearchSelect = function () {
        $('#partnerSelect').chosen({
            allow_single_deselect: true,
            search_contains: true,
            width: '100%'
        });
        _root.find("#partnerSelect").change(function () {
            var partnerId = _root.find("#partnerSelect option:selected").val();
            if (partnerId == ""){
              partnerId = 0;
            }
            $.get(GET_APPLIST,{partnerId:partnerId},function (data) {
              if (data.code == 0){
                var apps = data.data;
                  _root.find("#appSelect").empty();//去除option
                var appStr = '<option></option>';
                for (let app of apps){ // in 改用 let of
                  appStr += '<option value="'+app.id+'">'+app.name+'</option>';
                }
                _root.find("#appSelect").append(appStr);
                $('#appSelect').chosen("destroy").chosen({
                    allow_single_deselect: true,
                    search_contains: true,
                    width: '100%'
                });//更新select
                  _refreshList();
              }
            });
        });
        $('#appSelect').chosen({
          allow_single_deselect: true,
          search_contains: true,
          width: '100%'
        });
        _root.find("#appSelect").change(function () {
          _refreshList();
        });
        $('#modelSelect').chosen({
          allow_single_deselect: true,
          search_contains: true,
          width: '100%'
        });
        _root.find("#modelSelect").change(function () {
          _refreshList();
        });
        _root.find("#timeSelect").change(function () {
          _refreshList();
        });
      },
    _refreshList=function (page) {
        if (page == undefined) {
            page = 1;
        }
        var searchVO = _loadParameters(page);
        $.ajax({
            url:GET_BOOKFEEDBACKLIST,
            type:'POST',
            async:false,
            data:JSON.stringify(searchVO),
            contentType: "application/json; charset=utf-8",
            success:function (data) {
                var dom = $(data);
                var pagination = dom.find("#pagination");
                if(pagination.length>0){
                    _initPagination(pagination);
                }
                $("#userFeedBackContent").html(dom);
                _clickhref();
            }
        });
    },
    _loadParameters = function(page){
        var name = _root.find("#name").val();
        var author = _root.find("#author").val();
        var publisher = _root.find("#publisher").val();
        var isbn = _root.find("#isbn").val();
        var seriesTitle = _root.find("#seriesTitle").val();
        var partnerId = _root.find("#partnerSelect option:selected").val();
        var appId = _root.find("#appSelect option:selected").val();
        var model = _root.find("#modelSelect option:selected").val();
        var dayNum = _root.find("#timeSelect option:selected").val();

        var allSelect = _root.find(".select").find(
        "input[type=checkbox]");
        var selectState = [];
        allSelect.each(function () {
          var thisCheckBox = $(this);
          var _state = thisCheckBox.val();
          if (this.checked) {
            selectState.push(_state);
          }
        });
        var bookStates = selectState.length != 0
        ? selectState : [-2,0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12,13];
        return {
            currentPage: page,
            name: name,
            isbn: isbn,
            author: author,
            publisher: publisher,
            seriesTitle: seriesTitle,
            partnerId: partnerId,
            appId: appId,
            model: model,
            bookStates: bookStates,
            dayNum: dayNum
        }
    },
      _initBtn = function(){
        _root.find("#searchBtn").click(function () {
            _refreshList();
        });
        _root.find("#clearBtn").click(function () {
          _root.find("#name").val("");
          _root.find("#author").val("");
          _root.find("#publisher").val("");
          _root.find("#isbn").val("");
          _root.find("#seriesTitle").val("");
        });

        $("#feedBackDetailPanel").keyup(function(event){
            if(event.keyCode ==13){
                _root.find("#searchBtn").click();
            }
        });
        _root.off("click",".noDeal").on("click",".noDeal",function () {
          var id = $(this).attr("id");
          _openNoDealRemark(id);
        });
        _root.off("click",".addToWorkOrder").on("click",".addToWorkOrder",function () {
          var id = $(this).attr("id");
          _openAddToWorkOrder(id);
        });
    },
    _openAddToWorkOrder = function(id){
      $.get(ADD_TO_WORK_ORDER,{id:id},function (data) {
        _createAndUpdateMessage(data,id);
      });
    },
    _createAndUpdateMessage = function(obj,id){
      _index = layer.open({
        title: "编辑信息",
        type: 1,
        maxmin: false,
        area: ['800px', 'auto'],
        content: obj,
        move: true,
        end: function () {

        },
        cancel: function () {
          layer.closeAll();
        },
        success: function (layero) {
          $(layero).find(".layui-layer-content").css("height","");
          _addToWorkOrder($(layero),id);
        }
      });
    },
    _addToWorkOrder = function(obj,id){
      obj.find(".cancel-button").off("click").on("click", function () {
        layer.close(_index);
      });
      obj.find(".confirm-button").off("click").on("click", function () {
        var data = _getWorkOrderMessage(obj,id);
        if (data.isbn == "") {
          layer.msg("ISBN不能为空");
          return;
        }
        if (data.isbn.length != 10 && data.isbn.length != 13) {
          layer.msg("非法isbn");
          return;
        }
        if (data.name == "") {
          layer.msg("书名不能为空");
          return;
        }
        if (data.author == "") {
          layer.msg("作者不能为空");
          return;
        }
        if (data.publisher == "") {
          layer.msg("出版社不能为空");
          return;
        }
        $.ajax({
          url: SAVE_TO_WORK_ORDER,
          type: 'POST',
          async: true,
          contentType: "application/json",
          data: JSON.stringify(data),
          dataType: 'json',
          success: function (data) {
            if (data.code == 0) {
              layer.msg("加入工单成功");
              setTimeout(function () {
                layer.close(_index);
              }, 500);
              //更新当前列表
              var num = $("#pagination").attr("currentPage");
              _refreshList(parseInt(num));
            } else {
              layer.msg(data.msg);
            }
          },
          error: function () {
            layer.msg("服务器异常");
          }
        })
      });
    },
    _getWorkOrderMessage= function (obj,id) {
      var isbn = obj.find("#isbn").val();
      var name = obj.find("#bookName").val();
      var author = obj.find("#author").val();
      var publisher = obj.find("#publisher").val();
      var seriesTitle = obj.find("#seriesTitle").val();

      return {
        id:id,
        isbn:isbn,
        name:name,
        author:author,
        publisher:publisher,
        seriesTitle:seriesTitle
      }
    },
    _openNoDealRemark = function(id){
      var content = $("#noDealRemark").html();
      _index = layer.open({
        title: "请备注原因",
        type: 1,
        maxmin: false,
        area: ['400px', '200px'],
        content: content,
        end: function () {

        },
        cancel: function () {
          layer.closeAll();
        },
        success: function (layero) {

          $(layero).find(".layui-layer-content").css("height","");
          _addRemark($(layero),id);
        }
      });
    },
    _addRemark = function(obj,id){
      var comfirmBtn = obj.find(".confirm-button");
      var cancelBtn = obj.find(".cancel-button");
      //取消按钮事件
      cancelBtn.off("click").on("click", function () {
        layer.close(_index);
      });
      comfirmBtn.off("click").on("click", function () {
        var remark = obj.find("#remark").val();
        if (remark == "" || remark == undefined || $.trim(remark) == ""){
          layer.msg("原因不能为空");
          return;
        }
        if (remark.length > 50){
          layer.msg("原因不能超过50个字");
          return;
        }
        $.get(ADD_REMARK,{
          id:id,
          remark:remark
        },function (data) {
          if (data.code == 0) {
            _refreshList();
            //关闭layer
            layer.close(_index);
          } else {
            layer.msg(data.msg);
          }
        });
      })
    },
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
    _clickhref=function () {
        var href=_root.find("#ul-list").find("span").find("a");
        href.on("click",function () {
          $(this).blur();
          if(!_initializationLayer){
            return;
          }
          _initializationLayer = false;
            var thisBtn = $(this);
            var parent= thisBtn.parent("#userbackContent");
            var connet=parent.find("#userFeedBackImage");
            layer.open({
                type: 1,
                title: false,
                closeBtn: 0,
                area: '1280px 700px',
                skin: 'layui-layer-nobg', //没有背景色
                shadeClose: true,
                scrollbar:false,
                resize:false,
                content:connet,
                success: function (layero) {
                var mask = $(".layui-layer-shade");
                mask.appendTo(layero.parent());
                //其中：layero是弹层的DOM对象
                },
              end:function () {
                _initializationLayer = true;
              }
            });
        });

    },
    _searchUserFeedBack=function () {
         var _pageline=_root.find("#pageline");
         var _lis=_pageline.find("li");
         _lis.on("click",function () {
           $(this).blur();
             var currentPage=$(this).find("a").attr("page");
             if(currentPage==0)
             {
                 return;
             }

             _serachForm.find("#currentPage").val($(this).find("a").attr("page"));
             var option={
                 dataType:"text",
                 success: function(data){
                     $("#moduleBodyDiv").html(data);
                 },
                 error: function(data){
                     layer.alert("error");
                 }
             }
             _serachForm.ajaxSubmit(option);
         });
    },
    _exportBooks = function () {
        window.open(SEARCH_ALl);
    };
    return{
       init:function (conf) {
           _init(conf);
       }
    };
})();
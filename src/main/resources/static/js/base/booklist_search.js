wantong.base.booklist.search = (function () {
  var
      _modelId = 0,
      _searchBookList = null,
      _searchTerms = null,
      _status = null,
      _module = null,
      _root = null,
      _selectLabelIndex = null,
      _isClickSearch = false,
      isAuthExport = false,
      parameter = {
        labelNams:"",
        stateArray:"",
        content: {
          modelId: 0,
          bookName: "",
          isbn: "",
          press: "",
          dubble: "",
          edition: "",
          bookNumber: "",
          bookId: 0,
          currentPage: 0,
          status: status,
          label: "",
          pageSize: 0,
          isSearchAll: false,
          origin: origin,
          beginTime: "",
          endTime: "",
          labelIds: ""
        }
      },
      _conf = {
        SEARCH_ALL_BOOK_URL: "/base/searchAllBooks.do",
        LABEL_INFO_URL: "/cms/addLabel.do",
        GETDATA_URL:"/base/baseBookExport.do"
      },
      _init = function (conf) {
        $.extend(_conf, conf);
        console.log("search");
        _root = $("#searchTermsBase");
        isAuthExport = JSON.parse($("#isAuthExport").attr("auth"));

        _modelId = parseInt(_conf.modelId);
        _status = _conf.status;
        _searchBookList = _conf.currentTab;
        _module = _conf.module;
        _searchTerms = $("#searchTermsBase");
        _initClickEvent();
        _initClearBtn();
        _initStateSelect();
        _initLabelSelect();
        _loadComponent();
      },
      _initClearBtn = function () {
        _searchTerms.find("#clearBtn").click(function () {
          _searchTerms.find("#bookName").val("");
          _searchTerms.find("#isbn").val("");
          _searchTerms.find("#press").val("");
          _searchTerms.find("#dubble").val("");
          _searchTerms.find("#edition").val("");
          _searchTerms.find("#bookNumber").val("");
          _searchTerms.find("#bookId").val("");
          _searchTerms.find("#label-name").val("");
          _searchTerms.find("#stateSelector").find("ul input[type='checkbox']").each(function(){
            $(this).prop("checked",false);
          });
          _searchTerms.find("#label-name-select").val("");
          _searchTerms.find("#beginTime").val("");
          _searchTerms.find("#endTime").val("");
          _searchTerms.find("#stateSelector").find("input[name='text']").val("");
          _searchTerms.find(".mr-selector").text("选择状态");
          _searchTerms.find("input[name='ids']").val("");
          _isClickSearch = false;
          _clearParam();
        });
      },
      _initClickEvent = function () {

        _searchTerms.off("keydown").on("keydown",function (event) {
          if (event.keyCode == 13) {
            _refreshList(0);
            _isClickSearch = true;
          }
        });
        _searchTerms.find(".con-search-input input[value='搜索']").off(
            "click").on("click", function () {
          console.log("search");
          _refreshList(0);
          _isClickSearch = true;
        });
        _searchTerms.find("#bookOriginSelect").off(
            "change").on("change", function () {
          _refreshList(0);
          _isClickSearch = true;
        });

        //导出数据的借口
        _searchTerms.find(".export").off("click").on("click",function () {
          _searchDataWriteToExcel();
        });
      },
      _mags = function (mags) {
        layer.open({
          title: '提示'
          , content: mags
        });
      },
      // 搜查数据 写入excel
      _searchDataWriteToExcel = function() {
        if(isNaN(parameter.content.isbn)){
          layer.msg("ISBN必须为数字");
          return;
        }
        if(isNaN(parameter.content.bookNumber)){
          layer.msg("书本编号必须为数字");
          return;
        }
        if(isNaN(parameter.content.bookId)){
          layer.msg("BookID必须为数字");
          return;
        }
        if (!_judgeNoInput()) {
            layer.msg("请先搜索书本");
            return;
        }
        if(parameter.content.beginTime != ""){
          if(parameter.content.endTime == ""){
            _mags("请选择结束时间");
            return;
          }
        } else {
          if(parameter.content.endTime != ""){
            _mags("请选择开始时间");
            return;
          }
        }
        if (parameter.content.beginTime > parameter.content.endTime) {
          _mags('结束时间不能早于开始时间！');
          return ;
        }
        if (parameter.content.beginTime != "" && parameter.content.beginTime == parameter.content.endTime) {
          _mags('开始时间与结束时间不能相同！');
          return ;
        }
        var index = layer.load(1, {
          shade: [0.3,'#fff'] //0.1透明度的白色背景
        });
        $.get(_conf.GETDATA_URL, parameter.content,function(data){
          if(data.code == 0){
            if(data.data.length <= 0){
              layer.msg("导出无数据");
              layer.close(index);
            }else {
              var excelData = data.data;
              var newArr = excelData.map((e) => (
                  {
                    '书本编号': e.number,
                    'bookId': e.bookId,
                    '书名': e.bookName,
                    'isbn': e.isbn,
                    '作者': e.author,
                    '所属系列': e.series_title,
                    '状态': e.state,
                    '时间': e.time,
                    '书本标签': e.label
                  }

              ));
              console.log(newArr);
              Excel.download(newArr, "图像库书本信息数据" + ".xlsx");
              layer.close(index);
            }
          }
        });
      },
      _initStateSelect = function() {
        _root.off("click", "#stateSelector").on("click",
            "#stateSelector", function (eve) {
              $(".laydate-theme-molv").remove();
              eve.stopPropagation();
            });
        _root.off("click", "#stateSelector .mr-selector").on("click",
            "#stateSelector .mr-selector", function (eve) {
              $("#stateSelector .select").toggle();
            });
        _root.off("click", "#stateSelector .img-selector").on("click",
            "#stateSelector .img-selector", function (eve) {
              $("#stateSelector .select").toggle();
            });
        _root.off("click", "#stateSureBtn").on("click",
            "#stateSureBtn", function () {
              _selectStrDisplay();
              $("#stateSelector .select").hide();
            });
        $("body").click(function () {
          $("#stateSelector .select").hide();
        });

      },

      _selectStrDisplay = function () {
        var _selectStr = '';
        var selectDom = _root.find("#stateSelector :checked");
        var stateTextDom = _root.find("#stateSelector").find("input[name='text']");
        let stateText = "";
        if (selectDom.length > 3) {
          _selectStr = selectDom.eq(0).val() + '、' + selectDom.eq(1).val() + '、' + selectDom.eq(2).val() + '...';
        } else if (selectDom.length == 3) {
          _selectStr = selectDom.eq(0).val() + '、' + selectDom.eq(1).val() + '、' + selectDom.eq(2).val();
        } else if (selectDom.length == 2) {
          _selectStr = selectDom.eq(0).val() + '、' + selectDom.eq(1).val();
        } else if (selectDom.length == 1) {
          _selectStr = selectDom.eq(0).val();
        } else {
          _selectStr = '选择状态';
        }
        selectDom.each(function(){
          if(stateText == "") {
            stateText = $(this).attr("state");
          }else {
            stateText = stateText+"," + $(this).attr("state");
          }
        });
        stateTextDom.val(stateText);
        _root.find("#stateSelector .mr-selector").html(_selectStr);
      },

      //初始化标签选择或者输入
      _initLabelSelect = function () {
        $(".search-all #label-name-select").off("click").on("click",function () {
          var idsString = $(".search-all").find("input[name='ids']").val();
          $.get(_conf.LABEL_INFO_URL, {
            isMakePic:false,
            isSearch:true,
            isBase:true
          }, function (data) {
            let content = data;
            _openLabelPanel(content,idsString);
          });
        });
      },
      _openLabelPanel = function(content,idsString) {
        _selectLabelIndex = layer.open({
          type:1,
          title:false,
          scrollbar:false,
          area: ['830px','800px'],
          content:content,
          closeBtn:false,
          success : function() {
            wantong.base.searchLabel.initChecked(idsString)
          }
        });
      },
      _loadComponent = function () {
        layui.use(['laydate', 'form'], function () {
          var laydate = layui.laydate,
              layer = layui.layer;
          laydate.render({
            elem: '#beginTime' //日期input id
            , done: function (value, date) { //监听日期被切换

            }
            , type: 'datetime'
            , theme: '#3dbeed'
          });
          laydate.render({
            elem: '#endTime'
            , done: function (value, date) { //监听日期被切换

            }
            , type: 'datetime'
            , theme: '#3dbeed'
          });
        });
      },
      /**
       * 关闭选择标签的方法
       * @param ids 选择标签的Id集合
       * @param labelNames 选择标签的名称集合
       * @param labelName 输入的标签名称
       * @private
       */
      _labelLayerClose = function(ids,labelNames,labelName){
        if(ids == undefined && labelName == undefined && labelNames == undefined){
          layer.close(_selectLabelIndex);
          return;
        }
        if(""==labelName){
          $("#label-name-select").val(labelNames);
          $("input[name='ids']").val(ids);
        } else {
          $("#label-name-select").val(labelName);
          $("input[name='ids']").val("");
        }
        layer.close(_selectLabelIndex);
      },
      _setUpParameters = function (page) {
        var bookName = _searchTerms.find("#bookName").val().trim();
        var isbn = _formatInputContent(_searchTerms.find("#isbn").val());
        var press = _formatInputContent(_searchTerms.find("#press").val());
        var dubble = _formatInputContent(_searchTerms.find("#dubble").val());
        var edition = _formatInputContent(_searchTerms.find("#edition").val());
        var bookNumber = _formatInputContent(
            _searchTerms.find("#bookNumber").val());
        var bookId = _formatInputContent(_searchTerms.find("#bookId").val());
        var label = "";
        if(!isAuthExport) {
          label = _formatInputContent(_searchTerms.find("#label-name").val());
        } else {
          label = _formatInputContent(_searchTerms.find("#label-name-select").val());

        }
        var labelIds = _searchTerms.find("input[name='ids']").val();
        var beginTime = _searchTerms.find("#beginTime").val();
        var endTime = _searchTerms.find("#endTime").val();
        var stateArray = _searchTerms.find("#stateSelector").find("input[name='text']").val();
        var _isSearchAll = false;
        var modelId = _modelId;
        var status="";
        if(stateArray == "") {
           status = _status;
        }else {
          status = stateArray;
        }
        var _width = window.screen.width;
        var _pageSize = 16;
        var origin = -1;
        if (_width <= 1600) {
          _pageSize = 12;
        }
        if (_module == 100 ){
          _isSearchAll = true;
        }else {
          label = _formatInputContent(_searchTerms.find("#label-name").val());
        }
        /*
         * Sprint8 K12图像库不搜索ny书本
         */
        if(_modelId == 29){
          origin = 0;
        } else if (_module == 10) {
          origin = 2;
        } else if (_module == 0 || _module == 1 || _module == 7) {
          origin = 0;
        } else if (_module == 3 || _module == 4 || _module == 5){
          origin = $("#bookOriginSelect").val();
        }
        var labelNams = _searchTerms.find("#label-name-select").val();
        var stateArray = _searchTerms.find("#stateSelector").find("input[name='text']").val();
        parameter.content.modelId = modelId;
        parameter.content.bookName = bookName;
        parameter.content.isbn=isbn;
        parameter.content.press= press;
        parameter.content.dubble = dubble;
        parameter.content.edition = edition;
        parameter.content.bookNumber = bookNumber;
        parameter.content.bookId = bookId;
        parameter.content.currentPage = page;
        parameter.content.status = status;
        parameter.content.label = label;
        parameter.content.pageSize = _pageSize;
        parameter.content.isSearchAll = _isSearchAll;
        parameter.content.origin = origin;
        parameter.content.beginTime = beginTime;
        parameter.content.endTime = endTime;
        parameter.content.labelIds = labelIds;
        parameter.labelNams = labelNams;
        parameter.stateArray = stateArray;
      },
      _refreshCurrentPage = function(toggleTab){
        var currentPage =$("#pagination").attr("currentPage");
        if (currentPage == null){
          currentPage = 1;
        } else {
          currentPage=parseInt(currentPage);
        }
        if (!_judgeNoInput()) {
          wantong.base.booklist.refresh(currentPage);
          return;
        }
        _refreshList(currentPage,toggleTab);
      },
      _refreshList = function (page, toggleTab) {
        _setUpParameters(page);
        if(isNaN(parameter.content.isbn)){
          layer.msg("ISBN必须为数字");
          return;
        }

        if(isNaN(parameter.content.bookNumber)){
          layer.msg("书本编号必须为数字");
          return;
        }
        if(isNaN(parameter.content.bookId)){
          layer.msg("BookID必须为数字");
          return;
        }
        if (_module == 100){
          if (!_judgeNoInput()) {
            layer.msg("请输入搜索内容");
            return;
          }
        }
        if(parameter.content.beginTime != ""){
          if(parameter.content.endTime == ""){
            _mags("请选择结束时间");
            return;
          }
        } else {
          if(parameter.content.endTime != ""){
            _mags("请选择开始时间");
            return;
          }
        }
        if (parameter.content.beginTime > parameter.content.endTime) {
          _mags('结束时间不能早于开始时间！');
          return ;
        }
        if (parameter.content.beginTime != "" && parameter.content.beginTime == parameter.content.endTime) {
          _mags('开始时间与结束时间不能相同！');
          return ;
        }
        $.get(_conf.SEARCH_ALL_BOOK_URL, parameter.content,
            function (data) {
              var dom = $(data);

              var pagination = dom.find("#pagination");
              var bookCount = dom.find("#bookCount");
              var noSearchBook = dom.find("#noSearchBook");

              if (pagination.length > 0) {
                _initPagination(pagination);
              }
              _searchBookList.html(dom);
              if (noSearchBook.length > 0) {
                if (!toggleTab){
                  layer.msg("没有查询到符合条件的书本");
                }
              }
              if (_status=="0,1,3,4,5,6,7"){
                bookCount.hide();
              }
            });
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
        paginationDom.find("#jumpButton").off("click").on("click", function () {
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
      _clearSearchMessage = function () {
        if (_searchTerms != null) {
          _searchTerms.find("#bookName").val("");
          _searchTerms.find("#isbn").val("");
          _searchTerms.find("#press").val("");
          _searchTerms.find("#dubble").val("");
          _searchTerms.find("#edition").val("");
          _searchTerms.find("#bookNumber").val("");
          _searchTerms.find("#bookId").val("");
          _searchTerms.find("#label-name").val("");
          _searchBookList.html("");

          _searchTerms.find("#label-name-select").val("");
          _searchTerms.find("#beginTime").val("");
          _searchTerms.find("#endTime").val("");
          _searchTerms.find("#stateSelector").find("input[name='text']").val("");
          _searchTerms.find("#stateSelector").find("ul input[type='checkbox']").each(function(){
          $(this).prop("checked",false);
          });
          _searchTerms.find(".mr-selector").text("选择状态");
          _searchTerms.find("input[name='ids']").val("");
          _modelId = 0;
          _isClickSearch = false;
          _clearParam();
        }
      },
      _formatInputContent = function (content) {
        content = content.replace(/\s+/g, "");
        content = content.replace(/\%+/g, "");

        return content;
      },
       _clearParam = function () {
         parameter.labelNams="";
         parameter.stateArray = "";
         parameter.content.modelId = 0;
         parameter.content.bookName = ""
         parameter.content. isbn = "";
         parameter.content.press = "";
         parameter.content.dubble = "";
         parameter.content.edition = "";
         parameter.content.bookNumber = "";
         parameter.content.bookId = 0;
         parameter.content.currentPage = 0;
         parameter.content.status = status;
         parameter.content.label = "";
         parameter.content. pageSize = 0;
         parameter.content.isSearchAll = false;
         parameter.content.origin = origin;
         parameter.content.beginTime = "";
         parameter.content.endTime = "";
         parameter.content.labelIds = "";

      } ,
      //判断是都没有输入 或者输入空格后
      _judgeNoInput = function () {
        if (parameter.content.bookName == "" && parameter.content.isbn == "" && parameter.content.press == "" && parameter.content.dubble == ""
            && parameter.content.edition == "" && parameter.content.bookNumber == "" && parameter.content.bookId == "" && parameter.content.label == "" && parameter.labelNams=="" && parameter.content.beginTime== ""
        && parameter.content.endTime== "" && parameter.stateArray == "") {
          return false;
        } else {
          return true;
        }
        //检查时间
      };
  return {
    init: function (conf) {
      _init(conf);
    },
    refresh: function (page, modelId, toggleTab) {
      _modelId = modelId;
      _refreshList(page, toggleTab);
    },
    refreshCurrentPage: function ( modelId, toggleTab) {
      _modelId = modelId;
      _refreshCurrentPage(toggleTab);
    },
    clear: function () {
      _clearSearchMessage();
    },
    closeLabelLayer:function (ids,labelNames,labelName) {
      _labelLayerClose(ids,labelNames,labelName);
    },
    refreshEvent:function () {
      _initStateSelect();
    }
  }
})();
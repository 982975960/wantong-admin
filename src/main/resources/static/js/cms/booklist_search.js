wantong.cms.booklist.search = (function () {
 var
   _modelId = 0,
   _searchBookList =null,
     _searchTerms = null,
   _conf = {
      SEARCH_ALL_BOOK_URL : "/cms/searchAllBooks.do"
   },
   _init = function (conf) {
     $.extend(_conf,conf);
     console.log("search");
     _modelId = parseInt(_conf.modelId);
     _searchBookList = conf.currentTab;
     _searchTerms = $("#searchTerms")
     _initClickEvent();
     _initClearBtn();
   },
   _initClearBtn = function(){
     _searchTerms.find("#clearBtn").click(function () {
         _searchTerms.find("#bookName").val("");
         _searchTerms.find("#isbn").val("");
         _searchTerms.find("#press").val("");
         _searchTerms.find("#dubble").val("");
         _searchTerms.find("#edition").val("");
         _searchTerms.find("#bookNumber").val("");
         _searchTerms.find("#bookId").val("");
     });
   },
   _initClickEvent = function () {
     $("#searchTerms").keydown(function (event) {
       if(event.keyCode==13) {
         _refreshList(0);
       }
     });
     _searchTerms.find(".con-search-input input[value='搜索']").off("click").on("click",function () {
       _refreshList(0);
     });
   },
   _setUpParameters = function(page){
      var bookName = _searchTerms.find("#bookName").val().trim();
      var isbn = _formatInputContent(_searchTerms.find("#isbn").val());
      var press = _formatInputContent(_searchTerms.find("#press").val());
      var dubble = _formatInputContent(_searchTerms.find("#dubble").val());
      var edition = _formatInputContent(_searchTerms.find("#edition").val());
      var bookNumber = _formatInputContent(_searchTerms.find("#bookNumber").val());
      var bookId = _formatInputContent(_searchTerms.find("#bookId").val());
      var modelId = _modelId;
      return { modelId: modelId, bookName:bookName,
        isbn :isbn,
        press:press,
        dubble:dubble,
        edition:edition,
        bookNumber:bookNumber,
        bookId:bookId,
        currentPage:page
      };
    },
   _refreshList = function(page, toggleTab){
      if(!_judgeNoInput()){
        if (!toggleTab) {
          layer.msg("请输入搜索内容");
        }

        return;
      }
     $.get(_conf.SEARCH_ALL_BOOK_URL,_setUpParameters(page), function (data) {
       var dom = $(data);
       var pagination = dom.find("#pagination");
       var bookCount = dom.find("#bookCount");
       bookCount.hide();
       if (pagination.length > 0) {
         _initPagination(pagination);
       }
        _searchBookList.html(dom);
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
               '<li class="page-back-b2" page="' + i + '"><a href="#">' + i + '</a></li>');
         }

         if (i == totalPages) {
           paginationDom.append(
               '<li page="0" class="page-back"><a href="#" aria-label="Next"><img src="static/images/ico9_05.png"></a></li>');
         }
         lastPageAppend = i;
       }
       paginationDom.append('<Li>到第</Li><Li><input type="text" id="jumpPage" class="page-box page-back"/></Li><Li>页</Li><button type="button" class="page-input" id="jumpButton">跳转</button>');
     }
     paginationDom.find("#jumpButton").off("click").on("click",function () {
       var jumpPage = paginationDom.find("#jumpPage").val();
       var jumpPage2 = parseInt(jumpPage);
       if (jumpPage2!=NaN && jumpPage2 > 0 && jumpPage2 <= totalPages){
         $("html,body").animate({scrollTop:0},10);
         _refreshList(jumpPage2);
       }else {
         layer.msg("请输入正确页数")
       }
     });
     paginationDom.keydown(function (event) {
       var i = event.keyCode;
       if (event.keyCode == 13){
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
   _clearSearchMessage = function(){
    if(_searchTerms != null) {
      _searchTerms.find("#bookName").val("");
      _searchTerms.find("#isbn").val("");
      _searchTerms.find("#press").val("");
      _searchTerms.find("#dubble").val("");
      _searchTerms.find("#edition").val("");
      _searchTerms.find("#bookNumber").val("");
      _searchTerms.find("#bookId").val("");
      _searchBookList.html("");
      _modelId = 0;
    }
   },
   _formatInputContent = function (content) {
      content = content.replace(/\s+/g, "");
      content = content.replace(/\%+/g,"");

      return content;
   },
     //判断是都没有输入 或者输入空格后
  _judgeNoInput = function () {
    var bookName = _searchTerms.find("#bookName").val().trim();
    var isbn = _formatInputContent(_searchTerms.find("#isbn").val());
    var press = _formatInputContent(_searchTerms.find("#press").val());
    var dubble = _formatInputContent(_searchTerms.find("#dubble").val());
    var edition = _formatInputContent(_searchTerms.find("#edition").val());
    var bookNumber = _formatInputContent(_searchTerms.find("#bookNumber").val());
    var bookId = _formatInputContent(_searchTerms.find("#bookId").val());

     if(bookName == "" && isbn == "" && press == "" && dubble == "" && edition == "" && bookNumber == "" && bookId == ""){
       return false;
     }else {
       return true;
     }
  };
 return {
   init : function (conf) {
     _init(conf);
   },
   refresh : function (page,modelId, toggleTab) {
     _modelId = modelId;
      _refreshList(page, toggleTab);
   },
   refreshCurrentPage : function () {

   },
   clear : function () {
     _clearSearchMessage();
   }
 }
})();
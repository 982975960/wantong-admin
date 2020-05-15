wantong.ass={};
wantong.ass.feedback = (function () {
    var _conf = null,
        _url = {
          // 反馈的书本列表的URL
          USER_FEEDBACK_LIST_URL : "/ass/feedbackList.do",
          // 书本信息的URL
          BOOK_INFO_BY_ISBN_URL :"/ass/getBookInfoByIsbn.do",
          FILE_URL:GlobalVar.services.FDS,
            IMAGE_PATH:GlobalVar.services.BOOKIMAGEPATH,
        },
        pagination = {},
        _bookModelOrigin = [
            {id:1, name: '来自绘本图像库'},
            {id:2, name: '来自K12图像库'},
            {id:3, name: '来自豆瓣'}
        ],
        //记录Isbn
        _digIsbn = "",
        _modelType = 1,
        _currentDigPagination = null,
        _currentPaginationId = "",
        digPictureBookPagination = {},
        digK12BookPagination = {},
        digDouBanBookdPagination={},
        //搜索数据的vo 用来记录搜索
        _searchVO =   {
         openId : null,
         isbn : null,
         searchQuestionTypes : [],
         currentPage : 1
        };
        viewModel = null,
        //书本问题反馈的问题集合
        _questionTypesArr = [
            {type : 2, name : '封面不读'},
            {type : 3, name : '内页不读'},
            {type : 4, name : '内页读错'},
            {type : 5, name : '下载失败'},
            {type : 6, name : '网络问题'},
            {type : 7, name : '其他'}
        ];
    function _init(conf) {
        $.extend(_conf, conf);
        _initData();
        _initVue();
        getUserFeedback((data)=>{
            _initPanelData(data);
        });
        _initEvent();
    };
    function _initEvent() {
        $(document).on('click',".el-image-viewer__mask",function(e) {
            $(".el-icon-circle-close").click();
        });
        $(document).on('click',".el-image-viewer__canvas",function(e) {
            $(".el-icon-circle-close").click();
        });
    };
    //初始化数据结构
    function _initData() {
        viewModel = {};
        pagination = {
            currentPage : 1,
            pageSize : 12
        };
        digPictureBookPagination = {
            currentPage : 1,
            pageSize : 4
        };
        digK12BookPagination = {
            currentPage : 1,
            pageSize : 4
        };
        digDouBanBookdPagination = {
            currentPage : 1,
            pageSize : 4
        };
        _clearSearchVO();
        viewModel.search = {};
        viewModel.search.questionTypes = [];
        viewModel.search.questionTypes = _questionTypesArr;
        viewModel.search.feedbackPaths = [];
        //搜索选择的内容
        viewModel.resultSearch = {};
        viewModel.resultSearch.openId = "";
        viewModel.resultSearch.isbn = "";
        viewModel.resultSearch.questionType = [];
        viewModel.align = "center";
        viewModel.head = [{
            name: "序号",
            width: "5",
            align: "center",
            vAlign: "middle",
            noWrap: "nowrap",
            bgColor: "#f6f7fb",
            style: "padding: 0.8% 1%;border-bottom: 1px solid #eceff8;line-height: 16px"
        },{
            name: "OpenID",
            width: "15",
            align: "center",
            vAlign: "middle",
            noWrap: "nowrap",
            bgColor: "#f6f7fb",
            style: "padding: 0.8% 1%;border-bottom: 1px solid #eceff8;line-height: 16px"
        },{
            name: "ISBN",
            width: "15",
            align: "center",
            vAlign: "middle",
            noWrap: "nowrap",
            bgColor: "#f6f7fb",
            style: "padding: 0.8% 1%;border-bottom: 1px solid #eceff8;line-height: 16px"
        }, {
            name: "问题类别",
            width: "10",
            align: "center",
            vAlign: "middle",
            noWrap: "nowrap",
            bgColor: "#f6f7fb",
            style: "padding: 0.8% 1%;border-bottom: 1px solid #eceff8;line-height: 16px"
        },
            {
                name: "问题描述",
                width: "10",
                align: "center",
                vAlign: "middle",
                noWrap: "nowrap",
                bgColor: "#f6f7fb",
                style: "padding: 0.8% 1%;border-bottom: 1px solid #eceff8;line-height: 16px"
            },
            {
                name: "反馈图片",
                width: "10",
                align: "center",
                vAlign: "middle",
                noWrap: "nowrap",
                bgColor: "#f6f7fb",
                style: "padding: 0.8% 1%;border-bottom: 1px solid #eceff8;line-height: 16px"
            },
            {
                name: "反馈时间",
                width: "15",
                align: "center",
                vAlign: "middle",
                noWrap: "nowrap",
                bgColor: "#f6f7fb",
                style: "padding: 0.8% 1%;border-bottom: 1px solid #eceff8;line-height: 16px"
            }];
        viewModel.isShowMessage = true;
        //主题数据结构
        viewModel.body = [];
        //isbn数据
        viewModel.digUserData = {};
        viewModel.digUserData.pictureBookData = [];
        viewModel.digUserData.K12BookData = [];
        viewModel.digUserData.doubanBookData = [];
        viewModel.digUserData.activeName = "";
        //dig的标题
        viewModel.title="书本信息";
        //dig是否显示
        viewModel.dialogFormVisible = false;
        viewModel.count=0;
    };
    //初始化vue对象
    function _initVue() {
        let vm = new Vue({
            el : "#feedbackBody",
            data:viewModel,
            methods:{
                feedBackPathChange:function (type) {
                    console.log(type)
                },
                closeViewer:function(){

                },
                //
                showBookMessage:function(isbn){
                    viewModel.digUserData.pictureBookData = [];
                    viewModel.digUserData.K12BookData = [];
                    viewModel.digUserData.doubanBookData = [];
                    viewModel.digUserData.activeName = "1";
                    _digIsbn = isbn;
                    viewModel.dialogFormVisible = true;
                    _modelType = 1;
                    _currentDigPagination = digPictureBookPagination;
                    _currentPaginationId = "#pictureBookPagination";
                    _tabBookData((data)=>{
                       _initDigTabBookData(data);
                    });
                },
                tabClick:_tabClickEventHandle,
                //dig的关闭按钮事件
                handleClose:function() {
                    viewModel.dialogFormVisible = false;
                    $(".el-dialog__wrapper").remove();
                    digPictureBookPagination = {
                        currentPage : 1,
                        pageSize : 4
                    };
                    digK12BookPagination = {
                        currentPage : 1,
                        pageSize : 4
                    };
                    digDouBanBookdPagination = {
                        currentPage : 1,
                        pageSize : 4
                    };
                },
                //清空按钮的处理事件
                clearSearchData : _clearSearchDataEventHandle,
                //搜索按钮的处理事件
                searchFeedback : _searchEventHandle,
            }
        });
    };
    //搜索按钮的处理事件
    function _searchEventHandle() {
        pagination.currentPage = 1;
        _getUserSearchVO();
        getUserFeedback((data)=>{
            _initPanelData(data);
        })
    };
    //情况搜索类容的按钮事件
    function _clearSearchDataEventHandle() {
        viewModel.resultSearch.isbn = "";
        viewModel.resultSearch.openId = "";
        viewModel.resultSearch.questionType = [];
        _clearSearchVO();
        getUserFeedback((data)=>{
            _initPanelData(data);
        })
    };
    //tab 点击事件的处理
    function _tabClickEventHandle(tab,event) {
        _modelType= _bookModelOrigin.filter(function(item){return item.name == tab.label;})[0].id;
        if(_modelType == 1){
           _currentDigPagination = digPictureBookPagination;
           _currentPaginationId = "#pictureBookPagination";
      } else if(_modelType == 2){
           _currentDigPagination = digK12BookPagination;
           _currentPaginationId = "#K12BookPagination";
      } else {
           _currentDigPagination = digDouBanBookdPagination;
           _currentPaginationId = "#DouBanBookPagination";
      }
        _tabBookData((data)=>{
            _initDigTabBookData(data);
        });
    };
    //出事话dig界面数据
    function _initDigTabBookData (data) {
        viewModel.digUserData.pictureBookData = [];
        viewModel.digUserData.doubanBookData = [];
        viewModel.digUserData.K12BookData = [];
        if(_modelType == 1) {
            if (data.listBook != null && data.listBook.length > 0) {
                //遍历数组
                for (let i = 0; i < data.listBook.length; i++) {
                    data.listBook[i].source.cover_image = _url.FILE_URL+_url.IMAGE_PATH +"/"+data.listBook[i].source.model_id + "/"+ data.listBook[i].source.id+ "/"+data.listBook[i].source.cover_image;
                    viewModel.digUserData.pictureBookData.push(data.listBook[i].source);
                }
            }
        } else if (_modelType == 2) {
            if(data.listBook != null && data.listBook.length > 0) {
                for (let i = 0; i < data.listBook.length; i++) {
                    data.listBook[i].source.cover_image = _url.FILE_URL + _url.IMAGE_PATH + "/" + data.listBook[i].source.model_id + "/" + data.listBook[i].source.id + "/" + data.listBook[i].source.cover_image;
                    viewModel.digUserData.K12BookData.push(data.listBook[i].source);
                }
            }
        } else {
            if(data != null && data.length > 0) {
                for (let i = 0; i < data.length; i++) {
                    viewModel.digUserData.doubanBookData.push(data[i]);
                }
            }
        }
        if(_modelType != 3) {
            //分页
            let paginationParam = {
                currentPage: _currentDigPagination.currentPage,
                totalPages: data.pagination.pages,
                parentElement: _currentPaginationId,
                callback: function (index) {
                    _currentDigPagination.currentPage = index;
                    _tabBookData((data)=>{
                        _initDigTabBookData(data);
                    });
                }
            };
            util.makePagination(paginationParam)
        }
    };

    /**
     * 获取Isbn在每个tab的书本数据
     * @param modelType 基础库I
     * @param currentPage 当前页数据
     * @private
     */
    function _tabBookData(callBack) {
        $.get(_url.BOOK_INFO_BY_ISBN_URL,{
            isbn:_digIsbn,
            type:_modelType,
            currentPage:_currentDigPagination.currentPage
        },function(data) {
            if(data.code == 0){
                callBack(data.data);
            }else {
                layer.msg(data.msg);
            }
        });
    };

    //初始化界面数据
    function _initPanelData(data) {
        viewModel.body=[];
        //初始界面
        if(data.list != null){
            //遍历数组
            for (let i = 0; i < data.list.length; i++) {
                data.list[i]['src']="static/images/ico30.jpg";
                data.list[i]['srcList'] = [data.list[i].fileURL];
                viewModel.body.push(data.list[i]);

            }
        }
        viewModel.count=data.pagination.totalRecord;

        //分页
        let paginationParam = {
            currentPage: pagination.currentPage,
            totalPages: data.pagination.pages,
            parentElement: '#messageCenter_pagination',
            callback: function (index) {
                pagination.currentPage = index;
                _searchVO.currentPage = index;
                getUserFeedback((data)=>{
                    _initPanelData(data)
                });
            }
        };
        util.makePagination(paginationParam);
    };
    //获取用户数据的请求
    function getUserFeedback(callBack) {
        $.ajax({
            url : _url.USER_FEEDBACK_LIST_URL,
            dataType : "json",
            type:'POST',
            contentType : "application/json",
            data : JSON.stringify(_searchVO),
            async : false,
            success : function (data) {
                if(data.code == 0){
                    callBack(data.data)
                } else {
                    layer.msg(data.msg);
                }
            },
            error : function () {
                layer.msg("服务器错误");
            }
        });
    };
    //清楚记录VO
    function _clearSearchVO() {
        _searchVO.openId = null;
        _searchVO.isbn = null;
        _searchVO.searchQuestionTypes = [];
        _searchVO. currentPage = 1;
    };
    //获得搜索数据的VO对象
    function _getUserSearchVO() {
        _searchVO.openId = viewModel.resultSearch.openId;
        _searchVO.isbn = viewModel.resultSearch.isbn;
        _searchVO. searchQuestionTypes = viewModel.resultSearch.questionType;
        _searchVO. currentPage = pagination.currentPage;
    };
    return {
        init : function (conf) {
            _init(conf);
        }
    };
})();
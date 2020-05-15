var wantong = wantong || {};
wantong.noResourceBookStatistics = (function () {
    var _conf={
        LIST_NO_RESOURCE_BOOK:"/noResourceBookStatistics/listNoResourceBook.do",
        DELETE_NO_RESOURCE_RECORD:"/noResourceBookStatistics/deleteRecord.do",
        EXPORT_OR_DEL_URL:"/noResourceBookStatistics/exportRecordOrDel.do",
        EXPORT_NO_DEL_URL:"/noResourceBookStatistics/exportRecordNoDel.do"
        },
        viewModel = null,
        //全选的bookId
        baseBookIds = [],
        recordCheck = [],
        _noResourceStatisticsDTO = {
            bookName: "",
            author: "",
            publisher: "",
            isbn: "",
            seriesTitle: "",
            currentPage: 1,
         },
        pagination = {};
    function _init(conf) {
        $.extend(_conf, conf);
        _initData();
        _initVue();
        getListData((data)=>{
            _initPanelData(data)
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
    function _initData() {
        viewModel = {};
        pagination = {
            currentPage: 1,
            pageSize: 10
        };
        viewModel.head = [{
            name: "序号",
            width: "5",
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
        },{
            name: "书名",
            width: "15",
            align: "center",
            vAlign: "middle",
            noWrap: "nowrap",
            bgColor: "#f6f7fb",
            style: "padding: 0.8% 1%;border-bottom: 1px solid #eceff8;line-height: 16px"
        }, {
            name: "作者",
            width: "10",
            align: "center",
            vAlign: "middle",
            noWrap: "nowrap",
            bgColor: "#f6f7fb",
            style: "padding: 0.8% 1%;border-bottom: 1px solid #eceff8;line-height: 16px"
        },
            {
                name: "出版社",
                width: "15",
                align: "center",
                vAlign: "middle",
                noWrap: "nowrap",
                bgColor: "#f6f7fb",
                style: "padding: 0.8% 1%;border-bottom: 1px solid #eceff8;line-height: 16px"
            },{
                name: "所属系列",
                width: "10",
                align: "center",
                vAlign: "middle",
                noWrap: "nowrap",
                bgColor: "#f6f7fb",
                style: "padding: 0.8% 1%;border-bottom: 1px solid #eceff8;line-height: 16px"
            },
            {
                name: "封面图片",
                width: "10",
                align: "center",
                vAlign: "middle",
                noWrap: "nowrap",
                bgColor: "#f6f7fb",
                style: "padding: 0.8% 1%;border-bottom: 1px solid #eceff8;line-height: 16px"
            },
            {
                name: "图像库BookID",
                width: "10",
                align: "center",
                vAlign: "middle",
                noWrap: "nowrap",
                bgColor: "#f6f7fb",
                style: "padding: 0.8% 1%;border-bottom: 1px solid #eceff8;line-height: 16px"
            },{
                name: "识别次数",
                width: "10",
                align: "center",
                vAlign: "middle",
                noWrap: "nowrap",
                bgColor: "#f6f7fb",
                style: "padding: 0.8% 1%;border-bottom: 1px solid #eceff8;line-height: 16px"
            }];
        viewModel.body = [];
        viewModel.align = "center";
        viewModel.result={};
        viewModel.result.bookName = "";
        viewModel.result.author = "";
        viewModel.result.publisher = "";
        viewModel.result.isbn = "";
        viewModel.result.seriesTitle = "";
        viewModel.isShowMessage = true;
        viewModel.dialogFormVisible = false;
        viewModel.title="提示";
        viewModel.checked = "" ;
        //选择所有
        viewModel.checkAll=false;
        viewModel.checkedItemList=[];
        viewModel.disabled = true;
        recordCheck = [];
        viewModel.isShow=true;
        viewModel.dialogConfirmFormVisible = false;
    };

    function _initVue() {
        let vw = new Vue({
            el : "#noResourceBookBody",
            data:viewModel,
            methods:{
                searchRecord:function() {
                    viewModel.body = [];
                    recordCheck = [];
                    pagination.currentPage = 1;
                    recordCheck = [];
                    viewModel.disabled=true;
                    _getRequestParameter();
                    getListData((data)=>{
                        _initPanelData(data);
                    });
                },
                //清空按钮事件
                clearSearchData:_clearSearchDataEventHandle,
                handleClose:function () {
                    viewModel.dialogFormVisible = false;
                },
                handleConfirmClose:function(){
                  viewModel.dialogConfirmFormVisible = false;
                },
                exportEvent:exportRecordEvent,

                delItemsEvent:deleteItemsEvent,

                openHint:function() {
                    viewModel.dialogConfirmFormVisible = true;
                },
                closeViewer:function(){

                },
                handleCheckAllChange:function (val) {

                   let page = pagination.currentPage;
                   if(val) {
                       let item = {
                           page:0,
                           baseBookIds:[],
                           isAll:true
                       };
                       item.page = page;
                       viewModel.checkedItemList = viewModel.body.forEach((e) => {
                           e.seleced = val;
                           item.baseBookIds.push(e.baseBookId);
                       });
                       recordCheck.push(item);
                       viewModel.disabled =false;
                   } else {
                       recordCheck=[];
                       viewModel.checkAll = false;
                       viewModel.body.forEach((e)=>{
                           e.seleced = false;
                       });
                      viewModel.disabled = true;
                   }

                },
                handleCheckedItemChange:function (val,baseBookId) {
                    if(val.target.checked){

                        let index = -1;
                        for (i = 0; i < recordCheck.length; i++){
                            if(recordCheck[i].page === parseInt(pagination.currentPage)){
                                index = i;
                                break;
                            }
                        }
                        if(index == -1){
                            let item = {
                                page:0,
                                baseBookIds:[],
                                isAll:false
                            };
                            item.page = pagination.currentPage;
                            item.baseBookIds.push(baseBookId);
                            recordCheck.push(item);
                        } else {
                            recordCheck[index].baseBookIds.push(baseBookId);
                        }
                        viewModel.disabled = false;
                    } else {
                        if(viewModel.checkAll){
                            viewModel.checkAll = false;
                        }
                    //    去掉记录里
                        let startIndex = -1;
                        for (let i = 0; i < recordCheck.length; i++) {
                            if(recordCheck[i].page == parseInt(pagination.currentPage)){
                                startIndex = i;
                                break;
                            }
                        }
                        if(startIndex != -1){
                           if(recordCheck[startIndex].baseBookIds.length <= 1){
                               recordCheck.splice(startIndex, 1);
                           } else {
                               let index = -1;
                               for (let i = 0; i <recordCheck[startIndex].baseBookIds.length; i++){
                                   if(recordCheck[startIndex].baseBookIds[i] == baseBookId){
                                       index = i;
                                       if(recordCheck[startIndex].isAll){
                                           recordCheck[startIndex].isAll = false;
                                       }
                                       break;
                                   }
                               }
                               recordCheck[startIndex].baseBookIds.splice(index,1);

                           }
                        }
                        if(recordCheck.length <= 0){
                            viewModel.disabled = true;
                        }
                    }
                },
                exportOrDel:_exportOrDel,
                exportNoDel: _exportNoDel,
            }
        })
    };

    function _initPanelData(data) {
        let tableBody = [];
        let index = -1;
        if(recordCheck.length != 0) {
            for (let i = 0; i < recordCheck.length; i++) {
                if (recordCheck[i].page == parseInt(pagination.currentPage)) {
                    index = i;
                    break;
                }
            }
        }
        for (let i = 0; i < data.data.length; i++) {
            data.data[i]['src']="static/images/ico30.jpg";
            data.data[i]['srcList'] = [data.data[i].coverImage];
            data.data[i].seleced = false;
            viewModel.checkAll = false;
            if (index != -1){
                if(recordCheck[index].isAll){
                   viewModel. checkAll = true;
                   data.data[i].seleced = true;
                   viewModel.disabled = false;
                } else {
                    for (let j = 0; j < recordCheck[index].baseBookIds.length; j++) {
                        if (recordCheck[index].baseBookIds[j] == data.data[i].baseBookId) {
                            data.data[i].seleced = true;
                            viewModel.disabled = false;
                        }
                    }
                }
            }
            data.data[i].number = i+1;
            tableBody.push(data.data[i]);
            baseBookIds.push(parseInt(data.data[i].number));
        }
        viewModel.body = [];
        viewModel.body = tableBody;
        let paginationParam = {
            currentPage: pagination.currentPage,
            totalPages: data.pagination.pages,
            parentElement: '#messageCenter_pagination',
            callback: function (index) {
                pagination.currentPage = index;
                _noResourceStatisticsDTO.currentPage = index;
                getListData((data)=>{
                    _initPanelData(data);
                });
            }
        };
        util.makePagination(paginationParam)
    };
    //清空按钮事件
    function _clearSearchDataEventHandle() {
        viewModel.result.bookName = "";
        viewModel.result.author = "";
        viewModel.result.publisher = "";
        viewModel.result.isbn = "";
        viewModel.result.seriesTitle = "";
        viewModel.body = [];
        recordCheck=[];
        viewModel.disabled = true;
        _clearNoResourceStatisticsDTO();
        getListData((data)=>{
           _initPanelData(data);
        });
    };
    //请求获得数据的event
    function getListData(callback) {
        $.ajax({
            url: _conf.LIST_NO_RESOURCE_BOOK,
            dataType: "json",
            type: 'POST',
            contentType: "application/json",
            data:  JSON.stringify(_noResourceStatisticsDTO),
            async: false,
            success: function (data) {
                if(data.code === 0){
                    if(callback != null){
                        callback(data.data);
                    }
                } else {
                    layer.msg(""+data.msg);
                }
            },error : function(){
                layer.msg("服务异常");
            }
        })
    };
    function delRequest(deleteBaseBookIds,callback) {
        $.ajax({
            url: _conf.DELETE_NO_RESOURCE_RECORD,
            type: 'POST',
            data: JSON.stringify(deleteBaseBookIds),
            dataType: "json",
            contentType: "application/json",
            success:function (data) {
                if(data.code == 0){
                    if(callback != null){
                        callback();
                    }
                } else {
                    layer.msg(data.msg);
                }
            },error:function () {
               layer.msg("服务异常");
            }
        });

    };
    //批量删除数据
    function deleteItemsEvent() {
        let ids = [];
        for (let i = 0; i < recordCheck.length;i++){
            for (let j = 0 ; j <recordCheck[i].baseBookIds.length; j++){
                ids.push(recordCheck[i].baseBookIds[j]);
            }
        }
        delRequest(ids,()=>{
            viewModel.dialogConfirmFormVisible = false;
            recordCheck = [];
            viewModel.disabled = true;
            viewModel.checkAll = false;
            _noResourceStatisticsDTO.currentPage = 1;
            getListData((data)=>{
              _initPanelData(data);
           });
        });
    };
    //导出数据
    function exportRecordEvent() {
        viewModel.dialogFormVisible = true;
    };
    function _exportRequest(ids,url,del,callback) {
        $.ajax({
            url: url,
            type: 'POST',
            data: JSON.stringify(ids),
            dataType: "json",
            contentType: "application/json",
            success:function (data) {
                if(data.code == 0){
                    if(callback != null){
                        callback(data.data);
                    }
                } else {
                    layer.msg(data.msg);
                }
            },error:function () {
                layer.msg("服务异常");
            }
        });
    };
    //请求参数
    function _getRequestParameter() {
        _noResourceStatisticsDTO.bookName = viewModel.result.bookName;
        _noResourceStatisticsDTO. author = viewModel.result.author;
        _noResourceStatisticsDTO. publisher = viewModel.result.publisher;
        _noResourceStatisticsDTO.isbn = viewModel.result.isbn;
        _noResourceStatisticsDTO.seriesTitle = viewModel.result.seriesTitle;
        _noResourceStatisticsDTO.currentPage = pagination.currentPage;
    };
    //清空dto数据
    function _clearNoResourceStatisticsDTO() {
        _noResourceStatisticsDTO.bookName = "";
        _noResourceStatisticsDTO. author = "";
        _noResourceStatisticsDTO. publisher = "";
        _noResourceStatisticsDTO.isbn = "";
        _noResourceStatisticsDTO.seriesTitle = "";
        _noResourceStatisticsDTO.currentPage = 1;
    };

    function _exportOrDel() {
        let ids=[];
        for (let i = 0 ; i <recordCheck.length; i++ ){
            for (let j = 0; j <recordCheck[i].baseBookIds.length; j++ ){
                ids.push(parseInt(recordCheck[i].baseBookIds[j]));
            }
        }
        _exportRequest(ids,_conf.EXPORT_OR_DEL_URL,true,(data)=>{
            var excelData = data;
            for (let i = 0; i <data.length; i++ ){
                data[i].number = i+1;
            }
            var newArr = excelData.map((e)=>(
                {
                    '序号': e.number,
                    'isbn':e.isbn,
                    '书名':e.bookName,
                    '作者': e.author,
                    '出版社':e.publisher,
                    '所属系列':e.seriesTitle,
                    '封面图':e.coverImage,
                    '图像库BookId':e.baseBookId,
                    '识别次数':e.recognitionTimes
                }));
            Excel.download(newArr,"无资源书本信息"+".xlsx");
            _noResourceStatisticsDTO.currentPage = 1;
            pagination.currentPage = 1;
            getListData((data)=>{
                recordCheck=[];
                viewModel.checkAll = false;
                viewModel.dialogFormVisible = false;
                viewModel.disabled = true;
                _initPanelData(data);
            });
        });
    };
    function _exportNoDel() {
        let ids=[];
        for (let i = 0 ; i <recordCheck.length; i++ ){
            for (let j = 0; j <recordCheck[i].baseBookIds.length; j++ ){
                ids.push(recordCheck[i].baseBookIds[j]);
            }
        }
        _exportRequest(ids,_conf.EXPORT_NO_DEL_URL,false,(data)=>{
            var excelData = data;
            for ( let i = 0; i < data.length; i++){
                data[i].number = i+1;
            }
            var newArr = excelData.map((e)=>(
                {
                    '序号': e.number,
                    'isbn':e.isbn,
                    '书名':e.bookName,
                    '作者': e.author,
                    '出版社':e.publisher,
                    '所属系列':e.seriesTitle,
                    '封面图':e.coverImage,
                    '图像库BookId':e.baseBookId,
                    '识别次数':e.recognitionTimes
                }));
            Excel.download(newArr,"无资源书本信息"+".xlsx");
            getListData((data)=>{
                recordCheck=[];
                viewModel.checkAll = false;
                viewModel.dialogFormVisible = false;
                viewModel.disabled = true;
                _initPanelData(data);
            });
        });
    };
    return{
        init : function(conf) {
            _init(conf);
        }
    }
})();

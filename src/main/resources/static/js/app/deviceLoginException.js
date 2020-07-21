wantong.app ={};
wantong.app.deviceLoginException = (function () {

    let _conf = {}
        ,vmData = null,
        pagination = {},
        URL = {
            GET_DEVICE_LOGIN_EXCEPTION:"/app/getDeviceIdLoginException.do",
            DELETE_DEVICE_LOGIN_EXCEPTION:"/app/delLoginExceptionRecord.do",
            DOWNLOAD_EXCEL_URL:"/app/deviceExcelDownload.do"
        };

    function _init(conf) {
        $.extend(_conf, conf);
        initData();
        initVue();
        getDeviceLoginException((data)=>{
            initPanelData(data);
        })

    };

    function initData() {
        vmData = {};
        pagination = {
            currentPage : 1,
            pageSize : 12
        };
        vmData.tableData = {};
        vmData.isShowMessage = true;
        vmData.activeName = "0";
        vmData.searchText = "";
    };

    function initPanelData(data) {
        vmData.tableData = [];
        if(data.result != null){
            if(data.result.length == 0 && pagination.currentPage != 1){
                pagination.currentPage = pagination.currentPage - 1;
                getDeviceLoginException((data)=>{
                    initPanelData(data)
                });
                return;
            }

            vmData.tableData = data.result;
        }

        let paginationParam = {
            currentPage: pagination.currentPage,
            totalPages: data.pagination.pages,
            parentElement: '#messageCenter_pagination',
            callback: function (index) {
                pagination.currentPage = index;
                getDeviceLoginException((data)=>{
                    initPanelData(data)
                });
            }
        };
        util.makePagination(paginationParam);
    };

    function getDeviceLoginException(callBack) {
        $.ajax({
            url: URL.GET_DEVICE_LOGIN_EXCEPTION+"?appId="+_conf.appId+"&currentPage="+pagination.currentPage+
                "&status="+vmData.activeName+"&searchText="+vmData.searchText,
            type:'GET',
            contentType : "application/json",
            success : function(data) {
                if(data.code === 0){
                    if(callBack != null){
                        callBack(data.data);
                    }
                } else {
                    layer.msg(data.msg);
                }
            },
            error:function(){
                layer.msg("服务错误");
            }
        })
    };

    function confirmForbidden(id,callBack) {
      let index =  layer.confirm('确定禁用此设备ID吗?', {
            btn: ['确认','取消'] //按钮
        }, function(){
           forExceptionRecord(id,index, callBack);
        }, function(){
            layer.close(index);
        });
    };

    //禁用设备ID
    function forExceptionRecord(id,index,callBack) {
        $.ajax({
            url : URL.DELETE_DEVICE_LOGIN_EXCEPTION + "?id="+id,
            type:'GET',
            contentType : "application/json",
            async : false,
            success : function(data) {
                if(data.code === 0){
                    layer.close(index);
                    if(callBack != null){
                        callBack();
                    }
                } else {
                    layer.msg(data.msg);
                }
            },
            error : function() {
                layer.msg("服务异常");
            }
        })
    };

    function initVue() {
        let VM = new Vue({
            el:"#error_page",
            data:vmData,
            methods : {
                indexMethod:function(index) {
                    return index + 1;
                },
                handleClick:function () {
                    handleClick();
                },
                cleanClick:function () {
                  cleanClick();
                },
                forbiddenClick: function (id) {
                    confirmForbidden(id, () => {
                        getDeviceLoginException((data) => {
                            initPanelData(data);
                        })
                    });
                },
              exportExcel:function () {
                exportExcel();
              },
            },

            watch:{
                tableData:function() {
                    this.$nextTick(function () {
                        $(".el-table__row").each(function () {
                            let   str =  $(this).find("td")[1].children[0].innerHTML;
                            if(str != "设备ID") {
                                $($(this).find("td")[1].children[0]).attr("title",str);
                            }
                        }) ;
                    });
                }
            }
        })
    };

    function handleClick() {
        getDeviceLoginException((data)=>{
            initPanelData(data);
        });
    };

    function cleanClick() {
        vmData.searchText = "";
        getDeviceLoginException((data)=>{
            initPanelData(data);
        });
    };

    function exportExcel() {
        window.open(
            URL.DOWNLOAD_EXCEL_URL + "?appId=" + _conf.appId);
    }

    return{
        init:function(conf) {
            _init(conf);
        }
    }
})();

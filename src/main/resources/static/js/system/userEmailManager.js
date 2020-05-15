var wantong = wantong || {};
wantong.userEmailManager = (function () {
    var _conf = {
        USER_EMAIL_URL:"/system/userSetEmailList.do",
        PARTNER_USER_INFO_URL:"/system/partnerUserEmail.do",
        SAVE_DATA_URL:"/system/saveUserSetData.do"
    },
    viewModel = null,
    pagination = {},
    changeData = new Map(),
    userEmailData = {
        isAdd:true,
        removeOld:false,
        data:[]
    };
    function _init(conf) {
        $.extend(_conf, conf);
        _initData();
        _initVue();
        _initPanelData();
    };
    function _initVue() {
        let vw = new Vue({
            el : "#userEmailBody",
            data:viewModel,
            methods:{
                emailManagerEvent:_emailManagerEvent,
                saveMessageCenterData:_saveDataMethod,
                change (e) {
                    this.$forceUpdate()
                },
                handleClose(){
                    viewModel.digUserData = [];
                    viewModel.dialogFormVisible = false;
                },
                //处理选择图像管理的复选框的处理
                handleCheckedChange(value,tid,checkList){
                    console.log(`checked:${tid}`);
                    //value 的长度为0 说明都取消掉
                    if(value.length == 0) {
                        checkBoxHandle(tid,false,[0],0)
                    } else {
                        if(checkList.length == 1) {
                            if(checkList[0] == "版本升级通知"){
                                checkBoxHandle(tid, true,[1],1);
                            } else if(checkList[0] == "图像修改通知") {
                                checkBoxHandle(tid, true,[2],1);
                            } else {
                                checkBoxHandle(tid, true,[3],1);
                            }
                        } else if(checkList.length == 2){
                            if(checkList.indexOf("版本升级通知") != -1 && checkList.indexOf("图像修改通知") != -1){
                                checkBoxHandle(tid, true,[1,2],2);

                            } else if(checkList.indexOf("版本升级通知") != -1 && checkList.indexOf("授权数量不足通知") != -1){
                                checkBoxHandle(tid, true,[1,3],2);
                            } else {
                                checkBoxHandle(tid, true,[2,3],2);
                            }

                        }else {
                            checkBoxHandle(tid, true,[1,2,3],3);
                        }
                    }
                }
            }
        })
    };
    function _initData() {
        viewModel = {};
        pagination = {
            currentPage: 1,
            pageSize: 10
        };
        viewModel.isShowMessage = true;
        viewModel.tableData = {};
        viewModel.diglogHead =[{
            name: "序号",
            width: "10",
            align: "center",
            vAlign: "middle",
            noWrap: "nowrap",
            bgColor: "#f6f7fb",
            style: "padding: 0.8% 1%;border-bottom: 1px solid #eceff8;line-height: 16px"
        },{
            name: "收件人",
            width: "15",
            align: "center",
            vAlign: "middle",
            noWrap: "nowrap",
            bgColor: "#f6f7fb",
            style: "padding: 0.8% 1%;border-bottom: 1px solid #eceff8;line-height: 16px"
        },{
            name: "角色",
            width: "25",
            align: "center",
            vAlign: "middle",
            noWrap: "nowrap",
            bgColor: "#f6f7fb",
            style: "padding: 0.8% 1%;border-bottom: 1px solid #eceff8;line-height: 16px"
        }, {
            name: "收件类型",
            width: "50",
            align: "center",
            vAlign: "middle",
            noWrap: "nowrap",
            bgColor: "#f6f7fb",
            style: "padding: 0.8% 1%;border-bottom: 1px solid #eceff8;line-height: 16px"
        }];
        viewModel.head = [{
            name: "序号",
            width: "15",
            align: "center",
            vAlign: "middle",
            noWrap: "nowrap",
            bgColor: "#f6f7fb",
            style: "padding: 0.8% 1%;border-bottom: 1px solid #eceff8;line-height: 16px"
        },{
            name: "收件人",
            width: "25",
            align: "center",
            vAlign: "middle",
            noWrap: "nowrap",
            bgColor: "#f6f7fb",
            style: "padding: 0.8% 1%;border-bottom: 1px solid #eceff8;line-height: 16px"
        },{
            name: "角色",
            width: "25",
            align: "center",
            vAlign: "middle",
            noWrap: "nowrap",
            bgColor: "#f6f7fb",
            style: "padding: 0.8% 1%;border-bottom: 1px solid #eceff8;line-height: 16px"
        }, {
                name: "收件类型",
                width: "35",
                align: "center",
                vAlign: "middle",
                noWrap: "nowrap",
                bgColor: "#f6f7fb",
                style: "padding: 0.8% 1%;border-bottom: 1px solid #eceff8;line-height: 16px"
        }];
        viewModel.align = "center";
        viewModel.body = [];
        viewModel.digUserData = [];
        viewModel.title="管理收件人";
        viewModel.dialogFormVisible = false;
    };
    function _initPanelData() {
        $.get(_conf.USER_EMAIL_URL,{currentPage: pagination.currentPage},function (data) {
            if(data.code == 0){
                let tableBody = [];
                for (let i = 0; i < data.data.list.length; i++) {
                    tableBody.push(data.data.list[i]);
                }
                viewModel.body = [];
                viewModel.body = tableBody;
                let paginationParam = {
                    currentPage: pagination.currentPage,
                    totalPages: data.data.pagination.pages,
                    parentElement: '#messageCenter_pagination',
                    callback: function (index) {
                        pagination.currentPage = index;
                        _initPanelData();
                    }
                };
                util.makePagination(paginationParam)
            }
        });
    };
    function _setUserMessageMethod(){

    };
    function _saveDataMethod() {
        let list = new Array();
        let isHasVersionUpdate = false;
        let isHasImageChange = false;
        let isSendQrCodeChange = false;
        for (let i = 0; i < viewModel.digUserData.length; i++) {
            if (viewModel.digUserData[i].checkList.length > 0) {
                let e = viewModel.digUserData[i];
                for (let j = 0; j < e.checkList.length; j++) {
                    if (e.checkList[j] == "版本升级通知") {
                        isHasVersionUpdate = true;
                    } else if (e.checkList[j] == "图像修改通知") {
                        isHasImageChange = true;
                    } else if(e.checkList[j] == "授权数量不足通知"){
                        isSendQrCodeChange = true;
                    }
                }
                   if (isHasVersionUpdate && isHasImageChange && isSendQrCodeChange) {
                       break;
                   }
                }
        }
        if(!(isHasVersionUpdate && isHasImageChange && isSendQrCodeChange)){
            layer.msg("每种邮件最少需要一位收件人");
            return;
        }
        changeData.forEach(function(value,key){
            let data = {
                adminId:key,
                isAdd:value.isAdd,
                removeOld:value.removeOld,
                types:value.data
            }
            list.push(data);
        });
        console.log("----------------->> 保存数据",list);
        $.ajax({
            url: _conf.SAVE_DATA_URL,
            type: 'POST',
            data: JSON.stringify(list),
            dataType: "json",
            contentType: "application/json",
            success:function (data) {
                if(data.code == 0){
                    viewModel.dialogFormVisible = false;
                    viewModel.digUserData = [];
                    changeData = new Map();
                    _initPanelData();
                }
            },error:function () {

            }
        });

    };
    function _emailManagerEvent() {
        // userSetEmailData = {};
        _loadDialogData(()=>{
            viewModel.dialogFormVisible = true;
        });
    };
    function _loadDialogData(callback) {
        $.get(_conf.PARTNER_USER_INFO_URL,{},function (data) {
            if(data.code == 0){
                let digUserData = [];
                for (let i = 0; i < data.data.list.length; i++) {
                    let tempData = data.data.list[i];
                    let checkData = {checkList:[]}
                    if(data.data.list[i].receiptTypes != null){
                        if(data.data.list[i].receiptTypes.length == 3){
                            checkData.checkList.push('版本升级通知');
                            checkData.checkList.push('图像修改通知');
                            checkData.checkList.push('授权数量不足通知');
                        }else if (data.data.list[i].receiptTypes.length == 2) {
                            for (let j =0 ; j < data.data.list[i].receiptTypes.length;j++){
                                if(data.data.list[i].receiptTypes[j] == 1){
                                    checkData.checkList.push('版本升级通知')
                                } else if(data.data.list[i].receiptTypes[j] == 2){
                                    checkData.checkList.push('图像修改通知');
                                } else {
                                    checkData.checkList.push('授权数量不足通知');
                                }
                            }
                        } else {
                            if(data.data.list[i].receiptTypes[0] == 1){
                                checkData.checkList.push('版本升级通知')
                            } else if(data.data.list[i].receiptTypes[0] == 2){
                                checkData.checkList.push('图像修改通知');
                            } else {
                                checkData.checkList.push('授权数量不足通知');
                            }
                        }
                    }
                    Object.assign(tempData,checkData);
                    digUserData.push(tempData);
                    // if(data.data.list[i])
                }
                viewModel.digUserData = [];
                viewModel.digUserData = digUserData;
                if(callback != null){
                    callback();
                }
            }
        });
    };
    function checkBoxHandle(adminId,checked,emailId,checkListLength) {
        if(checked == false){
            if (changeData.has(adminId)) {
                if(!changeData.get(adminId).removeOld) {
                    changeData.get(adminId).isAdd = false;
                    changeData.get(adminId).removeOld = true;
                    changeData.get(adminId).data = [];
                }
            } else {
                userEmailData = {
                    isAdd:true,
                    removeOld:false,
                    data:[]
                };
                userEmailData.isAdd = false;
                userEmailData.removeOld = true;
                changeData.set(adminId,userEmailData);
            }
        } else {
            if(changeData.has(adminId)){
                if(changeData.get(adminId).removeOld == true){
                    changeData.get(adminId).removeOld = false;
                    changeData.get(adminId).isAdd = true;
                    for (e in emailId){
                        changeData.get(adminId).data.push(e);
                    }
                } else {
                    changeData.get(adminId).data = emailId;
                }
            } else {
                userEmailData = {
                    isAdd:true,
                    removeOld:false,
                    data:[]
                };
                userEmailData.data = emailId;
                changeData.set(adminId,userEmailData);
            }
        }
    };
    return{
        init:function (conf) {
            _init(conf);
        }
    }
})();
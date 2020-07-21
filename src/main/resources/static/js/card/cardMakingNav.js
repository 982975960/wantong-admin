wantong.cardMakingNav = (function () {
    let _conf = {
            cardId:0,
            //获得用户的卡片套装
            USER_CARD_GROUP_URL:"/card/cardGroup.do",
            GROUP_CARD_LIST_URL:"/card/cardInfoList.do",
            DELETE_CARD_INFO_URL:"/card/deleteCardInfo.do",
            SHOW_CARD_PAGE_URL:"/card/showCardPageFrame.do",
            CHANGE_CARD_STATE:"/card/changeCardStateIntoResource.do",
            CHANGE_CARD_STATE_TO_TRAIN:"/card/changeCardStateIntoWaitTrain.do",
            START_TRAIN_TASK_URL:"/card/startTrainTask.do",
            CHANGE_GROUP_CARD_TO_EDIT:"/card/moveCardIntoResourceEditState.do",
            CAHNGE_GROUP_TRAIN_URL:"/card/intoTrain.do"
        },
        _onlySave = '<div id = "onlySave" style= "text-align: center;margin-top: 40px">'
            + '<button type="button" class="btn btn-primary">仅退出，信息还需完善</button></div>',
        _changeBookStatus = '<div id = "changeBookStatus" style="text-align: center;margin-top: 30px">'
            + '<button type="button" class="btn btn-primary">已完成，移至资源待编辑</button></div>',
        _onlySave_resouce = '<div id = "onlySaveNext" style= "text-align: center;margin-top: 40px">'
            + '<button type="button" class="btn btn-primary">仅退出，信息还需完善</button></div>',
        _changeBookStatus_resouce = '<div id = "changeBookStatusNext" style="text-align: center;margin-top: 30px">'
            + '<button type="button" class="btn btn-primary">已完成，移至待训练</button></div>',
        _hintIndex = null,
        _changeImageTip = false, //在已发布修改图片保存后是否需要提示
        viewModel = {};
    function _init(conf) {
        $.extend(_conf, conf);
        _initViewModelData();
        // 初始化套装
        _initUserCardGroup(()=> {
            //初始化cardList的列表
            _initGroupCardInfoList((data) => {
                _initCardListPanel(data);
            });
        });
        //出事化vue
        _initVue();

        _initItemEvent();
    };
    //初始化viewModel的数据
    function _initViewModelData() {
       viewModel.currentTabName = "待采样";
       viewModel.canAddCard = true;
        //导航栏列表
        viewModel.navList = [{
            tab: 0,
            id:"editCardListTab",
            name:"待采样",
            class:"active",
            cardCount:0,
            paginationId:"editCardListPagination",
            isShowPagination:true,
            tabStyle:{
                display : "block"
            },
            pagination:{
                currentPage : 1,
                pageSize : 18
            },
            status:[0]
        },{
            tab: 1,
            id:"editCardResourceListTab",
            name:"资源待编辑",
            class:"",
            cardCount:0,
            paginationId:"editCardResourceListPagination",
            isShowPagination:true,
            tabStyle:{
                display : "none"
            },
            pagination:{
                currentPage : 1,
                pageSize : 18
            },
            status:[1]
        },{
            tab: 2,
            id:"unpublishedBookListTab",
            name:"待训练",
            class:"",
            cardCount:0,
            paginationId:"unpublishedPagination",
            isShowPagination:true,
            tabStyle:{
                display : "none"
            },
            pagination:{
                currentPage : 1,
                pageSize : 18
            },
            status:[2,3]
        },{
            tab: 3,
            id:"inProgressBookListTab",
            name:"训练中",
            class:"",
            cardCount:0,
            paginationId:"inProgressBookListPagination",
            isShowPagination:true,
            tabStyle:{
                display : "none"
            },
            pagination:{
                currentPage : 1,
                pageSize : 18
            },
            status:[4]
        },{
            tab: 4,
            id:"publishedBookListTab",
            name:"已发布",
            class:"",
            cardCount:0,
            paginationId:"publishedBookListPagination",
            isShowPagination:true,
            tabStyle:{
                display : "none"
            },
            pagination:{
                currentPage : 1,
                pageSize : 18
            },
            status:[5]
        }];
        viewModel.currentCardGroupId = null;
        viewModel.cardGroup = [];
        viewModel.currentTab = 0;
        //主题数据
        viewModel.body = [];
    };

    function _initVue() {
        let vm = new Vue({
            el:"#cardList",
            data:viewModel,
            methods : {
                //切换卡片套装
                cardGroupChange:_cardGroupChangeEventHandle,
                //切换navTab的事件
                changeTab:_changeTabEventHandle,
                //点击将卡片移至资源待编辑模块
                moveCardToEditResEvent:_moveCardToEditResEventHandle,
                //添加卡片的事件处理
                addCardEvent:_addCardEventHandle,
                //添加卡片的事件处理
                moveCardToWaitTrainEvent:_moveCardToWaitTrainEventHandle,
                //移动卡片到训练
                moveCardToTrainEvent:_moveCardToTrainEventHandle,
                thumbnailContainerMouseOver:_thumbnailContainerMouseOver,
                thumbnailContainerMouseOut:_thumbnailContainerMouseOut,
                dlClassMouseOver:_dlClassMouseOver,
                dlClassMouseOut:_dlClassMouseOut,
                proWindowLeave:_proWindowLeave,
                proWindowIcoClick:_proWindowIcoClick,
                clickPicture:_clickPicture,
                editCardClick:_editCardClick,
                deleteCard:_deleteCard,
            }
        });
    };

    function _initItemEvent() {
        $("body").off("click", "#onlySave .btn").on("click", "#onlySave .btn",function () {
            layer.closeAll();
            _refreshList();
        });

        $("body").off("click", "#changeBookStatus .btn").on("click",
            "#changeBookStatus .btn", function () {
            $.ajax({
                url:_conf.CHANGE_CARD_STATE,
                type: "POST",
                async: false,
                data:{
                    cardId:_conf.cardId
                },
                success : function(data) {
                    if(data.code == 0){
                        layer.closeAll();
                        _refreshList();
                    }else {
                        layer.msg(data.msg);
                    }
                },
                error:function () {
                    layer.msg("服务异常");
                }
            });
        });
        $("body").off("click", "#onlySaveNext .btn").on("click", "#onlySaveNext .btn",function () {
            layer.closeAll();
            _refreshList();
        });

        $("body").off("click", "#changeBookStatusNext .btn").on("click",
            "#changeBookStatusNext .btn", function () {
                $.ajax({
                    url:_conf.CHANGE_CARD_STATE_TO_TRAIN,
                    type: "POST",
                    async: false,
                    data:{
                        cardId:_conf.cardId
                    },
                    success : function(data) {
                        if(data.code == 0){
                            layer.closeAll();
                            _refreshList();
                        }else {
                            layer.msg(data.msg);
                        }
                    },
                    error:function () {
                        layer.msg("服务异常");
                    }
                });
        });
    };
    //初始化获得用户卡片库套装列表
    function _initUserCardGroup(callback) {
        $.get(_conf.USER_CARD_GROUP_URL,{},function(data) {
           if(data.code === 0){
             for (let i = 0; i < data.data.cardGroupList.length; i++){
                 let item = data.data.cardGroupList[i];
                 let group = {};
                 group.id = item.id;
                 group.name = item.name;
                 viewModel.cardGroup.push(group);
             }
             viewModel.currentCardGroupId = viewModel.cardGroup[0].id;
             if(callback != null){
                 callback();
             }
           } else {
               viewModel.canAddCard = false;
               layer.msg(data.msg);
           }
        });
    };
    //获取cardList的列表
    function _initGroupCardInfoList(callback) {
        $.ajax({
            url:_conf.GROUP_CARD_LIST_URL,
            type:"POST",
            dataType:"json",
            contentType: "application/json",
            data: JSON.stringify(cardVOSetValue()),
            async : false,
            success : function(data) {
                if(data.code === 0){
                    if(callback != null){
                        callback(data.data);
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
    //初始化card列表的数据
    function _initCardListPanel(data) {
        viewModel.body = [];

        for (let i = 0; i < data.cardInfoDTOList.length;i++) {
            data.cardInfoDTOList[i].buttonContainerStyle = {
                visibility:"hidden"
            };
            data.cardInfoDTOList[i].proWindowIcoStyle={
                visibility:"hidden"
            };
            data.cardInfoDTOList[i].proWindowBoxStyle = {
                display:"none"
            };
            viewModel.body.push(data.cardInfoDTOList[i]);
        }
        viewModel.navList[viewModel.currentTab].cardCount = data.pagination.totalRecord;
        let paginationParam = {
            currentPage: viewModel.navList[viewModel.currentTab].pagination.currentPage,
            totalPages: data.pagination.pages,
            parentElement: '#'+viewModel.navList[viewModel.currentTab].paginationId,
            callback: function (index) {
                viewModel.navList[viewModel.currentTab].pagination.currentPage = index;

                _initGroupCardInfoList((data)=>{
                    _initCardListPanel(data)
                });
            }
        };
        util.makePagination(paginationParam);
    };
    //切换卡片套装
    function _cardGroupChangeEventHandle(e){
        //切换模块时 需要去重新加载界面的卡片数据
        viewModel.navList[viewModel.currentTab].pagination = {
            currentPage : 1,
            pageSize : 18
        };
        _initGroupCardInfoList((data)=>{
            _initCardListPanel(data);
        });
    };
    //切换tab的事件
    function _changeTabEventHandle(event,e){
        event.srcElement.blur();
        viewModel.currentTabName = e.name;
        viewModel.navList[viewModel.currentTab].pagination = {
            currentPage : 1,
            pageSize : 18
        };
        viewModel.currentTab = e.tab
        for (let i = 0; i< viewModel.navList.length; i++){
            if(viewModel.navList[i].tab == e.tab){
                viewModel.navList[i].class ="active";
                viewModel.navList[i].tabStyle = {
                    display : "block"
                }
            } else {
                viewModel.navList[i].class ="";
                viewModel.navList[i].tabStyle = {
                    display : "none"
                }
            }
        }

        _initGroupCardInfoList((data)=>{
            _initCardListPanel(data);
        });
    };
    //在资源待编辑中将所有卡片移至资源待编辑
    function _moveCardToEditResEventHandle(e) {
        e.srcElement.blur();
       let index =  layer.confirm(
            "确认将改套装下的所有卡片全部移至资源待编辑吗？",
            {
                btn:["确认","取消"],
                title:"提示"
            },function() {
               $.ajax({
                   url:_conf.CHANGE_GROUP_CARD_TO_EDIT,
                   type:"post",
                   async : false,
                   data:{
                       groupId:viewModel.currentCardGroupId
                   } ,
                   success : function(data) {
                       if(data.code == 0){
                           _refreshList();
                       } else {
                           layer.msg(data.msg);
                       }
                   },
                   error : function() {
                       layer.msg("服务异常");
                   }
               }).always(function(){
                   layer.close(index);
               });
            },function() {
                layer.close(index);
            });

    };
    //添加卡片的事件处理
    function _addCardEventHandle(e) {
        e.srcElement.blur();
        _editCardClick();
    };
    //移动卡片到待训练
    function _moveCardToWaitTrainEventHandle(e) {
        e.srcElement.blur();
        $.ajax({
            url:_conf.CAHNGE_GROUP_TRAIN_URL,
            type:"POST",
            data:{
                groupId:viewModel.currentCardGroupId
            },
            async:false,
            success : function(data) {

                if(data.code == 0){
                    _refreshList();
                }else {
                    layer.msg(data.msg);
                }
            },error:function () {

                layer.msg("服务异常");
            }
        })
    };
    //移动卡片到训练
    function _moveCardToTrainEventHandle(e) {
        e.srcElement.blur();
        $.post(_conf.START_TRAIN_TASK_URL, {
            groupId: viewModel.currentCardGroupId
        }, function () {
            setTimeout(function () {
                $("#3").click();
            }, 500);

        });
    };
    //获取参数VO
    function cardVOSetValue() {
        let cardInfoVO = {};
        cardInfoVO.cardGroupId = viewModel.currentCardGroupId;
        cardInfoVO.status = viewModel.navList[viewModel.currentTab].status;
        cardInfoVO.pagination = viewModel.navList[viewModel.currentTab].pagination;
        return cardInfoVO;
    };
    //鼠标移入
    function _thumbnailContainerMouseOver(item) {
        if(viewModel.currentTab == 3){
            item.buttonContainerStyle.visibility = "visible";
        }
    };
    //鼠标移除事件
    function _thumbnailContainerMouseOut(item) {
        if(viewModel.currentTab != 3){
            item.buttonContainerStyle.visibility = "hidden";
        }
    };

    function _dlClassMouseOver(item) {
        if(viewModel.currentTab != 3){
          item.proWindowIcoStyle.visibility = "visible";
        }
    };

    function _dlClassMouseOut(item) {
        if(item.proWindowBoxStyle.display != "block"){
            item.proWindowIcoStyle.visibility = "hidden";
        }
    };

    function _proWindowLeave(item) {
        item.proWindowIcoStyle.visibility = "hidden" ;
        item.proWindowBoxStyle.display = "none";
    };

    function _proWindowIcoClick(item) {
        item.proWindowBoxStyle.display = "block";
    };

    function _clickPicture(item) {
        if (viewModel.currentTab == 2 || viewModel.currentTab == 3){
            layer.msg("当前状态卡片不能被编辑");
            return;
        }
        _editCardClick(item);
    };

    function _editCardClick(item) {
        var cardId = 0;
        _conf.cardId = 0;
        var groupId =  viewModel.currentCardGroupId;
        if (item != undefined) {
            cardId = item.cardId;
            _conf.cardId = item.cardId;
        }
        $.get(_conf.SHOW_CARD_PAGE_URL + "?cardId=" + cardId+"&groupId="+groupId, {},
            function (data) {
                if (data.code != undefined) {
                    layer.msg(data.msg);
                } else {
                    //    打开界面
                    layer.open({
                        title: "添加卡片",
                        type: 1,
                        maxmin: false,
                        resize: false,
                        area: ['1200px', '800px'],
                        scrollbar: false,
                        content: data,
                        end: function () {
                            /*wantong.frame.showPageGet(GlobalVar.backPath, GlobalVar.data);*/
                            _refreshList();
                            wantong.addCardPageInfo.destory();
                        },
                        cancel:function () {
                            if(_conf.cardId == 0) {
                                if(wantong.addCardPageInfo.getCardId() == 0){
                                    return true;
                                } else {
                                    if (!wantong.addCardPageInfo.checkDataChange()) {
                                        _conf.cardId = wantong.addCardPageInfo.getCardId();
                                    }
                                }

                            }
                            //待采样模块
                            if(viewModel.currentTab == 0){
                                _showSaveCardHint();
                                return false;
                            } else if(viewModel.currentTab == 1){
                                showSaveCardHint2();
                                return false;
                            } else if(viewModel.currentTab == 4){
                                if (_changeImageTip){
                                    //修改了图片需要进行关闭提示
                                    layer.msg("因更新了图片，该卡片将进入到资源待编辑中");
                                }
                            }
                        }
                    })
                }
            });
    };

    function _refreshList() {
        //wantong.addCardPageInfo.voiceManager.stopAllAudio();
        _initGroupCardInfoList((data) => {
            _initCardListPanel(data);
        });
    };
    //删除card数据
    function _deleteCard(item) {
       let index =  layer.confirm("确定删除该卡片吗？",
            {btn:['确认','取消'],title:"提示"},
            function () {
                $.ajax({
                    url:_conf.DELETE_CARD_INFO_URL,
                    type:"POST",
                    data:{cardId:item.cardId},
                    async : false,
                    success : function(data) {
                        if(data.code == 0){
                            _refreshList();
                        } else {
                            layer.msg(data.msg);
                        }
                    },
                    error:function () {

                        layer.msg("服务异常");
                    }

                }).always(function(){
                   layer.close(index);
                });
            },function () {
                layer.close(index);
            });

    };

    function _showSaveCardHint() {
        let _content = _onlySave + _changeBookStatus;
        _hintIndex = layer.open({
            type: 1,
            shade: 0.3,
            title: false,
            area: ['300px', '200px'],
            content: _content,
            success: function (layero, index) {

            },
            cancel: function () {
                layer.close();
            }
        });
    };

    function showSaveCardHint2() {
        let _content = _onlySave_resouce + _changeBookStatus_resouce;
        _hintIndex = layer.open({
            type: 1,
            shade: 0.3,
            title: false,
            area: ['300px', '200px'],
            content: _content,
            success: function (layero, index) {

            },
            cancel: function () {
                layer.close();
            }
        });
    };

    function changeImageTip(isChange) {
        _changeImageTip = isChange;
    }

    return {
        init: function (conf) {
            _init(conf);
        },
        changeTip: function (isChange) {
            changeImageTip(isChange);
        }
    }
})();

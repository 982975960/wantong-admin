// 闭包 三个
wantong.cms ={};
wantong.cms.migration={};

//#submit
wantong.cms.migration.submit = (function () {
//  复制主界面
    let API_URL_SEARCH = "/api/cms/migration/search";
    let API_URL_CHECK = "/api/cms/migration/check";
    let API_URL_MIGRATE = "/api/cms/migration/migrate";
    let API_URL_CUT = "/api/cms/migration/cut";

    //vue监视对象 更新此对象，页面将随之自动更新
    let viewModel = {};

    let layer_index = -1;

    let pagination = {};

    let vueApp;

    //入口函数
    function _init() {
        _initObject();
        _instantiateVue();
        _bindEnterKeySearch();
    }
    function _bindEnterKeySearch() {
        $('input.search-box').keypress(function (e) {
            if (e.which == 13) {
                _search();
            }
        });
    }
    //设置partnerName、源repoList、目标repo
    function _setup(self, total) {
        viewModel.self = self;
        viewModel.total = total;
        viewModel.searchParam.repoId = self.repositoryVOList[0].repositoryId;

        //设置默认目标客户
        viewModel.targetPartnerId = self.partnerVO.partnerId;
        $("#targetPartnerName").val(viewModel.targetPartnerId);

        //jq chosen插件
        Vue.nextTick().then(function () {
            let $repo = $("#sourceRepoName");
            if ($("#sourceRepoName_chosen").size() === 0){
                //源资源库
                $repo.chosen({
                    allow_single_deselect: true,
                    search_contains: true,
                    width: '95%'
                });
                $repo.on("change", () => {
                    viewModel.searchParam.repoId = $("#sourceRepoName option:selected").val();
                    vueApp.sourceRepoChanged();
                });
                //目标客户名
                $("#targetPartnerName").chosen({
                    allow_single_deselect: true,
                    search_contains: true,
                    width: '95%'
                });
                $("#targetPartnerName").on("change", () => {
                    viewModel.targetPartnerId = $("#targetPartnerName").val();
                    vueApp.targetPartnerIdChanged();
                });
                //目标资源库
                $("#targetRepoName").chosen({
                    allow_single_deselect: true,
                    search_contains: true,
                    width: '95%'
                });
                $("#targetRepoName").on("change", () => {
                    viewModel.migrationRequest.targetRepoId = $("#targetRepoName").val();
                });
            }else {
                $("#sourceRepoName").trigger("chosen:updated");
                $("#targetPartnerName").trigger("chosen:updated");
                $("#targetRepoName").trigger("chosen:updated");
            }

        });
        _targetPartnerIdChanged();
    }
    //切换源客户
    function _switchSourcePartner(self, total) {
        _initObject();
        _setup(self, total);
    }
    //初始化vue监视对象
    function _initObject  () {

        //setup信息
        //自身
        viewModel.self = {};
        //可控 partner
        viewModel.total = [];

        viewModel.searchNone = false;

        //分页信息
        pagination.currentPage = 1;
        pagination.pages = 1;

        //目标合作商
        viewModel.targetPartnerId = -1;

        //搜索结果
        viewModel.books = [];//books结构看pojo

        //勾选 全部 搜索结果的书本
        viewModel.selectAll = false;

        //搜索请求参数
        viewModel.searchParam = {
                repoId: -1,

                bookName: "",
                isbn: "",
                press: "",
                series: "",
                edition: "",
                bookNumber: "",
                bookId: "",
                labelName: "",

                whole: false,

                forbidden: false,
                examined: false,
                examining: false,
                editing: false,

                currentPage: 1,
                pageSize: 16
            };
        viewModel.targetPartnerId=-1;
        viewModel.targetRepoList={};

        //迁移请求 参数
        viewModel.migrationRequest = {
            selectedBooks: [],
            targetRepoId: -1,
            normal: true,
            pointing:true,
            override: false,
            sourceRepoId: -1,
            isCutMode: false
        };
        //源和目标信息
        viewModel.sourceRepoName = "";
        viewModel.sourcePartnerName = "";
        viewModel.targetRepoName = "";
        viewModel.targetPartnerName = "";

        //查重有重的数
        viewModel.duplicatedBooks = [];

        //移动资源模式名
        viewModel.modeName = "复制";
    }
    //vue实例化
    function _instantiateVue (){
        vueApp = new Vue({
            el: "#migration_submit",
            data: viewModel,
            methods: {
                //这些方法的调用 在html里
                search: _search,
                migrationDialog: _migrationDialog,
                closeDialog: _closeDialog,
                nextStep: _nextStep,
                searchAllChanged: _searchAllChanged,
                selectAllChanged: _selectAllChanged,
                targetPartnerIdChanged: _targetPartnerIdChanged,
                searchStateChange: _searchStateChange,
                goCopy: _goCopy,
                overrideStateChanged: _overrideStateChanged,
                clearSearchInput: _clearSearchInput,
                sourceRepoChanged:function () {
                    viewModel.books=[];
                    $("#pagination_parent_migration_submit").empty();
                },
                bookOneSelectChanged: function (isSelected) {
                    if(isSelected != true){
                        viewModel.selectAll = false;
                    }else {
                        viewModel.selectAll = true;
                        viewModel.books.forEach(e=>{
                            if(e.onCopy != true && e.isSelected == false){
                                viewModel.selectAll = false;
                            }
                        })
                    }
                },
                changeMode: function (isCutMode) {
                    viewModel.migrationRequest.isCutMode = isCutMode;
                    viewModel.modeName = isCutMode ? "移动" : "复制";
                    if(isCutMode){
                        viewModel.migrationRequest.pointing = true;
                        viewModel.migrationRequest.normal = true;
                    }
                }
            }

        });
    }
    function _clearSearchInput() {
        viewModel.searchParam.bookName = "";
        viewModel.searchParam.isbn = "";
        viewModel.searchParam.press = "";
        viewModel.searchParam.series = "";
        viewModel.searchParam.edition = "";
        viewModel.searchParam.bookNumber = "";
        viewModel.searchParam.bookId = "";
        viewModel.searchParam.labelName = "";
    }
    //实际迁移请求
    function _goCopy() {

        let override = viewModel.migrationRequest.override;
        let passBooks = new Array();
        if (!override){
            //不覆盖，过滤重复的
            for (let one in viewModel.migrationRequest.selectedBooks) {
                if (viewModel.migrationRequest.selectedBooks[one] == -1) {
                    passBooks.push(one);
                }
            }

        }else {
            for (let one in viewModel.migrationRequest.selectedBooks) {
                    passBooks.push(one);
            }
        }

        viewModel.migrationRequest.selectedBooks = passBooks;
        viewModel.migrationRequest.sourceRepoId = viewModel.searchParam.repoId;
        layer.close(layer_index);
        $("#migration_confirm_dialog").css("display", "none");
        $("#migration_ready_dialog").css("display", "none");
        $('#migration_module').addClass("main-w");

        if (0 == viewModel.migrationRequest.selectedBooks.length){
            layer.msg("忽略全部，没有要复制的书");
            return;
        }



        if (viewModel.migrationRequest.isCutMode){
            $.post(API_URL_CUT,viewModel.migrationRequest,function (response) {
                if (response.code == 0){
                    layer.msg("资源移动成功，在任务列表，可查看移动详情");
                }else {
                    layer.msg(response.msg);
                }
                _search();
            });
        }else {
            $.post(API_URL_MIGRATE,viewModel.migrationRequest,function (response) {
                if (response.code == 0){
                    layer.msg("正在复制中，在任务列表，可查看复制进度");
                }
                _search();
            });
        }
    }
    function _overrideStateChanged() {
        viewModel.migrationRequest.override = !viewModel.migrationRequest.override;
    }
    function _searchStateChange() {
        let searchParam = viewModel.searchParam;
        if(
        searchParam.examined != true||
        searchParam.examining != true||
        searchParam.editing != true){
            searchParam.whole = false;
        }
        if(
            searchParam.examined == true&&
            searchParam.examining == true&&
            searchParam.editing == true){
            searchParam.whole = true;
        }
    }
    function _paginationChanged(i) {
        //to del
        // layer.msg("分页");
        viewModel.searchParam.currentPage=i;
        _search();
    }
    //选择目标合作商
    function _targetPartnerIdChanged() {

        if (viewModel.targetPartnerId == 1) {
            //复制到玩瞳旗下时必选领读
            viewModel.migrationRequest.normal=true;
        }

        for (let i = 0; i < viewModel.total.length; i++) {
            if (viewModel.targetPartnerId == viewModel.total[i].partnerVO.partnerId) {
                viewModel.targetRepoList = viewModel.total[i].repositoryVOList;
                Vue.nextTick().then(()=>{
                    if (viewModel.targetRepoList.length>0){
                        viewModel.migrationRequest.targetRepoId = viewModel.targetRepoList[0].repositoryId;
                        $("#targetRepoName").val(viewModel.migrationRequest.targetRepoId);
                    }
                    $("#targetRepoName").trigger("chosen:updated");
                });
                return;
            }
        }
    }
    //全选book
    function _selectAllChanged() {
        viewModel.selectAll = !viewModel.selectAll;
        for (let i = 0; i < viewModel.books.length; i++) {
            if (!viewModel.books[i].onCopy){
                viewModel.books[i].isSelected = viewModel.selectAll;
            }
        }
    }
    //全选状态搜索条件
    function _searchAllChanged() {
        let searchParam = viewModel.searchParam;
        searchParam.forbidden = false;
        searchParam.examined = !searchParam.whole;
        searchParam.examining = !searchParam.whole;
        searchParam.editing = !searchParam.whole;
        //searchParam.whole的布尔值会在点击后反转
    }
    //弹出对话框
    function _migrationDialog() {

        //###
         viewModel.migrationRequest.selectedBooks = new Array();

        for (let i = 0; i < viewModel.books.length; i++) {
            //选择 选中的bookId到arr
            if (viewModel.books[i].isSelected) {
                //###
                 viewModel.migrationRequest.selectedBooks.push(viewModel.books[i].bookId);
            }
        }

        //###
        if ( viewModel.migrationRequest.selectedBooks.length == 0){
            layer.msg("没有选择要"+viewModel.modeName+"的书");
            return;
        }

        $('#migration_module').removeClass("main-w");
        layer_index = layer.open({
            title: viewModel.modeName + "到",
            type: 1,
            area:["480px","350px"],
            content: $('#migration_dialog'),
            cancel: function () {
                $("#migration_dialog").css("display","none");
                $('#migration_module').addClass("main-w");
            }
        });

    }
    //关闭按钮 关闭对话框
    function _closeDialog() {
        layer.close(layer_index);
        $("#migration_dialog").css("display","none");
        $('#migration_module').addClass("main-w");
    }
    //下一步按钮
    function _nextStep() {
        viewModel.migrationRequest.sourceRepoId = viewModel.searchParam.repoId;
        //###
        if(viewModel.migrationRequest.targetRepoId == viewModel.migrationRequest.sourceRepoId){
            layer.msg("同一资源库下不可存在相同书本资源，请选择其他私有库");
            return;
        }

        if (viewModel.targetPartnerId == 1 && viewModel.self.partnerVO.partnerId != 1){

            layer.msg("不支持客户的资源"+viewModel.modeName+"给玩瞳");
            return;
        }
        if (viewModel.migrationRequest.normal == false
        && viewModel.migrationRequest.pointing == false) {
            layer.msg("请选择资源类型");
            return;
        }

        $.get(API_URL_CHECK
            //###
            ,viewModel.migrationRequest
            ,function (response) {

                viewModel.migrationRequest.selectedBooks = response.data;

                //关闭旧对话框
                layer.close(layer_index);
                $("#migration_dialog").css("display","none");
                $('#migration_module').addClass("main-w");
                //有重复
                let pass = true;

                let duplicatedBookIds = new Array();
                for (let one in response.data){
                    if(response.data[one] != -1){
                        //有重复
                        duplicatedBookIds.push(one);
                        pass = false;
                        continue;
                    }
                }
                if (pass){
                    //自检成功
                    $('#migration_module').removeClass("main-w");
                    layer_index = layer.open({
                        title: "资源自检结果",
                        type: 1,
                        area:["480px","350px"],
                        content: $('#migration_ready_dialog'),
                        cancel: function () {
                            $("#migration_ready_dialog").css("display","none");
                            $('#migration_module').addClass("main-w");
                        }
                    });
                }else {
                    //自检有重复
                    viewModel.targetPartnerName = $("#targetPartnerName option:selected").text();
                    viewModel.targetRepoName = $("#targetRepoName option:selected").text();
                    viewModel.sourceRepoName = $("#sourceRepoName option:selected").text();
                    viewModel.sourcePartnerName = viewModel.self.partnerVO.partnerName;

                    let duplicatedBooks = new Array();
                    for (let i = 0; i < viewModel.books.length; i++) {
                        for (let j = 0; j < duplicatedBookIds.length; j++) {
                            if (viewModel.books[i].bookId == duplicatedBookIds[j]) {
                                duplicatedBooks.push(viewModel.books[i]);
                            }
                        }

                    }


                    viewModel.duplicatedBooks = duplicatedBooks;

                    viewModel.migrationRequest.override = false;
                    $('#migration_module').removeClass("main-w");
                    layer_index = layer.open({
                        title: "资源自检结果（注意：资源迁移进度和结果，在\"任务列表\"中可看到）",
                        type: 1,
                        area:["720px","700px"],
                        content: $('#migration_confirm_dialog'),
                        cancel: function () {
                            $("#migration_confirm_dialog").css("display","none");
                            $('#migration_module').addClass("main-w");
                        }
                    });
                }
            }
        )
    }
    //提交搜索
    function _search (){

        viewModel.books = [];
        $("#pagination_parent_migration_submit").empty();
        if(!_checkInput()){
            return
        }
        $.get(API_URL_SEARCH,viewModel.searchParam,function (response) {

            if (response.code != 0){
                layer.msg(response.msg);
                return;
            }

            //设置为未选中
            for (let i = 0; i < response.data.books.length; i++) {
                response.data.books[i].isSelected = false;
            }

            viewModel.books = response.data.books;

            if (viewModel.books.length == 0){
                viewModel.searchNone = true;
            }else {
                viewModel.searchNone = false;
            }

            pagination.currentPage = response.data.currentPage;
            pagination.pages = response.data.pages;

            viewModel.selectAll = false;

            _initPagination();
        })
    }
    //检查输入的搜索条件
    function _checkInput(){
        let searchParam = viewModel.searchParam;
        if(
            searchParam.bookName == "" &&
            searchParam.isbn == "" &&
            searchParam.press == "" &&
            searchParam.series == "" &&
            searchParam.edition == "" &&
            searchParam.bookNumber == "" &&
            searchParam.bookId == "" &&
            searchParam.labelName == ""){

            layer.msg("请输入搜索内容");
            return false;
        }
        if(isNaN(searchParam.isbn)){
            layer.msg("ISBN必须为数字");
            return false;

        }
        if(isNaN(searchParam.bookId)){
            layer.msg("BookID必须为数字");
            return false;
        }
        if(isNaN(searchParam.bookNumber)){
            layer.msg("书本编号必须为数字");
            return false;
        }


        if(!viewModel.searchParam.examined && !viewModel.searchParam.examining && !viewModel.searchParam.editing){
            layer.msg("请选择资源状态");
            return false;
        }

        return true;
    }
    //分页导航
    function _initPagination() {
        let param = {
            currentPage : pagination.currentPage,
            totalPages : pagination.pages,
            parentElement : "#pagination_parent_migration_submit",
            callback : _paginationChanged
        };
        util.makePagination(param);
    }

    //返回“公有函数集合”
    return {
        init: function () {
            //对外暴露“私有函数”
            _init();
        },
        switchSourcePartner: function (self, total) {
            _switchSourcePartner(self, total);
        }
    }
})();

//#schedule
wantong.cms.migration.schedule = (function () {

    let API_URL_ORDERS = "/api/cms/migration/orders";
    let API_URL_ITEMS = "/api/cms/migration/items";

    //vue监视对象 更新此对象，页面将随之自动更新
    let viewModel = {};

    let pagination = {
        currentPage:1,
        pageSize:14
    }

    //入口函数
    function _init() {
        _initViewModel();
        _setupData();
        _doVue();
    }
    function _initViewModel() {
        viewModel.orders = [];

        viewModel.openedOrder = {};
        viewModel.items=[];

        viewModel.state = 15;

    }
    //设置partnerName、源repoList、目标repo
    function _setupData() {
        $.get(API_URL_ORDERS, {
                currentPage:pagination.currentPage,
                pageSize: pagination.pageSize,
                state: viewModel.state === undefined ? 15 : viewModel.state
            }
            ,function (response) {
            if (response.code == 0){
                viewModel.orders = response.data.result;
                pagination.currentPage = response.data.pagination.currentPage;
                pagination.pages = response.data.pagination.pages;
                _initPagination();
            } else {
                //出错
                layer.msg(response.msg);
            }
        });
    }
    function _paginationChanged(i) {
        //to del
        // layer.msg("分页");
        pagination.currentPage=i;
        _setupData();
    }
    //分页导航
    function _initPagination() {
        let param = {
            currentPage : pagination.currentPage,
            totalPages : pagination.pages,
            parentElement : "#pagination_parent_migration_schedule",
            callback : _paginationChanged
        };
        util.makePagination(param);
    }

    //vue实例化
    function _doVue (){
        let app = new Vue({
            el: "#migration_schedule",
            data: viewModel,
            methods:{
                gotoItems: function (one) {
                    _gotoItems(one);
                },
                backToOrders:function () {
                    $("#migration_orders").show();
                    $("#migration_items").hide();
                },
                showImage:function (url) {
                    layer.open({
                        type: 1,
                        title: false,
                        content: "<img style='width: 640px;height: 480px' src='"+url+"'>",
                        shadeClose: true,
                        area: ['640px', '480px']
                    });
                },
                refresh:function () {
                    pagination.currentPage = 1;
                    _setupData();
                }
            }
        });
    }

    function _gotoItems(one) {
        $("#migration_orders").hide();
        viewModel.openedOrder = one;

        $.getJSON(API_URL_ITEMS,{orderId: one.orderId},function (response) {
            viewModel.items = response.data;
        });
        $("#migration_items").show();
    }

    //返回“公有函数集合”
    return {
        init: function () {
            //对外暴露“私有函数”
            _init();
        },
        refresh: function () {
            pagination.currentPage = 1;
            _setupData();
        }
    }
})();

//#initer
//模块入口
wantong.cms.migration.initer = (function () {

    let API_URL_SETUP = "/api/cms/migration/setup";
    //vue监视对象 更新此对象，页面将随之自动更新
    let viewModel = {};
    let vueApp;

    //入口函数
    function _init() {
        _initViewModel();
        _doVue();
        _setupData();
    }
    function _initViewModel() {
        viewModel.self = {};
        viewModel.total = [];

        viewModel.tag = "";
    }
    //设置partnerName、源repoList、目标repo
    function _setupData() {
        $("#bookSearchShow").hide();

        wantong.cms.migration.submit.init();

        $.get(API_URL_SETUP,function (response) {
            if (response.code == 0){
                viewModel.self = response.data.self;
                viewModel.total = response.data.total;

                Vue.nextTick().then(()=>{
                    let $partnerSelector = $("#migration_partner_selector");
                    $partnerSelector.chosen({
                        allow_single_deselect: true,
                        search_contains: true,
                        width: '95%'
                    });
                    $partnerSelector.on("change", () => {
                        let selectedPartnerId = $("#migration_partner_selector").val();
                        viewModel.self = viewModel.total.find(one => one.partnerVO.partnerId == selectedPartnerId);
                        vueApp.switchSourcePartner();
                    });
                });

                wantong.cms.migration.submit.switchSourcePartner(viewModel.self, viewModel.total);
                wantong.cms.migration.schedule.init();

                $("#bookSearchShow").show();
            } else {
                //出错
                layer.msg(response.msg);
            }
        });
    }
    //vue实例化
    function _doVue (){
        vueApp = new Vue({
            el: "#migration_left",
            data: viewModel,
            methods: {
                switchSourcePartner: function () {
                    wantong.cms.migration.submit.switchSourcePartner(viewModel.self, viewModel.total);
                },
                switchTag: function (a) {
                    if (viewModel.tag == 'submit'){
                        $("#migration_submit").show();
                        $("#migration_schedule").hide();
                        $("#pagination_parent_migration_submit_pagination").remove();
                    } else {
                        $("#migration_submit").hide();
                        $("#migration_schedule").show();
                        wantong.cms.migration.schedule.refresh();
                    }
                }
            }
        });
    }


    //返回“公有函数集合”
    return {
        init: function () {
            //对外暴露“私有函数”
            _init();
        }
    }
})();
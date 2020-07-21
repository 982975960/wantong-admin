wantong.feedback = {};
wantong.feedback.dashboard = {};
wantong.feedback.dashboard.runner = {};
wantong.feedback.dashboard.chart = {};

//闭包封装

//右边界面 闭包
wantong.feedback.dashboard.chart = (()=>{

    const API_DASHBOARD_SETUP = '/api/feedback/dashboard/setup';
    const API_DASHBOARD_DETAIL = '/api/feedback/dashboard/detail';
    const API_DASHBOARD_EXPORT = '/api/feedback/dashboard/export';
    let oldNav = "";
    //vue视图模型
    let viewModel = undefined;
    //baidu eChart
    let eChart = undefined;
    //分页
    let pagination = {};
    //vm map
    const tagMap = _initTagMap();
    //vm map
    const fieldMap = initFieldMap();
    let vueApp;
    function initFieldMap() {
        let map = new Map();
        //tag -> json key
        map.set("总阅读次数","readTimesCount");
        map.set("总阅读本数","readBookCount");
        map.set("总阅读时长","readTime");
        map.set('新增用户',"userNewCount");
        map.set("活跃用户数", "userActiveCount");
        map.set("活跃构成", "userActiveComponent");
        map.set("累计用户数","userTotalCount");
        map.set("启动次数", "countStartApp");
        map.set('拥有书本总数', "countBook");
        map.set("平均阅读次数","avgReadBookCount");
        map.set("平均阅读本数","avgReadTimesCount");
        map.set("平均阅读时长","avgReadTime");
        map.set("日期","recordDate");
        return map;
    }

    function _initTagMap(){
        //nav -> tag
        let map = new Map();
        map.set("新增用户",[]);
        map.set("活跃用户",["活跃用户数","活跃构成"]);
        map.set("累计用户数",[]);
        map.set("启动次数",[]);
        map.set("留存用户",["新增用户留存","活跃用户留存"]);
        map.set("阅读总量",["总阅读次数", "总阅读本数", "总阅读时长"]);
        map.set("阅读均量",["平均阅读次数", "平均阅读本数", "平均阅读时长"]);
        map.set("拥有书本总数",[]);
        map.set("阅读数据" ,[]);
        map.set("书籍数据" , []);
        return map;
    }

    //闭包入口
    function _init(){
        _initObject();
        _initVue();
        return _setup();
    }
    //切换标签
    function _changeTag(newTag) {
        viewModel.currentTag = newTag.name;
        console.log("currentTag:"+viewModel.currentTag);
        console.log("nav:"+viewModel.nav);
        if (viewModel.currentTag == "新增用户留存" || viewModel.currentTag == "活跃用户留存"){
            _renderDetailData(viewModel.nav);
        }
        _computeChartData(newTag.name);
    }
    //初始化
    function _initObject() {
        viewModel = {};
        //分页
        pagination = {
            currentPage:1,
            pageSize: 20
        };
        //可选id
        viewModel.optionalPartnerList = [];
        //登录id
        viewModel.sessionPartner = {};
        //查询对象id
        viewModel.selectedPartner = {};
        //不收起详细数据
        viewModel.isShowDetailData = true;
        //详细数据 表格
        viewModel.tableData = {};
        viewModel.tableData.head = ["日期", "总阅读次数", "总阅读本数", "总阅读时长"];
        viewModel.tableData.body = [];
        //标签切换
        //当前标签
        viewModel.currentTag = "";
        //可选标签
        viewModel.tags = [];
        //导航切换
        viewModel.nav = "";
        //图表数据
        viewModel.chartData = {};
        viewModel.data = [];
        //日期范围
        viewModel.minDate= moment().subtract(1,'months').subtract(1,'day').format('YYYY-MM-DD');
        viewModel.maxDate= moment().subtract(1,'day').format('YYYY-MM-DD');
        viewModel.dateBound={start:"",end:""};
    }
    function _initVue() {
        vueApp = new Vue({
            el: "#dashboard_content",
            data: viewModel,
            methods: {
                render: _render,
                changeTag: _changeTag
            },
            watch:{
                chartData: ()=>{
                    _drawChart(viewModel.chartData);
                }
            },
            computed: {
                //excel导出动态url
                exportUrl: ()=>{
                    let tableName = viewModel.nav;
                    tableName = tableName == "留存用户" ? viewModel.currentTag : tableName;
                    return API_DASHBOARD_EXPORT
                        +"?partnerId="+viewModel.selectedPartner.partnerId
                        +"&tableName="+tableName
                        +"&partnerName="+viewModel.selectedPartner.partnerName
                        +"&minDate="+viewModel.minDate+"&maxDate="+viewModel.maxDate
                },
                //提示语
                tipContent: ()=>{
                    switch (viewModel.nav) {
                        case "新增用户": return ["第一次启动应用的用户（以设备为判断标准，但是对于授权码激活的设备，同一授权码激活多台设备，只记录为一个用户）"];

                        case "活跃用户": return ["活跃用户：启动过应用的用户（去重），启动过一次的用户即视为活跃用户，包括新用户与老用户；"
                            , "活跃构成：活跃用户中新增用户的占比比例"];

                        case "累计用户数": return ["截止到当前时间，启动过应用的所有独立用户（去重，以设备为判断标准）"];

                        case "启动次数": return ["打开应用视为启动，完全退出或退至后台即视为启动结束"];

                        case "留存用户": return ["某段时间内的新增用户（活跃用户），经过一段时间后，又继续使用应用的被认作是留存用户; " +
                        "这部分用户占当时新增用户（活跃用户）的比例即是留存率。例如，5月份新增用户200，这200人在6月份。" +
                        "启动过应用的有100人，7月份启动过应用的有80人，8月份启动过应用的有50人；则5月新增用户一个月后" +
                        "的留存率是50%，两个月后的留存率是40%，三个月后的留存率是25%。"];

                        case "阅读总量": return ["总阅读次数：某段时间内活跃用户阅读书本次数总数之和 ;"
                            , "总阅读本数：某段时间内活跃用户阅读书本总数之和（去重，相同书本只算一次）;"
                            , "总阅读时长：某段时间内活跃用户阅读书本的总时长。阅读时长=封面阅读时长+所有“读过”的正文阅读时长"];
                        case "阅读均量": return ["平均阅读次数：某段时间内活跃用户阅读书本次数的平均值;"
                            , "平均阅读本数：某段时间内活跃用户阅读书本本数的平均值（去重，相同书本只算一次）;"
                            , "平均阅读时长：某段时间内活跃用户阅读书本时长的平均值"];

                        case "拥有书本总数": return ["所有用户阅读书本总数之和（去重，相同书本只算一次） "];
                    }
                }

            }

        });
    }
    //初始化数据
    function _setup(callback) {
        console.log("viewModel.nav:"+viewModel.nav);
        var type = 0;
        if (viewModel.nav == "新增用户"){
            type = 0;
        } else if (viewModel.nav == "活跃用户"){
            type = 1;
        } else if (viewModel.nav == "累计用户数"){
            type = 2;
        } else if (viewModel.nav == "启动次数"){
            type = 3;
        }

         return $.get(API_DASHBOARD_SETUP+"?type="+type+"&minDate="+viewModel.minDate+"&maxDate="+viewModel.maxDate, (response) => {
                viewModel.sessionPartner = response.data.sessionPartner;
                viewModel.optionalPartnerList = response.data.optionalPartnerList;
                let dateBound = response.data.dateBound;
                viewModel.dateBound.start = dateBound.start[0] + "-" + dateBound.start[1] + "-" + dateBound.start[2]
                viewModel.dateBound.end = dateBound.end[0] + "-" + dateBound.end[1] + "-" + dateBound.end[2]
                if (viewModel.sessionPartner.partnerId === 1) {
                    viewModel.selectedPartner = {partnerId: 0, partnerName: "全部客户"};
                } else {
                    viewModel.selectedPartner = viewModel.sessionPartner;
                }
                Vue.nextTick().then(function () {
                    let jqElem = $("#dashboard_partner_select");
                    jqElem.chosen({
                        allow_single_deselect: true,
                        search_contains: true,
                        width: '95%'
                    });
                    jqElem.on("change", () => {
                        viewModel.selectedPartner.partnerId = $("#dashboard_partner_select option:selected").val();
                        console.log("123123123");
                        vueApp.render(viewModel.nav);
                    });
                    layui.use('laydate', function () {
                        var laydate = layui.laydate;
                        //执行一个laydate实例 ###
                        laydate.render({
                            elem: '#dashboard_date_pick',
                            range: true,
                            value: moment().subtract(1, 'months').subtract(1, 'day').format('YYYY-MM-DD') + ' - ' + moment().subtract(1, 'day').format('YYYY-MM-DD'),
                            min: viewModel.dateBound.start,
                            max: viewModel.dateBound.end,
                            done: function (value, minDate, maxDate) {
                                let bi = value.split(" - ");
                                viewModel.minDate = bi[0];
                                viewModel.maxDate = bi[1];
                                console.log("123123123123");
                                vueApp.render(viewModel.nav);
                                if(callback != null){
                                    callback();
                                }
                            }
                        });
                    });
                });
            });


    }

    //重载界面(数据)
    function _render(nav){
        if (nav != undefined) {
            viewModel.tags = tagMap.get(nav);
            viewModel.currentTag = viewModel.tags[0];
            viewModel.nav = nav;
        }
        console.log("currentTag1:"+viewModel.currentTag);
        console.log("nav1:"+viewModel.nav);
        let partnerId = viewModel.selectedPartner.partnerId;
        // //ajax方式
        // $.get(API_DASHBOARD_DETAIL
        //     , {partnerId:partnerId,
        //         currentPage: 1,
        //         pageSize: 30}
        //     , (data)=> {
        //
        //     data.data.result.reverse();
        //     viewModel.data =  data.data.result;
        //
        //     _computeChartData(viewModel.currentTag ? viewModel.currentTag : nav);
        // });
        // ES6 原生API 代替ajax
        fetch(API_DASHBOARD_DETAIL+"?partnerId="+partnerId+"&currentPage=1&pageSize=999"+"&minDate="+viewModel.minDate+"&maxDate="+viewModel.maxDate)
            .then(res=>res.json())
            .then(data=>{

                data.data.result.reverse();
                viewModel.data =  data.data.result;

                if (nav != "留存用户"){
                    _computeChartData(viewModel.currentTag ? viewModel.currentTag : nav);
                }

            });

        pagination.currentPage = 1;
        _renderDetailData(nav);
    }
    //转换图表数据
    function _computeChartData(tag){
        console.log("_computeChartData:"+tag+", "+fieldMap.get(tag));
        // let field = fieldMap.get(tag) ? 1:fieldMap.get(tag))
        let xAxisData = new Array();
        let seriesData = new Array();
        for (let dataKey in viewModel.data) {
            xAxisData.push(new Date(viewModel.data[dataKey].recordDate).toLocaleDateString());
            seriesData.push(viewModel.data[dataKey][fieldMap.get(tag)]);
        }
        viewModel.chartData = {
            seriesName: viewModel.currentTag ? viewModel.currentTag : viewModel.nav,
            xAxisData: xAxisData,
            seriesData: seriesData
        };
        eChart.resize();
    }
    //下面表格数据
    function _renderDetailData(nav){
        viewModel.isShowDetailData = true;
        let tags;
        console.log(tags = tagMap.get(nav));
        if (tags.length == 0){
            tags = [nav];
        }
        console.log("tags=====");
        tags.forEach(e=> {
            console.log(e + " " + fieldMap.get(e));
        });
        $.get(API_DASHBOARD_DETAIL
            , {partnerId: viewModel.selectedPartner.partnerId,
                currentPage:pagination.currentPage,
                pageSize: pagination.pageSize,
                minDate:viewModel.minDate,
                maxDate:viewModel.maxDate
            }
            ,(data)=>{
                let tableBody = [];
                let tableHead = [];
                if(viewModel.currentTag == "新增用户留存"){
                    tableHead = ["日期","新增用户","1天后","2天后","3天后","4天后","5天后","6天后","7天后","14天后","30天后"];
                    for (let i = 0; i < data.data.result.length; i++) {
                        tableBody.push(data.data.result[i].retentionRateNew);
                    }
                }else if (viewModel.currentTag == "活跃用户留存"){
                    tableHead = ["日期","活跃用户","1天后","2天后","3天后","4天后","5天后","6天后","7天后","14天后","30天后"];
                    for (let i = 0; i < data.data.result.length; i++) {
                        tableBody.push(data.data.result[i].retentionRateActive);
                    }
                }else {
                    if (tags[1] == "活跃构成"){
                        tableHead = ["日期","活跃用户数","活跃构成（新用户占比）"];
                    }else {
                        tableHead.push("日期");
                        tableHead = tableHead.concat(tags);
                    }
                    console.log("HEAD: "+tableHead);
                    let detailData = data.data.result;
                    for (let i = 0; i < detailData.length; i++) {
                        let one = detailData[i];
                        let row = new Array();
                        row.push(new Date(one.recordDate).toLocaleDateString());
                        for (let j = 0; j < tags.length; j++) {
                            let field = fieldMap.get(tags[j]);
                            if(tags[1] == "活跃构成" && field == "userActiveComponent"){
                                row.push((one[field] * 100).toFixed(2)+"%");
                            }else if (tableHead[3] == "总阅读时长" && field == "readTime"){
                                row.push(_toTimeString(one[field]));
                            }else if (tableHead[3] == "平均阅读时长" && field == "avgReadTime"){
                                row.push(_toTimeString(one[field]));
                            }else {
                                row.push(one[field]);
                            }
                        }
                        tableBody.push(row);
                    }
                }
                viewModel.tableData.head = tableHead;
                viewModel.tableData.body = tableBody;
                console.log(JSON.stringify(viewModel.tableData));
                //分页
                let paginationParam = {
                    currentPage:pagination.currentPage,
                    totalPages : data.data.pagination.pageCount,
                    parentElement : '#dashboard_pagination',
                    callback : function (index) {
                        //todo
                        pagination.currentPage = index;
                        _renderDetailData(nav);
                    }
                };
                util.makePagination(paginationParam);
            }
        );
    }
    //秒数 转为 00:00:00形式
    function _toTimeString(seconds) {
        let h = "" + Math.floor(seconds / (60 * 60));
        let m = "" + Math.floor((seconds % (60 * 60)) /60);
        let s = "" + Math.floor(seconds % 60);
        if (h.length == 1){
            h = "0"+h;
        }
        if (m.length == 1){
            m = "0"+m;
        }
        if (s.length == 1){
            s = "0"+s;
        }
        return h+":"+m+":"+s ;
    }

    //画 图表
    function _drawChart(chartData) {

            eChart =  echarts.init(document.getElementById("dashboard_chart"));
            window.onresize = function () {
                eChart.resize();
            }

        console.log(chartData.seriesName);
        let option = {
            xAxis: {
                type: 'category',
                data: chartData.xAxisData,
                axisLine: {
                    lineStyle:{
                        color: "#737373"
                    }
                }
            },
            yAxis: {
                axisLine: {
                    show: false
                },
                type: 'value',
                axisLabel:{
                    formatter: chartData.seriesName == "活跃构成"? function (a) {
                            return (a * 100).toFixed(2)+"%";
                        }
                        :chartData.seriesName.endsWith("阅读时长")? function (a, b, c) {
                            let n = Math.floor(a);
                            return _toTimeString(n);
                        }: '{value}'
                },
                splitLine:{
                    lineStyle:{
                        type:"dotted"
                    }
                }
            },
            series: [{
                name: chartData.seriesName,
                data: chartData.seriesData,
                type: 'line'
            }],
            grid:{

            },
            tooltip:{
                borderColor:'#eee',
                borderWidth:2,
                backgroundColor: 'rgba(ff,ff,ff,1.0)',
                textStyle:{
                    color: '#737373'
                },
                trigger: 'axis',
                formatter: chartData.seriesName == "活跃构成" ? function (param) {
                        return param[0].name+"<br>"+param[0].seriesName + " : "+(param[0].value * 100).toFixed(2)+"%";
                    }
                    :chartData.seriesName.endsWith("阅读时长")? function (param) {

                        let fix =  param[0].name+"<br>"+param[0].seriesName + ":";
                        return _toTimeString(param[0].value);

                    }: "{b} <br> {a}: {c}"
            },
            color:['#2196f3']
        };
        eChart.setOption(option);
    }

    function _change(nav,callback) {
        if (nav != undefined) {
            viewModel.tags = tagMap.get(nav);
            viewModel.currentTag = viewModel.tags[0];
            viewModel.nav = nav;
        }
      console.log("viewModel.nav:"+viewModel.nav);
      var type = 0;
      if (viewModel.nav == "新增用户"){
        type = 0;
      } else if (viewModel.nav == "活跃用户"){
        type = 1;
      } else if (viewModel.nav == "累计用户数"){
        type = 2;
      } else if (viewModel.nav == "启动次数"){
        type = 3;
      }
        viewModel.minDate= moment().subtract(1,'months').subtract(1,'day').format('YYYY-MM-DD');
        viewModel.maxDate= moment().subtract(1,'day').format('YYYY-MM-DD');

        $.get(API_DASHBOARD_SETUP+"?type="+type+"&minDate="+viewModel.minDate+"&maxDate="+viewModel.maxDate, (response) => {
            viewModel.sessionPartner = response.data.sessionPartner;
            viewModel.optionalPartnerList = response.data.optionalPartnerList;
            let dateBound = response.data.dateBound;
            viewModel.dateBound.start = dateBound.start[0] + "-" + dateBound.start[1] + "-" + dateBound.start[2]
            viewModel.dateBound.end = dateBound.end[0] + "-" + dateBound.end[1] + "-" + dateBound.end[2]
            if (viewModel.sessionPartner.partnerId === 1) {
                viewModel.selectedPartner = {partnerId: 0, partnerName: "全部客户"};
            } else {
                viewModel.selectedPartner = viewModel.sessionPartner;
            }
            _clearSelect();
            let jqElem = $("#dashboard_partner_select");
            jqElem.chosen({
                allow_single_deselect: true,
                search_contains: true,
                width: '95%'
            });
            jqElem.on("change", () => {
                viewModel.selectedPartner.partnerId = $("#dashboard_partner_select option:selected").val();
                vueApp.render(viewModel.nav);
            });
            layui.use('laydate', function () {
                    var laydate = layui.laydate;
                    //执行一个laydate实例 ###
                    laydate.render({
                        elem: '#dashboard_date_pick',
                        range: true,
                        value: moment().subtract(1, 'months').subtract(1, 'day').format('YYYY-MM-DD') + ' - ' + moment().subtract(1, 'day').format('YYYY-MM-DD'),
                        min: viewModel.dateBound.start,
                        max: viewModel.dateBound.end,
                        done: function (value, minDate, maxDate) {
                            let bi = value.split(" - ");
                            viewModel.minDate = bi[0];
                            viewModel.maxDate = bi[1];
                            vueApp.render(viewModel.nav);
                            if(callback != null){
                                callback();
                            }
                        }
                    });
                });
            if(callback != null){
                callback();
            }

        });
    }
    
    function _clearSelect() {
        $('#dashboard_partner_select').empty();
        $('#dashboard_partner_select').chosen("destroy");
        let html = "";
        let list = viewModel.optionalPartnerList;
        for (let one in list){
            html += "<option value="+list[one].partnerId+" >"+list[one].partnerName+"</option>"
        }
        $('#dashboard_partner_select').append(html)
        $('#dashboard_partner_select').chosen({width: "95%"});
    }

    function _eChat(callback) {

        eChart =  echarts.init(document.getElementById("dashboard_chart"));
        window.onresize = function () {
            eChart.resize();
        }
        calback();
    }
    return {
        init: _init,
        render: _render,
        setup:_setup,
        change:_change,
        eChart:_eChat
    }
})();

//入口闭包
wantong.feedback.dashboard.runner = (()=>{
    let app;
    let oldNav = "";
    let viewModel = {
        nav:"新增用户"
    };
    //入口
    function _run() {
       let haveAuth = JSON.parse($("#userAuth").attr("ishaveAuth"));

       let userReadAuth = JSON.parse($("#userReadAuth").attr("ishaveAuth"));
        _initNavVue();
        let jqxhr = wantong.feedback.dashboard.chart.init();
        jqxhr.done(()=>{
            wantong.feedback.dashboard.chart.render(viewModel.nav);
            if(!haveAuth && userReadAuth) {
                _handleNavSelect('阅读数据');
                app.render();
            }
        });
    }

    function _initNavVue() {
         app = new Vue({
            data: viewModel,
            el: "#dashboard_nav",
            methods: {
                handleNavSelect: _handleNavSelect
            }
        });
    }
    let tt = null;
    let t2 = null;

    //切换导航
    function _handleNavSelect(index) {
        let partnerId = null;
        scroll(0,0);
        viewModel.nav = index;
        if(oldNav != "阅读数据" && oldNav != "书籍数据" ){
            console.log("111111");
            if(index != "阅读数据" && index != "书籍数据"){
                console.log("22222");
                wantong.feedback.dashboard.chart.change(viewModel.nav,()=>{
                    wantong.feedback.dashboard.chart.render(viewModel.nav);
                });
            } else {
                wantong.feedback.dashboard.chart.render(viewModel.nav);
            }
        } else {
            if(index != "阅读数据" && index != "书籍数据"){
                console.log("22222");
                wantong.feedback.dashboard.chart.change(viewModel.nav,()=>{
                    wantong.feedback.dashboard.chart.render(viewModel.nav);
                });

            } else {
                if(oldNav  == '阅读数据'){
                    partnerId = tt.getPartnerId();
                } else {
                    partnerId = t2.getPartnerId();
                }
                console.log("33333");
                wantong.feedback.dashboard.chart.render(viewModel.nav);
            }
        }
        if(viewModel.nav == '阅读数据' ){
            if(tt == null){
                tt = wantong.feedback.dashboard_layui;
                setTimeout(function () {
                    tt.render(partnerId);
                },200);

            } else {
                setTimeout(function () {
                    tt.onClickDept(true,partnerId);
                },200);
            }

        } else if(viewModel.nav == '书籍数据'){
            if(t2 == null) {
                t2 = wantong.dashboard.dashboardBookData;
                setTimeout(function () {
                    t2.render(partnerId);
                },200);
            }else {
                setTimeout(function () {
                    t2.onClickOpen(true,partnerId);
                },500);
            }
            // wantong.dashboard.dashboardBookData.render();
        }


        oldNav = index;

    }

    return {
        run: _run
    }
})();

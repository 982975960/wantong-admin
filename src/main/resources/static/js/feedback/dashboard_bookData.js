wantong.dashboard.dashboardBookData = (function () {

    let conf = {
        LOAD_PARTNER_URL: "/api/feedback/dashboard/partners.do",
        LOAD_ALL_DATA_URL: "/api/feedback/dashboard/getAllData.do",
        LOAD_BOOK_READ_DATA_URL:"/api/feedback/dashboard/getReadBookData"
    };
    let func ;
    let selectPartnerId = 0;
    function render(inPartnerIdParam) {
        layui.use(['layer','form','table','laydate','element'],function () {
            let  layer = layui.layer;
            let $form = layui.form;
            let laydate = layui.laydate;
            let element = layui.element;
            let table = layui.table;
            let fromDate;
            let toDate;
            let partnerId;
            let period;
            let tableIns;


            function loadPartner(callback) {
                $.get(conf.LOAD_PARTNER_URL,{},function (data) {
                    if(data.code === 0){
                        let innerHtmlOptionsId = "";
                        for (let index in data.data){
                            let item = data.data[index];
                            innerHtmlOptionsId += "<option value='" + item.partnerId + "'>" + item.partnerName + "<option>"
                        }
                        $("#partnerBookReadName").html(innerHtmlOptionsId);
                        partnerId = data.data[0].partnerId;
                        $form.render('select');
                        if(callback != null){
                            callback();
                        }
                    } else {
                        layer.msg(data.msg);
                    }
                });
            };
            func  = function (periodParam,partnerIdParam,isClick,inPartnerParam) {
                if(isClick){
                    $("#times").find("#periodBookRead").remove();
                    $("#times").append(' <input id="periodBookRead" name="period" class="layui-input" type="text" placeholder="请选择时间段"\n' +
                        '                                       lay-verify=""\n' +
                        '                                       autocomplete="off"/>');
                    timeFun();
                }
                if(!partnerIdParam){
                    partnerIdParam = partnerId;
                    if(inPartnerParam != 0 && inPartnerParam != undefined && inPartnerParam != null) {
                        loadPartner(()=>{
                            var select = 'dd[lay-value=' + inPartnerParam + ']';// 设置value
                            $('#partnerBookRead').find("div.layui-form-select").find('dl').find(select).click();// 查找点击
                            $form.render('select(partnerBookReadName)');// 再次渲染select
                        });
                        partnerIdParam = inPartnerParam;
                    } else {
                        loadPartner();
                    }
                }
                if(!periodParam) periodParam = period;
                let split = periodParam.split(" - ");
                fromDate = split[0];
                toDate = split[1];
                $.get(conf.LOAD_ALL_DATA_URL + "?fromDate=" + fromDate
                    + "&toDate=" + toDate + "&partnerId=" + partnerIdParam,function (data) {
                    if(data.code == 0){
                        $("#read_times_totals").find("p")[1].innerHTML = data.data.readNumTotal;
                        $("#read_time_totals").find("p")[1].innerHTML = data.data.readTimeTotal;
                    } else {
                        layer.msg(data.msg);
                    }
                });
                if(tableIns != undefined){
                    readerTable();
                }
            };
            function readerTable() {
                tableIns.reload({
                    elem:'#book_data',
                    where : {
                        fromDate: fromDate,
                        toDate:toDate,
                        partnerId: partnerId,
                    }
                 });
            };
            let begin = getDay(-8);
            let end = getDay(-1);
            period = begin + " - " + end;
            loadPartner(()=>{
                if(inPartnerIdParam != 0) {
                    var select = 'dd[lay-value=' + inPartnerIdParam + ']';// 设置value
                    $('#partnerBookRead').find("div.layui-form-select").find('dl').find(select).click();// 查找点击
                    $form.render('select(partnerBookReadName)');// 再次渲染select
                    func(period,inPartnerIdParam, false);
                } else {
                    func(period)
                }
                tableIns =  table.render({
                    elem:'#book_data',
                    height:'500',
                    cols:getCol(),
                    page:true,
                    url:conf.LOAD_BOOK_READ_DATA_URL,
                    where : {
                        fromDate: fromDate,
                        toDate:toDate,
                        partnerId:partnerId
                    },done : function(data) {

                    }
                });
            });
            let timeFun = function() {
                laydate.render({
                    elem: '#periodBookRead',
                    range: true,
                    value: period,
                    max: end,
                    done: function (value) {
                        period = value;
                        if (period === '' || typeof period === "undefined" || period === null) {
                            loadPartner(() => {
                                func(period, partnerId)
                            });
                        } else {
                            func(period, partnerId);
                        }
                    }
                });
            };
            timeFun();
            $form.on('select(partnerBookReadName)',function(obj) {
                partnerId = obj.value;
                selectPartnerId = parseInt(partnerId);
                func(period,partnerId);
            });

            function getDay(day) {
                let today = new Date();
                let targetday_milliseconds = today.getTime() + 1000 * 60 * 60 * 24 * day;
                today.setTime(targetday_milliseconds); //注意，这行是关键代码
                let tYear = today.getFullYear();
                let tMonth = today.getMonth();
                let tDate = today.getDate();
                tMonth = doHandleMonth(tMonth + 1);
                tDate = doHandleMonth(tDate);
                return tYear + "-" + tMonth + "-" + tDate;
            };
            function doHandleMonth(month) {
                let m = month;
                if (month.toString().length == 1) {
                    m = "0" + month;
                }
                return m;
            };
            function getCol() {
                return [[{
                    field : 'number',
                    title : '序号',
                    type :'numbers',
                    width : "15%"
                },{
                    field : 'bookName',
                    title : '书籍名称',
                    width : "29%"
                },{
                    field : 'readCount',
                    title : '阅读次数',
                    width : "29%"
                },{
                    field : 'readTime',
                    title : '总时长(单位小时)',
                    width : "29%"
                }]];
            };
        });
    };

    return {
        render:function (inPartnerIdParam) {
            render(inPartnerIdParam);
        },
        onClickOpen:function(isClick,inPartnerIdParam) {
            func(null,null,isClick,inPartnerIdParam);
        },
        getPartnerId: function () {
            return selectPartnerId;
        }
    }
})();

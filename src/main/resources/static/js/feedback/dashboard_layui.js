wantong.feedback.dashboard_layui = (function() {
    let conf = {
        LOAD_PARTNER_URL: "/api/feedback/dashboard/partners.do",
        LOAD_ALL_DATA_URL: "/api/feedback/dashboard/getAllData.do",
        GET_READ_DATA_URL: "/api/feedback/dashboard/getReadData.do"
    };

    let func;
    let selectPartnerId = 0;
    function render(inPartnerIdParam) {
        layui.use(['layer', 'form','laydate','element'],function () {
            let layer = layui.layer;
            let $form = layui.form;
            let element = layui.element;
            let laydate = layui.laydate;
            let timeTypeReadNow = 'day';
            let fromDate;
            let toDate;
            let partnerId;
            let period;

            element.on('tab(readData)', function (e) {
                let period = document.getElementById('period').value;
                if (period === '' || typeof period === "undefined" || period === null){
                    layer.msg("请选择时间!");
                    return;
                }
                if (e.index === 0) {
                    timeTypeReadNow = "day";
                } else if (e.index === 1) {
                    timeTypeReadNow = "week";
                } else {
                    timeTypeReadNow ="month";
                }
                getReadData(fromDate,toDate,partnerId,timeTypeReadNow);
            });

            function loadPartner(callback) {
                $.get(conf.LOAD_PARTNER_URL,{},function (data) {
                    if(data.code === 0){
                        let innerHtmlOptionsId = "";
                        for (let index in data.data){
                            let item = data.data[index];
                            innerHtmlOptionsId += "<option value='" + item.partnerId + "'>" + item.partnerName + "<option>"
                        }
                        $("#partnerName").html(innerHtmlOptionsId);
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

            let readChart =null;
            function getReadData(fromDataParam, toDataParam, partnerIdParam, timeType) {

                if(readChart == null){

                    readChart = echarts.init(document.getElementById(timeType + "_data"));
                    window.onresize = function () {
                        readChart.resize();
                    }
                } else {
                    readChart.dispose();
                    readChart = echarts.init(document.getElementById(timeType + "_data"));
                }
                $.get(conf.GET_READ_DATA_URL + "?fromDate=" + fromDataParam +
                    "&toDate=" + toDataParam + "&partnerId=" + partnerIdParam + "&timeType=" + timeType, function (data) {
                    if(data.code == 0){
                        readChart.setOption(initOption("", ['阅读时长(小时)', '阅读数量'],data.data.xdata,[{
                            name : '阅读时长(小时)',
                            type : 'line',
                            smooth : true,
                            data: data.data.ydata.readTime
                        },{
                            name : '阅读数量',
                            type : 'line',
                            smooth : true,
                            data: data.data.ydata.readCount
                        }]));
                        readChart.resize();
                    } else {
                      layer.msg(data.msg);
                        readChart.clear();
                    }
                });

            };
            let begin = getDay(-8);
            let end = getDay(-1);
            period = begin + " - " + end;
            loadPartner(()=>{
                if(inPartnerIdParam != 0) {
                    var select = 'dd[lay-value=' + inPartnerIdParam + ']';// 设置value
                    $('#partnerIdItem').find("div.layui-form-select").find('dl').find(select).click();// 查找点击
                    $form.render('select(partnerName)');// 再次渲染select
                    func(period,inPartnerIdParam, false);
                } else {
                    func(period)
                }
            });
           let times = function() {
               laydate.render({
                   elem: '#period',
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
           times();

            $form.on('select(partnerName)',function(obj) {
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

            //初始化折线图数据
            function initOption(text, data, xData, yData) {
                var option = {
                    title: {
                        text: text,
                    },
                    tooltip: {
                        trigger: 'axis'
                    },
                    legend: {
                        data: data /*['意向','预购','成交']*/,
                        selected : {},
                    },
                    toolbox: {
                        show: false,
                        feature: {
                            saveAsImage: {show: true}
                        }
                    },
                    xAxis: {
                        type: 'category',
                        boundaryGap: false,
                        data: xData
                    },
                    yAxis: {
                        type: 'value'
                    },
                    series: yData
                };
                return option;
            }

            func = function (periodParam,partnerIdParam,isClick, inPartnerParam) {
                if(isClick){
                    $("#readTimes").find("#period").remove();
                    $("#readTimes").append('<input id="period" name="period" class="layui-input" type="text" placeholder="请选择时间段"\n' +
                        '                                       lay-verify=""\n' +
                        '                                       autocomplete="off"/>');
                    times();
                }
                if(!partnerIdParam){
                    partnerIdParam = partnerId;
                    if(inPartnerParam != 0 && inPartnerParam != undefined && inPartnerParam != null){
                       loadPartner(()=>{
                           var select = 'dd[lay-value=' + inPartnerParam + ']';// 设置value
                           $('#partnerIdItem').find("div.layui-form-select").find('dl').find(select).click();// 查找点击
                           $form.render('select(partnerName)');// 再次渲染select
                       });
                    } else {
                        loadPartner();
                    }
                }
                if(!periodParam)  periodParam = period;
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

                //获取数据
                 getReadData(fromDate,toDate,partnerIdParam,timeTypeReadNow);

            };
        });
    };
    return {
        render: function (inPartnerParam) {
            render(inPartnerParam);
        },
        onClickDept: function (isClick,inPartnerParam) {
            func(null,null,isClick,inPartnerParam);
        },
        getPartnerId: function () {
            return selectPartnerId;
        }
    }})();

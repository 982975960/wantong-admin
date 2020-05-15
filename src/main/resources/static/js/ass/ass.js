wantong.ass = (function () {
    var
        //展示分组
        GET_ASSIMAGELOGS = GlobalVar.contextPath + "/ass/showDetailImages.do",
        //展示日志明细图片
        GET_SHOWIMAGEDETAIL = GlobalVar.contextPath + "/ass/listLogsDetails.do",
        //打包下载
        URL_PACK_UP_RESOURCE = GlobalVar.contextPath + "/ass/packUpSample.do",
        //全部打包下载
        URL_PACK_UP_ALL = GlobalVar.contextPath +"/ass/packUpAll.do",
        //打包进度
        URL_CHECK_PACK_UP_RESOURCE = GlobalVar.contextPath
            + "/ass/checkPackUpSample.do",
        //图片页面
        GET_SPECIFICIMAGEPAGE = GlobalVar.contextPath
            + "/ass/specificImagePage.do",
        _conf = {},
        _root = null,
        serchGroupVO,//查询条件
        indexPage = 1,//请求参数 1已识别 0未识别
        nowPage = 1,//当前页码
        maxPage,//最大页码
        loadding = false,
        beanMap = new Map();
        _init = function (conf) {
            $.extend(_conf, conf);
            $('#modelSelect').chosen({
                allow_single_deselect: true,
                search_contains: true,
                width: '100%'
            }).change(function(e) {
                e.stopPropagation();
                console.log('change');
            });
            _root = $("#assSearchLogs");
            _initBtn();
            _loadComponent();
            _initResourceDownloadBtn();
            _initDisabled(true);
        },
        //判断是否可编辑
        _initWhenEidt = function (start, end) {
            var beginTime = _root.find("#beginTime").val();
            var endTime = _root.find("#endTime").val();
            start = start == undefined ? '' : start;
            end = end == undefined ? '' : end;
            beginTime = beginTime == '' ? start : beginTime;
            endTime = endTime == '' ? end : endTime;
            if (beginTime !== "" && endTime !== "") {
                _initDisabled(false);
            } else {
                _initDisabled(true);
            }
        },
        //设置不可编辑
        _initDisabled = function (bl) {
            document.getElementById("openId").readOnly = bl;
            document.getElementById("deviceNumber").readOnly = bl;
            document.getElementById("imageNumber").readOnly = bl;
            if (bl === true){
                document.getElementById("chosen").style.pointerEvents = "none";
            } else {
                document.getElementById("chosen").style.pointerEvents = "";
            }
        },
        _initScroll = function () {
            //优化 引入Throttle监控scroll
            console.log('scroll');
            $('.scroll-container').on('scroll', function (e) {
                if (loadding || nowPage > maxPage) {
                    $('.scroll-container').unbind('scroll');
                    return;
                }
                var top = $(this).scrollTop();
                var height = $(this).height();
                var fullHeight = this.scrollHeight;
                var bhHegiht = fullHeight - top - height;

                // console.log(top, height, fullHeight, bhHegiht);
                if (bhHegiht <= 30 && nowPage <= maxPage) {
                    _getdata(nowPage, indexPage);
                }
            });
        },
        //加载组件
        _loadComponent = function () {
            layui.use(['laydate', 'form'], function () {
                var laydate = layui.laydate,
                    layer = layui.layer;
                laydate.render({
                    elem: '#beginTime' //日期input id
                    , done: function (value, date) { //监听日期被切换
                        _initWhenEidt(value, undefined);
                    }
                    , type: 'datetime'
                    , theme: '#3dbeed'
                });
                laydate.render({
                    elem: '#endTime'
                    , done: function (value, date) { //监听日期被切换
                        _initWhenEidt(undefined, value);
                    }
                    , type: 'datetime'
                    , theme: '#3dbeed'
                });
            });
        },
        // 全局变量初始化
        _initData = function (index) {
            maxPage = 0; //最大页码
            nowPage = 1; //当前页面
            indexPage = index; //1已识别 0未识别
        },
        //提示信息
        _mags = function (mags) {
            layer.open({
                title: '提示'
                , content: mags
            });
        },
        //检查时间
        _checkTime = function () {
            var beginTime = _root.find("#beginTime").val();
            var endTime = _root.find("#endTime").val();
            if (beginTime == "" || endTime == "") {
                _mags('开始时间与结束时间不得为空！');
                return 1;
            }
            if (beginTime > endTime) {
                _mags('结束时间不能早于开始时间！');
                return 1;
            }
            if (beginTime != "" && beginTime == endTime) {
                _mags('开始时间与结束时间不能相同！');
                return 1;
            }
        },
        // 监听按钮的控制
        _initBtn = function () {
            $('.chosen-container').keydown(function (event) {
                if (event.keyCode == 13) {
                    console.log('enter');
                    event.stopPropagation();
                }
            });
            $(document).keydown(function (event) {
                var currentTab = $('#curContentTab').text();
                if (event.keyCode == 13 && currentTab == '查看图片日志') {
                    console.log('enter');
                    _root.find("#searchBtn").click();
                }
            });
            //监听时间，当两者不为空时，其他条件才能编辑
            // $('.time-input').on('change', function () {
            //
            // });
            /*$(document).on("change","#beginTime",function(){
                _initWhenEidt();
            });
            $(document).on("change","#endTime",function(){
                _initWhenEidt();
            });*/
            //下一页图片
            $(document).off('click', '#thumbnailImage').on('click', '#thumbnailImage', function () {
               console.log(beanMap.get(this.traceId));
               var $chekbox;
               if ($(this).parent().parent().parent().attr('id') == 'thumbnailtwo') {
                   $chekbox = $(this).parent().parent().parent().prev().find('.checkbox');
               } else {
                   $chekbox = $(this).parent().next();
               }

                $chekbox.find('input').click();
            });
            $(document).off('click', '#nextPage').on('click', '#nextPage', function () {
                if (nowPage != maxPage) {
                    _getdata(nowPage, indexPage);
                } else {
                    _mags('已经到达底部！');
                    return;
                }
            });
            //查询未识别图片
            $(document).off('click', '#seeNoImage').on('click', '#seeNoImage', function () {
                _initData(0);
                _refreshList(nowPage, 1, indexPage, function () {
                    console.log('load data');
                    _getdata(nowPage, indexPage);
                    _initScroll();
                });
            });
            //查询识别图片
            $(document).off('click', '#seeYesImage').on('click', '#seeYesImage', function () {
                _initData(1);
                _refreshList(nowPage, 1, indexPage,function () {
                    console.log('load data');
                    _getdata(nowPage, indexPage);
                    _initScroll();
                });
            });
            //查看详情按钮监听
            $(document).off('click', '#seeSpecific').on('click', '#seeSpecific', function () {
                beanMap.clear();
                var chaeck = _checkTime();
                if (chaeck == 1) {
                    $('#assSearchLogs').show();
                    $('#imageLogsDetails').hide();
                }else{
                _initData(1);
                serchGroupVO = this.dataset;
                _refreshList(nowPage, 1, indexPage, function () {
                    console.log('load data');
                    $('#assSearchLogs').hide();
                    $('#imageLogsDetails').show();
                    _getdata(nowPage, indexPage);
                    _initScroll();
                });
                }
            });
            //查看图片返回按钮监听
            $(document).off('click', '#callbackLogs').on('click', '#callbackLogs', function () {
                $('#assSearchLogs').show();
                $('#imageLogsDetails').hide();
            });
            //查询分组详情
            _root.find("#searchBtn").off('click').click(function () {
                _refreshList(undefined, 0);

            });
            //清空查询条件
            _root.find("#clearBtn").click(function () {
                _root.find("#beginTime").val("");
                _root.find("#endTime").val("");
                _root.find("#openId").val("");
                _root.find("#deviceNumber").val("");
                _root.find("#imageNumber").val("");
                $("#modelSelect").val("").trigger("chosen:updated");
                _root.find("#totalImageLogs").html("");
                _initWhenEidt();
            });
        },
        _getdata = function (page, index) {
            loadding = true;
            if (page == undefined) {
                page = 1;
            }
            var searchVO = _loadShowImage(page);
            $.ajax({
                url: GET_SHOWIMAGEDETAIL + "?currentPage=" + page + "&index=" + index,
                type: 'POST',
                async: false,
                data: JSON.stringify(searchVO),
                contentType: "application/json; charset=utf-8",
                success: function (data) {
                    var dom = $(data);
                    var pagination = dom.find("#pagination");
                    if (pagination.length > 0) {
                        _initPagination(pagination);
                    }
                    if (data == "" || data == null) {
                        _mags("数据错误！");
                        return;
                    }
                    maxPage = data.pages;
                    console.log('before page', nowPage);
                    nowPage = data.currentPage + 1;
                    console.log('after page', nowPage);
                    if (data.recognitionLogList === "") {
                        maxPage = nowPage;
                    } else {
                        for (var ii = 0; ii <data.recognitionLogList.length; ii++) {
                            var l = data.recognitionLogList[ii];
                            beanMap.set(l.traceId,l);//添加对象到map
                            if (l !== "") {
                                var imageName;
                                if (l.logPath !== "" && l.logPath !== null) {
                                    var arr = l.logPath.split("/");
                                    imageName = arr[arr.length - 1].replace(".jpg", "");
                                }
                                if (index === 1) {
                                    var $domtwo = $('#thumbnail').clone();
                                    $domtwo.removeClass('template');
                                    $domtwo.css('display', 'inline-block');
                                    $domtwo.find('input')[0].value = l.traceId;
                                    $domtwo.find('p')[0].innerText = imageName;
                                    $domtwo.find('p').attr('title', imageName);
                                    $domtwo.find('input')[0].checked = false;
                                    $domtwo.find('img')[0].src = GlobalFunc.getEndpointByTraceId(l.traceId) + (l.logPath == null ? "":l.logPath.replace("/mnt/nas_storage/", ""));
                                    $domtwo.find('img')[0].traceId =l.traceId;
                                    $('#logsImageShow').append($domtwo);

                                    var $domone = $('#thumbnailtwo').clone();
                                    $domone.removeClass('template');
                                    $domone.css('display', 'inline-block');
                                    $domone.find('input').css('display', 'none');
                                    $domone.find('img')[0].traceId =l.traceId;
                                    $domone.find('img')[0].src = GlobalVar.services.FDS + GlobalVar.services.BOOKIMAGEPATH + "/" + l.pid + '/' + l.extraBookId + '/' + l.imageId + '.jpg';
                                    $('#logsImageShow').append($domone);
                                } else {
                                    var $domone = $('#thumbnail').clone();
                                    $domone.removeClass('template');
                                    $domone.css('display', 'inline-block');
                                    $domone.find('input')[0].value = l.traceId;
                                    $domone.find('img')[0].traceId =l.traceId;
                                    $domone.find('p')[0].innerText = imageName;
                                    $domone.find('p').attr('title', imageName);
                                    $domone.find('input')[0].checked = false;
                                    $domone.find('img')[0].src = GlobalFunc.getEndpointByTraceId(l.traceId) +(l.logPath == null? "" : l.logPath.replace("/mnt/nas_storage/", ""));
                                    $('#logsImageShow').append($domone);
                                }
                            }
                        }

                        console.log('continue');
                        //是否有scroll 继续加载
                        var height = $('#logsImageShow').height();
                        var fullHeight = $('#logsImageShow')[0].scrollHeight;
                        if (nowPage <= maxPage && fullHeight <= height) {
                            console.log('no scroll')
                            _getdata(nowPage, indexPage);
                        }
                    }
                }
            }).always(() => {
                loadding = false;
            });
        },
        /**
         * 搜索功能
         * @param page 查询页码
         * @param select 为1时时查询分组 为0时查询识别图片
         * @param index 为1时时查询已识别图片 为0时查询所有图片
         * @private
         */
        _refreshList = function (page, select, index, callback) {
            //加载任务
            var i = layer.msg('日志加载中...', {
                icon: 16,
                shade: [0.5, '#f5f5f5'],
                scrollbar: false,
                offset: 'auto',
                time: 1000000
            });

            if (page == undefined) {
                page = 1;
            }
            if (index == undefined) {
                index = 1;
            }
            console.log('load page', page);
            var now_url, //当前需要访问的url
                now_ftl, //加载的页面
                searchVO;//查询条件
            switch (select) {
                case 0: {//展示分组页面
                    now_url = GET_ASSIMAGELOGS + "?currentPage=" + page;
                    searchVO = _loadParameters(page);
                    now_ftl = "#totalImageLogs";
                }
                    break;
                case 1: {
                    //展示具体图片页面
                    //index=0代表查询未识别图片  index=1代表查询已识别图片
                    now_url = GET_SPECIFICIMAGEPAGE + "?index=" + index;
                    searchVO = _loadParameters(page);
                    now_ftl = "#imageLogsDetails";
                }
                    break;
            }
            var chaeck = _checkTime();
            if (chaeck == 1) {
                layer.close(index);
                return;
            }


            $.ajax({
                url: now_url,
                type: 'POST',
                data: JSON.stringify(searchVO),
                contentType: "application/json; charset=utf-8",
                success: function (data) {
                    var dom = $(data);
                    var pagination = dom.find("#pagination");
                    if (pagination.length > 0) {
                        _initPagination(pagination);
                    }
                    $(now_ftl).html(dom);
                }
            }).always(function () {
                if (callback) {
                    callback();
                }
                layer.close(i);
            });
        },
        //获得复选框的图片id
        _checkedValues = function () {
            console.log('check select ');
            var arr = new Array();
            var checkbox = document.getElementsByName('imageIds');
            for (var i = 0; i < checkbox.length; i++) {
                if (checkbox[i].checked == true) {
                    // arr.push(checkbox[i].value);
                    var imgUrl = $(checkbox[i]).parent().parent().prev().find('img').attr('src');
                    // console.log(imgUrl);
                    arr.push(imgUrl);
                }
            }
            return arr;
        },
        _resetCheckBox = function() {
            var checkbox = document.getElementsByName('imageIds');
            for (var i = 0; i < checkbox.length; i++) {
                checkbox[i].checked = false;
            }
        },
        //打包下载方法
        _initResourceDownloadBtn = function () {
            $(document).off('click', '.down-logs').on('click', '.down-logs', (e) => {
                var urls = _checkedValues();
                if (urls.length == 0) {
                    _mags("请选择需要下载的图片！");
                    return;
                }
                var index = layer.confirm('<div style="text-align: center">确定需要下载图片吗?</div>', {
                    title: '提示',
                    btn: ['确定', '取消'] //按钮
                }, function () {
                    layer.close(index);
                    //提交打包任务
                    index = layer.msg('文件打包中...', {
                        icon: 16,
                        shade: [0.5, '#f5f5f5'],
                        scrollbar: false,
                        offset: 'auto',
                        time: 1000000
                    });

                    //取设备名 ruozhi
                    var parts = urls[0].split('/');
                    var zipName = parts[parts.length - 2];
                    //取消勾选 ruozhi
                    _resetCheckBox();

                    var zip = new JSZip();
                    //新建文件夹
                    var img = zip.folder(zipName);
                    //创建多个Promise
                    let tasks = [];
                    for (var i = 0; i < urls.length; i++) {
                        tasks.push(new Promise(function(resolve, reject) {
                            var fileName = getFileName(urls[i]);
                            console.log(fileName, urls[i]);
                            //这个方法需要图片域名同后台域名一样支持https，该方法不会压缩图片
                            loadImageToBlob(urls[i], fileName,  function (name, blob) {
                                var obj =  {
                                    name: name,
                                    data: blob
                                }
                                resolve(obj);
                                console.log('finish down', obj.name);
                            });
                            // 这个方法会压缩图片
                            // urlToFile(urls[i], fileName, function (name, blob) {
                            //     var obj =  {
                            //         name: name,
                            //         data: blob
                            //     }
                            //     resolve(obj);
                            //     console.log('finish down', obj.name);
                            // });
                        }));
                    }

                    Promise.all(tasks).then(results=>{
                        //下载转换完成 加入zip
                        results.forEach(obj => {
                            console.log('add to zip', obj.name, obj.data);
                            img.file(obj.name, obj.data, {bolb: true});
                        });

                        //压缩
                        zip.generateAsync({type:"blob"})
                        .then(function(content) {
                            // see FileSaver.js
                            console.log('zip finish');
                            saveAs(content, zipName + ".zip");
                            layer.close(index);
                        });
                    })



                    //是否可以轮询任务状态
                    // if (success) {
                    //     success = !success;
                    //     var timeTask = setInterval(() => {
                    //         $.ajax({
                    //             url: URL_CHECK_PACK_UP_RESOURCE,
                    //             type: "POST",
                    //             async: false,
                    //             data: {"taskId": taskId},
                    //             dataType: "json",
                    //             success: function (data) {
                    //                 if (data.code == 0) {
                    //                     if (!data.data.finish) {
                    //                         console.log('打包进度:' + data.data.progress + '%');
                    //                         return;
                    //                     }
                    //                     window.open(data.data.extra);
                    //
                    //                     success = true;
                    //                 } else {
                    //                     console.log(data);
                    //                     layer.msg("打包数据出现异常");
                    //                 }
                    //                 success = true;
                    //             }
                    //         }).always(() => {
                    //             if (success) {
                    //                 clearInterval(timeTask);
                    //                 layer.close(index);
                    //             }
                    //         });
                    //     }, 500);
                    // }
                });
            });
            $(document).off('click', '.down-all-logs').on('click', '.down-all-logs', (e) => {
                var success = false;
                var taskId = '';
                var index = layer.confirm('<div style="text-align: center">确定需要下载所有图片吗?</div>', {
                    title: '提示',
                    btn: ['确定', '取消'] //按钮
                }, function () {
                    layer.close(index);
                    //提交打包任务
                    index = layer.msg('文件打包中...', {
                        icon: 16,
                        shade: [0.5, '#f5f5f5'],
                        scrollbar: false,
                        offset: 'auto',
                        time: 1000000
                    });
                    $.ajax({
                        type: "post",
                        url: URL_PACK_UP_ALL,
                        data: JSON.stringify(_loadShowImage(0)),
                        async: false,
                        dataType: "json",
                        success: function (data) {
                            if (data.code == 0) {
                                taskId = data.data.taskId;
                                success = true;
                                return;
                            }
                            layer.close(index);
                            layer.msg("打包资源失败");
                        },
                        error: function (data) {
                            layer.close(index);
                            layer.msg("网络异常");
                        }
                    });

                    //是否可以轮询任务状态
                    if (success) {
                        success = !success;
                        var timeTask = setInterval(() => {
                            $.ajax({
                                url: URL_CHECK_PACK_UP_RESOURCE,
                                type: "POST",
                                async: false,
                                data: {"taskId": taskId},
                                dataType: "json",
                                success: function (data) {
                                    if (data.code == 0) {
                                        if (!data.data.finish) {
                                            console.log('打包进度:' + data.data.progress + '%');
                                            return;
                                        }
                                        window.open(data.data.extra);

                                        success = true;
                                    } else {
                                        console.log(data);
                                        layer.msg("打包数据出现异常");
                                    }
                                    success = true;
                                }
                            }).always(() => {
                                if (success) {
                                    clearInterval(timeTask);
                                    layer.close(index);
                                }
                            });
                        }, 500);
                    }
                });
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
                            '<li class="page-back-b2" page="' + i + '"><a href="#">' + i
                            + '</a></li>');
                    }

                    if (i == totalPages) {
                        paginationDom.append(
                            '<li page="0" class="page-back"><a href="#" aria-label="Next"><img src="static/images/ico9_05.png"></a></li>');
                    }
                    lastPageAppend = i;
                }
                paginationDom.append(
                    '<Li>到第</Li><Li><input type="text" id="jumpPage" class="page-box page-back"/></Li><Li>页</Li><button type="button" class="page-input" id="jumpButton">跳转</button>');
            }
            paginationDom.find("#jumpButton").on("click", function () {
                var jumpPage = paginationDom.find("#jumpPage").val();
                var jumpPage2 = parseInt(jumpPage);
                if (jumpPage2 != NaN && jumpPage2 > 0 && jumpPage2 <= totalPages) {
                    $("html,body").animate({scrollTop: 0}, 10);
                    _refreshList(jumpPage2, 0);
                } else {
                    layer.msg("请输入正确页数")
                }
            });
            paginationDom.keydown(function (event) {
                var i = event.keyCode;
                if (event.keyCode == 13) {
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
                        _refreshList(prevPage, 0);
                    }
                } else if (page == "0") {
                    var nextPage = currentPage + 1;
                    if (nextPage <= totalPages) {
                        _refreshList(nextPage, 0);
                    }
                } else {
                    if (page != undefined) {
                        _refreshList(page, 0);
                    }
                }
            });
        },
        //加载页面搜索条件
        _loadParameters = function (page) {
            return {
                currentPage: page,
                beginTime: _root.find("#beginTime").val(),
                endTime: _root.find("#endTime").val(),
                openId: _root.find("#openId").val(),
                deviceId: _root.find("#deviceNumber").val(),
                imageId: _root.find("#imageNumber").val(),
                device: _root.find("#modelSelect option:selected").val(),
            }
        },//加载页面搜索条件
        _loadShowImage = function (page) {
            if (serchGroupVO == undefined){
                serchGroupVO = {
                    openId: null,
                    deviceId: null,
                    device: null,
                };
            } ;
            return {
                currentPage: page,
                beginTime: _root.find("#beginTime").val(),
                endTime: _root.find("#endTime").val(),
                openId: serchGroupVO.openid,
                deviceId: serchGroupVO.deviceid,
                imageId: _root.find("#imageNumber").val(),
                device: serchGroupVO.device,
            }
        };
    return {
        init: function (conf) {
            _init(conf);
        }
    };

})();

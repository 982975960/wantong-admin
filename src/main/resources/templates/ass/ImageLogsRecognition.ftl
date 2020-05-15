<@link href="/css/3rd-party/zui/component-chosen.css" rel="stylesheet" />
<@script src="/js/3rd-party/chosen.jquery.js" />
<@script src="/js/3rd-party/jszip.min.js" />
<@script src="/js/3rd-party/FileSaver.min.js" />
<@script src="/js/ass/stanUtil.js" />
<@script src="/js/ass/ass.js"/>

<div class="main-w">
    <div class="content-wrap-w">
        <div class="content-r-path">售后服务 / 图片识别日志</div>
        <div class="content-box" id="imageLogsDetails"  style="margin-top: auto;"/>
        <#--搜索日志内容体-->
        <div id="assSearchLogs" class="search-container content-box">
            <div class="container-fluid" style="margin: 0px;padding: 0px">
                <div class="row" style="margin-bottom: 10px" >
                    <div class="col-md-3">
                            <span class="search-name">开始时间：</span>
                            <span class="search-span">
                                  <input type="text" readonly="readonly" style="height: 32px" id="beginTime" placeholder="选择开始时间" class="layui-input time-input" autocomplete="off">
                             </span>
                    </div>
                     <div class="col-md-3">
                             <span class="search-name">结束时间：</span><span class="search-span">
                                 <input type="text" readonly="readonly" style="height: 32px" id="endTime" placeholder="选择结束时间" class="layui-input time-input" autocomplete="off">
                             </span>
                      </div>
                 </div>
                <div class="row">
                     <div class="col-md-3">
                            <span class="search-name">OpenID：</span>
                            <span class="search-span">
                                 <input name="text" type="text" id="openId" placeholder="输入OpenID查询" class="search-box search-width" />
                             </span>
                     </div>
                     <div class="col-md-3">
                            <span class="search-name">DeviceId：</span>
                            <span class="search-span">
                                <input name="text" type="text" id="deviceNumber" placeholder="输入设备编号查询" class="search-box search-width" />
                            </span>
                     </div>
                    <div class="col-md-3" id = "chosen">
                        <span class="search-name">机型：</span>
                        <span class="search-span">
                                        <select id="modelSelect" class="form-control form-control-chosen" data-placeholder="请输入机型查询" data-compact_search="true">
                                            <option value=""></option>
                                              <#list devices as device>
                                              <option value="${device}">${device}</option>
                                              </#list>
                                        </select>
                                    </span></div>
                    <div class="col-md-3">
                             <span class="search-name">ImageId：</span>
                             <span class="search-span">
                                 <input name="text" type="text" id="imageNumber"  placeholder="输入图片编号查询" class="search-box search-width" />
                             </span>
                    </div>
                </div>
            </div>
            <div class="con-search-input" style="width: 70%">
                <input name="" type="submit" value="搜索"  class="frame-Button-b search-Button" id="searchBtn" style="width:27.3%; margin-right:3%;margin-left: 40%;"/>
                <input name="" type="button" value="清空"  class="search-Button02" id="clearBtn" />
            </div>
            <div class="content-pro" id="totalImageLogs"/>
        </div>
    </div>
</div>
<script>
    $(function () {
        wantong.ass.init();
    });
</script>
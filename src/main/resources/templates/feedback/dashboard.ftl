<link rel="stylesheet" href="/static/js/3rd-party/element-ui/2.12.0/lib/theme-chalk/index.css" />
<script src="/static/js/3rd-party/vue/2.6.10/dist/vue.min.js"></script>
<script src="/static/js/3rd-party/element-ui/2.12.0/lib/index.js"></script>
<script src="/static/js/3rd-party/echarts/4.1.0/dist/echarts.min.js"></script>
<#--<@script src="/js/layui/lay/modules/element.js"/>-->
<@script src="/js/common/pagination.js"/>
<@script src="/js/vuecomponents/vt-table.js"/>
<@link href="/css/feedback/dashboard.css"/>
<@script src="/js/feedback/dashboard.js"/>
<@script src="/js/feedback/dashboard_layui.js"/>
<@script src="/js/feedback/dashboard_bookData.js"/>
<@link href="/css/demo.css" rel="stylesheet"/>
<@link href="/css/3rd-party/zui/component-chosen.css" rel="stylesheet"/>
<script src="/static/js/3rd-party/chosen.jquery.js"></script>
<script src="/static/js/3rd-party/momentjs/moment.min.js"></script>
<div id="module_dashboard">

    <#--    2导航 开始-->
    <div id="dashboard_nav" class="content-nav">
        <el-menu :default-active="nav" @select="handleNavSelect">
            <div id="userAuth"  ishaveAuth = ' <@checkPrivilege url="/virtual/statistics.do" def="false">true</@checkPrivilege>'></div>
            <@checkPrivilege url="/virtual/statistics.do">
            <el-submenu index="用户分析">
                <template slot="title">
                    <span>用户分析</span>
                </template>
                <el-menu-item-group>
                    <el-menu-item index="新增用户">新增用户</el-menu-item>
                    <el-menu-item index="活跃用户">活跃用户</el-menu-item>
                    <el-menu-item index="累计用户数">累计用户数</el-menu-item>
                    <el-menu-item index="启动次数">启动次数</el-menu-item>
                    <el-menu-item index="留存用户">留存用户</el-menu-item>
                </el-menu-item-group>
            </el-submenu>
            </@checkPrivilege>
            <el-submenu index="书本分析" v-show="false">
                <template slot="title">
                    <span>书本分析</span>
                </template>
                <el-menu-item-group>
                    <el-menu-item index="阅读总量">阅读总量</el-menu-item>
                    <el-menu-item index="阅读均量">阅读均量</el-menu-item>
                    <el-menu-item index="拥有书本总数">拥有书本总数</el-menu-item>
                </el-menu-item-group>
            </el-submenu>
            <div id="userReadAuth"  ishaveAuth ='<@checkPrivilege url="/api/feedback/dashboard/partners.do" def='false'>true</@checkPrivilege>'></div>
            <@checkPrivilege url="/api/feedback/dashboard/partners.do">
              <el-submenu index="阅读数据">
                <template slot="title">
                    <span>阅读数据</span>
                </template>
                <el-menu-item-group>
                    <el-menu-item index="阅读数据">阅读数据</el-menu-item>
                    <el-menu-item index="书籍数据">书籍数据</el-menu-item>
                </el-menu-item-group>
            </el-submenu>
            </@checkPrivilege>
        </el-menu>
    </div>
    <#--    2导航 结束-->

    <#--    2内容 开始-->
    <div id="dashboard_content" class="content-right">
        <div class="content-wrap-w">
            <div class="content-r-path">运营管理 / 数据报表 / {{nav}}</div>
            <div class="content-box partner-detail-panel">
                <#--                <select @change="render(nav)" v-model="selectedPartner" id="dashboard_partner_select" class="con-r-top-l-frame frame-line" style=" width:200px;padding-right: 25px">-->
                <#--                   <option v-for='one in optionalPartnerList' :value='one'> {{one.partnerName}}</option>-->
                <#--                </select>-->

                <div v-if="nav != '阅读数据' && nav != '书籍数据'">
                    <div style=" width:250px;float: left">
                        <select id="dashboard_partner_select" >
                            <option v-for='one in optionalPartnerList' :value='one.partnerId'>
                                {{one.partnerName}}
                            </option>
                        </select>
                    </div>
                    <span class="dashboard_title">
                        <el-popover  slot="reference" placement="right" width="500" trigger="click">
                            <p v-for="tipWords in tipContent">{{tipWords}}</p>
                           <span  slot="reference">
                               {{nav}}
                               <i style="margin-left: 10px" class="el-icon-question"></i>
                           </span>
                        </el-popover>
                     </span>
                    <div style="float: right;">
                        <input id="dashboard_date_pick" type="text"
                               class="layui-input"
                               name="period"
                               placeholder="选择日期范围"
                               style="height: 29px; border-color: rgb(210, 211, 213);width: 180px"/>
                    </div>
                </div>
                <div v-if="nav == '阅读数据'">
                    <div class="layui-form toolbar">
                        <div class="layui-form-item container_row_c_s">

                            <div class="layui-inline" id="partnerIdItem">
                                <select lay-filter="partnerName" id="partnerName" name="partnerName" placeholder="请选择幼儿园"
                                        lay-verify=""
                                        lay-search>
                                    <option value>全部合作商</option>
                                </select>
                            </div>
                            <!--时间选择-->
                            <div class="layui-inline" id="readTimes">
                                <input id="period" name="period" class="layui-input" type="text" placeholder="请选择时间段"
                                       lay-verify=""
                                       autocomplete="off"/>
                            </div>
                        </div>
                    </div>
                </div>
                <div v-if="nav == '书籍数据'">
                    <div class="layui-form toolbar">
                        <div class="layui-form-item container_row_c_s">

                            <div class="layui-inline" id="partnerBookRead">
                                <select lay-filter="partnerBookReadName" id="partnerBookReadName" name="partnerName" placeholder="请选择幼儿园"
                                        lay-verify=""
                                        lay-search>
                                    <option value>全部合作商</option>
                                </select>
                            </div>
                            <!--时间选择-->
                            <div class="layui-inline" id="times">
                                <input id="periodBookRead" name="period" class="layui-input" type="text" placeholder="请选择时间段"
                                       lay-verify=""
                                       autocomplete="off"/>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
            <div class="content-pro">
                <#--                3选项卡 开始-->
                <div v-if="nav != '阅读数据' && nav != '书籍数据'">
                    <div>
                        <div  style="margin-left: 1%; margin-right: 1%">
                            <el-tabs v-if="tags.length > 0" v-model="currentTag" @tab-click="changeTag">
                                <el-tab-pane v-for="tag in tags" :label="tag" :name="tag"></el-tab-pane>
                            </el-tabs>
                        </div>
                        <div v-show="nav!='留存用户'" id = "dashboard_chart" style="width: 100%;height: 400px"></div>
                    </div>
                    <#--                3选项卡 结束-->
                    <div v-show="nav!='留存用户'" class="dashboard_foot">{{currentTag?currentTag:nav}}</div>
                    <div class="dashboard_scroller">
                        <button v-show="nav!='留存用户'" @click = 'isShowDetailData = !isShowDetailData' class="frame-Button-b Button-left" style="margin-left: 1%">
                            {{isShowDetailData ? '收起明细数据' : '展开明细数据'}}</button>
                        <button class="frame-Button-b Button-right" style="float: right;margin-right: 1%">
                            <a :href="exportUrl" style="color: white">导出</a>
                        </button>
                    </div>

                    <#--                详细数据-->
                    <vt-table v-show="isShowDetailData" :table-data="tableData"></vt-table>
                </div>
                <div v-else>
                    <div class="container_row_c_s" style="width: 100%;height: 100%;padding: 0;">
                        <img src='/static/images/readData.png' class="left"
                             style="height: 20px ;margin-left: 20px;line-height:24px;margin-bottom: 5px;">
                        <p class="myTitle" style="display:inline">阅读数据</p>
                    </div>
                    <!--阅读数据-->
                    <div class="layui-row">
                        <div class="layui-col-md4 " id="read_time_totals">
                            <div class="layui-row layui-col-space15 data_card container_row_s_c">
                                <div class="layui-col-md7">
                                    <p class="font_Style">总阅读时长(小时)</p>
                                    <p class="value_Style">0</p>
                                </div>
                                <div class="layui-col-md5 layui-col-right">
                                    <div class="container_column_e_c" style="width: 100%;height: 100%;padding: 0;">
                                        <div class="circle" style="margin-left: 70px"></div>
                                        <img src='/static/images/blue-totals.png' class="bar">
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="layui-col-md4 " id="read_times_totals">
                            <div class="layui-row layui-col-space15 data_card container_row_s_c">
                                <div class="layui-col-md7">
                                    <p class="font_Style">总阅读数量(次)</p>
                                    <p class="value_Style">0</p>
                                </div>
                                <div class="layui-col-md5 layui-col-right">
                                    <div class="container_column_e_c" style="width: 100%;height: 100%;padding: 0;">
                                        <div class="circle" style="margin-left: 73px"></div>
                                        <img src='/static/images/pink-totals.png' class="bar">
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div v-if="nav == '阅读数据'">
                    <!--报表数据-->
                    <div class="layui-tab layui-tab-brief layui-tab-container1" lay-filter="readData">
                        <ul class="layui-tab-title layui-tab-ul layui-inline" id="layui-tab-ul" style="width:98%">
                            <li class="layui-this layui-active layui-tab-mainNav">
                                <button type="button" class="layui-btn layui-btn-primary" data-state-type="READDAY">日
                                </button>
                            </li>
                            <li class="layui-tab-mainNav">
                                <button type="button" class="layui-btn layui-btn-primary" data-state-type="READWEEK">周
                                </button>
                            </li>
                            <li class="layui-tab-mainNav">
                                <button type="button" class="layui-btn layui-btn-primary" data-state-type="READMONTH">月
                                </button>
                            </li>
                        </ul>
                        <div class="layui-tab-content book-tab-content1" id="book-tab-content1">
                            <div id="READDAY" class="layui-tab-item layui-show layui-tab-mainMenu">
                                <div id="cardRead_day"  style="width: 100%;height:600px;">
                                    <table id="day_data" style="width: 100%;height:600px;"></table>
                                </div>
                            </div>
                            <div id="READWEEK" class="layui-tab-item layui-tab-mainMenu">
                                <div id="cardRead_week" style="width: 100%;height:600px;">
                                    <table id="week_data" style="width: 100%;height:600px;"></table>
                                </div>
                            </div>
                            <div id="READMONTH" class="layui-tab-item layui-tab-mainMenu">
                                <div id="cardRead_month" style="width: 100%;height:600px;">
                                    <table id="month_data" style="width: 100%;height:600px;"></table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div v-if="nav == '书籍数据'">
                    <div class="layui-tab-brief layui-tab-container1">
                        <div class="book-tab-content1" id="book-tab-content1">
                            <div id="READDAY" class=" layui-show ">
                                <div id="table_data" style="width: 1400px;height:500px;margin-left: 20px">
                                    <table id="book_data" ></table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <#--                分页-->
                <div v-if="nav != '阅读数据' && nav!= '书籍数据'">
                <div v-show="isShowDetailData" id="dashboard_pagination" style="border: 0"></div>
                </div>
            </div>
        </div>
    </div>
    <#--    2内容 结束-->
</div>
<script>
    wantong.feedback.dashboard.runner.run();

</script>

<style>
    .circle {
        width: 20px;
        height: 20px;
        background-color: #303940;
        border-radius: 50%;
        -moz-border-radius: 50%;
        -webkit-border-radius: 50%;
        padding: 5px;
    }
    .data_card {
        border-radius: 10px;
        height: 150px;
        overflow: hidden;
        background: rgb(255, 255, 255);
        margin: 20px;
        box-shadow: -3px 6px 10px #ececec;
    }
    .bar {
        margin: 7px -48px 10px -48px;
        height: 80px;
    }
    .myTitle {
        color: #3A9EFC;
        font-size: 16px;
        margin: 15px;
    }
    .font_Style{
        margin: 15px;
        font-size: 15px;
        color: #5E6C84;
    }
    .value_Style{
        margin: 20px;
        font-size: 45px;
        color: #303940;
        font-family: auto;
    }
    .layui-tab-ul > li > .layui-btn {
        border: 0;
        border-radius: 20px;
        letter-spacing: 1px;
        width: 120px;
        height: 30px;
        line-height: 30px;
        font-size: 16px;
    }
    .layui-tab-brief > .layui-tab-title .layui-this {
        color: #1890FF;
    }
    .layui-tab-ul > li.layui-this > .layui-btn {
        background: #1890FF;
        color: #fff;
    }
    .layui-inline{
        width: 200px;
    }
    .layui-laypage select {
        line-height: 18px !important;
    }
</style>

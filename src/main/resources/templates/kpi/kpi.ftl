<#--KPI模块 start-->
<link rel="stylesheet" href="/static/js/3rd-party/element-ui/2.12.0/lib/theme-chalk/index.css" />
<script src="/static/js/3rd-party/vue/2.6.10/dist/vue.min.js"></script>
<script src="/static/js/3rd-party/element-ui/2.12.0/lib/index.js"></script>
<@link href="/css/demo.css" rel="stylesheet"/>
<@link href="/css/3rd-party/zui/component-chosen.css" rel="stylesheet"/>
<script src="/static/js/3rd-party/chosen.jquery.js"></script>
<style>
    .el-input__inner{
        /*选择框样式*/
        border-radius: 0!important;
    }
    th .cell{
        /*表格样式*/
        padding: 6px 0px;
        background-color: #f6f7fb;
        color: #3A3A3A;

    }
    th.is-leaf{
        /*表格样式*/
        padding-bottom: 0;
        border-bottom: 0!important;
    }
    td .cell{
        /*表格样式*/
        font-size: 12px;
        color: #737373;
    }
    li.number{
        /*分页组件样式*/
        min-height: 25px!important;
        min-width: 25px!important;
        border-radius: 0!important;
    }
    button.btn-next, button.btn-prev{
        min-height: 25px!important;
        min-width: 25px!important;
    }
</style>
<div id="kpi_display_container">
    <div class="main-w">
        <div class="content-wrap-w">

            <div class="content-r-path">KPI管理 / 效绩查看</div> <#-- 面包屑-->
            <div class="content-pro" style="background-color: white;padding: 1%">
                <el-row :gutter="30"> <#-- 选择栏 start-->
                    <el-col :span="4">
<#--                        JQueryUI 替换掉 ElementUI-->
<#--                        <el-select size="small" v-if="isSessionVT"  style="width: 95%" @change="onConditionChange" v-model="query.partner" placeholder="请选择合作商" filterable clearable>-->
<#--                            <el-option v-for="partner in setup.partnerOption" :label="partner.name" :value="partner.id"></el-option>-->
<#--                        </el-select>-->
                        <select data-placeholder="请选择合作商" id = "kpi_partner" class="form-control form-control-chosen">
                            <option v-for="partner in setup.partnerOption" :value="partner.id">{{partner.name}}</option>-->
                        </select>
                    </el-col>
                    <el-col :span="4">
<#--                        JQueryUI 替换掉 ElementUI-->
<#--                        <el-select size="small" style="width: 95%" @change="onConditionChange" v-model="query.admin" placeholder="输入账号查询" filterable clearable>-->
<#--                            <el-option v-for="admin in setup.adminOption" :label="admin.email" :value="admin.id"></el-option>-->
<#--                        </el-select>-->
                        <select data-placeholder="输入账号查询" class="kpi_select_item" id = "kpi_admin">
                            <option value="" ></option>
                            <option v-for="admin in setup.adminOption" :value="admin.id">{{admin.email}}</option>-->
                        </select>
                    </el-col>
                    <el-col :span="4">
<#--                        JQueryUI 替换掉 ElementUI-->
<#--                        <el-select size="small" style="width: 95%" @change="onConditionChange" v-model="query.role" placeholder="请选择角色" clearable>-->
<#--                            <el-option v-for="role in setup.roleOption" :label="role.name" :value="role.jobKind"></el-option>-->
<#--                        </el-select>-->
                        <select data-placeholder="请选择角色" class="kpi_select_item" id = "kpi_role">
                            <option value="" ></option>
                            <option v-for="role in setup.roleOption" :value="role.jobKind">{{role.name}}</option>-->
                        </select>
                    </el-col>
                    <el-col :span="4">
<#--                        LayUI 替换掉 ElementUI-->
<#--                        <el-date-picker size="small" style="width: 95%" @change="onConditionChange" v-model="query.date" type="month" placeholder="请选择月份" clearable></el-date-picker>-->
                        <input type="text" id="kpi_date" class="layui-input" style="height: 29px; border-color: #d2d3d5" placeholder="请选择月份" autocomplete="off">
                    </el-col>
                </el-row> <#-- 选择栏 end-->
                <el-row> <#-- 数据表格 start-->
                    <el-col span="24">
                        <el-table :data="tableData" style="width: 100%">
                            <el-table-column v-if="isSessionVT" prop="partner" label="客户" ></el-table-column>
                            <el-table-column prop="email" label="账号" ></el-table-column>
                            <el-table-column prop="role" label="角色"></el-table-column>
                            <el-table-column prop="month" label="所属日期" ></el-table-column>
                            <el-table-column prop="count" label="完成数量"></el-table-column>
                        </el-table>
                    </el-col>
                </el-row><#-- 数据表格 end-->
                <el-row> <#-- 分页 start-->
                    <el-col span="7" offset = "17">
                        <br/><br/>
                        <el-pagination hide-on-single-page
                                       small
                                       @current-change="queryData"
                                       :current-page.sync="query.currentPage"
                                       :page-size="query.pageSize"
                                       :total="query.total"
                                       pager-count="5"
                                       layout="prev, pager, next, jumper"
                                       background>
                        </el-pagination>
                    </el-col>
                </el-row><#--分页 end-->
                <el-row v-show="query.currentPage < 2">
<#--                    留白-->
                    <div style="width: 100%;height: 50px"> </div>
                </el-row>
            </div>
        </div>
    </div>
</div>
</div>
<#--KPI模块 start-->
<script>
    wantong.kpi=(()=>{

    const API_URL_SETUP = "/api/kpi/setup";
    const API_URL_QUERY = "/api/kpi/query";

    let viewModel = _initModel();
    let vueApp = _initVue();

    function _initModel() {
        return {
            setup:{
                adminOption: [],
                roleOption: [],
                partnerOption: [],
                sessionPartnerId : -1
            },
            query: {
                admin: "",
                role: "",
                partner: "",
                // date: null,
                year: 2019,
                month: -1,

                pageSize: 14,
                currentPage: 1,
                total: 0
            },
            tableData: []
        };
    }

    function _initVue() {
        return new Vue({
            el: '#kpi_display_container',
            data: viewModel,
            methods: {
                queryData: _queryData,
                onConditionChange: _onConditionChange
            },
            computed: {
                isSessionVT: ()=>{
                    return viewModel.setup.sessionPartnerId === 1;
                }
            }
        });
    }
    /**
     * 初始化化数据
     */
    function _setup() {
        get(API_URL_SETUP)
            .then(res=>{
                viewModel.setup.adminOption = res["adminOption"];
                viewModel.setup.roleOption = res["roleOption"];
                viewModel.setup.partnerOption = res["partnerOption"];
                viewModel.setup.sessionPartnerId = res["sessionPartnerId"];
                viewModel.query.partner = res["sessionPartnerId"];
            }).then(()=>{
            layui.use('laydate', ()=>{
                layui.laydate.render({
                    elem: '#kpi_date'
                    ,type: 'month'
                    ,theme: '#3ebeed'
                    ,done: function(value, date, endDate){
                        if (date.year === undefined){
                            viewModel.query.month = -1;
                        }else {
                            viewModel.query.year = date.year;
                            viewModel.query.month = date.month;
                        }
                    vueApp.onConditionChange();
                }
                });
            });
            $("#kpi_partner").val(viewModel.query.partner);
            $("#kpi_partner").chosen({
                search_contains: true,
                width: '95%'
            });
            $(".kpi_select_item").chosen({
                allow_single_deselect: true,
                search_contains: true,
                width: '95%'
            });
            $("#kpi_partner").on("change", () => {
                viewModel.query.partner = $("#kpi_partner option:selected").val();
                viewModel.query.admin = $("#kpi_admin option:selected").val();
                viewModel.query.role = $("#kpi_role option:selected").val();
                vueApp.onConditionChange();
            });
            $(".kpi_select_item").on("change", () => {
                viewModel.query.partner = $("#kpi_partner option:selected").val();
                viewModel.query.admin = $("#kpi_admin option:selected").val();
                viewModel.query.role = $("#kpi_role option:selected").val();
                vueApp.onConditionChange();
            });
            _queryData();
        });
    }

    /**
     * 入口
     * @private
     */
    function _init(){
        _setup();
    }

    function _onConditionChange() {
        // if (viewModel.query.date === null){
        //     viewModel.query.month = -1;
        // }else {
        //     viewModel.query.year = viewModel.query.date.getFullYear();
        //     viewModel.query.month = viewModel.query.date.getMonth() + 1;
        // }
        viewModel.query.currentPage = 1;
        _queryData();
    }

    //搜索数据
    function _queryData(){
        console.log(viewModel.query);
        get(API_URL_QUERY, viewModel.query)
            .then(res=>{
                viewModel.tableData = res["data"];
                viewModel.query.total = res["pagination"]["total"];
            });
    }
        /**
         * 公用方法get请求
         * @param url
         * @param param
         * @returns {Promise<any>}
         */
    function get(url, param){
        let urlParam = "";
        if (param !== undefined){
            urlParam += "?";
            for (let key in param){
                urlParam += key + "=" + param[key]+"&"
            }
        }
        return fetch(url+urlParam)
            .then(res=>res.json())
            .then(json=>{
                if (json.code !== 0){
                    vueApp["$message"].error(json.msg);
                    return null;
                }else {
                    return json.data;
                }
            });
    }

        /**
         * 公开_init方法
         */
    return {
        init: _init
    }
    })();
    wantong.kpi.init();
</script>

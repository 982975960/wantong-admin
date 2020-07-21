<@script src="/js/app/deviceLoginException.js"/>
<@script src="/js/common/pagination.js"></@script>
<@link href="/css/app/bindDeviceIdRecord.css" rel="stylesheet"/>


<div id="error_page">
    <div class="row create-partner-container">
        <div class="col-md-12">
            <div>
              <el-tabs type="card" v-model="activeName" @tab-click="handleClick">
                <el-tab-pane label="待确认" name="0"></el-tab-pane>
                <el-tab-pane label="禁用中" name="2"></el-tab-pane>
                <el-tab-pane label="已导入" name="1"></el-tab-pane>
              </el-tabs>
              <div>
                  <input type="text" class="con-r-top-l-frame frame-line" id="searchInput" placeholder="请输入设备ID" v-model.trim="searchText">
                  <button type="button" class="frame-Button" id="searchBtn" style="margin-left: 20px;" @click="handleClick">搜索</button>
                  <button value="清空"  class="search-Button02" id="clearBtn" style="margin-left: 20px;" @click="cleanClick">清空</button>
                  <button style="margin-left: 40%;" class="frame-Button" @click="exportExcel">Excel导出</button>
              </div>
            </div>

            <div v-if="tableData.length>0">
                <div class="form-group">
                    <div style="margin-top: 10px;">
                        <table class="table controls-table list-panel table-striped" id="recordDiv">
                            <thead>
                            <tr>
                                <th class="center" style="width: 10%">序号</th>
                                <th class="center" style="width: 20%">设备ID</th>
                                <th class="center" v-if="activeName!=1" style="width: 20%">异常时间</th>
                                <th class="center" v-if="activeName==0" style="width: 20%">异常备注</th>
                                <th class="center" style="width: 10%">状态</th>
                                <th class="center" v-if="activeName==0" style="width: 20%">操作</th>
                            </tr>
                            </thead>
                            <tbody>
                                <tr v-for="(item , i) in tableData">
                                    <th class="center2" style="width: 10%">{{i+1}}</th>
                                    <th class="center2" style="width: 20%">{{item.deviceId}}</th>
                                    <th class="center2" v-if="activeName!=1" style="width: 20%">{{item.time}}</th>
                                    <th class="center2" v-if="activeName==0" style="width: 20%">{{item.errorMessage}}</th>
                                    <th class="center2" v-if="item.status==2" style="width: 10%">禁用中</th>
                                    <th class="center2" v-else style="width: 10%">激活</th>
                                    <th class="center2" v-if="activeName==0" style="width: 20%">
                                        <button style="float: none;" type="button" class="Button-line btn-info" @click="forbiddenClick(item.id)">禁用
                                        </button>
                                    </th>
                                </tr>

                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <div v-else>
                <div class="text-block-con row-t">
                    <div class="alert alert-info" style="margin-top: 20px;width: 96%;margin-left: 2%" role="alert">暂无异常信息</div>
                </div>
            </div>
            <div v-show="isShowMessage" id="messageCenter_pagination" style="border: 0;" >
            </div>
        </div>
    </div>
</div>
<script>
    $(function () {
        wantong.app.deviceLoginException.init({
            appId: ${appId}
        });
    });
</script>

<style>
   /*.el-table__header-wrapper .cell{*/
   /*     font-weight:bold;*/
   /*    color: black;*/
   /* }*/
   /* .cell{*/
   /*     text-align: center;*/
   /* }*/
   /*.el-table .cell{*/
   /*     white-space: nowrap;*/
   /*     text-overflow: ellipsis;*/
   /* }*/
   #error_page .center{
       text-align: center;
       background-color: #f6f7fb;
       border-bottom: none;
       font-size: 14px;
   }

   #error_page .center2{
       text-align: center;
       border-top: 1px solid #eceff8;
   }

   #error_page  .down-btn {
       padding-left: 34%;
       border-bottom: 1px solid #eceff8;
       border-top: 1px solid #eceff8;
   }


   #error_page .layui-tab-title li {
       height: 38px;
       border: none;
       border-bottom: #e6e6e6;
   }
   #error_page .layui-tab-title li a {
       color: #737373;
   }
   #error_page .layui-tab-brief>.layui-tab-title .layui-this {
       color: #3DBEED;
       height: 40px;
       border-radius: 0;
       border-bottom: 1px solid #FFFFFF;
       border-top: 2px solid #3dbeed;
       border-left: 1px solid #e6e6e6;
       border-right: 1px solid #E6E6E6;
   }
   #error_page .layui-tab-brief>.layui-tab-more li.layui-this:after, .layui-tab-brief>.layui-tab-title .layui-this:after{
       border:none;
   }
   #error_page .layui-tab-brief>.layui-tab-title .layui-this a {
       /*color: #FFFFFF;*/
   }
   /*2个元素*/
   #error_page .layui-tab-title li:nth-last-child(2):first-child {
       /*border-top-right-radius: 0px;*/
   }
   #error_page .layui-tab-title li + li {
       /*border-top-left-radius: 0px;*/
   }


</style>

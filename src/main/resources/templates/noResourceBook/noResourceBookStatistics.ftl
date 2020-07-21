<@script src="/js/3rd-party/vue/2.6.10/dist/vue.min.js" />
<@link rel="stylesheet" href="/js/3rd-party/element-ui/2.12.0/lib/theme-chalk/index.css" />
<@script src="/js/3rd-party/element-ui/2.12.0/lib/index.js" />
<@script src = "/js/noResourceBook/noResourceBookStatistics.js"></@script>
<@script src="/js/common/pagination.js"></@script>
<script src="/static/js/3rd-party/xlsx.mini.min.js"></script>
<script src="/static/js/common/excel.js"></script>

<div class="main-w">
    <div class="content-wrap-w">
        <div class="content-r-path">
            图书管理/无资源书本统计
        </div>
        <div class="content-box" id="noResourceBookBody">
            <#--头部功能块-->
            <div class="con-r-top">
                <el-input v-model.trim="result.bookName"  placeholder="请输入书名" style="width: 15%"></el-input>
                <el-input v-model.trim="result.author" placeholder="请输入作者" style="width: 15%;margin-left: 20px"></el-input>
                <el-input v-model.trim="result.publisher" placeholder="请输入出版社" style="width: 15%;margin-left: 20px"></el-input>
                <el-input v-model.trim="result.isbn" maxlength="13" show-word-limit placeholder="请输入ISBN" style="width: 15%;margin-left: 20px"></el-input>
                <el-input v-model.trim="result.seriesTitle" placeholder="请输入系列名" style="width: 15%;margin-left: 20px"></el-input>
                <#--搜索按钮               -->
                <input name="" type="button" value="搜索" class="frame-Button-b search-Button" style="margin-left: 20px" @click = "searchRecord">
                <#--               清空按钮-->
                <input name=""  type="button" value="清空" class="search-Button02"  style="margin-left: 8px"  @click = "clearSearchData">
            </div>
            <div class="con-r-top-r">
                <@checkPrivilege url = "/noResourceBookStatistics/exportRecordNoDel.do">
                <input name=""  type="button" value="导出" class="frame-Button-b" :class="{'noSelect' : disabled}"  :disabled ="disabled" @click="exportEvent">
               </@checkPrivilege>
                <@checkPrivilege url="/noResourceBookStatistics/deleteRecord.do">
                <input name=""  type="button" value="删除" class="frame-Button-b" :class="{'noSelect' : disabled}" :disabled="disabled" @click="openHint">
                </@checkPrivilege>
            </div>
            <#--列表主体-->
            <div class="content-pro">
                <#--列表-->
                <div class="text-block-con row-t">
                    <ul>
                        <li>
                            <table width="100%">
                                <thead>
                                <tr class="text-block-head">
                                    <td>
                                        <el-checkbox  v-if="body.length > 0" v-model="checkAll" @change="handleCheckAllChange"></el-checkbox>
                                    </td>
                                    <td v-for="(a,index) in head" :width="a.width + '%'" :align="a.align"
                                        :valign="a.valign" :nowrap="a.nowrap" :bgcolor="a.bgcolor" :style="a.style">
                                        {{a.name}}
                                    </td>
                                </thead>
                                <tbody>
                                    <tr v-for="(tt,index) in body" class="anno-item" :keyId="tt.id">
                                       <td><input type="checkbox" name="" value="" v-model="tt.seleced" @change="handleCheckedItemChange($event,tt.baseBookId)"></td>
                                        <td :align="align"> {{tt.number}} </td>
                                        <td :align="align"> {{tt.isbn}} </td>
                                        <td :align="align"> {{tt.bookName}} </td>
                                        <td :align="align"> {{tt.author}} </td>
                                        <td :align="align"> {{tt.publisher}} </td>
                                        <td :align="align"> {{tt.seriesTitle}} </td>
                                        <td :align="align" style="max-width: 180px;overflow: hidden;text-overflow: ellipsis;white-space: nowrap;" :title="tt.fileURL"><div v-if='tt.fileURL != "" '><div class="demo-image__preview">
                                                    <el-image :src="tt.src"
                                                              :on-close="closeViewer"
                                                              :preview-src-list="tt.srcList">
                                                    </el-image>
                                                </div>
                                            </div>
                                            <div v-else>/</div></td>
                                        <td :align="align"> {{tt.baseBookId}} </td>
                                        <td :align="align"> {{tt.recognitionTimes}} </td>
                                    </tr>
                                    </tbody>
                            </table>
                        </li>
                    </ul>
                    <div v-if="body.length <= 0">
                        <div class="text-block-con row-t">
                            <div class="alert alert-info" style="margin-top: 20px;" role="alert">暂无相关数据</div>
                        </div>
                    </div>
                </div>
                <#--分页-->
                <div v-show="isShowMessage" id="messageCenter_pagination" style="border: 0"></div>
            </div>

        <#--diglog-->
            <el-dialog :title="title" width="350px" top="260px" :close-on-press-escape="false" :close-on-click-modal="false" append-to-body="true" :before-close="handleClose" :visible="dialogFormVisible">
                <div id = "onlySaveNext" style= "text-align: center;">
                    <button type="button" class="btn btn-primary" style="width: 149px" @click="exportOrDel">导出并删除记录</button></div>
                <div id = "keepEx" style="text-align: center;margin-top: 30px">
                    <button type="button" class="btn btn-primary" style="width: 149px" @click="exportNoDel">导出不删除记录</button>
                </div>
            </el-dialog>

            <el-dialog :title="title" width="350px" top="260px" :close-on-press-escape="false" :close-on-click-modal="false" append-to-body="true" :before-close="handleConfirmClose" :visible="dialogConfirmFormVisible">
                <div>确认删除书本信息记录吗？</div>

                <div slot="footer" class="dialog-footer">
                    <el-button type="primary" @click="delItemsEvent">确 定</el-button>
                    <el-button @click="dialogConfirmFormVisible = false">关 闭</el-button>
                </div>
            </el-dialog>
        </div>
    </div>
</div>

<script>
    wantong.noResourceBookStatistics.init({

    });
</script>
<style>
    .noSelect{
        background: #6c757d;
    }
    <#--dialog 的头部样式-->
    .el-dialog__header{
        border-bottom: 1px solid #eee;
        background-color: #f6f7fb;
    }
    <#--dialog 的脚部样式-->
    .el-dialog__footer{
        border-top: 1px solid #eceff8;
    }
</style>
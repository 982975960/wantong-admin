<@script src="/js/3rd-party/vue/2.6.10/dist/vue.min.js" />
<@link rel="stylesheet" href="/js/3rd-party/element-ui/2.12.0/lib/theme-chalk/index.css" />
<@script src="/js/3rd-party/element-ui/2.12.0/lib/index.js" />
<@script src = "/js/system/userEmailManager.js"></@script>
<@script src="/js/common/pagination.js"></@script>
<div class="main-w">
    <div class="content-wrap-w">
        <div class="content-r-path">
            系统管理/邮件中心
        </div>
        <div class="content-box" id="userEmailBody">
            <#--创建公告按钮-->
            <div class="con-r-top">
                <button class="frame-Button-b Button-left" style="float: right" @click="emailManagerEvent">管理收件人</button>
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
                                    <td v-for="a in head" :width="a.width + '%'" :align="a.align"
                                        :valign="a.valign" :nowrap="a.nowrap" :bgcolor="a.bgcolor" :style="a.style">
                                        {{a.name}}
                                    </td>
                                </thead>
                                <tbody>
                                <tr v-for="(tt,index) in body" class="anno-item" :keyId="tt.id">
                                    <td :align="align">{{tt.number}}</td>
                                    <td :align="align" style="max-width: 180px;overflow: hidden;white-space: nowrap;text-overflow: ellipsis" :title="tt.email">{{tt.email}}</td>
                                    <td :align="align" style="max-width: 180px;overflow: hidden;text-overflow: ellipsis;white-space: nowrap;" :title="tt.roleName">{{tt.roleName}}</td>
                                    <td :align="align" style="max-width: 180px;overflow: hidden;text-overflow: ellipsis;white-space: nowrap;" :title="tt.receiptName">{{tt.receiptName}}</td>
                                </tr>
                                </tbody>
                            </table>
                        </li>
                    </ul>
                </div>
                <#--分页-->
                <div v-show="isShowMessage" id="messageCenter_pagination" style="border: 0"></div>
            </div>

            <el-dialog :title="title" width="950px" top="260px" :close-on-press-escape="false" :close-on-click-modal="false" append-to-body="true" :before-close="handleClose" :visible="dialogFormVisible">
                <ul>
                    <li>
                        <table width="100%">
                            <thead style="display:table;width:100%;table-layout:fixed;">
                            <tr class="text-block-head">
                                <td v-for="a in diglogHead" :width="a.width + '%'" :align="a.align"
                                    :valign="a.valign" :nowrap="a.nowrap" :bgcolor="a.bgcolor" :style="a.style">
                                    {{a.name}}
                                </td>
                            </tr>
                            </thead>
                            <tbody style="display:block; height:300px;overflow-y:scroll;">
                            <tr v-for="tt in digUserData" class="anno-item" :keyId="tt.id" style="display:table;width:100%;table-layout:fixed;" >
                                <td :align="align" width="10%" style="padding: 0.8% 1%;border-bottom: 1px solid #eceff8;line-height: 16px">{{tt.number}}</td>
                                <td :align="align" width="15%" style="padding: 0.8% 1%;border-bottom: 1px solid #eceff8;line-height: 16px;white-space: nowrap;max-width: 100px;overflow: hidden;text-overflow: ellipsis" :title="tt.email">{{tt.email}}</td>
                                <td :align="align" width="25%" style="padding: 0.8% 1%;border-bottom: 1px solid #eceff8;line-height: 16px;white-space: nowrap;max-width: 100px;overflow: hidden;text-overflow: ellipsis" :title="tt.roleName">{{tt.roleName}}</td>
                                <td :align="align" width="50%" style="padding: 0.8% 1%;border-bottom: 1px solid #eceff8;line-height: 16px;white-space: nowrap;max-width: 180px;overflow: hidden;text-overflow: ellipsis" :title="tt.receiptName">
                                    <template>
                                        <el-checkbox-group :tid="tt.id" v-model="tt.checkList" @change="checked=>handleCheckedChange(checked,tt.id,tt.checkList)">
                                            <el-checkbox label="版本升级通知" type ="1"></el-checkbox>
                                            <el-checkbox label="图像修改通知" type ="2"></el-checkbox>
                                            <el-checkbox label="授权数量不足通知" type ="3"></el-checkbox>
                                        </el-checkbox-group>
                                    </template>
                                </td>
                            </tr>
                            </tbody>
                        </table>
                    </li>
                </ul>
                <div slot="footer" class="dialog-footer">
                    <el-button type="primary" @click="saveMessageCenterData">保 存</el-button>
                    <el-button @click="dialogFormVisible = false">关 闭</el-button>
                </div>
            </el-dialog>
        </div>
    </div>
</div>
<#--样式-->
<style>
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

<script>
    wantong.userEmailManager.init({

    });
</script>
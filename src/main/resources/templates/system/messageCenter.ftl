<@script src="/js/3rd-party/vue/2.6.10/dist/vue.min.js" />
<@link rel="stylesheet" href="/js/3rd-party/element-ui/2.12.0/lib/theme-chalk/index.css" />
<@script src="/js/3rd-party/element-ui/2.12.0/lib/index.js" />
<@script src = "/js/system/messageCenter.js"></@script>
<@script src="/js/common/pagination.js"></@script>
<@script src="/js/common/Sortable.js"></@script>
<@script src="/js/common/jquery-sortable.js"/>
<div class="main-w">
  <div class="content-wrap-w">
    <div class="content-r-path">
      系统管理/消息中心
    </div>
    <div class="content-box" id="messageBody">
    <#--创建公告按钮-->
      <div class="con-r-top">
        <button class="frame-Button-b Button-left" style="float: right" @click="createMessage">新增公告</button>
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
                <tr v-for="tt in body" class="anno-item" :keyId="tt.id">
                  <td :align="align">{{tt.number}}</td>
                  <td :align="align"><a :href="tt.href" target="_blank">{{tt.title}}</td>
                  <td :align="align"style="max-width: 180px;overflow: hidden;text-overflow: ellipsis" :title="tt.href"><a :href="tt.href" target="_blank">{{tt.href}}</td>
                  <td :align="align" style="max-width: 180px;overflow: hidden;text-overflow: ellipsis" :title="tt.departmnt">{{tt.departmnt}}</td>
                  <td :align="align">{{tt.createTime}}</td>
                  <td :align="align">
                    <button  style="margin-left: 35%" class="btn-status Button-line btn-info" @click="edit(tt)">编辑
                    </button>
                    <button class="btn-status Button-line btn-info" @click="deleteItem(tt)"> 删除
                    </button>
                  </td>
                </tr>
                </tbody>
              </table>
            </li>
          </ul>
        </div>
      <#--分页-->
        <div v-show="isShowMessage" id="messageCenter_pagination" style="border: 0"></div>
      </div>

      <el-dialog :title="title" width="600px" top="260px" :close-on-press-escape="false" :close-on-click-modal="false" append-to-body="true" :before-close="handleClose" :visible="dialogFormVisible">
        <el-form :model="form">
          <el-form-item label="标题:" label-position="left" :label-width="formLabelWidth">
            <el-input v-model="form.title" placeholder="请输入标题(最多15字)" maxlength="15" autocomplete="off" @input="change($event)"></el-input>
          </el-form-item>
          <el-form-item label="链接:"  :label-width="formLabelWidth">
            <el-input v-model="form.href" placeholder="请输入链接" autocomplete="off" @input="change($event)"></el-input>
          </el-form-item>
          <el-form-item label="部门:" :label-width="formLabelWidth">
            <el-input v-model="form.departmnt" placeholder="请输入部门或负责同事" autocomplete="off" @input="change($event)"></el-input>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button type="primary" @click="saveMessageCenterData(isEdit)">保 存</el-button>
          <el-button @click="dialogFormVisible = false">取 消</el-button>
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
  $(function () {
    wantong.messageCenter.init();
  });
</script>
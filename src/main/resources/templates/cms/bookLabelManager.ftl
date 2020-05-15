<!DOCTYPE html>
	<head>
    <meta charset="utf-8">
      <@script src="/js/cms/label_manager.js"/>
  </head>
<style>
  #bookLabelManager .layui-tab-title li {
    /*border-top-left-radius: 5px;*/
    /*border-top-right-radius: 5px;*/
    /*border: 1px solid #3dbeed;*/
    /*border-bottom: none;*/
    /*background: #FFFFFF;*/

    height: 38px;
    border: none;
    border-bottom: #e6e6e6;
  }
  #bookLabelManager .layui-tab-title li a {
    color: #737373;
  }
  #bookLabelManager .layui-tab-brief>.layui-tab-title .layui-this {
    /*background: #3dbeed;*/
    /*border-bottom: none;*/
    height: 40px;
    border-radius: 0;
    border-bottom: #FFFFFF;
    border-top: 2px solid #3dbeed;
    border-left: 1px solid #e6e6e6;
    border-right: 1px solid #E6E6E6;
  }
  #bookLabelManager .layui-tab-brief>.layui-tab-more li.layui-this:after, .layui-tab-brief>.layui-tab-title .layui-this:after{
    border:none;
  }
  #bookLabelManager .layui-tab-brief>.layui-tab-title .layui-this a {
    /*color: #FFFFFF;*/
  }
  /*2个元素*/
  #bookLabelManager .layui-tab-title li:nth-last-child(2):first-child {
    /*border-top-right-radius: 0px;*/
  }
  #bookLabelManager .layui-tab-title li + li {
    /*border-top-left-radius: 0px;*/
  }
</style>
<body>
<div class="main-w">
  <div class="content-wrap-w">
    <div class="content-r-path">图书管理 / 标签管理 / 正在使用</div>
    <div id="bookLabelManager" class="content-box">

      <div id="showBookLabel">
        <div class="layui-tab layui-tab-brief" lay-filter="docDemoTabBrief" style="margin-top: 0">
          <ul class="layui-tab-title" tabSelect="${tabSelect}">
            <#if partnerId ==1>
              <li class="layui-this" id="wt"><a href="#">玩瞳标签</a></li>
            <#else>
              <li class="layui-this" id="partner"><a href="#">客户标签</a></li>
              <li id="wt"><a href="#">玩瞳标签</a></li>
            </#if>
          </ul>
        </div>
        <div class="con-r-top">
           <div class="con-r-top-l">
            <select class="con-r-top-l-frame frame-line" name="changel-label-state" id="changeLabelStateList"
                    style="width: 85px;padding-left: 10px;background: url(static/images/ico6.png) no-repeat 90% center transparent;">
              <option value="0">正在使用</option>
              <option value="1">已废弃</option>
            </select>
          </div>

          <div class="con-r-top-r">

            <input type="hidden" id="enabled">
            <#--创建标签的权限-->
            <@checkPrivilege url="/cms/createLabel.do">
              <#if isCreateLabel>
                 <#if enabled == 0>
                    <button class="frame-Button-b Button-left" id="createlabelbtn">创建书本标签</button>
                 </#if>
              </#if>
            </@checkPrivilege>
          </div>
        </div>
        <div class="content-pro">

     <#if list?size == 0>
       <#if enabled==0>
         <hr></hr>
         无书本标签，创建新的？
         <button type="button" id="createlabel" class="frame-Button-b Button-left">是的</button>
       <#else>
         <label style="margin-top: 16px;font-size: 16px;font-weight: normal;">暂无废弃标签</label>
       </#if>
     <#else>
        <div class="text-block-con row-t">
          <ul>
            <li>
              <table width="100%" border="0" cellpadding="0" cellspacing="0">
                <thead>
                <tr class="text-block-head">
                  <td width="10%" align="left" valign="middle" nowrap="nowrap" bgcolor="#f6f7fb"
                      style="border-bottom:none;">序号
                  </td>
                  <td width="10%" align="left" valign="middle" nowrap="nowrap" bgcolor="#f6f7fb"
                      style="border-bottom:none;">一级标签
                  </td>
                  <td width="15%" align="left" valign="middle" nowrap="nowrap" bgcolor="#f6f7fb"
                      style="border-bottom:none;">二级标签
                  </td>
                  <td width="24%" align="left" valign="middle" nowrap="nowrap" bgcolor="#f6f7fb"
                      style="border-bottom:none;">三级标签
                  </td>
                  <td width="10%" align="left" valign="middle" nowrap="nowrap" bgcolor="#f6f7fb"
                      style="border-bottom:none;">更新时间
                  </td>
                  <td width="11%" align="left" valign="middle" nowrap="nowrap" bgcolor="#f6f7fb"
                      style="border-bottom:none;">操作
                  </td>
                </tr>
                </thead>
                <tbody>
				<#list list as l>
        <tr>
          <td align="left">
            ${l_index+1}
          </td>
        <#--一级标签的名字-->
          <td align="left" labelId = ${l.id} style="white-space: normal">

            ${l.labelName}
          </td>
          <td colspan="2" align="left" valign="top">
            <table width="100%" border="0" cellpadding="0" cellspacing="0">
            <#--遍历二级菜单-->
             <#list l.childLabels as c>
             <tr>
               <td width="40%" align="left" labelId="${c.id}" style="border-bottom:none; padding-left:0;">
                 ${c.labelName}
               </td>
               <#assign thirdAllId>
                 <#list c.childLabels as d>
                   <#assign t = c.childLabels?size>
                   ${d.id}
                   <#if ( t != d_index+1)>
                     /
                   </#if>
                 </#list>
               </#assign>

                <#assign thirdName>
                  <#list c.childLabels as e>
                    <#assign k = c.childLabels?size>
                    ${e.labelName}
                    <#if ( k != e_index+1)>
                      /
                    </#if>
                  </#list>
                </#assign>

               <td width="60%" align="left"
                   style="border-bottom:none; padding-left:0;" allThirdId="${thirdAllId}" >${thirdName}
               </td>
             </tr>
             </#list>
            </table>
          </td>
          <td align="left">
            ${l.updateTime?string('yyyy-MM-dd HH:mm:ss')}
          </td>
          <td align="left">
             <#--判断是不是玩瞳用户和是不是玩瞳标签-->
             <#if (partnerId!=1)>
               <#if (l.partnerId==1)>
               <#else>
                 <#if enabled == 0>
                   <@checkPrivilege url="/cms/updateLabel.do">
              <button class="btn-edit Button-line btn-info" id="editBookLabelBtn">
                编辑
              </button>
                   </@checkPrivilege>
                 <#--检测删除标签的权限-->
                   <@checkPrivilege url="/cms/deleteLabel.do">
                <button class="btn-del  Button-line btn-info" labelId="${l.id}" id="deleteBookLabelBtn">
                  删除
                </button>
                   </@checkPrivilege>
                 <#--废弃权限-->
                   <@checkPrivilege url="/cms/discardAndRestoreLabel.do">
              <button class="btn-discard Button-line btn-info" order = "discardAndRestoreLabel">
                废弃
              </button>
                   </@checkPrivilege>
                 <#else>
                   <@checkPrivilege url="/cms/discardAndRestoreLabel.do">
                    <button class="btn-discard Button-line btn-info" order = "discardAndRestoreLabel">
                      还原
                    </button>
                   </@checkPrivilege>
                   <#--检测删除标签的权限-->
                   <@checkPrivilege url="/cms/deleteLabel.do">
                     <button class="btn-del  Button-line btn-info" labelId="${l.id}" id="deleteBookLabelBtn">
                       删除
                     </button>
                   </@checkPrivilege>
                 </#if>
               </#if>
             <#else>
               <#if enabled == 0>
                 <@checkPrivilege url="/cms/updateLabel.do">
              <button class="btn-edit Button-line btn-info" id="editBookLabelBtn">
                编辑
              </button>
                 </@checkPrivilege>
               <#--检测删除标签的权限-->
                 <@checkPrivilege url="/cms/deleteLabel.do">
                <button class="btn-del  Button-line btn-info" labelId="${l.id}" id="deleteBookLabelBtn">
                  删除
                </button>
                 </@checkPrivilege>
               <#--废弃权限-->
                 <@checkPrivilege url="/cms/discardAndRestoreLabel.do">
              <button class="btn-discard Button-line btn-info" order = "discardAndRestoreLabel">
                废弃
              </button>
                 </@checkPrivilege>
               <#else>
                 <@checkPrivilege url="/cms/discardAndRestoreLabel.do">
                <button class="btn-discard Button-line btn-info" order = "discardAndRestoreLabel">
                  还原
                </button>
                 </@checkPrivilege>
                 <@checkPrivilege url="/cms/deleteLabel.do">
                   <button class="btn-del  Button-line btn-info" labelId="${l.id}" id="deleteBookLabelBtn">
                     删除
                   </button>
                 </@checkPrivilege>
               </#if>
             </#if>

          </td>
        </tr>
        </#list>
                </tbody>
              </table>
        </div>
     </#if>
        </div>
      </div>

      <div class="popups-con" id="createBookLabel" style="display: none">
        <div class="popups-b">
          <div class="label-box primary-label">
            <span class="label-name">一级标签：</span>
            <span><input name="text" type="text" labelId="0" id="text" value="" maxlength="15" class="popups-line p-width" /></span>
          </div>

          <!--新增一个二级标签样式-->

          <div class="label-box">
            <span class="label-b-img2" id="addSecondLable"><img src="static/images/ico12.png" width="13" height="13" />添加二级标签</span>
          </div>
          <!--新增加标签样式结束-->
          <div class="popups-bot">
            <span>
              <input name="提交" id="saveBtn" type="submit" class="pop-padding frame-Button-b Button-left" value="保存" />
              <input name="提交" id="closeBtn" type="submit" class="pop-padding frame-Button Button-left" value="取消" />
            </span>
          </div>

        </div>
      </div>


      <!--分页-->
      <div class="con-page" style="border-top: none">
        <div class="hint-label" style="float: left">
          <label class="text" style="    margin-top: 5px;font-weight: normal;font-size: 14px;">注意：如果您为书本勾选添加了玩瞳标签，当玩瞳对标签有修改时，您之前勾选了玩瞳标签的书本也会随之更新标签信息。</label>
        </div>
      <#if (pages > 1)>
        <div id="paginationContainer">
          <div>
            <nav aria-label="Page navigation">
              <ul id="pagination" class="" currentPage="${currentPage}" pages="${pages}"
                  pageSize="${pageSize}" style="margin-top: 0px;">
              </ul>
            </nav>
          </div>
        </div>
      </#if>
      </div>

    </div>
  </div>
</div>
</body>
</html>
<script>
  $(function () {
    wantong.bookLabelManager.init();
  });

</script>
<@script src="/js/role/rolemanager.js"></@script>
<@link href="/css/auth/auth.css" rel="stylesheet"/>
<div class="main-w">
  <div class="content-wrap-w">
    <div class="content-r-path">系统管理 / 角色维护</div>
<div id="rolemanager" class="content-box">
  <form id="searchFrom" action="" method="get">
    <input type="hidden" name="currentPage" id="currentPage" value="${page.currentPage!}" />
  </form>
  <div class="con-r-top">
  <div class="con-r-top-r">
	<@checkPrivilege url="/role/createrole.do">
    <button class="frame-Button-b Button-left" id="createRoleBtn">创建角色</button>
  </@checkPrivilege>
  </div>
  </div>

  <div class="content-pro">
    <div class="text-block-con row-t">
      <ul>
        <li>
      <table width="100%" border="0" cellpadding="0" cellspacing="0">
        <thead>
        <tr class="text-block-head">
          <td width="20%" align="left" valign="middle" nowrap="nowrap" bgcolor="#f6f7fb" style="border-bottom:none;">序号</td>
          <td width="60%" align="left" valign="middle" nowrap="nowrap" bgcolor="#f6f7fb" style="border-bottom:none;">名称</td>
          <td width="20%" align="left" valign="middle" nowrap="nowrap" bgcolor="#f6f7fb" style="border-bottom:none;">操作</td>
        </tr>
        </thead>
        <tbody>
				<#list page.data as l>
        <tr>
          <td align="left">
            ${l_index+1}
          </td>
          <td align="left">
            ${l.name}
          </td>
          <td align="left">
							<@checkPrivilege url="/role/updateRole.do">
								<button class="btn-edit Button-line btn-info"
                        tid="${l.id}"
                        tpartnerId="${l.partnerId}"
                        tname="${l.name}">
                  编辑
                </button>
              </@checkPrivilege>
							<@checkPrivilege url="/grantAuth/manager.do">
								<button class="btn-grantAuth Button-line btn-info" tid="${l.id}" tname="${l.name}">
                  权限分配
                </button>
              </@checkPrivilege>
          </td>
        </tr>
        </#list>
        </tbody>
      </table>
        </li>
      </ul>
    </div>
  </div>

  <!--分页-->
  <#if (page.totalPage>1)>
    <div id="pageline" class="con-page" style="border:none; margin-top:1%;">
      <ul>
        <#--<li><a href="#" page="${page.first}">首页</a></li>-->
        <li class="page-back"><a href="#" page="${page.prev}"><img src="/static/images/ico9_03.png"></a></li>
        <#list page.arrPage as p>
          <#if p==page.currentPage>
            <li class="page-back-b"><a page="0">${p}</a></li>
          <#elseif p==-1>
            <li class="disabled page-back-b2"><a href="#" onclick="return false;">...</a></li>
          <#else >
            <li class="page-back-b2"><a href="#" page="${p}">${p}</a></li>
          </#if>
        </#list>
        <li class="page-back"><a href="#" page="${page.next}"><img src="/static/images/ico9_05.png"></a></li>
        <Li>到第</Li>
        <Li><input name="text" type="text" class="page-box page-back" id="pageText"/></Li>
        <Li>页</Li>
        <Li><input name="" type="submit" value="跳转" class="page-input" id="pageJump" totalPage="${page.totalPage}"/></Li>
      </ul>
    </div>
  </#if>
  <!--分页-->

  <!-- 创建角色 -->
  <div id="createRole" style="display: none">
      <form id="createRoleForm" method="post" action="">
          <div class="modal-body">
            <input type="hidden" name="partnerId" value="${admin.partnerId}">
            <div class="input-group form-group-sm col-xs-6" style="margin-bottom:5px;">
              <span class="input-group-addon">角色名称</span>
              <input type="text" class="form-control" name="name" id="describe" placeholder="不能大于15个字符"/>
              <input style="display: none" type="text">
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" id="saveBtn" class="pop-padding frame-Button-b">保存</button>
            <button type="button" id="closeBtn" class="pop-padding frame-Button">关闭</button>
          </div>
      </form>
  </div>
  <!-- 创建角色 -->

  <!-- 修改 -->
  <div style="display: none" id="editRole">
      <form id="editRoleForm" method="post" action="">

          <div class="modal-body">
            <input type="hidden" name="id" id="id" value=""/>
            <input type="hidden" name="partnerId" value="${admin.partnerId}">
            <div class="input-group form-group-sm col-xs-6" style="margin-bottom:5px;">
              <span class="input-group-addon">角色名称</span>
              <input type="text" class="form-control" name="name" id="name" onkeydown="if(event.keyCode==13)return false;" onSubmit="return checkSubmit();"placeholder="不能大于15个字符"/>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" id="saveBtn" class="pop-padding frame-Button-b">保存</button>
            <button type="button" id="closeBtn" class="pop-padding frame-Button">关闭</button>
          </div>
      </form>
  </div>
  <!-- 修改 -->
</div>	
<script>
  $(function () {
    wantong.rolemanager.init();
  });
</script>
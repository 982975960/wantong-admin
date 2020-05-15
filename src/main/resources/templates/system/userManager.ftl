<#--搜索输入框引入-->
<@link href="/css/demo.css" rel="stylesheet"/>
<@link href="/css/3rd-party/zui/component-chosen.css" rel="stylesheet"/>
<@script src="/js/3rd-party/chosen.jquery.js"/>

<@script src="/js/system/userManager.js"></@script>
<div class="main-w">
  <div class="content-wrap-w">
    <div class="content-r-path">系统管理 / 用户管理</div>
<div id="userManager" class="content-box">
  <form id="searchFrom" action="" method="get">
    <input type="hidden" name="currentPage" id="currentPage" value="${page.currentPage!}" />
    <input type="hidden" name="searchText" id="searchText" value="${searchText}">
  </form>
  <div class="con-r-top">
    <input hidden type="text" style="width: 400px;margin-left: 10px" class="con-r-top-l-frame frame-line" id="searchInput"  value="${searchText}" placeholder="请输入邮箱开始搜索" / >

    <button id="searchSupplierBtn" class="frame-Button" hidden="hidden">查找</button>

    <div class="col-xs-12 col-md-4 mb-5" style="min-width: 300px">
      <select id="searchSelect" class="form-control form-control-chosen"
              data-placeholder="请输入要查找的邮箱开始搜索">
        <option></option>
          <#list emailList as p>
            <option value="${p.email}">${p.email}</option>
          </#list>
      </select>
    </div>

  <div class="con-r-top-r">
		<@checkPrivilege url="/system/createUser.do">
      <button class="frame-Button-b Button-left"
              id="createRoleBtn">创建用户
      </button>
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
        <td width="10%" align="left" valign="middle" nowrap="nowrap" bgcolor="#f6f7fb" style="border-bottom:none;">序号</td>
        <td width="10%" align="left" valign="middle" nowrap="nowrap" bgcolor="#f6f7fb" style="border-bottom:none;">供应商</td>
        <td width="15%" align="left" valign="middle" nowrap="nowrap" bgcolor="#f6f7fb" style="border-bottom:none;">邮箱</td>
        <td width="30%" align="left" valign="middle" nowrap="nowrap" bgcolor="#f6f7fb" style="border-bottom:none;">角色</td>
        <td width="10%" align="left" valign="middle" nowrap="nowrap" bgcolor="#f6f7fb" style="border-bottom:none;">创建时间</td>
        <td width="10%" align="left" valign="middle" nowrap="nowrap" bgcolor="#f6f7fb" style="border-bottom:none;">状态</td>
        <td width="15%" align="left" valign="middle" nowrap="nowrap" bgcolor="#f6f7fb" style="border-bottom:none;">操作</td>
        </tr>
        </thead>
        <tbody>
				<#list page.data as l>
        <tr>
          <td align="left">
            ${l_index+1}
          </td>
          <td align="left">
            ${l.partnerName}
          </td>
          <td align="left">
            ${l.email}
          </td>
          <td align="left">
            ${l.roleNames!}
          </td>
          <td align="left">
            ${l.createdTime?string("yyyy-MM-dd")}
          </td>
          <td class="status" align="left">
							<#if l.status==0>
                停用
              <#elseif l.status==1>
								正常
              <#elseif l.status==2>
								待激活
              </#if>
          </td>
          <td align="left">
							<@checkPrivilege url="/system/changeUserStatus.do">
									<button
										<#if l.status==2>
											disabled
                    </#if>
                      class="btn-status Button-line btn-info" tid="${l.id}" status="${l.status}">
										<#if l.status==0>
                      启用
                    <#elseif l.status==1>
											禁用
                    <#elseif l.status==2>
											待激活
                    </#if>
                  </button>
              </@checkPrivilege>
								<@checkPrivilege url="/grantRole/manager.do">
									<button
                      class="btn-grantRole Button-line btn-info" tid="${l.id}">
										角色分配
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
        <Li><input type="text" id="pageText" class="page-box page-back" onkeyup="this.value=this.value.replace(/[^0-9]+/,'');"></Li>
        <Li>页</Li>
        <Li><input name="" type="submit" value="跳转" class="page-input" id="pageJump" totalPage="${page.totalPage}"/></Li>
      </ul>
    </div>
  </#if>
  <!--分页-->

  <!-- 创建新用户 -->
  <div style="display: none" id="createUser">
    <form id="userForm" method="post" action="">
      <div class="modal-body">
        <div class="input-group form-group-sm col-xs-6" style="margin-bottom:5px;">
          <span class="input-group-addon">邮箱:</span>
          <input type="text" class="form-control" name="email" id="email" placeholder="请输入邮箱"/>
          <input type="text" style="display: none">
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" id="saveBtn" class="pop-padding frame-Button-b">保存</button>
        <button type="button" id="closeBtn" class="pop-padding frame-Button">关闭</button>
      </div>
    </form>
  </div>
  <!-- 创建新用户 -->
</div>
  </div>
</div>
  <script>
  $(function () {
    wantong.userManage.init();
  });
</script>
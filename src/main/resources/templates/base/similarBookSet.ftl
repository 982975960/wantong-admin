<@link href="/css/3rd-party/zui/component-chosen.css" rel="stylesheet" />
<@script src="/js/3rd-party/chosen.jquery.js" />
<@script src="/js/base/similar_set.js"></@script>
<div class="similar-set-container">
  <div class="similar-set">
    <!-- 筛选条件 -->
    <div class="search-head">
  <span class="search-span" style="width: 20%; max-width: 230px">
    <select id="similarSetSelector" class="form-control form-control-chosen" data-placeholder="请输入书组名称"
            data-compact_search="true"
            name="${(name)!''}">
               <option value=""></option>
        <#if names?? && (names?size > 0) >
                   <#list names as name>
                     <option value="${(name)!''}">${(name)!''}</option>
                   </#list>
               </#if>
      </select>
  </span>
      <div class="con-r-top-r">
          <@checkPrivilege url="/base/addSimilarSet.do">
            <input  type="button" class="set-create-btn frame-Button-b Button-left" value="创建书组" id="createBookSet">
          </@checkPrivilege>
      </div>
    </div>
    <!-- 表格 -->
    <div class="content-pro">
      <div class="text-block-con row-t">
        <ul>
          <li>
            <table width="100%" border="0" cellpadding="0" cellspacing="0">
              <thead>
              <tr class="text-block-head">
                <td width="3%" align="left" valign="middle" nowrap="nowrap" bgcolor="#f6f7fb"
                    style="border-bottom:none;">序号
                </td>
                <td width="14%" align="left" valign="middle" nowrap="nowrap" bgcolor="#f6f7fb"
                    style="border-bottom:none;">书组名称
                </td>
                <td width="13%" align="center" valign="middle" nowrap="nowrap" bgcolor="#f6f7fb"
                    style="border-bottom:none;">创建时间
                </td>
                <td width="20%" align="left" valign="middle" nowrap="nowrap" bgcolor="#f6f7fb"
                    style="border-bottom:none;">创建账户
                </td>
                <td width="15%" align="left" valign="middle" nowrap="nowrap" bgcolor="#f6f7fb"
                    style="border-bottom:none;">操作
                </td>
              </tr>
              </thead>
              <#if data?? && (data?size > 0) >
                <tbody>
                <#list data as set>
                  <tr style="height: 50px">
                    <td align="left">
                        #{set_index + 1}
                    </td>
                    <td align="left" style="white-space: normal">
                        ${(set.name)!''}
                    </td>
                    <td align="center">
                        ${set.createTime!''}
                    </td>
                    <td align="left">
                        ${(set.createAdminEmail)!''}
                    </td>
                    <td align="left">
                      <@checkPrivilege url="/base/updateSimilarSet.do">
                      <button type="button" sid="${set.id}" class="set-edit-btn Button-line btn-info">编辑</button>
                      </@checkPrivilege>
                      <@checkPrivilege url="/base/openSimilarSet.do">
                      <button type="button" sid="${set.id}" class="set-open-btn Button-line btn-info">查看</button>
                      </@checkPrivilege>
                      <@checkPrivilege url="/base/deleteSimilarSet.do">
                      <button type="button" sid="${set.id}" class="set-del-btn Button-line btn-info">删除</button>
                      </@checkPrivilege>
                    </td>
                  </tr>
                </#list>
                </tbody>
              </#if>
            </table>
                <#if data?? && (data?size > 0)>
                <#else>
                  <div class="alert alert-info" style="margin-top: 20px;" role="alert">暂无数据</div>
                </#if>
          </li>
        </ul>
      </div>
    </div>
      <#assign pages = pagination.pages>
      <#assign currentPage = pagination.currentPage>
      <#assign pageSize = pagination.pageSize>
      <#assign totalRecord = pagination.totalRecord>
      <div class="con-page" style="border-top: none;">
        <div id="paginationContainer">
          <div>
            <nav aria-label="Page navigation">
                <#if (pages > 1)>
                  <ul id="pagination" class="" currentPage="${currentPage}" pages="${pages}"
                      pageSize="${pageSize}" style="margin-top: 0px;">
                  </ul>
                </#if>
            </nav>
          </div>
        </div>
      </div>
  </div>

  <!-- Tab2 -->
  <div class="similar-set-detail" style="display: none;">
  </div>


  <div style="display: none" class="layer-ops-window">
    <!-- 创建 -->
    <div id="setCreateTemplate" class="row create-set-container" style="width: 100%;display: none">
      <div class="modal-body">
        <form id="createSetForm" method="post" action="">
          <div class="input-group form-group-sm col-xs-10" style="margin-bottom:15px;margin-left: 40px;margin-top: 20px">
            <span class="input-group-addon" style="border: none;background-color:#FFFFFF ">书组名称</span>
            <input type="text" class="form-control" id="setName"  onkeydown="if(event.keyCode==13){return false;}" placeholder="输入数组名称" maxlength="100" style="margin-left: 10px">
          </div>
        </form>
      </div>
      <div class="modal-footer" style="width: 100%;float: left">
        <button type="button" id="saveBtn" class="pop-padding frame-Button-b">保存</button>
        <button type="button" id="closeBtn" class="pop-padding frame-Button" data-dismiss="modal" >关闭</button>
      </div>
    </div>
  </div>
</div>

<script>
  wantong.similar.init();
</script>
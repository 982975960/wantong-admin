<@link href="/css/3rd-party/zui/component-chosen.css" rel="stylesheet" />
<@script src="/js/3rd-party/chosen.jquery.js" />
<!-- 筛选条件 -->
<div class="search-head">
  <span class="search-span" style="width: 20%; max-width: 230px">
    <select id="partnerSelector" class="form-control form-control-chosen" data-placeholder="请输入要查找的合作商"
            data-compact_search="true" partnerid="${(partnerId)!''}">
               <option value="0"></option>
       <#if partners?? && (partners?size > 0) >
           <#list partners as partner>
             <option value="${(partner.id)!''}">${(partner.name)!''}</option>
           </#list>
       </#if>
      </select>
  </span>
  <span id="timeContainer" class="search-span" style="margin-left: 30px; width: 20%; max-width: 230px">
    <input id="startTime" type="text" month="${(month)!''}" readonly="readonly" placeholder="选择月份"
           class="layui-input time-input" autocomplete="off">
  </span>
</div>
<!-- 表格 -->
<div class="content-pro">
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
                style="border-bottom:none;">客户
            </td>
            <td width="10%" align="center" valign="middle" nowrap="nowrap" bgcolor="#f6f7fb"
                style="border-bottom:none;">appId
            </td>
            <td width="20%" align="left" valign="middle" nowrap="nowrap" bgcolor="#f6f7fb"
                style="border-bottom:none;">激活码
            </td>
            <td width="15%" align="left" valign="middle" nowrap="nowrap" bgcolor="#f6f7fb"
                style="border-bottom:none;">注销时间
            </td>
          </tr>
          </thead>
            <#if records?? && (records?size > 0) >
              <tbody>
              <#list records as record>
                <tr style="height: 50px">
                  <td align="left">
                      #{record_index + 1}
                  </td>
                  <td align="left" style="white-space: normal">
                      ${(record.partner)!''}
                  </td>
                  <td align="center">
                      ${(record.appId)!''}
                  </td>
                  <td align="left">
                      ${(record.qrCode)!''}
                  </td>
                  <td align="left">
                      ${record.createdTime?string('yyyy-MM-dd HH:mm:ss')}
                  </td>
                </tr>
              </#list>
              </tbody>
            </#if>
        </table>
          <#if records?? && (records?size > 0)>
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
          <#if records?? && (records?size > 0)>
            <div style="float: left">总注销量: ${totalRecord}</div>
          </#if>
          <#if (pages > 1)>

            <ul id="pagination" class="" currentPage="${currentPage}" pages="${pages}"
                pageSize="${pageSize}" style="margin-top: 0px;">
            </ul>
          </#if>
      </nav>
    </div>
  </div>
</div>
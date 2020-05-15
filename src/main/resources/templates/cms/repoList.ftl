<#assign repoAmount = repos?size>
<div id="repo-list" class="content-pro">

  <#if (repoAmount > 0)>
  <div class="text-block-con row-t">
    <ul>
      <li>
        <table width="100%" border="0" cellpadding="0" cellspacing="0" id="repoPanel">
          <thead>
          <tr class="text-block-head">
            <td width="6%" align="center" valign="middle" nowrap="nowrap" bgcolor="#f6f7fb"
                style="border-bottom:none;">序号
            </td>
            <td width="10%" align="left" valign="middle" nowrap="nowrap" bgcolor="#f6f7fb"
                style="border-bottom:none;padding-right: 10px">客户
            </td>
            <td width="10%" align="center" valign="middle" nowrap="nowrap" bgcolor="#f6f7fb"
                style="border-bottom:none;">资源库ID
            </td>
            <td width="19%" align="left" valign="middle" nowrap="nowrap" bgcolor="#f6f7fb"
                style="border-bottom:none;">资源库名称
            </td>
            <td width="5%" align="center" valign="middle" nowrap="nowrap" bgcolor="#f6f7fb"
                style="border-bottom:none;">语言
            </td>
            <td width="5%" align="center" valign="middle" nowrap="nowrap" bgcolor="#f6f7fb"
                style="border-bottom:none;">声线
            </td>
            <td width="15%" align="left" valign="middle" nowrap="nowrap" bgcolor="#f6f7fb"
                style="border-bottom:none;">创建时间
            </td>
            <td width="12%" align="left" valign="middle" nowrap="nowrap" bgcolor="#f6f7fb" style="border-bottom:none;">
                        操作
            </td>
          </tr>
          </thead>
          <tbody>
                <#if (repos?size>0)>

                  <#list repos as l>
                    <tr>
                      <td align="center">
                        ${l_index+1}
                      </td>
                      <td align="left">
                        ${partnerName}
                      </td>
                      <td align="center">
                          ${l.id}
                      </td>
                      <td align="left" style="padding-right: 10px;">
                        ${l.name}
                      </td>
                      <td align="center">
                        <#switch l.language>
                            <#case 0>
                              ${"未知"}<#break>
                            <#case 1>
                              ${"中文"}<#break>
                            <#case 2>
                              ${"英文"}<#break>
                            <#case 3>
                              ${"其他语言"}<#break>
                            <#default>
                              ${"未知"}<#break>
                        </#switch>
                      </td>
                      <td align="center">
                        <#switch l.soundRay>
                          <#case 0>
                            ${"未知"}<#break>
                          <#case 1>
                            ${"人声"}<#break>
                          <#case 2>
                            ${"TTS"}<#break>
                          <#default>
                            ${"未知"}<#break>
                        </#switch>
                      </td>
                      <td align="left">
                        ${l.returnTime}
                      </td>
                      <td align="left" repoId =${l.id}>
                        <@checkPrivilege url="/cms/editRepo.do">
                          <button class="btn-info Button-line set-repo-btn"  id="${l.id}" partnerId = "${l.partnerId}" partnerName="${partnerName}" encrypt = "${l.encrypt}" modelid="${l.modelId}" name ="${l.name}" language ="${l.language}" soundRay ="${l.soundRay}">
                          编辑
                          </button>
                        </@checkPrivilege >
                          <@checkPrivilege url="/cms/setRepoAdmin.do">
                            <button class="btn-info Button-line set-repo-admin-btn"  repo_id="${l.id}">
                              指定操作用户
                            </button>
                          </@checkPrivilege >
                      </td>
                    </tr>
                  </#list>
                </#if>
          </tbody>
        </table>
      </li>
    </ul>
  </div>
    <#else>
    <div class="text-block-con row-t">
      <div class="alert alert-info" style="margin-top: 20px;" role="alert">没有搜索到相关资源库</div>
    </div>
  </#if>
</div>

<div class="con-page" style="border-top: none;">
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
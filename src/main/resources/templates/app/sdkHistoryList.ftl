<div class="content-pro" id="historyContent">
  <div class="text-block-con row-t">
    <ul>
      <li>
        <table width="100%" border="0" cellpadding="0" cellspacing="0" id="repoPanel">
          <thead>
          <tr class="text-block-head">
            <td width="15%" align="center" valign="middle" nowrap="nowrap" bgcolor="#f6f7fb"
                style="border-bottom:none;">版本
            </td>
            <td width="40%" align="left" valign="middle" nowrap="nowrap" bgcolor="#f6f7fb"
                style="border-bottom:none;">更新说明
            </td>
            <td width="25%" align="left" valign="middle" nowrap="nowrap" bgcolor="#f6f7fb"
                style="border-bottom:none;">创建时间
            </td>
            <td width="20%" align="left" valign="middle" nowrap="nowrap" bgcolor="#f6f7fb" style="border-bottom:none;">
                        操作
            </td>
          </tr>
          </thead>
          <tbody>
                <#if (sdkVersions?size>0)>
                  <#list sdkVersions as version>
                    <tr>
                      <td align="center">
                        ${version.version}
                      </td>
                      <td align="left">
                        ${version.description}
                      </td>
                      <td align="left">
                        ${version.createTime}
                      </td>
                      <td align="left">
                        <button class="btn-info Button-line set-repo-btn" name="download" url="${version.downloadUrl}">
                          下载
                        </button>
                      </td>
                    </tr>
                  </#list>
                </#if>
          </tbody>
        </table>
      </li>
    </ul>
  </div>
</div>

<div class="con-page" style="border-top: none;">
  <#if (pages > 1)>
    <div id="paginationContainer">
      <div>
        <nav aria-label="Page navigation">
          <ul id="historyPagination" class="" currentPage="${currentPage}" pages="${pages}"
              pageSize="${pageSize}" style="margin-top: 0px;">
          </ul>
        </nav>
      </div>
    </div>
  </#if>
</div>
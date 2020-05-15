<#assign sdkAcount = sdks?size>
<div id="sdk-list" class="content-pro">

  <#if (sdkAcount > 0)>
  <div class="text-block-con row-t">
    <ul>
      <li>
        <table width="100%" border="0" cellpadding="0" cellspacing="0" id="repoPanel">
          <thead>
          <tr class="text-block-head">
            <td width="8%" align="center" valign="middle" nowrap="nowrap" bgcolor="#f6f7fb"
                style="border-bottom:none;">平台
            </td>
            <td width="8%" align="left" valign="middle" nowrap="nowrap" bgcolor="#f6f7fb"
                style="border-bottom:none;padding-right: 10px">SDK类型
            </td>
            <td width="10%" align="center" valign="middle" nowrap="nowrap" bgcolor="#f6f7fb"
                style="border-bottom:none;">版本
            </td>
            <td width="27%" align="left" valign="middle" nowrap="nowrap" bgcolor="#f6f7fb"
                style="border-bottom:none;">更新说明
            </td>
            <td width="17%" align="left" valign="middle" nowrap="nowrap" bgcolor="#f6f7fb"
                style="border-bottom:none;">创建时间
            </td>
            <td width="12%" align="left" valign="middle" nowrap="nowrap" bgcolor="#f6f7fb" style="border-bottom:none;">
                        操作
            </td>
          </tr>
          </thead>
          <tbody>
                <#if (sdks?size>0)>

                  <#list sdks as sdk>
                    <tr>
                      <td align="center">
                        ${sdk.platformStr}
                      </td>
                      <td align="left">
                        ${sdk.type}
                      </td>
                      <td align="center">
                        ${sdk.version}
                      </td>
                      <td align="left" style="padding-right: 10px;">
                        ${sdk.description}
                      </td>
                      <td align="left">
                        ${sdk.createTime}
                      </td>
                      <td align="left">
                        <button class="btn-info Button-line set-repo-btn" name="download" url="${sdk.downloadUrl}">
                          下载
                        </button>
                        <#if sdk.instructions != "">
                          <button class="btn-info Button-line set-repo-btn" name="instructions" url="${sdk.instructions}">
                            使用说明
                          </button>
                        </#if>
                        <button class="btn-info Button-line set-repo-btn" name="historyVersion" platform="${sdk.platform}" typeId="${sdk.typeId}">
                          历史版本
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
  <#else>
    <div class="text-block-con row-t">
      <div class="alert alert-info" style="margin-top: 20px;" role="alert">没有相关SDK</div>
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
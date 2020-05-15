<#assign modelAcount = models?size>
<div id="sdk-list" class="content-pro">

    <#if (modelAcount > 0)>
      <div class="text-block-con row-t">
        <ul>
          <li>
            <table width="100%" border="0" cellpadding="0" cellspacing="0" id="repoPanel">
              <thead>
              <tr class="text-block-head">
                <td width="8%" align="center" valign="middle" nowrap="nowrap" bgcolor="#f6f7fb"
                    style="border-bottom:none;">序号
                </td>
                <td width="18%" align="center" valign="middle" nowrap="nowrap" bgcolor="#f6f7fb"
                    style="border-bottom:none;max-width: 180px;overflow: hidden;text-overflow: ellipsis;white-space: nowrap;">合作商名称
                </td>
                <td width="13%" align="center" valign="middle" nowrap="nowrap" bgcolor="#f6f7fb"
                    style="border-bottom:none;padding-right: 10px">卡ID
                </td>
                <td width="18%" align="center" valign="middle" nowrap="nowrap" bgcolor="#f6f7fb"
                    style="border-bottom:none;">名称
                </td>
                <td width="18%" align="center" valign="middle" nowrap="nowrap" bgcolor="#f6f7fb"
                    style="border-bottom:none;">创建账号
                </td>
                <td width="17%" align="center" valign="middle" nowrap="nowrap" bgcolor="#f6f7fb"
                    style="border-bottom:none;">创建时间
                </td>
                <td width="8%" align="left" valign="middle" nowrap="nowrap" bgcolor="#f6f7fb" style="border-bottom:none;">
                  操作
                </td>
              </tr>
              </thead>
              <tbody>
              <#if (models?size>0)>

                  <#list models as model>
                    <tr>
                      <td align="center">
                          ${model_index+1}
                      </td>
                      <td align="center" title=" ${model.partnerName}" style="max-width: 180px;overflow: hidden;text-overflow: ellipsis;white-space: nowrap;">
                          ${model.partnerName}
                      </td>
                      <td align="center">
                          ${model.id}
                      </td>
                      <td align="center">
                          ${model.name}
                      </td>
                      <td align="center">
                          ${model.email}
                      </td>
                      <td align="center">
                          ${model.createTime}
                      </td>
                      <td align="left">
                        <button class="btn-info Button-line set-repo-btn" name="edit" id="${model.id}"
                                partnerName="${model.partnerName}" modelName="${model.name}" partnerId="${model.partnerId}">
                          编辑
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
        <div class="alert alert-info" style="margin-top: 20px;" role="alert">没有相关卡片库</div>
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

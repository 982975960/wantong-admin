<!-- 搜索框 -->
<div class="current-qr" style="display: none">${qr}</div>
<div class="con-search-input" style="width: 100% !important; text-align: left;">
  <input name="text" id="searchQrInput" type="text" placeholder="请输入激活码" class="search-qr">
  <input name="" id="searchQr" type="submit" value="搜索" class="frame-Button-b search-Button"
         style="width:10%; margin-right:1%;margin-left: 3%;">
  <input name="" id="clearQr" type="button" value="清空" class="search-Button02" id="clearBtn">
</div>

<div style="width: 100%;">
  <div style="line-height: 32px;display: inline-block;">激活码:</div>
    <#if qrcode??>
      <div style="line-height: 32px;display: inline-block;">
        <span id="resultQr">${qrcode.qrCodeId!}</span>
      </div>
      <input name="" id="deleteQr" type="submit" value="注销激活码" class="frame-Button"
             style="float:right;width:10%; margin-right:1%;margin-left: 3%;">
    </#if>
</div>
<!-- 表格 -->
<div class="content-pro">
  <div class="text-block-con row-t">
    <ul>
      <li>
        <table width="100%" border="0" cellpadding="0" cellspacing="0">
          <thead>
          <tr class="text-block-head">
            <td width="20%" align="left" valign="middle" nowrap="nowrap" bgcolor="#f6f7fb"
                style="border-bottom:none;">openId
            </td>
            <td width="15%" align="left" valign="middle" nowrap="nowrap" bgcolor="#f6f7fb"
                style="border-bottom:none;">机型
            </td>
            <td width="15%" align="left" valign="middle" nowrap="nowrap" bgcolor="#f6f7fb"
                style="border-bottom:none;">deviceId
            </td>
            <td width="10%" align="center" valign="middle" nowrap="nowrap" bgcolor="#f6f7fb"
                style="border-bottom:none;">appId
            </td>
            <td width="15%" align="left" valign="middle" nowrap="nowrap" bgcolor="#f6f7fb"
                style="border-bottom:none;">创建时间
            </td>
            <td width="10%" align="left" valign="middle" nowrap="nowrap" bgcolor="#f6f7fb"
                style="border-bottom:none;">操作
            </td>
          </tr>
          </thead>
            <#if machines?? && (machines?size > 0) >
              <tbody>
              <#list machines as machine>
                <tr>
                  <td align="left">
                      ${(machine.openId)!''}
                  </td>
                  <td align="left" style="white-space: normal">
                      ${(machine.machineType)!''}
                  </td>
                  <td align="left" valign="top">
                      ${(machine.machineId)!''}
                  </td>
                  <td align="center" valign="top">
                      ${(machine.appId)!''}
                  </td>
                  <td align="left">
                      ${machine.createTime?string('yyyy-MM-dd HH:mm:ss')}
                  </td>
                  <td align="left">
                    <button class="del-qr-active-btn btn-del  Button-line btn-info" activeid="${(machine.id)!''}">
                      删除
                    </button>
                  </td>
                </tr>
              </#list>
              </tbody>
            </#if>
        </table>
          <#if machines?? && (machines?size > 0)>
          <#elseif qrcode??>
            <div class="alert alert-info" style="margin-top: 20px;" role="alert">暂无数据</div>
          </#if>
      </li>
    </ul>
  </div>
</div>
<#--<div class="con-page" style="border-top: none;">-->
<#--    <#if (pages > 1)>-->
<#--      <div id="paginationContainer">-->
<#--        <div>-->
<#--          <nav aria-label="Page navigation">-->
<#--            <ul id="pagination" class="" currentPage="${currentPage}" pages="${pages}"-->
<#--                pageSize="${pageSize}" style="margin-top: 0px;">-->
<#--            </ul>-->
<#--          </nav>-->
<#--        </div>-->
<#--      </div>-->
<#--    </#if>-->
<#--</div>-->
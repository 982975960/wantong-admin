
  <#if totalCount??>
    <#assign qrcodeAmount = totalCount>
  <#else >
    <#assign qrcodeAmount = -1>
  </#if>

<div id="qrcodeList" class="content-pro" amount = "${qrcodeAmount}">


      <div class="text-block-con row-t">
        <ul>
          <li>
            <table width="100%" border="0" cellpadding="0" cellspacing="0" id="repoPanel">
              <thead>
              <tr class="text-block-head">
                <#if authType == 1>
                  <td width="17%" align="left" valign="middle" nowrap="nowrap" bgcolor="#f6f7fb"
                      style="border-bottom:none;">授权码</td>
                  <td width="15%" align="left" valign="middle" nowrap="nowrap" bgcolor="#f6f7fb"
                      style="border-bottom:none;">openID</td>
                  <td width="3%" align="left" valign="middle" nowrap="nowrap" bgcolor="#f6f7fb"
                      style="border-bottom:none;min-width: 67px;">商户ID</td>
                  <td width="9%" align="left" valign="middle" nowrap="nowrap" bgcolor="#f6f7fb"
                      style="border-bottom:none;min-width: 140px;">购物订单号</td>
                  <td width="9%" align="left" valign="middle" nowrap="nowrap" bgcolor="#f6f7fb"
                      style="border-bottom:none;">下单时间</td>
                  <td width="5%" align="left" valign="middle" nowrap="nowrap" bgcolor="#f6f7fb"
                      style="border-bottom:none;min-width: 70px;">订单状态</td>
                  <td width="16%" align="left" valign="middle" nowrap="nowrap" bgcolor="#f6f7fb"
                      style="border-bottom:none;">支付订单号</td>
                  <td width="4%" align="left" valign="middle" nowrap="nowrap" bgcolor="#f6f7fb"
                      style="border-bottom:none;min-width: 70px;">支付方式</td>
                  <td width="5%" align="left" valign="middle" nowrap="nowrap" bgcolor="#f6f7fb"
                      style="border-bottom:none;min-width: 70px;">支付金额</td>
                  <td width="9%" align="left" valign="middle" nowrap="nowrap" bgcolor="#f6f7fb"
                      style="border-bottom:none;">支付时间</td>
                <#else>
                  <td width="19%" align="left" valign="middle" nowrap="nowrap" bgcolor="#f6f7fb"
                      style="border-bottom:none;">openID</td>
                  <td width="5%" align="left" valign="middle" nowrap="nowrap" bgcolor="#f6f7fb"
                      style="border-bottom:none;min-width: 67px;">商户ID</td>
                  <td width="12%" align="left" valign="middle" nowrap="nowrap" bgcolor="#f6f7fb"
                      style="border-bottom:none;min-width: 140px;">购物订单号</td>
                  <td width="12%" align="left" valign="middle" nowrap="nowrap" bgcolor="#f6f7fb"
                      style="border-bottom:none;">下单时间</td>
                  <td width="7%" align="left" valign="middle" nowrap="nowrap" bgcolor="#f6f7fb"
                      style="border-bottom:none;min-width: 70px;">订单状态</td>
                  <td width="16%" align="left" valign="middle" nowrap="nowrap" bgcolor="#f6f7fb"
                      style="border-bottom:none;">支付订单号</td>
                  <td width="4%" align="left" valign="middle" nowrap="nowrap" bgcolor="#f6f7fb"
                      style="border-bottom:none;min-width: 70px;">支付方式</td>
                  <td width="5%" align="left" valign="middle" nowrap="nowrap" bgcolor="#f6f7fb"
                      style="border-bottom:none;min-width: 70px;">支付金额</td>
                  <td width="12%" align="left" valign="middle" nowrap="nowrap" bgcolor="#f6f7fb"
                      style="border-bottom:none;">支付时间</td>
                </#if>
              </tr>
              </thead>
              <tbody>
              <#if (qrcodeAmount > 0)>
                  <#list orderItemList as orderItem>
                    <tr>
                      <#if authType==1>
                        <td align="left">
                            ${orderItem.memo}
                        </td>
                      </#if>
                      <td align="left">
                          ${orderItem.openId}
                      </td>
                      <td align="center">
                          ${partnerId}
                      </td>
                      <td align="left">
                          ${orderItem.orderNumber}
                      </td>
                      <td align="left">
                          ${orderItem.returnCreateTime}
                      </td>
                      <td align="center">
                          <#if  orderItem.payStatus == 1>
                            支付成功
                            <#else>
                            支付失败
                          </#if>
                      </td>
                      <td align="left">
                          ${orderItem.thirdPartyNumber}
                      </td>
                      <td align="center">
                        <#if (orderItem.thirdPartyPlatform == 0)>
                          支付宝
                        <#else>
                          微信
                        </#if>
                      </td>
                      <td align="center">
                          ${orderItem.payment}元
                      </td>
                      <td align="left">
                          ${orderItem.returnPayTime}
                      </td>
                    </tr>
                  </#list>
              </#if>
              </tbody>
            </table>
          </li>
        </ul>
      </div>
      <#if (qrcodeAmount > 0)>
      <#elseif (qrcodeAmount==0)>
        <div class="text-block-con row-t">
          <div class="alert alert-info" style="margin-top: 20px;" role="alert">暂无数据</div>
        </div>
      <#else >
        <div class="text-block-con row-t">
          <div class="alert alert-info" style="margin-top: 20px;" role="alert">当前批次未开启到期后付费模式</div>
        </div>
      </#if>

</div>

<div class="con-page" style="border-top: none">
  <div style="float: left;">
    <#if authType == 1>
    <label id="payAmount" amount="${payAmount}">当前批次：共计${qrCodeCount}个授权码/已支付的授权码${payAmount}个</label>
    <#elseif authType == 0>
       <label id="payAmount" amount="${payAmount}">共计${licenseCount}个授权数量/已支付${payAmount}个授权数量</label>
    </#if>
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
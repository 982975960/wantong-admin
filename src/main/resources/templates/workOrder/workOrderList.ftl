<#--定义变量获得工单数量-->
<#assign workOrderAmount = workOrderList?size>
  <#--主体书单显示的模块-->
  <#if (workOrderAmount >0)>
  <div class="word-order-body" style="width: 100%;float: left;margin-top: 20px">
      <#--列表结构-->
      <ul>
        <li>
          <table width="100%"  border="0" cellpadding="0" cellspacing="0" id="word_order_body" style="line-height: 35px;">
            <thead>
              <tr class="text-block-head">
                <#if (partnerId ==1)>
                  <td width="8%" align="center" valign="middle" nowrap="nowrap" bgcolor="#f6f7fb"
                      style="border-bottom:none;">
                    序号
                  </td>
                  <td width="18%" align="center" valign="middle" nowrap="nowrap" bgcolor="#f6f7fb"
                      style="border-bottom:none;">
                    客户
                  </td>
                  <td width="18%" align="center" valign="middle" nowrap="nowrap" bgcolor="#f6f7fb"
                      style="border-bottom:none;">
                      工单名称
                  </td>
                  <td width="15%" align="center" valign="middle" nowrap="nowrap" bgcolor="#f6f7fb"
                      style="border-bottom:none;">
                    创建时间
                  </td>
                  <td width="20%" align="center" valign="middle" nowrap="nowrap" bgcolor="#f6f7fb"
                      style="border-bottom:none;">
                    创建账号
                  </td>
                  <td width="21%" align="left" valign="middle" nowrap="nowrap" bgcolor="#f6f7fb"
                      style="border-bottom:none;">
                    操作
                  </td>
                <#else>
                  <td width="20%" align="center" valign="middle" nowrap="nowrap" bgcolor="#f6f7fb"
                      style="border-bottom:none;">
                    序号
                  </td>
                  <td width="30%" align="center" valign="middle" nowrap="nowrap" bgcolor="#f6f7fb"
                      style="border-bottom:none;">
                    需求批次名称
                  </td>
                  <td width="30%" align="center" valign="middle" nowrap="nowrap" bgcolor="#f6f7fb"
                      style="border-bottom:none;">
                    创建时间
                  </td>
                  <td width="20%" align="left" valign="middle" nowrap="nowrap" bgcolor="#f6f7fb"
                      style="border-bottom:none;">
                    操作
                  </td>
                </#if>
              </tr>
            </thead>
            <tbody>
             <#--工单数量大于0-->
               <#if (workOrderAmount>0)>
                 <#--遍历元素-->
                 <#list workOrderList as item>
                    <tr class="work-order">
                      <#if (partnerId == 1)>
                        <td align="center" height="55px" style="border-bottom: 1px solid #eceff8;">
                          ${item_index+1}
                        </td>
                        <td align="center" style="border-bottom: 1px solid #eceff8;">
                          ${item.partnerName!}
                        </td>
                        <td align="center" style="border-bottom: 1px solid #eceff8;">
                          ${item.name}
                        </td>
                        <td align="center" style="border-bottom: 1px solid #eceff8;">
                          ${item.returnTime}
                        </td>
                        <td align="center" style="border-bottom: 1px solid #eceff8;">
                          ${item.email}
                        </td>
                        <td align="left" style="border-bottom: 1px solid #eceff8;">
                          <#if (item.id != huibenOrderId && item.id != testOrderId) >
                              <@checkPrivilege url="/work/updateWorkOrder.do">
                                <button class="btn-info Button-line edit-work-order" id="edit_work_order" tid = "${item.id}" name="${item.name}" partnerId="${item.partnerId}" style="margin-top: 8px; height: 30px; padding: 2px 10px;line-height: 24px;">编辑工单</button>
                              </@checkPrivilege>
                          <#else >
                              <@checkPrivilege url="/work/updateWorkOrder.do">
                                <button disabled class="Button-line2" style="margin-top: 8px; height: 30px; padding: 2px 10px;line-height: 24px;margin-right: 2%;background: #f1f1f1;">编辑工单</button>
                              </@checkPrivilege>
                          </#if>
                          <@checkPrivilege url="/work/loadWorkOrderBooks.do">
                            <button class="btn-info Button-line add-books" id="enter_work_order" name="${item.name}" tid="${item.id}" style="margin-top: 8px; height: 30px; padding: 2px 10px;line-height: 24px;"><#if (partnerId ==1)>查看工单<#else>查看进度</#if></button>
                          </@checkPrivilege>
                            <#if (item.id != huibenOrderId && item.id != testOrderId) >
                                <@checkPrivilege url="/work/deleteWorkOrder.do">
                                  <button class="btn-info Button-line" id="delete_work_order" tid="${item.id}" style="margin-top: 8px; height: 30px; padding: 2px 10px;line-height: 24px;">删除</button>
                                </@checkPrivilege>
                            <#else >
                                <@checkPrivilege url="/work/deleteWorkOrder.do">
                                  <button disabled class="Button-line2" style="margin-top: 8px; height: 30px; padding: 2px 10px;line-height: 24px;margin-right: 2%;background: #f1f1f1;">删除</button>
                                </@checkPrivilege>
                            </#if>
                        </td>
                      <#else>
                        <td align="center" height="55px" style="border-bottom: 1px solid #eceff8;">
                            ${item_index+1}
                        </td>
                        <td align="center" style="border-bottom: 1px solid #eceff8;">
                            ${item.name}
                        </td>
                        <td align="center" style="border-bottom: 1px solid #eceff8;">
                            ${item.returnTime}
                        </td>
                        <td align="left" style="border-bottom: 1px solid #eceff8;">
                            <#if (item.id != huibenOrderId && item.id != testOrderId) >
                                <@checkPrivilege url="/work/updateWorkOrder.do">
                                  <button class="btn-info Button-line edit-work-order" id="edit_work_order" tid = "${item.id}" name="${item.name}" partnerId="${item.partnerId}" style="margin-top: 8px; height: 30px; padding: 2px 10px;line-height: 24px;">编辑工单</button>
                                </@checkPrivilege>
                            <#else >
                                <@checkPrivilege url="/work/updateWorkOrder.do">
                                  <button disabled class="Button-line2" style="margin-top: 8px; height: 30px; padding: 2px 10px;line-height: 24px;margin-right: 2%;background: #f1f1f1;">编辑工单</button>
                                </@checkPrivilege>
                            </#if>
                            <@checkPrivilege url="/work/loadWorkOrderBooks.do">
                              <button class="btn-info Button-line add-books" id="enter_work_order" name="${item.name}" tid="${item.id}" style="margin-top: 8px; height: 30px; padding: 2px 10px;line-height: 24px;"><#if (partnerId ==1)>查看工单<#else>查看进度</#if></button>
                            </@checkPrivilege>
                            <#if (item.id != huibenOrderId && item.id != testOrderId) >
                                <@checkPrivilege url="/work/deleteWorkOrder.do">
                                  <button class="btn-info Button-line" id="delete_work_order" tid="${item.id}" style="margin-top: 8px; height: 30px; padding: 2px 10px;line-height: 24px;">删除</button>
                                </@checkPrivilege>
                            <#else >
                                <@checkPrivilege url="/work/deleteWorkOrder.do">
                                  <button disabled class="Button-line2" style="margin-top: 8px; height: 30px; padding: 2px 10px;line-height: 24px;margin-right: 2%;background: #f1f1f1;">删除</button>
                                </@checkPrivilege>
                            </#if>
                        </td>
                      </#if>
                    </tr>
                 </#list>
               </#if>
            </tbody>
          </table>
        </li>
      </ul>
  </div>
  <#else>
    <div class="word-order-body" style="width: 100%;float: left;margin-top: 20px">
      <div class="alert alert-info" style="margin-top: 20px;" role="alert">没有搜索到相关工单</div>
    </div>
  </#if>

  <#--分页-->
  <div class="con-page" style="border-top: none">
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


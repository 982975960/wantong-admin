 <div class="text-block-con row-t" id="totalImageLogs">
    <div class="work-tab" style="margin-top: 0;">
      <ul class="work-block-head">
        <li style=" width:10%; text-align:center;">序号</li>
        <li style=" width:25%;">OpenID</li>
        <li style=" width:25%;">DeviceID</li>
        <li style=" width:25%;">机型</li>
        <li style=" width:15%;">操作</li>
      </ul>
      <div class="work-list" style="border:1px solid #eceff8; border-top:none; width:100%">
        <ul class="work-list-top" id="ul-list">
          <#if (recognitionUsers?size gt 0)>
            <#list recognitionUsers as l>
              <li>
                <span style=" width:10%; text-align:center;">${l_index+1}</span>
                <span style=" width:25%;" title="${l.openId}"> ${l.openId}</span>
                <span style=" width:25%;" title="${l.deviceId}"> ${l.deviceId}</span>
                <span style=" width:25%;" title="${l.device}"> ${l.device}</span>
                <span style=" width:15%;">
                    <@checkPrivilege url="/ass/listLogsDetails.do">
                        <button class="Button-line height27 noDeal" id="seeSpecific" data-openId="${l.openId}" data-device="${l.device}" data-deviceId="${l.deviceId}"  style="margin-top: 8px; height: 30px; padding: 2px 10px;line-height: 24px;">查看详情</button>
                    </@checkPrivilege>
                </span>
              </li>
            </#list>
          <#else>
            <li>
              <div class="text-block-con row-t">
                <div class="alert alert-info" style="margin-top: 20px;" role="alert">没有搜索到相关日志</div>
              </div>
            </li>
          </#if>
        </ul>
      </div>
    </div>
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

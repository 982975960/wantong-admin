<@link href="/css/3rd-party/zui/component-chosen.css" rel="stylesheet" />
<@script src="/js/3rd-party/chosen.jquery.js" />
<@link href="/css/demo.css" rel="stylesheet" />
<@script src="/js/ass/assLogFilter.js" />
<@link rel="stylesheet" href="/css/lc/lc_switch.css" />
<@script src="/js/3rd-party/lc/lc_switch.js"></@script>

<div class="main-w">
    <div class="content-wrap-w">
        <div class="content-r-path">售后服务 / 图片识别日志</div>
        <#--搜索日志内容体-->
        <div id="logsFilter" class="content-box">
          <div class="con-r-top">
            <div id="partnerList" class="con-r-top-l" style="float: left;">
              <div class="form-group">
                <h3 class="con-list-title">选择合作商</h3>
                <div class="" style="width: 200px;float: left;margin-left: 10px;padding: 3px 0;">
                  <select id="partnerSelector" class="form-control form-control-chosen" data-placeholder="请选择合作商"
                          data-compact_search="true"
                          partnerid="${(partnerId)!''}"
                  >
                    <option value="0"></option>
                      <#if partners?? && (partners?size > 0) >
                          <#list partners as partner>
                            <option value="${(partner.id)!''}">${(partner.name)!''}</option>
                          </#list>
                      </#if>
                  </select>
                </div>
                <div class="" style="width: 200px;float: left;margin-left: 10px;padding: 3px 0;">
                  <select id="appSelector" class="form-control form-control-chosen" data-placeholder="所有应用"
                          data-compact_search="true"
                          appid="${(appId)!''}"
                  >
                    <option value="0"></option>
                      <#if apps?? && (apps?size > 0) >
                          <#list apps as app>
                            <option value="${(app.id)!''}">${(app.name)!''}</option>
                          </#list>
                      </#if>
                  </select>
                </div>
              </div>
            </div>
          </div>
            <div class="content-pro" id="appFilters">
              <div class="text-block-con row-t">
                <ul>
                  <li>
                    <table width="100%" border="0" cellpadding="0" cellspacing="0" id="partnersListPanel">
                      <thead>
                        <tr class="text-block-head">
                          <td width="28%" align="left" valign="middle" nowrap="nowrap" bgcolor="#f6f7fb"
                              style="border-bottom:none;">应用名称
                          </td>
                          <td width="28%" align="left" valign="middle" nowrap="nowrap" bgcolor="#f6f7fb"
                              style="border-bottom:none;">应用ID
                          </td>
                          <td width="28%" align="left" valign="middle" nowrap="nowrap" bgcolor="#f6f7fb"
                              style="border-bottom:none;">合作商
                          </td>
                          <td width="16%" align="left" valign="middle" nowrap="nowrap" bgcolor="#f6f7fb"
                              style="border-bottom:none;">操作
                          </td>
                        </tr>
                      </thead>
                      <tbody>
                      <#list list as app>
                        <tr>
                          <td align="left" id="appNameSpan">
                            <span style="float: left;padding-right: 5px">${app.appName}</span>
                          </td>
                          <td align="left">${app.appId}</td>
                          <td align="left">${app.partnerName}</td>
                          <!-- 操作列开始  -->
                          <td align="left" id="controller">
                            <input type="checkbox" appid="${app.appId}" name="check-1" value="${app.state}"
                              <#if app.state == 1 >
                                  checked="checked"
                              </#if>
                                   class="save-log lc-switch" autocomplete="off" />
                          </td>
                          <!-- 操作列结束  -->
                        </tr>
                      </#list>
                      </tbody>
                    </table>
                  </li>
                </ul>
              </div>
            <!--分页-->
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
            <!--分页-->
          </div>
        </div>
    </div>
</div>
<script>
    $(function () {
        wantong.assLogFilter.init();
    });
</script>
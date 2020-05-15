<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <@script src="/js/feedback/userfeedback.js"/>
</head>
<body>
<div class="main-w">
  <div class="content-wrap-w">
    <div class="content-r-path">运营管理 / 用户反馈</div>
    <div class="content-box">

      <div class="con-r-top">
        <div class="con-r-top-l">
          <select class="con-r-top-l-frame frame-line" name="feedbackType" id="feedbackType" style="width: 80px">
            <option value="0">待处理</option>
            <option value="1">已处理</option>
          </select>
          <form action="" style="display: inline-block" method="POST" onsubmit="return $('#searchBtn').click();">
            <div class="input-group" style="margin-left: 10px">
              <div style="float: left">
                <input type="text" class="con-r-top-l-frame frame-line" id="searchInput" placeholder="输入要查询的机型"
                       value="${searchText}">
                <input type="hidden" id="searchText">
                <input type="hidden" id="stateValue">
                <input type="text" style="display:none" value="此处的input删掉然后回车按钮就会触发提交"/>
              </div>
              <div style="float: left">
                <button type="button" class="frame-Button" id="searchBtn">查询</button>
              </div>
            </div>
          </form>
        </div>
      </div>

      <div id="feedBackDetailPanel" class="content-pro">
        <form id="searchFrom" action="" method="get">
          <input type="hidden" name="currentPage" id="currentPage" value="${page.currentPage!}"/>
          <input type="hidden" name="searchText" id="searchText" value="${searchText}">
        </form>

        <div class="text-block-con row-t">
          <ul>
            <li>
              <table width="100%" border="0" cellpadding="0" cellspacing="0" id="feedBackListPanel">
                <thead>
                <tr class="text-block-head">
                  <td width="8%" align="left" valign="middle" nowrap="nowrap" bgcolor="#f6f7fb"
                      style="border-bottom:none;">序号
                  </td>
                  <td width="17%" align="left" valign="middle" nowrap="nowrap" bgcolor="#f6f7fb"
                      style="border-bottom:none;">机型型号
                  </td>
                  <td width="19%" align="left" valign="middle" nowrap="nowrap" bgcolor="#f6f7fb"
                      style="border-bottom:none;padding-right: 10px">设备ID
                  </td>
                  <td width="21%" align="left" valign="middle" nowrap="nowrap" bgcolor="#f6f7fb"
                      style="border-bottom:none;">反馈内容
                  </td>
                  <td width="17%" align="left" valign="middle" nowrap="nowrap" bgcolor="#f6f7fb"
                      style="border-bottom:none;">反馈时间
                  </td>
                  <td width="17%" align="left" valign="middle" nowrap="nowrap" bgcolor="#f6f7fb"
                      style="border-bottom:none;"><#if state==0>
                      <@checkPrivilege url="/feedBack/setfeedbackstate.do">
                        操作
                      </@checkPrivilege>
                    <#else >
                      处理时间
                    </#if></td>
                </tr>
                </thead>
                <tbody>
                <#if (page.data?size>0)>

                  <#list page.data as l>
                    <tr>
                      <td align="left">
                        ${l_index+1}
                      </td>
                      <td align="left">
                        ${l.deviceType}
                      </td>
                      <td align="left" style="padding-right: 10px;">
                        ${l.userDeviceId}
                      </td>
                      <td align="left">
                        <div id="userbackContent">
                          <a href="#" id="checkimage" tid="${l.id}">${l.feedBackContent}</a>
                          <div class="row create-partner-container" id="checkUserBackImage">
                            <div class="col-md-12">
                              <div id="userFeedBackImage" style="display:none">
                                <#if  l.feedBackType == 1>
                                  <img style="user-select: none"
                                      src="<@filesServicePath src="/tis/feedback/${l.feedBackContent}"></@filesServicePath>">
                                <#else >
                                  <textarea rows=""
                                            readonly>${l.feedBackContent}</textarea>
                                </#if>

                              </div>
                            </div>
                          </div>
                        </div>

                      </td>
                      <td align="left">
                        ${l.createTime?string("yyyy-MM-dd")}
                      </td>
                      <td align="left">
                        <#if state==0>
                          <@checkPrivilege url="/feedBack/setfeedbackstate.do">
                            <button class="btn-info Button-line" id="setFeedBackState" tid="${l.id}">
                              处理
                            </button>
                          </@checkPrivilege>
                        <#else>
                          ${l.handingTime?string("yyyy-MM-dd")}
                          <button class="btn-info Button-line" style="visibility: hidden;float: none">
                            处理
                          </button>
                        </#if>
                      </td>
                    </tr>
                  </#list>
                </#if>
                </tbody>
              </table>
            </li>
          </ul>
        </div>

        <#assign pages = page.totalPage>
        <div class="con-page" style="border: none">
          <#if (pages > 1)>
            <div id="paginationContainer">
              <div>
                <nav aria-label="Page navigation">
                  <ul id="pagination" class="" currentPage="${page.currentPage}" pages="${pages}?int"
                      pageSize="${page.data?size}" style="margin-top: 0px;">
                  </ul>
                </nav>
              </div>
            </div>
          </#if>
        </div>
        <!--分页-->

      </div>
    </div>
  </div>
</body>
</html>
<script>
  $(function () {
    wantong.feedUserListPanel.init({
      len: "${len}"
    });
  });
</script>
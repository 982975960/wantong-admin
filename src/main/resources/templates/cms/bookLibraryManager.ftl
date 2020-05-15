<!DOCTYPE html>
<head>
  <meta charset="utf-8">
  <@script src="/js/cms/library_manager.js"/>
</head>
<body>
<div class="main-w">
  <div class="content-wrap-w">
    <div class="content-r-path">图书管理 / 书库管理</div>
<#assign page = list.pagination>
<div id="libraryManagerPanel" class="content-box">
  <input type="hidden" name="currentPage" id="currentPage" value="${page.currentPage!}"/>
  <div class="con-r-top">
  <div class="con-r-top-r" >
    <@checkPrivilege url="/cms/saveLib.do">
    <button class="frame-Button-b Button-left" id="createLibraryBtn" >创建书库</button>
    </@checkPrivilege>
  </div>
  </div>

  <div class="content-pro">
    <div class="text-block-con row-t">
      <ul>
        <li>
      <table width="100%" border="0" cellpadding="0" cellspacing="0" id="libraryListPanel">
        <thead>
        <tr class="text-block-head">
          <td width="20%" align="left" valign="middle" nowrap="nowrap" bgcolor="#f6f7fb" style="border-bottom:none;">序号</td>
          <td width="20%" align="left" valign="middle" nowrap="nowrap" bgcolor="#f6f7fb" style="border-bottom:none;">合作商</td>
          <td width="20%" align="left" valign="middle" nowrap="nowrap" bgcolor="#f6f7fb" style="border-bottom:none;">书库名称</td>
          <td width="20%" align="left" valign="middle" nowrap="nowrap" bgcolor="#f6f7fb" style="border-bottom:none;">创建时间</td>
          <td width="20%" align="left" valign="middle" nowrap="nowrap" bgcolor="#f6f7fb" style="border-bottom:none;">操作</td>
        </tr>
        </thead>
        <tbody>
        <#assign data = list.models>
        <#if (data?size>0)>
          <#list data as l>
            <tr>
              <td align="left">
              ${l_index+1}
              </td>
              <td align="left">
                ${l.partnerName}
              </td>
              <td align="left">
              ${l.name}
              </td>
              <td align="left">
              ${l.createdTime?string("yyyy-MM-dd HH:mm")}
              </td>
              <td align="left">
                <button class="edit-btn Button-line" lname="${l.name}" lpartnerId="${l.partnerId}" lid="${l.id}" lencrypt="${l.encrypt}" id="editLibraryBtn">
                  编辑</button>
              </td>
            </tr>
          </#list>
        </#if>
        </tbody>
      </table>
        </li>
      </ul>
    </div>

    <!--分页-->
    <#if (page.totalRecord % page.pageSize)!=0>
      <#assign pages = 1 + page.totalRecord / page.pageSize>
    <#else >
      <#assign pages = page.totalRecord / page.pageSize>
    </#if>
    <div class="con-page">
      <#if (pages > 1)>
        <div id="paginationContainer">
          <div>
            <nav aria-label="Page navigation">
              <ul id="pagination" class="" currentPage="${page.currentPage}" pages="${pages}?int"
                  pageSize="${page.pageSize}" style="margin-top: 0px;">
              </ul>
            </nav>
          </div>
        </div>
      </#if>
    </div>
    <!--分页-->

    <!--创建-->
    <div id="createLibrary" class="row create-partner-container" style="width: 100%;display: none">
        <div class="modal-body">
          <form id="createLibraryForm" method="post" action="">
            <select class="con-r-top-l-frame frame-line" name="partnerType" id="partnerType" style="margin-left: 40px; width:137px;display: none" >
              <option value="-1">请选择合作商</option>
              <#list partners as partner >
                        <option value="${partner.id }" style="width: 120px">${partner.name}</option>
              </#list>
            </select>
            <input style="visibility: hidden;" id="libId" >
            <div class="input-group form-group-sm col-xs-10" style="margin-bottom:5px;margin-left: 40px;margin-top: 20px">
              <span class="input-group-addon">书库名称</span>
              <input type="text" class="form-control" id="libName"  onkeydown="if(event.keyCode==13){return false;}" placeholder="书库名称不能大于15个字" maxlength="15" >
            </div>

            <div id="encryptDiv" style="margin-left: 40px">
              <input type="checkbox" id="encrypt" checked="checked"/>
              <label>MP3加密</label>
              <input type="checkbox" id="noEncrypt" style="margin-left: 10%"/>
              <label>MP3非加密</label>
            </div>
          </form>
        </div>
        <div class="modal-footer" >
          <button type="button" id="saveBtn" class="pop-padding frame-Button-b">保存</button>
          <button type="button" id="closeBtn" class="pop-padding frame-Button" data-dismiss="modal" >关闭</button>
        </div>
    </div>
  </div>


</div>
  </div>
</div>
</body>
</html>
<script>
  $(function () {
    wantong.bookLibraryManager.init();
  });
</script>
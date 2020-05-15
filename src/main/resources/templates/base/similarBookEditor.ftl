<@script src="/js/base/similar_editor.js"></@script>
<div class="similar-set-detail-container" sid="${sid}">
  <!-- 筛选条件 -->
  <div class="search-head" style="height: 40px;padding-top: 10px;">
  <span class="search-span" style="width: 20%; max-width: 230px">
    <div id="backToHome"
         style="display: inline-block;cursor: pointer; background: url('static/images/back_01.png') 2px center no-repeat; padding-left: 20px; height: 27px; border-radius: 5px; line-height: 27px; padding-right: 5px; font-size: 14px;">
                <span style="user-select: none;">返回</span></div>
    </span>
    <div class="con-r-top-r">
        <@checkPrivilege url="/base/addSimilarBook.do">

          <div class="book-create-btn">
            &nbsp;<input name="提交" type="submit" class="Button-left work-ico frame-Button-work"
                         value="添加书本"/>
          </div>
        </@checkPrivilege>
    </div>
  </div>
  <!-- 表格 -->
  <div class="content-pro">
    <div class="text-block-con row-t">
      <ul>
        <li>
          <table width="100%" border="0" cellpadding="0" cellspacing="0">
            <thead>
            <tr class="text-block-head">
              <td width="3%" align="left" valign="middle" nowrap="nowrap" bgcolor="#f6f7fb"
                  style="border-bottom:none;">序号
              </td>
              <td width="5%" align="left" valign="middle" nowrap="nowrap" bgcolor="#f6f7fb"
                  style="border-bottom:none;">书本编号
              </td>
              <td width="9%" align="center" valign="middle" nowrap="nowrap" bgcolor="#f6f7fb"
                  style="border-bottom:none;">ISBN
              </td>
              <td width="5%" align="left" valign="middle" nowrap="nowrap" bgcolor="#f6f7fb"
                  style="border-bottom:none;">BookId
              </td>
              <td width="10%" align="left" valign="middle" nowrap="nowrap" bgcolor="#f6f7fb"
                  style="border-bottom:none;">书名
              </td>
              <td width="10%" align="left" valign="middle" nowrap="nowrap" bgcolor="#f6f7fb"
                  style="border-bottom:none;">作者
              </td>
              <td width="10%" align="left" valign="middle" nowrap="nowrap" bgcolor="#f6f7fb"
                  style="border-bottom:none;">出版社
              </td>
              <td width="10%" align="left" valign="middle" nowrap="nowrap" bgcolor="#f6f7fb"
                  style="border-bottom:none;">封面图片
              </td>
              <td width="15%" align="left" valign="middle" nowrap="nowrap" bgcolor="#f6f7fb"
                  style="border-bottom:none;">操作
              </td>
            </tr>
            </thead>
              <#if data?? && (data?size > 0) >
                <tbody>
                <#list data as set>
                  <tr style="height: 50px">
                    <td align="left">
                        #{set_index + 1}
                    </td>
                    <td align="left" style="white-space: normal">
                        ${(set.innerId)!''}
                    </td>
                    <td align="center">
                        ${set.isbn!''}
                    </td>
                    <td align="left">
                        ${(set.bookId)!''}
                    </td>
                    <td align="left">
                        ${(set.name)!''}
                    </td>
                    <td align="left">
                        ${(set.author)!''}
                    </td>
                    <td align="left">
                        ${(set.publisher)!''}
                    </td>
                    <td align="left">
                      <div class="img-container" style="display: none;">
                        <img style="user-select: none; width: 850px;"
                             src="${set.coverImage!''}">
                      </div>
                      <button type="button" cover="${set.coverImage}" sid="${set.id}" class="book-cover-btn Button-line btn-info">封面图片</button>
                    </td>
                    <td align="left">
                      <@checkPrivilege url="/base/updateSimilarBook.do">
                      <button type="button" bid="${set.id}" class="book-edit-btn Button-line btn-info">编辑</button>
                      </@checkPrivilege>
                      <@checkPrivilege url="/base/deleteSimilarBook.do">
                      <button type="button" bid="${set.id}" class="book-del-btn Button-line btn-info">删除</button>
                      </@checkPrivilege>
                    </td>
                  </tr>
                </#list>
                </tbody>
              </#if>
          </table>
            <#if data?? && (data?size > 0)>
            <#else>
              <div class="alert alert-info" style="margin-top: 20px;" role="alert">暂无数据</div>
            </#if>
        </li>
      </ul>
    </div>
  </div>
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

  <div style="display: none" class="layer-ops-window">
    <!-- 创建 -->
    <div id="setCreateTemplate" class="row create-set-container" style="width: 100%;display: none">
      <div class="modal-body">
        <form id="createSetForm" method="post" action="">
          <div class="input-group form-group-sm col-xs-10"
               style="margin-bottom:15px;margin-left: 40px;margin-top: 20px">
            <span class="input-group-addon" style="border: none;background-color:#FFFFFF ">BookId</span>
            <input type="text" class="form-control" id="bookId" onkeydown="if(event.keyCode==13){return false;}"
                   placeholder="请输入纯数字" maxlength="20" style="margin-left: 10px">
          </div>
        </form>
      </div>
      <div class="modal-footer" style="width: 100%;float: left">
        <button type="button" id="saveBtn" class="pop-padding frame-Button-b">保存</button>
        <button type="button" id="closeBtn" class="pop-padding frame-Button" data-dismiss="modal">关闭</button>
      </div>
    </div>
  </div>
</div>

<script>
  wantong.similardetail.init();
</script>
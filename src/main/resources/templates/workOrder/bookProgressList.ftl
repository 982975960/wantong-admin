<#assign bookCount = books?size>
<#if (bookCount > 0)>
  <div class="work-tab">
    <ul class="work-block-head">
      <li style=" width:3%; text-align:center;"></li>
      <li style=" width:3%; text-align:center;padding-left: unset;">序号</li>
      <#if (tab = 1)>
        <li style=" width:8%;text-align:center;">书本编号</li>
        <li style=" width:8%;text-align:center;">ISBN</li>
        <li style=" width:8%;text-align:center;">书名</li>
        <li style=" width:8%;text-align:center;">作者名称</li>
        <li style=" width:8%;text-align:center;">出版社</li>
        <li style=" width:8%;text-align:center;">所属系列</li>
        <li style=" width:8%;text-align:center;">隶属工单</li>
        <li style=" width:10%;">任务状态</li>
        <li style=" width:28%;">操作</li>
      <#else>
        <li style=" width:17%;text-align:center;">ISBN</li>
        <li style=" width:17%;text-align:center;">书名</li>
        <li style=" width:15%;text-align:center;">作者名称</li>
        <li style=" width:15%;text-align:center;">出版社</li>
        <li style=" width:15%;text-align:center;">所属系列</li>
        <li style=" width:15%;">任务状态</li>
      </#if>
    </ul>
    <div class="work-list">
      <ul class="work-list-top">
          <#list books as l>
            <li>
              <#if ( tab = 1 )>
              <span style=" width:3%; text-align:center;">
                <#assign sonCount = l.son?size>
                  <#if (sonCount>0)>
                    <span type="button" taskId ="${l.id}" id="showSonTaskBtn" class="glyphicon glyphicon-plus" aria-hidden="true" style="cursor: pointer;" />
                  </#if>
              </span>
              <#else>
              <span style=" width:3%; text-align:center;"></span>
              </#if>
              <span style=" width:3%; text-align:center;padding-left: unset;">${l_index+1}</span>
              <#if ( tab = 1 )>
              <span style=" width:8%;white-space: nowrap;text-overflow: ellipsis;overflow: hidden;text-align:center;"
                    title="<#if (l.innerId == 0)> <#else >${l.innerId}</#if>"><#if (l.innerId == 0)> <#else >${l.innerId}</#if></span>
              </#if>
              <span style="<#if (tab = 1)> width:8%;<#else >width:17%;</#if>text-align:center;white-space: nowrap;text-overflow: ellipsis;overflow: hidden;" title="${l.isbn}"> ${l.isbn}</span>
              <span style="<#if (tab = 1)> width:8%;<#else >width:17%;</#if>white-space: nowrap;text-overflow: ellipsis;overflow: hidden;text-align:center;"
                    title="${l.name}"> ${l.name}</span>
              <span style="<#if (tab = 1)> width:8%;<#else >width:15%;</#if>text-align:center;white-space: nowrap;text-overflow: ellipsis;overflow: hidden;" title="${l.author}">${l.author}</span>
              <span style="<#if (tab = 1)> width:8%;<#else >width:15%;</#if>white-space: nowrap;text-overflow: ellipsis;overflow: hidden;text-align:center;"
                    title="${l.publisher}">${l.publisher}</span>
              <span style="<#if (tab = 1)> width:8%;<#else >width:15%;</#if>text-align:center;white-space: nowrap;text-overflow: ellipsis;overflow: hidden;"
                    title="${l.seriesTitle}">${l.seriesTitle}</span>
              <#if ( tab = 1 )>
              <span style=" width:8%;white-space: nowrap;text-overflow: ellipsis;overflow: hidden;text-align:center;"
                    title="${(l.workOrder)!""}"> ${(l.workOrder)!""}</span>
              </#if>
              <#if ( tab = 1 )>
                <span style=" width:10%;">
                   <#if (l.state > 2)>
                       ${l.stateName}
                   <#else >
                     <select id="bookStateSelect" iid="${l.id}" state="${l.state}" <@checkPrivilege url = "/work/updateWorkState.do" def="disabled"></@checkPrivilege>
                             class="con-r-top-l-frame frame-line height27" style=" width:90px; margin-top:12px;line-height: 20px;">
                          <option value="0" <#if (l.state == 0)> selected="selected"</#if> >未处理</option>
                          <option value="1" <#if (l.state == 1)> selected="selected"</#if> >待采购</option>
                          <option value="2" <#if (l.state == 2)> selected="selected"</#if> >已采购</option>
                          <option value="13" <#if (l.state == 13)> selected="selected"</#if> >不做处理</option>
                        </select>
                   </#if>
                </span>
              <#else>
                <span style=" width:15%;">
                  ${l.stateName}
                </span>
              </#if>
              <#if ( tab = 1 )>
              <span style=" width:28%;">
                  <#if (l.state == 0) ||(l.state == 1) >
                    <@checkPrivilege url = "/work/bookCheck.do">
                    <button id="checkBookBtn" bookProgressId="${l.id}" bookProgressName = "${l.name}" isbn = "${l.isbn}" class="Button-line height27"
                            style="margin-top:10px;line-height: 20px;">人工查重</button>
                    </@checkPrivilege>
                    <@checkPrivilege url = "/work/create.do">
                    <button id="createBookBtn" disabled="disabled" class="Button-line2 height27"
                            style="margin-top:10px;margin-bottom:10px;line-height: 20px;background: #f1f1f1;">创建书本信息</button>
                    </@checkPrivilege>
                  <#elseif (l.state == 2)>
                    <@checkPrivilege url = "/work/bookCheck.do">
                    <button id="checkBookBtn" bookProgressId="${l.id}"  bookProgressName = "${l.name}" isbn = "${l.isbn}" class="Button-line height27"
                            style="margin-top:10px;line-height: 20px;">人工查重</button>
                    </@checkPrivilege>
                    <@checkPrivilege url = "/work/create.do">
                    <button id="createBookBtn" bookProgressId="${l.id}" innerId="${l.innerId}"
                            class="Button-line height27"
                            style="margin-top:10px;margin-bottom:10px;line-height: 20px;">创建书本信息</button>
                    </@checkPrivilege>
                  <#else >
                    <@checkPrivilege url = "/work/bookCheck.do">
                    <button id="checkBookBtn" disabled="disabled" class="Button-line2 height27"
                            style="margin-top:10px;line-height: 20px;background: #f1f1f1;">人工查重</button>
                    </@checkPrivilege>
                    <@checkPrivilege url = "/work/create.do">
                    <button id="createBookBtn" disabled="disabled" class="Button-line2 height27"
                            style="margin-top:10px;margin-bottom:10px;line-height: 20px;background: #f1f1f1;">创建书本信息</button>
                    </@checkPrivilege>
                  </#if>
                  <@checkPrivilege url = "/work/editBookProgress.do">
                  <button bookProgressId="${l.id}" bookProgressName = "${l.name}" isbn = "${l.isbn}" class="Button-line height27 editBookProgress"
                          style="margin-top:10px;line-height: 20px;">编辑任务信息</button>
                  </@checkPrivilege>
                  <#if (l.bookId)??>
                    <@checkPrivilege url = "/work/showEditBaseBook.do">
                    <button bookProgressId="${l.id}" bookId = "${l.bookId}" bookType = "${l.bookType}" class="Button-line height27 editBaseBook"
                            style="margin-top:10px;line-height: 20px;">编辑书本信息</button>
                    </@checkPrivilege>
                    <#else>
                    <@checkPrivilege url = "/work/showEditBaseBook.do">
                    <button bookProgressId="${l.id}" bookId = "" bookType = "" disabled="disabled"  class="Button-line2 height27 editBaseBook"
                            style="margin-top:10px;line-height: 20px;">编辑书本信息</button>
                    </@checkPrivilege>
                  </#if>
                  </span>
              </#if>
            </li>
              <#list l.son as s>
                <li class="son_${l.id}" style = "display: none;">
                  <span style=" width:3%; text-align:center;border-top: 1px solid white;"> </span>
                  <span style=" width:3%; text-align:center;padding-left: unset;border-top: 1px solid white;"> </span>
                  <#if ( tab = 1 )>
                  <span style=" width:8%;white-space: nowrap;text-overflow: ellipsis;overflow: hidden;text-align:center;border-top: 1px solid white;"
                        title="<#if (s.innerId == 0)> <#else >${s.innerId}</#if>"><#if (s.innerId == 0)>  <#else >${s.innerId}</#if></span>
                  </#if>
                  <span style="<#if (tab = 1)> width:8%;<#else >width:17%;</#if>text-align:center;white-space: nowrap;text-overflow: ellipsis;overflow: hidden;border-top: 1px solid white;" title="${s.isbn}"> ${s.isbn}</span>
                  <span style="<#if (tab = 1)> width:8%;<#else >width:17%;</#if>white-space: nowrap;text-overflow: ellipsis;overflow: hidden;text-align:center;border-top: 1px solid white;"
                        title="${s.name}"> ${s.name}</span>
                  <span style="<#if (tab = 1)> width:8%;<#else >width:15%;</#if>text-align:center;white-space: nowrap;text-overflow: ellipsis;overflow: hidden;border-top: 1px solid white;" title="${s.author}">${s.author}</span>
                  <span style="<#if (tab = 1)> width:8%;<#else >width:15%;</#if>white-space: nowrap;text-overflow: ellipsis;overflow: hidden;text-align:center;border-top: 1px solid white;"
                        title="${s.publisher}">${s.publisher}</span>
                  <span style="<#if (tab = 1)> width:8%;<#else >width:15%;</#if>text-align:center;white-space: nowrap;text-overflow: ellipsis;overflow: hidden;border-top: 1px solid white;"
                        title="${s.seriesTitle}">${s.seriesTitle}</span>
                  <#if ( tab = 1 )>
                  <span style=" width:8%;white-space: nowrap;text-overflow: ellipsis;overflow: hidden;text-align:center;border-top: 1px solid white;"
                        title="${s.workOrder}"> ${s.workOrder}</span>
                  </#if>
                  <#if ( tab = 1 )>
                  <span style=" width:10%;border-top: 1px solid white;">
                    <#if (s.state > 2)>
                     ${s.stateName}
                    <#else >
                      <select id="bookStateSelect" iid="${s.id}" state="${s.state}" <@checkPrivilege url = "/work/updateWorkState.do" def="disabled"></@checkPrivilege>
                           class="con-r-top-l-frame frame-line height27" style=" width:90px; margin-top:12px;line-height: 20px;">
                        <option value="0" <#if (s.state == 0)> selected="selected"</#if>>未处理</option>
                        <option value="1" <#if (s.state == 1)> selected="selected"</#if>>待采购</option>
                        <option value="2" <#if (s.state == 2)> selected="selected"</#if>>已采购</option>
                        <option value="13" <#if (l.state == 13)> selected="selected"</#if>>不做处理</option>
                      </select>
                    </#if>
                  </span>
                  <#else>
                  <span style=" width:15%;border-top: 1px solid white;">
                    ${s.stateName}
                  </span>
                  </#if>
                  <#if ( tab = 1 )>
                  <span style=" width:28%;border-top: 1px solid white;">
                  <#if (s.state == 0) ||(s.state == 1) >
                    <@checkPrivilege url = "/work/bookCheck.do">
                    <button id="checkBookBtn" bookProgressId="${s.id}" bookProgressName = "${s.name}" isbn = "${s.isbn}" class="Button-line height27"
                            style="margin-top:10px;line-height: 20px;">人工查重</button>
                    </@checkPrivilege>
                    <@checkPrivilege url = "/work/create.do">
                    <button id="createBookBtn" disabled="disabled" class="Button-line2 height27"
                            style="margin-top:10px;margin-bottom:10px;line-height: 20px;background: #f1f1f1;">创建书本信息</button>
                    </@checkPrivilege>
                  <#elseif (s.state == 2)>
                    <@checkPrivilege url = "/work/bookCheck.do">
                    <button id="checkBookBtn" bookProgressId="${s.id}"  bookProgressName = "${s.name}" isbn = "${s.isbn}" class="Button-line height27"
                            style="margin-top:10px;line-height: 20px;">人工查重</button>
                    </@checkPrivilege>
                    <@checkPrivilege url = "/work/create.do">
                    <button id="createBookBtn" bookProgressId="${s.id}" innerId="${s.innerId}"
                            class="Button-line height27"
                            style="margin-top:10px;margin-bottom:10px;line-height: 20px;">创建书本信息</button>
                    </@checkPrivilege>
                  <#else>
                    <@checkPrivilege url = "/work/bookCheck.do">
                    <button id="checkBookBtn" disabled="disabled" class="Button-line2 height27"
                            style="margin-top:10px;line-height: 20px;background: #f1f1f1;">人工查重</button>
                    </@checkPrivilege>
                    <@checkPrivilege url = "/work/create.do">
                    <button id="createBookBtn" disabled="disabled" class="Button-line2 height27"
                            style="margin-top:10px;margin-bottom:10px;line-height: 20px;background: #f1f1f1;">创建书本信息</button>
                    </@checkPrivilege>
                  </#if>
                    <@checkPrivilege url = "/work/editBookProgress.do">
                    <button  bookProgressId="${s.id}" bookProgressName = "${s.name}" isbn = "${s.isbn}" class="Button-line height27 editBookProgress"
                            style="margin-top:10px;line-height: 20px;">编辑任务信息</button>
                    </@checkPrivilege>
                    <#if (l.bookId)??>
                      <@checkPrivilege url = "/work/showEditBaseBook.do">
                      <button bookProgressId="${s.id}" bookId = "${s.bookId}" bookType = "${s.bookType}" class="Button-line height27 editBaseBook"
                              style="margin-top:10px;line-height: 20px;">编辑书本信息</button>
                      </@checkPrivilege>
                    <#else>
                      <@checkPrivilege url = "/work/showEditBaseBook.do">
                      <button bookProgressId="${s.id}" bookId = "" bookType = "" disabled="disabled"  class="Button-line2 height27 editBaseBook"
                              style="margin-top:10px;line-height: 20px;">编辑书本信息</button>
                      </@checkPrivilege>
                    </#if>
                </span>
                </#if>
                </li>
              </#list>
          </#list>
      </ul>
    </div>
  </div>
<#else >
  <div class="text-block-con row-t">
    <div class="alert alert-info" style="margin-top: 20px;" role="alert">没有搜索到相关书本</div>
  </div>
</#if>

<!--翻页-->
<div class="con-page" style="border-top:unset;">
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

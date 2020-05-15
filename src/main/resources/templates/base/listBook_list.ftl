<#assign bookAmount = books?size>
<#assign rowSize = 6>
<#assign unpublishedAmount = 0>
<#assign rows = bookAmount/rowSize>
<#if (bookAmount%rowSize > 0)>
    <#assign rows = rows + 1>
</#if>
<div class="content-pro">
  <div class="content-pro-pic">
      <#if (bookAmount > 0)>
          <#list 0..(rows - 1) as i >
              <#list 0..5 as j >
                  <#assign index=i * rowSize + j>
                  <#if (index>=bookAmount)>
                  <#else>
                      <#assign originValue = books[index].source.origin>
                    <dl class="dlClass picture-hover">
                      <dt id="thumbnailContainer"
                          class="thumbnailContainer text-center center-block picture-book-thumbnail-container">
                        <div id="thumbnail" class="picture-book-thumbnail">
                          <img
                              src="<@filesServicePath bookImage="true" src="/${books[index].source.model_id!}/${books[index].source.id!}/${books[index].source.cover_image!}" bookImage="true"></@filesServicePath>"
                              style="" alt="封面图" width="109" height="109">
                        </div>
                          <#assign trainTaskStatus=books[index].source.state>
                          <#--<#assign trainStatus=books[index].bookBaseInfo.trainTaskStatus>-->
                          <#--isSearchAll用来判断是否是搜索全部，只有是搜索全部时才存在-->
                          <#if !isSearchAll??>
                            <div class="picture-book-status-container">
                                <#if (trainTaskStatus == 6) >
                                  <span class="picture-book-status-failure">训练失败(${trainTaskStatus})</span>
                                </#if>
                            </div>
                          <#else >
                            <div class="picture-book-status-container">
                                <#if (trainTaskStatus == 0) >
                                    <#if (originValue == 0)>
                                  <span class="picture-book-status">书本信息待创建</span>
                                  <#else>
                                    <span class="picture-book-status">NY书本</span>
                                  </#if>
                                <#elseif (trainTaskStatus == 1) >
                                    <#if (originValue == 0)>
                                      <span class="picture-book-status">待采样</span>
                                    <#else>
                                      <span class="picture-book-status">NY书本</span>
                                    </#if>
                                <#elseif (trainTaskStatus == 4) || (trainTaskStatus == 6)|| (trainTaskStatus == 13)|| (trainTaskStatus == 15)>
                                  <span class="picture-book-status">待训练</span>
                                <#elseif (trainTaskStatus == 5) || (trainTaskStatus == 14)>
                                  <span class="picture-book-status">训练中</span>
                                <#elseif (books[index].source.forbidden==1) >
                                  <span class="picture-book-status">禁用中</span>
                                <#elseif (trainTaskStatus == 3) >
                                  <span class="picture-book-status">已发布</span>
                                <#elseif (trainTaskStatus == 7) || (trainTaskStatus == 8)|| (trainTaskStatus == 9)|| (trainTaskStatus == 10)|| (trainTaskStatus == 11)|| (trainTaskStatus == 12)>
                                    <#if (originValue == 0)>
                                      <span class="picture-book-status">待审核</span>
                                    <#else>
                                      <span class="picture-book-status">NY书本</span>
                                    </#if>
                                </#if>
                            </div>
                          </#if>
                          <#--isSearchAll用来判断是否是搜索全部，只有是搜索全部时才存在-->
                          <#if !isSearchAll??>
                            <div id="buttonContainer" class="editBtn-container" bookId="${books[index].source.id!}">
                                <#if (books[index].source.state == 0) || (books[index].source.state == 1) || (books[index].source.state == 3)>
                                    <span id="editBtn" bookId="${books[index].source.id!}" bookState="${books[index].source.state!}" class="glyphicon"
                                      aria-hidden="true"></span>
                                </#if>
                                <#if (books[index].source.state == 7)>
                                    <@checkPrivilege url="/base/checkBook.do">
                                      <span id="checkBookBtn" bookId="${books[index].source.id!}" bookState="${books[index].source.state!}"
                                            class="glyphicon"
                                            aria-hidden="true"></span>
                                    </@checkPrivilege>
                                </#if>
                            </div>
                          <#else>
                            <div id="buttonContainer" class="editBtn-container" bookId="${books[index].source.id!}">
                                <#if (books[index].source.state == 0) || (books[index].source.state == 1) || (books[index].source.state == 3)>
                                  <span id="editBtn" isSearchAll="${isSearchAll!}" bookState="${books[index].source.state!}"
                                        bookId="${books[index].source.id!}" forbidden="${books[index].source.forbidden}"
                                        class="glyphicon"
                                        aria-hidden="true"></span>
                                </#if>
                                <#if (books[index].source.state == 7)>
                                    <@checkPrivilege url="/base/checkBook.do">
                                      <span id="checkBookBtn" isSearchAll="${isSearchAll!}" bookId="${books[index].source.id!}" bookState="${books[index].source.state!}"
                                            forbidden="${books[index].source.forbidden}" class="glyphicon"
                                            aria-hidden="true"></span>
                                    </@checkPrivilege>
                                </#if>
                            </div>
                          </#if>
                      </dt>
                      <dd>
                        <h3 title="${books[index].source.name!}">${books[index].source.name!}</h3>
                        <span style="width: 150px" title="ISBN:${books[index].source.isbn!}<#list books[index].source.isbns as isbn>/${isbn.isbn!}</#list>">ISBN:${books[index].source.isbn!}<#list books[index].source.isbns as isbn>/${isbn.isbn!}</#list></span>
                        <span style="width: 150px">作者:${books[index].source.author!}</span>
                        <span style="width: 150px;padding-right: 10px">出版社:${books[index].source.publisher!}</span>
                        <span style="width: 150px;padding-right: 10px">所属系列:${books[index].source.series_title!}</span>
                          <#--isSearchAll用来判断是否是搜索全部，只有是搜索全部时才存在-->
                          <#if books[index].source.state != 4 && books[index].source.state != 5 && books[index].source.state != 6>
                            <div class="pro-window">
                              <div class="pro-window-ico"><img src="static/images/ico-p.png" width="15" height="3"/>
                              </div>
                              <div class="pro-window-box">
                                <ul>
                                    <@checkPrivilege url="/base/deleteBook.do">
                                      <LI id="deleteLi"><a href="#" bookId="${books[index].source.id!}"
                                                           state="${books[index].source.state}" id="deleteBtn">删除</a>
                                      </LI>
                                    </@checkPrivilege>
                                    <#if (books[index].source.state==3 || books[index].source.state==7)>
                                      <@checkPrivilege url="/base/lookRepoMaked.do">
                                      <LI id="lookRepo"><a href="#" bookId="${books[index].source.id!}" id="lookRepoBtn">查看资源制作详情</a>
                                      </LI>
                                      </@checkPrivilege>
                                    </#if>
                                </ul>
                              </div>
                            </div>
                          </#if>
                      </dd>

                    </dl>
                  </#if>
              </#list>
          </#list>

        <div class="row" style="height: 70px"></div>

      <#else>
          <#if !isSearchAll??>
            <div class="alert alert-info" style="margin-top: 20px;" role="alert" id="noSearchBook">此标签页下暂无任何数据</div>
          <#else >
            <div class="alert alert-info" style="margin-top: 20px;" role="alert" id="noSearchBook">未搜到相关书本</div>
          </#if>
      </#if>
  </div>
</div>
<!--翻页-->
<div class="con-page">
    <@checkPrivilege url="/virtual/base/repoBooksCount.do">
      <div class="books-count" id="bookCount" style="float: left;" bookCount="${currentTabBookCount}">
        <label style="font-size: 12px;font-weight: normal;">当前模块共${currentTabBookCount}本 | 图像库总量共${modelBookCount}
          本</label>
      </div>
    </@checkPrivilege>
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


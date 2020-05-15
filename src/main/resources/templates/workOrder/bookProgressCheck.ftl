<#assign bookCount = books?size>
<#assign proCount = bookProgressList?size>
<div class="work-box" style="background: #ffffff;">
  <div class="work-box-title">
    <ul>
      <li id="isbnSameTab">ISBN相同的书本</li>
      <li id="nameSameTab">含有该书名的书本</li>
    </ul>
  </div>
  <div class="work-box-bot">
    <div>
      <h3>绘本图片库及资源库查重结果：</h3>
        <#if (bookCount > 0)>
          <div class="work-box-con">
            <div class="work-box-pic">
                <#list books as b>
                  <dl>
                    <dt>
                      <a style="width: 100%;height: 100%;" id="openBook" bookId= ${b.bookBaseInfo.id}>
                        <img style="width: 100%;height: 100%;"
                             src="<@filesServicePath bookImage="true" src="/${b.bookBaseInfo.modelId!}/${b.bookBaseInfo.id!}/${b.bookBaseInfo.coverImage!}" bookImage="true"></@filesServicePath>"
                             style="" alt="封面图">
                          <#assign trainTaskStatus=b.bookBaseInfo.state>
                      </a>
                      <div class="picture-book-status-container"
                           style="position: relative;margin-top: -15%;width: 100%;text-align: center;background: lightgray;">
                          <#if (trainTaskStatus == 0) >
                            <span class="picture-book-status">未处理</span>
                          <#elseif (trainTaskStatus == 1) >
                            <span class="picture-book-status">待采购</span>
                          <#elseif (trainTaskStatus == 2) >
                            <span class="picture-book-status">已采购</span>
                          <#elseif (trainTaskStatus == 3) >
                            <span class="picture-book-status">书本信息已创建</span>
                          <#elseif (trainTaskStatus == 4) >
                            <span class="picture-book-status">图片待采样</span>
                          <#elseif (trainTaskStatus == 5) >
                            <span class="picture-book-status">图片待审核</span>
                          <#elseif (trainTaskStatus == 6) >
                            <span class="picture-book-status">图片待训练</span>
                          <#elseif (trainTaskStatus == 7) >
                            <span class="picture-book-status">图片训练中</span>
                          <#elseif (trainTaskStatus == 8) >
                            <span class="picture-book-status">图片已发布</span>
                          <#elseif (trainTaskStatus == 9) >
                            <span class="picture-book-status">资源待编辑</span>
                          <#elseif (trainTaskStatus == 10) >
                            <span class="picture-book-status">资源待审核</span>
                          <#elseif (trainTaskStatus == 11) >
                            <span class="picture-book-status">资源已审核</span>
                          <#elseif (trainTaskStatus == 12) >
                            <span class="picture-book-status">资源禁用中</span>
                          </#if>
                      </div>
                    </dt>
                    <dd>
                      <h3 style="white-space: nowrap;text-overflow: ellipsis;overflow: hidden;width: 180px;" title="${b.bookBaseInfo.name!}">${b.bookBaseInfo.name!}</h3>
                      <span style="width: 150px;white-space: nowrap;text-overflow: ellipsis;overflow: hidden;"
                            title="ISBN:${b.bookBaseInfo.isbn!}<#list b.isbns as isbn>/${isbn.isbn!}</#list>">
                      ISBN:${b.bookBaseInfo.isbn!}<#list b.isbns as isbn>/${isbn.isbn!}</#list></span>
                      <span style="width: 150px;white-space: nowrap;text-overflow: ellipsis;overflow: hidden;" title="${b.bookBaseInfo.author!}">作者:${b.bookBaseInfo.author!}</span>
                      <span style="width: 150px;white-space: nowrap;text-overflow: ellipsis;overflow: hidden;" title="${b.bookBaseInfo.publisher!}">出版社:${b.bookBaseInfo.publisher!}</span>
                      <span style="width: 150px;white-space: nowrap;text-overflow: ellipsis;overflow: hidden;" title="${b.bookBaseInfo.seriesTitle!}">所属系列:${b.bookBaseInfo.seriesTitle!}</span>
                      <#if (type?? && type == "1") >
                      <div class="work-release" style="top: 78%">
                        <p><input name="相同" id="sameBookBtn" type="button" class="frame-Button-b" value="相同"
                                  bookId="${b.bookBaseInfo.id}" bookName = "${b.bookBaseInfo.name}" style="padding: 2px 8px;"/></p>
                      </div>
                      </#if>
                    </dd>
                  </dl>
                </#list>
            </div>
          </div>
        <#else >
          <div class="text-block-con row-t">
            <div class="alert alert-info" style="margin-top: 20px;background: none;border: none;color: #737373;width: 100%;text-align: center;font-size: 14px;" role="alert">没有搜索到相关书本
            </div>
          </div>
        </#if>
    </div>
    <div>
      <h3>任务列表查重结果：</h3>
        <#if (proCount > 0)>
            <div class="work-tab">
              <ul class="work-block-head" style="background:#eceff8;">
                <li style=" width:9%;">书本编号</li>
                <li style=" width:8%;">ISBN</li>
                <li style=" width:12%;">书名</li>
                <li style=" width:12%;">作者名称</li>
                <li style=" width:12%;">出版社</li>
                <li style=" width:12%;">所属系列</li>
                <li style=" width:11%;">隶属工单</li>
                <li style=" width:12%;">任务状态</li>
                <li style=" width:12%;">操作</li>
              </ul>
              <div class="work-list">
                <ul class="work-list-top">
                    <#list bookProgressList as l>
                      <li>
                        <span style=" width:9%; white-space: nowrap;text-overflow: ellipsis;overflow: hidden;" title="<#if (l.innerId == 0)> <#else >${l.innerId}</#if>">
                            <#if (l.innerId == 0)> <#else >${l.innerId}</#if></span>
                        <span style=" width:8%;white-space: nowrap;text-overflow: ellipsis;overflow: hidden;" title="${l.isbn}">${l.isbn}</span>
                        <span style=" width:12%;white-space: nowrap;text-overflow: ellipsis;overflow: hidden;" title="${l.name}">${l.name}</span>
                        <span style=" width:12%;white-space: nowrap;text-overflow: ellipsis;overflow: hidden;" title="${l.author}">${l.author}</span>
                        <span style=" width:12%;white-space: nowrap;text-overflow: ellipsis;overflow: hidden;" title="${l.publisher}">${l.publisher}</span>
                        <span style=" width:12%;white-space: nowrap;text-overflow: ellipsis;overflow: hidden;" title="${l.seriesTitle}">${l.seriesTitle}</span>
                        <span style=" width:11%;white-space: nowrap;text-overflow: ellipsis;overflow: hidden;" title="${l.workOrder}">${l.workOrder}</span>
                        <span style=" width:12%;white-space: nowrap;text-overflow: ellipsis;overflow: hidden;" title="${l.stateName}">${l.stateName}</span>
                        <span style="width:12%;">
                            <#if (type?? && type == "1") >
                          <button class="Button-line height27" style="margin-top:10px;line-height: 20px;"
                                  id="progressSameBtn" state="${l.state}" bookProgressId = "${l.id}">相同
                          </button>
                            </#if>
                        </span>
                      </li>
                    </#list>
                </ul>
              </div>
            </div>
          </div>
        <#else >
          <div class="text-block-con row-t">
            <div class="alert alert-info" style="margin-top: 20px;background: none;border: none;color: #737373;width: 100%;text-align: center;font-size: 14px;" role="alert">没有搜索到相关书本</div>
          </div>
        </#if>
    </div>
    <div>
      <div class="modal-footer" style="width: 100%;float: left;border: none;text-align: center;">
          <#if (type?? && type == "1") >
        <@checkPrivilege url = "/work/updateWorkState.do">
        <button type="button" id="noSameBtn" class="pop-padding frame-Button-b">未发现相同</button>
        </@checkPrivilege>
        </#if>
      </div>
    </div>
  </div>
</div>

<!--翻页-->
<div class="con-page" style="border-top:unset;">
    <#if (pages > 1)>
      <div id="paginationContainer2">
        <div>
          <nav aria-label="Page navigation">
            <ul id="pagination2" class="" currentPage="${currentPage}" pages="${pages}"
                pageSize="${pageSize}" style="margin-top: 0px;">
            </ul>
          </nav>
        </div>
      </div>
    </#if>
</div>
<#if (type?? && type == "0") >
<div id="template">
  <div id="bookPageInfoIDiv">
    <div id="itemTemplate" class="col-md-2" style="display:none; width: 150px;height: 112px;">
      <div id="thumbnailContainer" class="thumbnail-container text-center center-block">
        <div id="thumbnail" class="page-thumbnail-container">
          <img
              src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIwAAACgBAMAAAAsgJlAAAAAGFBMVEXc29y7u7zExMXU09TNzM3JyMnQ0NHAv8ANuow4AAABgElEQVRo3u3UvW7CMBSG4dOG0LU2DazYhbI6MT8rgRRWirgA4AoKS2+/JyZEqoJUW2zoeyTWN/YnEgIAAAAAAAAAAHgk7XcqPffpLq0OlZ5eqV3UVpSLq05g5lnUJOW6MvLJRHbyZu0lE1k269oS5YZoUD3mf+4E8pJx0mojzsRd70y7WCTFKtNaySGVlKkzuVum5b9NejnTkacQurTnTFvy1iokU10qdxUltZpz5kvtKTrtW4ETu4tInuuVUs5kSZxQ3vXbJhWlab+ZsXM6/EjjlxkXpazTzBiK1iLxy7BoyT95zQhWnWZykjYX5yJgYmWqTK8o1pfMrDcwRBMVkjlsGpeamlicd3u/S8V6JPWQr3Rrm08l+kEvQ8tcM9Zm1wyzhoL+fs2JzYsuOBWYaZ4m46LcmcBMcxsaL07CNxMnW9W/nWFjv0sdBZObpVXff17NwK9f2huuDJESYu4yDmcCv8UROVv9Qe5STnWpers72PpBhgAAAAAAAAAAAB7EL5cHSvDhqEN7AAAAAElFTkSuQmCC"
              style="" alt="封面图" class="img-thumbnail">
        </div>
        <div class="row picture-book-title-container">
          <div id="paginationText" class="picture-book-title text-center"></div>
        </div>
      </div>
    </div>
  </div>
</div>
</#if>

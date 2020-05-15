

  <div class="text-block-con row-t" id="feedBackListPanel">
    <div class="work-tab" style="margin-top: 0;">
      <ul class="work-block-head">
        <li style=" width:5%; text-align:center;">序号</li>
        <li style=" width:10%;">ISBN</li>
        <li style=" width:10%;">书名</li>
        <li style=" width:10%;">作者</li>
        <li style=" width:10%;">出版社</li>
        <li style=" width:10%;">所属系列</li>
        <li style=" width:5%;text-align:left;">封面图片</li>
        <li style=" width:6%;">反馈人数</li>
        <li style=" width:10%;text-align:center;">书本状态</li>
        <li style=" width:16%;">操作</li>
        <li style=" width:8%;">备注</li>
      </ul>
      <div class="work-list" style="border:1px solid #eceff8; border-top:none; width:100%">
        <ul class="work-list-top" id="ul-list">
          <#if (netBooks?size gt 0)>
            <#list netBooks as l>
              <li>
                <span style=" width:5%; text-align:center;">${l_index+1}</span>
                <span style=" width:10%;" title="${l.isbn}"> ${l.isbn}</span>
                <span style=" width:10%;" title="${l.name}"> ${l.name}</span>
                <span style=" width:10%;" title="${l.author}"> ${l.author}</span>
                <span style=" width:10%;" title="${l.publisher}"> ${l.publisher}</span>
                <span style=" width:10%;" title="${l.seriesTitle!""}"> ${l.seriesTitle!""}</span>
                <span style=" width:5%;">
                  <#if (l.coverImage !="")>
                    <div id="userbackContent">
                    <a href="#" id="checkimage" tid="${l.coverImage!}" style=" text-overflow: ellipsis;white-space: nowrap; overflow: hidden;display: block;padding-top: 10px;"><img src="static/images/ico30.jpg"></a>
                    <div class="row create-partner-container" id="checkUserBackImage">
                      <div class="col-md-12">
                        <div id="userFeedBackImage" style="user-select:none;display:none;overflow: hidden;" >
                          <img width="500px" style="overflow: hidden" src="<@filesServicePath src="/tis/netBookCover/${l.coverImage!}"></@filesServicePath>"/>
                        </div>
                      </div>
                    </div>
                  </div>
                  </#if>
                </span>
                <span style=" width:6%;text-align:center;" title="${l.bookCount}"> ${l.bookCount}</span>
                <span style=" width:10%;text-align:center;" title="${l.stateName}"> ${l.stateName}</span>
                <span style=" width:16%;">
                  <#if (l.orderId > 0 || l.state == 13 )>
                    <@checkPrivilege url="/feedback/addToWorkOrder.do">
                      <button class="Button-line2 height27 addToWorkOrder" id="${l.id}" style="margin-top: 8px; height: 30px; padding: 2px 10px;line-height: 24px;" disabled>加入工单</button>
                    </@checkPrivilege>
                    <@checkPrivilege url="/feedback/addRemark.do">
                      <button class="Button-line2 height27 noDeal" id="${l.id}"  style="margin-top: 8px; height: 30px; padding: 2px 10px;line-height: 24px;" disabled>不做处理</button>
                    </@checkPrivilege>
                  <#else>
                    <@checkPrivilege url="/feedback/addToWorkOrder.do">
                      <button class="Button-line height27 addToWorkOrder" id="${l.id}" style="margin-top: 8px; height: 30px; padding: 2px 10px;line-height: 24px;">加入工单</button>
                    </@checkPrivilege>
                    <@checkPrivilege url="/feedback/addRemark.do">
                      <button class="Button-line height27 noDeal" id="${l.id}"  style="margin-top: 8px; height: 30px; padding: 2px 10px;line-height: 24px;">不做处理</button>
                    </@checkPrivilege>
                  </#if>
                </span>
                <span style=" width:8%;" title="${l.remark}"> ${l.remark}</span>
              </li>
            </#list>
          <#else>
            <li>
              <div class="text-block-con row-t">
                <div class="alert alert-info" style="margin-top: 20px;" role="alert">没有搜索到相关书本</div>
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

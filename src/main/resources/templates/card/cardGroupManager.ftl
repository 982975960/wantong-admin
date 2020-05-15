<#assign groupSize = list?size>
<@script src="/js/card/cardGroupManager.js"></@script>
<@link href="/css/card/cardGroupManager.css" rel="stylesheet"/>
<div class="main-w">
  <div class="content-wrap-w">
    <div class="content-r-path">卡片管理 / 卡片套装管理</div>
    <div id="cardGroupManager" class="content-box">
      <#if (noModel == 0)>
      <div class="con-r-top">
        <div style="margin-bottom: 20px;font-size: 14px;border-bottom: 1px solid #eceff8;line-height: 32px;color: #333333;">
          <span id="cardModel" modelId="${model.id}">卡片库:${model.name}</span>
        </div>
        <div class="con-r-top-l" style="width: 70%;display: inline-flex;" id="searchDiv">
          <div style="width: 30%;" class="form-group">
            <label style="font-weight: normal;width: 70px;float: left;line-height: 34px;">套装名称:</label>
            <input id="groupNameInput" type="text" placeholder="输入套装名称" class="form-control" style="width: 150px;float: left;border-radius: 0;" value="${groupName}">
          </div>
          <div style="width: 30%;" class="form-group">
            <label style="font-weight: normal;width: 55px;float: left;line-height: 34px;">套装ID:</label>
            <input id="groupIDInput" type="text" placeholder="输入套装ID" class="form-control" style="width: 150px;float: left;border-radius: 0;"  onkeyup="this.value=this.value.replace(/[^0-9]+/,'');" value="${groupId}">
          </div>
          <input name="" type="button" value="搜索" class="frame-Button-b" id="searchBtn" style="height: 32px;"/>
          <input name="" type="button" value="清空" id="clearBtn" class="search-Button02" style="margin-top: 6px;margin-left: 20px;"/>
        </div>
        <div class="con-r-top-r" style="width: 30%;visibility: <@checkPrivilege url = "/card/saveCardGroupInfo.do" def="hidden">unset</@checkPrivilege>;">
          <input name="" type="button" value="创建卡片套装" class="frame-Button-b" id="createCardGroupBtn"/>
        </div>
      </div>
      <div style="width: 100%;overflow: hidden;float: left;">
      <div class="cardGroupListDiv" style="margin-top: 0;width: 105%;float: left;">
        <#if (groupSize > 0)>
          <#list list as card>
            <dl class="dlClass picture-hover" cardGroupId="${card.id!}">
              <dt id="thumbnailContainer"
                  class="thumbnailContainer text-center center-block picture-book-thumbnail-container" style="height: auto;">
                <div id="thumbnail" class="picture-book-thumbnail">
                  <img
                      src="<@filesServicePath cardImage="true" src="/${card.modelId!}/${card.id!}/${card.coverImage!}"></@filesServicePath>"
                      style="width: 129px;height: 129px;" alt="封面图">
                </div>
                <span  title="${card.name}" style="width: 100px;line-height: 30px;text-overflow:ellipsis;white-space:nowrap;overflow: hidden;display:block;margin-left:30%;">套装名称:${card.name!}</span>
                <div class="editBtn-container" cardGroupId="${card.id!}" style="background-color: unset;margin-top: -140px;">
                  <span id="editBtn" cardGroupId="${card.id!}" class="glyphicon" aria-hidden="true" style="margin-top: -36px"></span>
                </div>
              </dt>
              <dd>
                <div class="pro-window" style="visibility: hidden;">
                  <div class="pro-window-ico"><img src="static/images/ico-p.png" width="15" height="3"/>
                  </div>
                  <div class="pro-window-box">
                    <ul>
                      <LI id="deleteLi">
                        <a href="#" cardGroupId="${card.id!}" id="deleteBtn" class="delete-btn">删除</a>
                      </LI>
                    </ul>
                  </div>
                </div>
              </dd>
            </dl>
          </#list>
        <#else>
            <#if (isSearch==0)>
              <div id="noGroups" class="alert alert-info" style="margin-top: 20px;" role="alert">当前模块暂无卡片套装</div>
            <#else >
              <div id="noGroups" class="alert alert-info" style="margin-top: 20px;" role="alert">未搜到相关卡片套装</div>
            </#if>
        </#if>
      </div>
      </div>
      <div class="con-page">
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
      <#else >
        <div id="noGroups" class="alert alert-info" style="margin-top: 20px;" role="alert">用户没有卡片库，请联系玩瞳管路员，创建卡片库</div>
      </#if>
    </div>
  </div>
  <!--分页-->
</div>

<script>
  $(function () {
    wantong.cardGroupManager.init({

    });
  });
</script>

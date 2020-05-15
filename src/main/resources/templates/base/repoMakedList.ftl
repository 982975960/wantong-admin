<@script src="/js/base/repoMaked.js"></@script>

<#assign repoMakedInfoAmount = repoMakedInfo?size>
<#if (isDisplay == 0)>
  <div>
    <span style="color: red;font-size: 15px;line-height: 40px;">因以下客户在同一个资源库中将准备删除的书本和准备用于替换的书本领取到同一个资源库，您需先通知客户删除其中一本后才能执行删除操作！</span>
  </div>
</#if>

<div class="work-tab" id="repoMakedDiv">
  <ul class="work-block-head">
    <li style=" width:5%; text-align:center;">序号</li>
    <li style=" width:15%; text-align:center;">已制作资源的合作商</li>
    <li style=" width:10%; text-align:center;">资源库Id</li>
    <li style=" width:10%; text-align:center;">资源库名称</li>
    <li style=" width:10%; text-align:center;">资源库BookId</li>
    <li style=" width:15%; text-align:center;">资源制作状态</li>
    <li style="width: 15%;text-align: center">资源类型</li>
    <li style=" width:20%; text-align:center;">联系方式</li>
  </ul>
  <div class="work-list" style="border:1px solid #eceff8; border-top:none; width:99.8%">
    <ul class="work-list-top">

        <#if (repoMakedInfoAmount>0)>
            <#list repoMakedInfo as item>
              <li>
                <span style=" width:5%; text-align:center;">${item_index+1}</span>
                <span style=" width:15%; text-align:center;" title="${item.partnerName}">${item.partnerName}</span>
                <span style=" width:10%; text-align:center;" title="${item.repoId}"> ${item.repoId}</span>
                <span style=" width:10%; text-align:center;" title="${item.repoName}"> ${item.repoName}</span>
                <span style=" width:10%; text-align:center;" title="${item.bookId}"> ${item.bookId}</span>
                <span style=" width:15%; text-align:center;" title="${item.stateName}"> ${item.stateName}</span>
                <span style="width: 15%;text-align: center;" title="${item.repoType}">${item.repoType}</span>
                <span style=" width:20%; text-align:center;" title="${item.phone}">${item.phone}</span>
              </li>
            </#list>
        </#if>
    </ul>
  </div>
  <#if (isDisplay == 1)>
  <#--分页-->
    <div class="con-page" style="border-top: none">
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
  </#if>
</div>


<#if (isDisplay == 1)>
  <script>
    $(function () {
      wantong.base.repoMaked.init({
        bookId: "${bookId}"
      });
    });
  </script>
</#if>


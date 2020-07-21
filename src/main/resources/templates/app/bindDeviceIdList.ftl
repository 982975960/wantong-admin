<#if records??><#assign recordsAmount=records?size><#else><#assign recordsAmount=0></#if>
<@script src="/js/app/bindDeviceIdList.js"/>
<@link href="/css/app/bindDeviceIdList.css" rel="stylesheet"/>
<div id="bindDeviceIdListDiv">
  <div class="row create-partner-container">
    <div class="col-md-12">
      <div class="input-group">
        <div style="float: left">
          <input type="text" class="con-r-top-l-frame frame-line" id="searchInput" placeholder="请输入设备ID"
                 value="${searchText}">
        </div>
        <div style="float: left">
          <button type="button" class="frame-Button" id="searchBtn" style="margin-left: 20px;">搜索</button>
          <button value="清空"  class="search-Button02" id="clearBtn" style="margin-left: 20px;">清空</button>
        </div>
      </div>

        <#if (recordsAmount>0)>
          <div class="form-group" style="margin-top: 5px;">
            <div>
              <table class="table controls-table list-panel table-striped" id="recordDiv">
                <thead>
                <tr>
                  <th class="center">序号</th>
                  <th class="center">设备ID</th>
                  <th class="center">状态</th>
                </tr>
                </thead>
                <tbody>
                <#list records as record >
                  <tr>
                    <#assign index = record_index + 1>
                    <th class="center2">${index}</th>
                    <th class="center2">${record}</th>
                    <th class="center2">已激活</th>
                  </tr>
                </#list>
                </tbody>
              </table>
            </div>
          </div>
        <#else >
          <div class="text-block-con row-t">
            <div class="alert alert-info" style="margin-top: 20px;" role="alert">未搜索到此设备ID</div>
          </div>
        </#if>
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

</div>
<script>
  $(function () {
    wantong.bindDeviceIdList.init({
      recordId:${recordId}
    });
  });
</script>
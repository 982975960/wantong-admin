<#if records??><#assign recordsAmount=records?size><#else><#assign recordsAmount=0></#if>
<@script src="/js/app/bindDeviceIdRecord.js"/>
<@link href="/css/app/bindDeviceIdRecord.css" rel="stylesheet"/>
<div id="bindDeviceIdRecordDiv">
  <div class="row create-partner-container">
    <div class="col-md-12">
        <#if (recordsAmount>0)>
          <div class="form-group">
            <div style="height: 380px;">
              <table class="table controls-table list-panel table-striped" id="recordDiv">
                <thead>
                <tr>
                  <th class="center">批次</th>
                  <th class="center">导入数量</th>
                  <th class="center">授权时间</th>
                  <th class="center">操作</th>
                </tr>
                </thead>
                <tbody>
                <#list records as record >
                  <tr>
                      <#assign recordNum=recordsAmount-record_index>
                    <th class="center2">${recordNum}</th>
                    <th class="center2">${record.downloadAmount}</th>
                    <th class="center2">${record.createTime}</th>
                    <th class="center2">
                      <button type="button" class="show-device-btn btn btn-xs btn-warning bind-btn"
                              recordId="${record.id}">查看设备ID列表
                      </button>
                      <@checkPrivilege url="/app/addDeviceId.do">
                      <button type="button" class="add-device-btn btn btn-xs btn-warning bind-btn"
                              recordId="${record.id}" appId="${appId}">添加设备ID
                      </button>
                      </@checkPrivilege>
                    </th>
                  </tr>
                </#list>
                </tbody>
              </table>
            </div>
          </div>
        <#else >
          <div class="text-block-con row-t">
            <div class="alert alert-info" style="margin-top: 20px;" role="alert">暂无绑定记录</div>
          </div>
        </#if>
    </div>
  </div>
</div>
<script>
  $(function () {
    wantong.bindDeviceIdRecord.init();
  });
</script>
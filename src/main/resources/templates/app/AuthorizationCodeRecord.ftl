<#if records??><#assign recordsAmount=records?size><#else><#assign recordsAmount=0></#if>
<#assign isChoiceApp=isChoice>
<@script src="/js/app/viewAuthQrCodeRecord.js"/>
<@link href="/css/app/AuthorizationCodeRecord.css" rel="stylesheet"/>
<div id="authorizationCodeRecord">
  <div class="row create-partner-container">
    <div class="col-md-12">
      <#if (recordsAmount>0)>
        <div class="form-group">
          <div style="height: 380px;">
            <table class="table controls-table list-panel table-striped" id="downloadQrCodeTable">
              <thead>
              <tr>
                <th class="center"></th>
                <th class="center">批次</th>
                <th class="center">批次对应的卡号</th>
                <th class="center">创建时间</th>
                <th class="center">授权数量</th>
                <th class="center">操作</th>
              </tr>
              </thead>
              <tbody>
              <#list records as record >
                <tr>
                  <th class="center2"><#if (record.downloadState == 0)><img src="/static/images/newRecord.jpg"></#if>
                  </th>
                  <th class="center2" style="display: none">recordId:${record.id}</th>
                    <#assign recordNum=recordsAmount-record_index>
                  <th class="center2">${recordNum}</th>
                  <th class="center2">${record.cardNum}</th>
                  <th class="center2">${record.createTime}</th>
                  <th class="center2">${record.downloadAmount}</th>
                  <th class="center2">
                      <@checkPrivilege url="/app/prepareAuthorizationCode.do">
                          <@checkPrivilege url="/app/checkAuthorizationCode.do">
                              <@checkPrivilege url="/app/downloadAuthorizationCode.do">
                                  <#if (record.downloadState == 1)>
                                    <button type="button" class="Download-Record-Btn btn btn-xs btn-warning bind-btn"
                                            fileName="${record.fileName}" appId="${appId}">点击下载
                                    </button>
                                  <#else>
                                    <button type="button" class="download-new-qrcode btn btn-xs btn-warning bind-btn"
                                            fileName="${record.fileName}" appId="${appId}">点击下载
                                    </button>
                                  </#if>
                              </@checkPrivilege>
                          </@checkPrivilege>
                      </@checkPrivilege>
                      <#if (isChoiceApp)>
                          <@checkPrivilege url="/app/bindApp.do">
                              <#if record.cardNum != "" &&  record.downloadState == 1 >
                                <button id="bindCustomerApp" type="button"
                                        class="Bind-Customer-App-Btn btn btn-xs btn-warning bind-btn"
                                        recordId="${record.id}">绑定客户应用
                                </button>
                              <#else>
                                <button id="bindCustomerApp" type="button"
                                        class="Bind-Customer-App-Btn btn btn-xs btn-warning bind-btn"
                                        recordId="${record.id}" disabled="disabled" style="background-color: #CCCCCC">
                                  绑定客户应用
                                </button>
                              </#if>
                          </@checkPrivilege>
                      </#if>
                  </th>
                </tr>
              </#list>
              </tbody>
            </table>
          </div>
        </div>
      <#else >
        <div class="text-block-con row-t">
          <div class="alert alert-info" style="margin-top: 20px;" role="alert">暂无可下载授权码</div>
        </div>
      </#if>
  </div>
</div>
</div>
<script>
  $(function () {
    wantong.viewAuthQrCodeRecord.init();
  });
</script>
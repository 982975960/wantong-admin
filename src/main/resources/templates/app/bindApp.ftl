<@link href="/css/app/bindApp.css" rel="stylesheet"/>
<@script src="/js/app/bindApp.js"/>
<div id="bindCustomerAppDialog">
  <div class="form-group">
    <label for="appId"><h4>选择合作商：</h4></label>
    <select class="con-r-top-l-frame frame-line" id="partnerSelect1">
      <option value="-1">请选择</option>
      <#list partners as par>
        <option value="${par.id}">${par.name}</option>
      </#list>
    </select>
  </div>
  <div class="form-group" >
    <label for="appId"><h4>选择应用：</h4></label>
    <select class="con-r-top-l-frame frame-line" id="appSelect" disabled="disabled">
      <option value="-1">请选择</option>
    </select>
  </div>
  <div class="modal-footer">
    <button type="button" id="bindBtn" class="pop-padding frame-Button-b" recordId="${recordId}">保存</button>
    <button type="button" id="closeButton" class="pop-padding frame-Button">关闭</button>
  </div>
</div>


<script>
  $(function () {
    wantong.bindApp.init();
  });
</script>
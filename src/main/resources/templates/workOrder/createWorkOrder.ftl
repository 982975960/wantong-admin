
<#--搜索输入框引入-->
<@link href="/css/demo.css" rel="stylesheet"/>

<@link href="/css/3rd-party/zui/component-chosen.css" rel="stylesheet"/>
<@script src="/js/3rd-party/chosen.jquery.js"/>

<@script src="/js/workOrder/createWorkOrder.js"></@script>
<@link href="/css/workOrder/workorder.css" rel="stylesheet"/>

  <#--创建用户和更新用-->
  <div class="layer-1" id="createWorkOrder">
    <div class="create-update-work-order" >
        <div style="float: left;width: 100%;margin-top: 10px;">
            <label style="margin-left: 7%;font-size: 15px;float: left;font-weight: normal;margin-right: 10px;line-height: 32px;">选择合作商:</label>
            <div style="width: 210px;float: left;">
                <select id="createWordOrderPartner" class="form-control form-control-chosen" data-placeholder="请选择合作商">
                    <option></option>
                    <#list partners as partner>
                        <option value="${partner.id}">${partner.name}</option>
                    </#list>
                </select>
            </div>
        </div>
      <div class="work-order-message" style="float: left;width: 100%;height: auto;">
        <label style="margin-left: 7%;margin-top: 20px;">工单名称:</label>
        <input type="text" class="work-order-name" maxlength="20" name="" placeholder="不超过20个字" style="border: 1px solid #CCCCCC;padding-left: 10px;width: 218px;margin-left: 22px;">
      </div>
      <div class="work-order-action" style="padding-top: 10px;margin-top: 25px;float: left;">
        <button type="button" class="pop-padding frame-Button-b confirm-button" style="margin-left: 190px;">保存</button>
        <button type="button" class="pop-padding frame-Button cancel-button" style="margin-left: 20px;">取消</button>
      </div>
    </div>
  </div>

<script>
  $(function () {
    wantong.createWorkOrder.init({
      name: "${name}",
      id: "${id}",
      partnerId: "${partnerId}",
      modelId: "${modelId}"
    });
  });
</script>
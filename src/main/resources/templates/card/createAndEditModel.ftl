<link href="./static/css/demo.css" rel="stylesheet">
<link href="./static/css/3rd-party/zui/component-chosen.css" rel="stylesheet">
<@script src="/js/3rd-party/chosen.jquery.js"/>

<@link href="/css/card/cardModel.css" rel="stylesheet"/>

<@script src="/js/card/createAndEditModel.js"/>
<div id="createAndEditModel">
  <div class="modal-body">
    <div class="input-group form-group-sm col-xs-10" style="margin-bottom:15px;margin-left: 40px;">
      <span class="input-group-addon" style="border: none;background-color: #FFFFFF">合作商</span>
       <select id="selectPartner" class="form-control form-control-chosen" data-placeholder="请选择合作商">
          <option></option>
          <#list partners as partner>
            <option value="${partner.id}" style="overflow: hidden;text-overflow: ellipsis;white-space: nowrap;">${partner.name}</option>
          </#list>
        </select>
    </div>
    <div class="input-group form-group-sm col-xs-10" style="margin-bottom:15px;margin-left: 40px;margin-top: 20px">
      <span class="input-group-addon" style="border: none;background-color:#FFFFFF ">卡片库名称</span>
      <input type="text" class="form-control" id="createModelName"  onkeydown="if(event.keyCode==13){return false;}" placeholder="不能超过20个字" maxlength="20" style="width: 104%">
    </div>
  </div>
  <div class="modal-footer" style="width: 100%;float: left" >
    <button type="button" id="saveBtn" class="pop-padding frame-Button-b">保存</button>
    <button type="button" id="closeBtn" class="pop-padding frame-Button" data-dismiss="modal" >关闭</button>
  </div>
</div>

<script>
  $(function () {
    wantong.createAndEditModel.init({
      partnerId: "${partnerId}",
      partnerName: "${partnerName}",
      modelId: "${modelId}",
      modelName: "${modelName}"
    });
  });
</script>

<style>
  .chosen-single span{
    margin-top: 3px;
    max-width: 180px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .chosen-container{
    width: 94% !important;
    margin-left: 28px !important;
  }
  .chosen-single{
    height: 33px !important;
  }
  .chosen-single div{
    margin-top: 5px;
  }
  .search-choice-close{
    margin-top: 5px;
  }
</style>

<@script src="/js/app/qrcodeConsumptionDetails.js"></@script>
<@link href="/css/demo.css" rel="stylesheet" />
<@link href="/css/3rd-party/zui/component-chosen.css" rel="stylesheet" />
<div class="main-w">
  <div class="content-wrap-w">

    <div class="content-r-path" id="back" style="cursor: pointer;    background: url(static/images/back_01.png) 2px center no-repeat;padding-left: 20px"><span>返回</span></div>
    <#--<div class="content-r-path">应用管理 / 应用列表 / 付费详情</div>-->
    <div class="content-box" id="qrcodeConsumptionDetailsManager">
      <div class="con-r-top">
        <div class="con-r-top-l">
          <div style="font-size: 14px;margin-bottom: 5px;line-height: 24px;">
            <label style="font-weight: normal;">合作商：${partnerName}</label>
            <label style="font-weight: normal;margin: 0 25px;">应用名称：${appName}</label>
            <label id="appId" style="font-weight: normal;">应用ID：${appId}</label>
          </div>
          <div>
            <#if authType == 1>
            <label style="float: left;line-height: 32px;">批次对应的卡号：</label>
            <div style=" max-width: 320px; display: inline-block;">
              <select class="form-control form-control-chosen" name="cardNum" id="cardNum"  style="width: 105%;">
                  <#if recordList ??>
                      <#list recordList as record>
                        <option value="${record.id}" fileName="${record.fileName}" cardNum = "${record.cardNum}">${record.cardNum}&nbsp;创建时间：${record.createTime}</option>
                      </#list>
                  <#else>
                    <option value="-1">暂无批次</option>
                  </#if>
              </select>
            </div>
            <#else >
              <label style="float: left;line-height: 32px;"><label>License:&nbsp;&nbsp;</label><label style="display:inline-flex;font-weight: normal;width: 150px;overflow: hidden;text-overflow: ellipsis;display: block;float: right;" title="${license}"> ${license}</label><input id="cardNum" value="${recordId}" fileName="${fileName}" style="display: none"></label>
              <label style="float: left;line-height: 32px;margin-left: 25px">创建时间：${createTime}</label>
            </#if>
          </div>
        </div>
        <div class="con-r-top-r">
            <@checkPrivilege url="/app/checkExcel.do">
              <input name="提交" type="submit" class="frame-Button-b Button-left" value="导出excel" id="leadoutExcel"/>
            </@checkPrivilege>
        </div>
      </div>

      <div class="content-pro" id="recodeDetailsList">
      </div>

    </div>
  </div>
</div>
<script>
  $(function () {
    wantong.qrcodeConsumptionDetails.init({
      appId:"${appId}",
      partnerId:"${partnerId}",
      partnerName:"${partnerName}",
      appName:"${appName}",
      parentPanelPage:'${parentPanelPage}',
      parentSearchText:'${parentSearchText}',
      authType:${authType}
    });
  });
</script>
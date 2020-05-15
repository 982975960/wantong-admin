<@script src="/js/workOrder/workOrderManager.js"></@script>
<@script src="/js/workOrder/workOrderBookList.js"></@script>
<@script src="/js/workOrder/workOrder.js"></@script>
<@script src="/js/workOrder/bookProgressManager.js"></@script>
<@script src="/js/common/message.js"></@script>
<@link href="/css/workOrder/workorder.css" rel="stylesheet"/>
<@link href="/css/cms/picturebook.css" rel="stylesheet"/>

<#--搜索输入框引入-->
<@link href="/css/demo.css" rel="stylesheet"/>

<@link href="/css/3rd-party/zui/component-chosen.css" rel="stylesheet"/>
<@script src="/js/3rd-party/chosen.jquery.js"/>

<div id="workOrderManager" xmlns="http://www.w3.org/1999/html" xmlns="http://www.w3.org/1999/html">
  <div class="main-w">
    <!--工单管理-->
    <div id="workOrderDiv" class="content-nav">
      <div class="con-nav-top" style="padding: unset;">
        <form style="padding: 6%;border-bottom: 1px solid #eceff8;width: 100%;float: left;">
              <label for="appId" style="margin-top: 3px;color: #343434;"><h3>选择图像库</h3></label>
          <select style="width: 100px;padding-right: 20px;border: 0; float: right;font-size: 14px;" name="modelId" id="modelId" <#if (partnerId != 1)>disabled</#if>>
              <#list models as model>
                <option value="${model.id}"><label class="define-option">${model.name}</label></option>
              </#list>
          </select>
          <div style="font-size: 10px;color: darkgrey;width: 100%;float: left;line-height: 16px;"><#if (partnerId == 1)>管理商用工单选择绘本图像库</br>管理测试工单选择测试图像库</#if></div>
        </form>
      </div>
      <div class="con-nav-cen">
        <ul id="listTab">
          <li index="0" role="presentation" class="active"><a href="#"><#if (partnerId==1)>工单<#else>我的书本<img src="static/images/help.png" style="width: 15px;height: 15px;margin-left: 5px;" id="workOrderHelpImg"></#if></a></li>
          <#if (tab != -1)>
            <li index="1" role="presentation"><a href="#"><#if (partnerId==1)>任务<#else>玩瞳图片进度<img src="static/images/help.png" style="width: 15px;height: 15px;margin-left: 5px;" id="progressHelpImg"></#if></a></li>
          </#if>
        </ul>
      </div>
    </div>
    <div class="content-right">
      <div class="content-wrap-w">
        <div class="content-r-path" id="tab_head">图书管理 / 工单管理 /<span id="curContentTab"></span></div>
        <#--进入工单时切换的界面元素-->
        <div class="content-r-path" id="callbackWorkOrder" style="cursor: pointer;display: none;background: url(static/images/back_01.png) 2px center no-repeat;padding-left: 20px; height: 27px;border-radius: 5px;line-height: 27px;padding-right: 5px;font-size: 14px;"><span>返回</span></div>
        <div class="content-box">
          <div class="con-r-top">
          </div>
            <#--工单管理-->
          <div id="workOrderListManager"></div>
            <#--书本进度管理-->
          <div id="bookProgressListManager" style="margin-top: 10px"></div>
          <#--添加书本信息-->
          <div id="addWorkOrderBookListManageer"></div>
        </div>
      </div>
    </div>
  </div>
</div>
<script>
  $(function () {
    wantong.workOrderManager.init({
      partnerId: "${partnerId}"
    });
  });
</script>
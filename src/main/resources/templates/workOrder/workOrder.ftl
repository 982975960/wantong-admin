 <#--定义工单管理头部不变的div-->
  <div class="work-order-head">
     <div class="head-search-module">
       <#if partnerId != 1>
         <div style="float: left;line-height: 25px;">${partnerName}</div>
       </#if>
       <#--定义所有工单的名称-->
       <div class="work-order-items">
           <#if (partnerId == 1)>
           <div style="width: 200px;float: left;">
               <select id="partnerSelect" class="form-control form-control-chosen" data-placeholder="请输入要查找的合作商">
                   <option></option>
                   <#list partners as partner>
                       <option value="${partner.id}">${partner.name}</option>
                   </#list>
               </select>
           </div>
           </#if>
         <div class="col-xs-12 col-md-4 mb-5" style="width: 20%;">
           <select id="select_item" class="form-control form-control-chosen"
                   data-placeholder="请输入要查找的工单名称">
             <option value="" ></option>
               <#list allWorkOrderNames as p>
                 <option value="${p}">${p}</option>
               </#list>
           </select>
         </div>
       </div>
     </div>
       <#--创建书单按钮块-->
     <div class="head-create-work" style="margin: 0;">
          <#--查看有没有创建工单的权限-->
            <@checkPrivilege url = "/work/createWorkOrder.do">
              <button class="frame-Button-b Button-left" id = "createWordOrderBtn">创建工单</button>
            </@checkPrivilege>
         </div>
  </div>
<div id="workOrderListDiv">

</div>

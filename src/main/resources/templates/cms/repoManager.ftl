<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <@script src="/js/cms/repoManager.js"/>
  <@link href="/css/cms/addBook.css" rel="stylesheet"/>
  <@link href="/css/demo.css" rel="stylesheet"/>
  <@link href="/css/3rd-party/zui/component-chosen.css" rel="stylesheet"/>
  <script src="/static/js/3rd-party/chosen.jquery.js"></script>
</head>
<body>
<div class="main-w">
  <div class="content-wrap-w">
    <div class="content-r-path">图书管理 / 资源库管理</div>
    <div class="content-box">

      <div class="con-r-top">
        <div class="con-r-top-l">
          <div style="width: 250px;float: left; margin-right: 20px">
            <select class="con-r-top-l-frame frame-line" name="partner" id="partner" style="width: 250px">
              <#list partners as partner>
              <option value="${partner.id}">
                <label class="define-option">${partner.name}</label>
                </#list>
                <#--<option value="0" id="${partnerId}">${partnerName}</option>-->
                <#--<option value="1">已处理</option>-->
            </select>
          </div>
          <form action="" style="display: inline-block" method="POST" onsubmit="return $('#searchBtn').click();">
            <div class="input-group" style="margin-left: 10px">
              <div style="float: left">
                <input type="text" class="con-r-top-l-frame frame-line" id="searchInput" placeholder="输入资源库名称"
                       value="">
                <input type="hidden" id="searchText">
                <input type="hidden" id="stateValue">
                <input type="text" style="display:none" value="此处的input删掉然后回车按钮就会触发提交"/>
              </div>
              <div style="float: left">
                <button type="button" class="frame-Button" id="searchBtn">搜索</button>
              </div>
            </div>
          </form>
        </div>
        <div class="con-r-top-r">
          <input type="hidden" id="enabled">

          <#if (partnerId==1)>
          <@checkPrivilege url="/virtual/cms/createPartnerRepo.do">
            <button class="frame-Button-b Button-left" id="createRepoBtnforPartner">为客户创建资源库</button>
          </@checkPrivilege>
          </#if>

          <@checkPrivilege url = "/virtual/cms/createRepo.do">
             <button class="frame-Button-b Button-left" id="createRepo">创建资源库</button>
          </@checkPrivilege>
        </div>
      </div>

      <div id="repoPoolPanel" class="content-pro">


      </div>
    </div>
  </div>
  <#--创建资源库-->

  <div id="createRepoforPartner-panel" class="row create-partner-container" style="width: 100%;display: none">
    <div class="modal-body">
      <form id="create-repo" method="post" action="">
        <div class="input-group form-group-sm col-xs-10" style="margin-bottom:15px;margin-left: 40px;">
          <span class="input-group-addon" style="border: none;background-color: #FFFFFF">合作商</span>
          <select class="con-r-top-l-frame frame-line" name="partnerType" id="partnerType" style="width:137px;margin-left: 37px" >
            <option value="-1">请选择合作商</option>
                <#list partners as partner >
                  <option value="${partner.id }" style="width: 120px">${partner.name}</option>
                </#list>
          </select>
        <input style="visibility: hidden;" id="libId" >
        </div>
        <div class="input-group form-group-sm col-xs-10" style="margin-bottom:15px;margin-left: 40px;margin-top: 20px">
          <span class="input-group-addon" style="border: none;background-color:#FFFFFF ">资源库名称</span>
          <input type="text" class="form-control" id="libName"  onkeydown="if(event.keyCode==13){return false;}" placeholder="书库名称不能大于15个字" maxlength="15"  style="margin-left: 10px">
        </div>

        <div id="encryptDiv" class="input-group form-group-sm col-xs-10" style="margin-bottom:15px;margin-left: 40px;margin-top: 20px" style="margin-left: 120px">
          <span class="input-group-addon" style="border: none;background-color:#FFFFFF ">加密方式</span>
          <input type="checkbox" id="encrypt" style="margin-left: 24px"/>
          <label style="margin-top: 20px">资源加密</label>
          <input type="checkbox" id="noEncrypt" checked="checked" style="margin-left: 10%"/>
          <label>资源非加密</label>
        </div>
        <#if (partnerId == 1)>
        <div id="base-repo" class="input-group form-group-sm col-xs-10" style="margin-bottom:15px;margin-left: 40px;margin-top: 20px" style="margin-left: 120px" >
          <span class="input-group-addon" style="border: none;background-color:#FFFFFF;margin-left: -2px ">选择图像库</span>
           <select class="con-r-top-l-frame frame-line" name="models" id="models" style="width:137px;margin-left: 11px">
             <#list modelPOS as model>
               <option value="${model.id }" style="width: 120px">${model.name}</option>
             </#list>
           </select>
        </div>
        </#if>

        <div id="languageDiv" class="input-group form-group-sm col-xs-10" style="margin-bottom:15px;margin-left: 40px;margin-top: 20px" style="margin-left: 120px">
          <span class="input-group-addon" style="border: none;background-color:#FFFFFF ">语言</span>
          <select class="con-r-top-l-frame frame-line" name="language" id="language" style="width:137px;margin-left: 53px" >
            <option value="0">未知</option>
            <option value="1">中文</option>
            <option value="2">英文</option>
            <option value="3">其他语言</option>
          </select>
        </div>

        <div id="soundRayDiv" class="input-group form-group-sm col-xs-10" style="margin-bottom:15px;margin-left: 40px;margin-top: 20px" style="margin-left: 120px">
          <span class="input-group-addon" style="border: none;background-color:#FFFFFF ">声线</span>
          <select class="con-r-top-l-frame frame-line" name="soundRay" id="soundRay" style="width:137px;margin-left: 53px" >
            <option value="0">未知</option>
            <option value="1">人声</option>
            <option value="2">TTS</option>
          </select>
        </div>

        <div style="display:<@checkPrivilege url ="/virtual/cms/canUseK12Repo.do" def ='none'>inline</@checkPrivilege>">
          <span style="width: 90%;float: left;margin-left: 10%;">注：1、如果您想为绘本制作资源，请选择"绘本图像库"</span>
          <span style="width: 85%;float: left;margin-left: 15%;margin-top: 3px;">2、如果您想为K12书本制作资源，请选择"K12图像库"</span>
        </div>

      </form>
    </div>
    <div class="modal-footer" style="width: 100%;float: left" >
      <button type="button" id="saveBtn" class="pop-padding frame-Button-b">保存</button>
      <button type="button" id="closeBtn" class="pop-padding frame-Button" data-dismiss="modal" >关闭</button>
    </div>
  </div>

  <div id="createRepo-panel" class="row create-partner-container" style="width: 100%;display: none">
    <div class="modal-body">
      <form id="createLibraryForm" method="post" action="">
        <div class="input-group form-group-sm col-xs-10" style="margin-bottom:15px;margin-left: 40px;margin-top: 20px">
          <span class="input-group-addon" style="border: none;background-color: #FFFFFF">合作商</span>
            <label class="text"style="margin-left: 38px;margin-top: 5px">${partnerName} </label>
            <input style="visibility: hidden;" id="libId" >
        </div>
        <div class="input-group form-group-sm col-xs-10" style="margin-bottom:15px;margin-left: 40px;margin-top: 20px">
          <span class="input-group-addon" style="border: none;background-color:#FFFFFF ">资源库名称</span>
          <input type="text" class="form-control" id="libName"  onkeydown="if(event.keyCode==13){return false;}" placeholder="书库名称不能大于15个字" maxlength="15" style="margin-left: 10px">
        </div>

        <div id="encryptDiv" class="input-group form-group-sm col-xs-10" style="margin-bottom:15px;margin-left: 40px;margin-top: 20px" style="margin-left: 120px" >
          <span class="input-group-addon" style="border: none;background-color:#FFFFFF ">加密方式</span>
          <input type="checkbox" id="encrypt" style="margin-left: 24px"/>
          <label style="margin-top: 20px">资源加密</label>
          <input type="checkbox" id="noEncrypt" checked="checked" style="margin-left: 10%"/>
          <label>资源非加密</label>
        </div>

        <div id="base-repo" class="input-group form-group-sm col-xs-10"
             style="margin-bottom:15px;margin-left: 40px;margin-top: 20px" style="margin-left: 120px">
          <span class="input-group-addon" style="border: none;background-color:#FFFFFF;margin-left: -2px ">选择图像库</span>
          <select class="con-r-top-l-frame frame-line" name="models" id="models" style="width:137px;margin-left: 11px">
              <#list models as model>
                <option value="${model.id }" style="width: 120px">${model.name}</option>
              </#list>
          </select>
        </div>

        <div id="languageDiv" class="input-group form-group-sm col-xs-10" style="margin-bottom:15px;margin-left: 40px;margin-top: 20px" style="margin-left: 120px">
          <span class="input-group-addon" style="border: none;background-color:#FFFFFF ">语言</span>
          <select class="con-r-top-l-frame frame-line" name="language" id="language" style="width:137px;margin-left: 53px" >
            <option value="0">未知</option>
            <option value="1">中文</option>
            <option value="2">英文</option>
            <option value="3">其他语言</option>
          </select>
        </div>
        <div id="soundRayDiv" class="input-group form-group-sm col-xs-10" style="margin-bottom:15px;margin-left: 40px;margin-top: 20px" style="margin-left: 120px">
          <span class="input-group-addon" style="border: none;background-color:#FFFFFF ">声线</span>
          <select class="con-r-top-l-frame frame-line" name="soundRay" id="soundRay" style="width:137px;margin-left: 53px" >
            <option value="0">未知</option>
            <option value="1">人声</option>
            <option value="2">TTS</option>
          </select>
        </div>

        <div style="display:<@checkPrivilege url ="/virtual/cms/canUseK12Repo.do" def ='none'>inline</@checkPrivilege>">
          <span style="width: 90%;float: left;margin-left: 10%;">注：1、如果您想为绘本制作资源，请选择"绘本图像库"</span>
          <span style="width: 85%;float: left;margin-left: 15%;margin-top: 3px;">2、如果您想为K12书本制作资源，请选择"K12图像库"</span>
        </div>

      </form>
    </div>
    <div class="modal-footer" style="width: 100%;float: left">
      <button type="button" id="saveBtn" class="pop-padding frame-Button-b">保存</button>
      <button type="button" id="closeBtn" class="pop-padding frame-Button" data-dismiss="modal" >关闭</button>
    </div>
  </div>

  <div id="editRepo-panel" class="row create-partner-container" style="width: 100%;display: none">
    <div class="modal-body">
      <form id="createLibraryForm" method="post" action="">
        <div class="input-group form-group-sm col-xs-10" style="margin-bottom:15px;margin-left: 40px;margin-top: 20px">
          <span class="input-group-addon" style="border: none;background-color: #FFFFFF">合作商</span>
            <label class="text" id="user" style="margin-left: 39px;margin-top: 5px"> </label>
            <input style="visibility: hidden;" id="libId" >
        </div>
        <div class="input-group form-group-sm col-xs-10" style="margin-bottom:15px;margin-left: 40px;margin-top: 20px">
          <span class="input-group-addon" style="border: none;background-color:#FFFFFF ">资源库名称</span>
          <input type="text" style="margin-left: 10px" class="form-control" id="libName"  onkeydown="if(event.keyCode==13){return false;}" placeholder="书库名称不能大于15个字" maxlength="15" >
        </div>

        <div id="encryptDiv" class="input-group form-group-sm col-xs-10" style="margin-bottom:15px;margin-left: 40px;margin-top: 20px" style="margin-left: 120px">
          <span class="input-group-addon" style="border: none;background-color:#FFFFFF ">加密方式</span>
          <input type="checkbox" id="encrypt" style="margin-left: 24px"/>
          <label style="margin-top: 20px">资源加密</label>
          <input type="checkbox" id="noEncrypt" checked="checked" style="margin-left: 10%"/>
          <label>资源非加密</label>
        </div>

        <div id="base-model" class="input-group form-group-sm col-xs-10" style="margin-bottom:15px;margin-left: 40px;margin-top: 20px" style="margin-left: 120px">
          <span class="input-group-addon" style="border: none;background-color:#FFFFFF;margin-left: -2px ">图像库</span>
          <label style="margin-top: 5px;margin-left: 36px"></label>
        </div>

        <div id="languageDiv" class="input-group form-group-sm col-xs-10" style="margin-bottom:15px;margin-left: 40px;margin-top: 20px" style="margin-left: 120px">
          <span class="input-group-addon" style="border: none;background-color:#FFFFFF ">语言</span>
          <select class="con-r-top-l-frame frame-line" name="language" id="language" style="width:137px;margin-left: 53px" >
            <option value="0">未知</option>
            <option value="1">中文</option>
            <option value="2">英文</option>
            <option value="3">其他语言</option>
          </select>
        </div>
        <div id="soundRayDiv" class="input-group form-group-sm col-xs-10" style="margin-bottom:15px;margin-left: 40px;margin-top: 20px" style="margin-left: 120px">
          <span class="input-group-addon" style="border: none;background-color:#FFFFFF ">声线</span>
          <select class="con-r-top-l-frame frame-line" name="soundRay" id="soundRay" style="width:137px;margin-left: 53px" >
            <option value="0">未知</option>
            <option value="1">人声</option>
            <option value="2">TTS</option>
          </select>
        </div>

      </form>
    </div>
    <div class="modal-footer"  style="width: 100%;float: left">
      <button type="button" id="saveBtn" class="pop-padding frame-Button-b" >保存</button>
      <button type="button" id="closeBtn" class="pop-padding frame-Button" data-dismiss="modal" >关闭</button>
    </div>
  </div>

</body>
</html>
<script>
  $(function () {
    wantong.cms.repoManager.init({
      partnerId:'${partnerId}'
    });
  });
</script>
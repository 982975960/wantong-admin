<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <link href="./static/css/demo.css" rel="stylesheet">
  <link href="./static/css/3rd-party/zui/component-chosen.css" rel="stylesheet">
    <@script src="/js/3rd-party/chosen.jquery.js"/>

    <@link href="/css/card/cardModel.css" rel="stylesheet"/>
    <@script src="/js/card/cardModelManage.js"/>

</head>
<body>
<div class="main-w">
  <div class="content-wrap-w">
    <div class="content-r-path">卡片管理 / 卡片库管理</div>
    <div class="content-box">

      <div class="con-r-top">
        <div class="con-r-top-l">
            <#--<input type="text" class="con-r-top-l-frame frame-line" id="partnerName" placeholder="请输入合作商名称">-->
          <div class="col-xs-12 col-md-4 mb-5">
            <select id="partnerSelect" class="form-control form-control-chosen" data-placeholder="请选择合作商">
              <option></option>
                <#list partners as partner>
                  <option value="${partner.id}" style="overflow: hidden;text-overflow: ellipsis;white-space: nowrap;">${partner.name}</option>
                </#list>
            </select>
          </div>
          <input type="text" class="con-r-top-l-frame frame-line" id="modelName" placeholder="请输入卡片库名称" maxlength="20" style="margin-left: 10px;overflow:hidden; white-space:nowrap; text-overflow:ellipsis">
          <input type="button" value="搜索"  class="frame-Button-b search-Button" id="searchBtn" style="margin-left: 15px;" />
        </div>
        <div class="con-r-top-r">
          <button class="frame-Button-b Button-left" id="createCardModel">创建卡片库</button>
        </div>
      </div>

      <div id="cardModelList" class="content-pro">

      </div>
    </div>
  </div>
</div>
</body>
</html>
<script>
  $(function () {
    wantong.modelManage.init();
  });
</script>

<style>
  .chosen-container-single{
    height: 33px;
  }
  .chosen-container-single .chosen-default{
    height: 33px;
  }
  .chosen-container-single .chosen-default span{
    margin-top: 3px;
  }
  .chosen-container-single .chosen-default div{
    margin-top: 5px;
  }

</style>

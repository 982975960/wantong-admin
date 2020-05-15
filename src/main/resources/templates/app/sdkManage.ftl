<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <@script src="/js/app/sdkManage.js"/>
  <@link href="/css/app/sdkManage.css" rel="stylesheet"/>
</head>
<body>
<div class="main-w">
  <div class="content-wrap-w">
    <div class="content-r-path">应用管理 / SDK下载</div>
    <div class="content-box">

      <div class="con-r-top">
        <div class="con-r-top-l">
          <select class="con-r-top-l-frame frame-line" name="platform" id="platform" style="width: 80px">
            <option value="100" selected>全部</option>
            <option value="0">Android</option>
            <option value="1">Linux</option>
            <option value="2">IOS</option>
            <option value="3">Rtos</option>
          </select>
          <input type="text" class="con-r-top-l-frame frame-line" id="sdkType" placeholder="输入SDK类型" style="margin-left: 10px;">
          <input name="" type="button" value="搜索"  class="frame-Button-b search-Button" id="searchBtn" style="margin-left: 15px;" />
          <input name="" type="button" value="清空"  class="search-Button02" id="clearBtn" style="margin-left: 10px;"/>
        </div>
        <div class="con-r-top-r">
          <@checkPrivilege url = "/app/saveSdkType.do">
            <button class="frame-Button-b Button-left" id="sdkTypeManage">SDK类型管理</button>
          </@checkPrivilege>
          <@checkPrivilege url = "/app/sdkUpload.do">
            <button class="frame-Button-b Button-left" id="createSdk">创建SDK</button>
          </@checkPrivilege>
        </div>
      </div>

      <div id="sdkList" class="content-pro">

      </div>
    </div>
    <!--SDK类型管理-->
    <div class="popups-con" id="createSdkTypeDom" style="display: none">
      <div class="popups-b">
        <div class="label-box primary-label" id="sdkTypeBox">
          <div class="label-name">SDK类型：</div>
          <div class="sdkTypeDiv">
            <input name="sdkType" type="text" maxlength="15" placeholder="输入SDK类型(15字以内)" class="popups-line p-width"/>
            <img src="/static/images/ico-gb.jpg" width="13" height="12" name="delImg" class="sdkTypeImg">
          </div>
        </div>
        <!--新增一个二级标签样式-->
        <div class="label-box">
          <span class="label-b-img2" id="addSdkType"><img src="static/images/ico12.png" width="13" height="13" />添加SDK类型</span>
        </div>
        <!--新增加标签样式结束-->
        <div class="popups-bot">
        <span>
          <input id="saveSdkType" type="button" class="pop-padding frame-Button-b Button-left" value="保存" />
          <input id="closeBtn" type="button" class="pop-padding frame-Button Button-left" value="取消" />
        </span>
        </div>
      </div>
    </div>
    <!--SDK类型管理-->

    <!--创建SDK-->
    <div id="createSdkDom" style="display: none;width: 96%;margin: 2%;">
        <!--上部分-->
        <div>
          <div style="display:inline-block;width: 50%">
            <div class="form-group leftDiv">
              <label class="leftLable">平台:</label>
              <select class="con-r-top-l-frame frame-line" id="createSdkPlatform" style="width: 290px;">
                <option value="0" selected>Android</option>
                <option value="1">Linux</option>
                <option value="2">IOS</option>
                <option value="3">Rtos</option>
              </select>
            </div>
            <div class="form-group leftDiv">
              <label class="leftLable">SDK类型:</label>
              <select class="con-r-top-l-frame frame-line" id="sdkTypeSelect" style="width: 290px;">
                <#list sdkTypes as sdkType>
                  <option value="${sdkType.id}">${sdkType.type}</option>
                </#list>
              </select>
            </div>
            <div class="form-group leftDiv">
              <label class="leftLable">版本号:</label>
              <input type="text" class="form-control" placeholder="输入版本号" id="sdkVersion" style="width: 290px;border-radius: 0;">
            </div>
          </div>
          <div style="display:inline-block;float: right;width: 47%;">
            <label style="font-weight: normal;margin-bottom: 10px;">上传SDK文件:</label>
            <div style="float: left;width: 100%;">
              <div id="uploadFilePicker">
                <img src="/static/images/sdk_upload.jpg" alt="上传SDK文件" style="width: 30%;margin-top: 20px;">
              </div>
              <div id="uploadFileName" class="uploadFileName"></div>
            </div>
          </div>
        </div>
        <!--上部分结束-->
        <!--下部分开始-->
        <div>
          <div class="form-group" style="width: 100%;float: left;">
            <label class="textareaLable">更新说明:</label>
            <textarea id="description" class="form-control" placeholder="200字以内" style="resize: none;width: 90%;height: 200px;"></textarea>
          </div>
          <div class="form-group">
            <label class="textareaLable">使用说明:</label>
            <textarea id="instructions" class="form-control" placeholder="输入URL链接"  style="resize: none;width: 90%;height: 180px;"></textarea>
          </div>
        </div>
        <!--下部分结束-->
        <div class="modal-footer" style="width: 100%;float: left;">
          <button type="button" id="saveSdkBtn" class="pop-padding frame-Button-b">保存</button>
          <button type="button" id="closeSdkBtn" class="pop-padding frame-Button">关闭</button>
        </div>
    </div>
    <!--创建SDK结束-->
  </div>
</div>

</body>
</html>
<script>
  $(function () {
    wantong.app.sdkManage.init();
  });
</script>
<@script src="/js/feedback/userBookfeedback.js"/>
<@link href="/css/feedback/userBookfeedback.css" rel="stylesheet"/>

<@link href="/css/demo.css" rel="stylesheet" />
<@link href="/css/3rd-party/zui/component-chosen.css" rel="stylesheet" />
<@script src="/js/3rd-party/chosen.jquery.js"/>

<div class="main-w">
  <div class="content-wrap-w">
    <div class="content-r-path">运营管理 / 书本反馈</div>
      <div id="feedBackDetailPanel" class="content-box">
        <div class="con-r-top">
          <div class="con-r-top-l" style="width: 80%">
            <input type="text" class="con-r-top-l-frame frame-line" id="name" placeholder="输入书名">
            <input type="text" class="con-r-top-l-frame frame-line" id="author" placeholder="输入作者" style="margin-left: 10px;">
            <input type="text" class="con-r-top-l-frame frame-line" id="publisher" placeholder="输入出版社" style="margin-left: 10px;">
            <input type="text" class="con-r-top-l-frame frame-line" id="isbn" placeholder="输入完整ISBN" style="margin-left: 10px;">
            <input type="text" class="con-r-top-l-frame frame-line" id="seriesTitle" placeholder="输入系列名" style="margin-left: 10px;">
            <input name="" type="button" value="搜索"  class="frame-Button-b search-Button" id="searchBtn" style="margin-left: 15px;" />
            <input name="" type="button" value="清空"  class="search-Button02" id="clearBtn" style="margin-left: 10px;"/>
          </div>
          <div class="con-r-top-r" style="width: 20%">
            <@checkPrivilege url="/feedback/exportAllBooks.do">
              <button type="button" id="export_btn" class="frame-Button-b Button-left">导出excel</button>
            </@checkPrivilege>
          </div>
        </div>
        <div class="work-bot">
          <div class="work-left" style="width: 100%;">
            <#if (partnerId == 1)>
            <div style="width: 200px;float: left;">
              <select id="partnerSelect" class="form-control form-control-chosen" data-placeholder="请输入客户名称查询">
                <option></option>
                <#list partners as partner>
                  <option value="${partner.id}">${partner.name}</option>
                </#list>
              </select>
            </div>
            </#if>
            <div style="width: 200px;float: left;margin-left: 10px;">
              <select id="appSelect" class="form-control form-control-chosen" data-placeholder="请输入应用名称查询">
                <option></option>
                <#list apps as app>
                  <option value="${app.id}">${app.name}</option>
                </#list>
              </select>
            </div>
            <#--<div style="width: 150px;float: left;margin-left: 10px;">
              <select id="modelSelect" class="form-control form-control-chosen" data-placeholder="请输入机型查询">
                <option></option>
                <#list models as model>
                  <option value="${model}">${model}</option>
                </#list>
              </select>
            </div>-->
            <div style="width: 120px;float: left;margin-left: 10px;">
              <select id="timeSelect" class="con-r-top-l-frame frame-line" style="width: 100%">
                <option value="0" disabled selected style='display:none;'>请选择时间段</option>
                <option value="0">所有</option>
                <option value="1">今日</option>
                <option value="7">一周内</option>
                <option value="30">一个月内</option>
              </select>
            </div>
            <div id="selector" style="margin-left:10px;">
              <span class="mr-selector" style="white-space: nowrap;text-overflow: ellipsis;overflow: hidden;" title="请选择书本状态">请选择书本状态</span>
              <span class="img-selector" style="float: right;background: url(static/images/ico6.png) no-repeat 97% center transparent;width: 25px;height: 20px;margin-top: -25px;margin-right: 10px;"></span>
              <ul class="select">
                <li><input type="checkbox" value="-1" name = "全选"/>全选</li>
                <li><input type="checkbox" value="-2" name = "待处理"/>待处理</li>
                <li><input type="checkbox" value="0" name = "未处理"/>未处理</li>
                <li><input type="checkbox" value="1" name = "待采购"/>待采购</li>
                <li><input type="checkbox" value="2" name = "已采购"/>已采购</li>
                <li><input type="checkbox" value="3" name = "书本信息已创建"/>书本信息已创建</li>
                <li><input type="checkbox" value="4" name = "图片待采样"/>图片待采样</li>
                <li><input type="checkbox" value="5" name = "图片待审核"/>图片待审核</li>
                <li><input type="checkbox" value="6" name = "图片待训练"/>图片待训练</li>
                <li><input type="checkbox" value="7" name = "图片训练中"/>图片训练中</li>
                <li><input type="checkbox" value="8" name = "图片已发布"/>图片已发布</li>
                <li><input type="checkbox" value="9" name = "资源待编辑"/>资源待编辑</li>
                <li><input type="checkbox" value="10" name = "资源待审核"/>资源待审核</li>
                <li><input type="checkbox" value="11" name = "资源已审核"/>资源已审核</li>
                <li><input type="checkbox" value="12" name = "资源禁用中"/>资源禁用中</li>
                <li><input type="checkbox" value="13" name = "不做处理"/>不做处理</li>
                <div style="width: 100%;float: left;border-top: 1px solid #eceff8;margin: 5px 0;text-align: right;">
                  <input type="button" id="stateSureBtn" class="pop-padding frame-Button-b" style="padding: 1px 15px;margin: 12px 10px 7px 10px;" value="确定"/>
                </div>
              </ul>
            </div>
          </div>
        </div>

        <div class="content-pro" id="userFeedBackContent">
        </div>
      </div>
    </div>
</div>

<div class="layer-1" style="display: none" id="noDealRemark">
  <div class="create-update-work-order" >
    <div class="work-order-message">
      <textarea type="text" class="work-order-name" maxlength="50" id="remark" placeholder="不超过50个字" style="width: 370px;height: 65px;border: 1px solid #cccccc;margin: 20px 0 0 15px;padding: 10px;"></textarea>
    </div>
    <div class="work-order-action" style="padding-top: 10px;margin-top: 15px">
      <button type="button" class="pop-padding frame-Button-b confirm-button" style="margin-left: 210px">保存</button>
      <button type="button" class="pop-padding frame-Button cancel-button">取消</button>
    </div>
  </div>
</div>

<script>
  $(function () {
    wantong.feedBackListPanel.init();
  });
</script>
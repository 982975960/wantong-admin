<@script src="/js/3rd-party/vue/2.6.10/dist/vue.min.js" />
<@link rel="stylesheet" href="/js/3rd-party/element-ui/2.12.0/lib/theme-chalk/index.css" />
<@script src="/js/3rd-party/element-ui/2.12.0/lib/index.js" />
<#--<@script src="/js/cms/booklist.js"></@script>-->
<@script src="/js/cms/cmsInit.js"/>
<@script src="/js/cms/booklist_resource.js"/>
<#--<@script src = "/js/cms/booklist_search.js"></@script>-->
<@link href="/css/cms/picturebook.css" rel="stylesheet"/>
<script src="/static/js/3rd-party/xlsx.mini.min.js"></script>
<script src="/static/js/common/excel.js"></script>
<@script src="/js/3rd-party/qrcode.min.js" />

<div id="bookList" xmlns="http://www.w3.org/1999/html" xmlns="http://www.w3.org/1999/html">
  <div class="main-w">
    <!--图书管理-->
    <div id="bookNavi" class="content-nav">
      <div class="con-nav-top">
        <form>
          <#--判断是在那个模块从而来判断是书库还是资源库-->
           <#if module == 0>
              <label for="appId"><h2>选择图像库</h2></label>
              <#list models as model>
                <option value="${model.id}">
                  <label class="define-option">${model.name}</label>
                </option>
              </#list>
           <#else>
              <label for="appId"><h2>选择资源库</h2></label>
              <select style="width: 90px;padding-right: 20px;border: 0; float: right;line-height: 20px;" name="modelId" id="modelId" >
              <#list models as model>
                <option value="${model.id}">
                <label class="define-option">${model.name}</label>
              </#list>
              </select>
           </#if>
          <#--<label for="appId"><h2>选择书库</h2></label>-->
          <#--<select style="width: 100px;padding-right: 20px;border: 0; float: right;" name="modelId" id="modelId">-->
            <#--<#list models as model>-->
              <#--<option value="${model.id}"><label class="define-option">${model.name}</label></option>-->
            <#--</#list>-->
          <#--</select>-->
        </form>
      </div>
      <div class="con-nav-cen">
        <ul id="listTab" module="${module}">
         <#--module用于区分是图片制作模块还是在资源制作模块-->
          <#if module != 0 >
             <li index = "100" role="presentation" class="active"><a href="#">搜索全部</a></li>
             <li index = "0" role="presentation"><a href="#">领书</a></li>
             <li index = "1" role="presentation"><a href="#">资源待编辑</a></li>
             <li index = "2" role="presentation"><a href="#">待审核</a></li>
             <li index = "3" role="presentation" ><a href="#">已审核</a></li>
             <li index = "10" role="presentation"><a href="#">禁用中</a></li>
             <#-- 图片更新记录的权限-->
              <@checkPrivilege url="/cms/listRecordBooks.do">
                  <li index = "-1" role="presentation"><a href="#">图片更新记录</a></li>
              </@checkPrivilege>
          </#if>
        </ul>
      </div>
    </div>
    <div class="content-right">
      <div class="content-wrap-w">
        <div class="content-r-path">图书管理 / 资源制作 / <span id="curContentTab">搜索全部</span></div>
        <div class="content-box">
          <div class="con-r-top">

            <#--页面头查询组-->
            <div id="searchTerms" class="con-search" style="margin-top: 10px" partnerId="${partnerId}">
              <ul>
                    <Li><span class="search-name">书名：</span><span class="search-span"><input name="text" type="text" id="bookName" placeholder="请输入书名" class="search-box search-width" /></span></Li>
                    <Li><span class="search-name">ISBN：</span><span class="search-span"><input name="text" type="text" id="isbn" placeholder="请输入完整ISBN号" maxlength="13" class="search-box search-width" /></span></Li>
                    <Li><span class="search-name">出版社：</span><span class="search-span"><input name="text" type="text" id="press" placeholder="请输入关键字" class="search-box search-width" /></span></Li>
                    <Li><span class="search-name">系列名：</span><span class="search-span"><input name="text" type="text" id="dubble" placeholder="请输入关键字" class="search-box search-width" /></span></Li>
                    <Li><span class="search-name">版次：</span><span class="search-span"><input name="text" type="text" id="edition" placeholder="请输入完整版次" class="search-box search-width" /></span></Li>
                    <Li style="display: <@checkPrivilege url="/cms/searchByBookNumber.do" def="none"> inline</@checkPrivilege>"><span class="search-name">书本编号：</span><span class="search-span"><input name="text" type="text" id="bookNumber" maxlength="12" placeholder="请输入完整编号" class="search-box search-width" /></span></Li>
                    <Li><span class="search-name">BookID：</span><span class="search-span"><input name="text" type="text" id="bookId" placeholder="请输入完整ID" class="search-box search-width" /></span></Li>
                    <div id = "isAuthExport" auth = "  <@checkPrivilege url = "/cms/booksExport.do" def = "false">true</@checkPrivilege> "></div>
                    <div class="search-all">
                        <Li><span class="search-name">标签名：</span><span class="search-span"><input name="text" type="text" id="label-name-select"  placeholder="请输入完整标签名" class="search-box search-width" readonly="readonly" /><input name="ids" hidden></span></Li>
                        <li><span class="search-name">开始时间：</span><span class="search-span"><input name="text" readonly="readonly" style="height: 32px" id="beginTime" placeholder="选择开始时间" class="layui-input time-input" autocomplete="off"></span></li>
                        <li><span class="search-name">结束时间：</span><span class="search-span"><input name="text" readonly="readonly" style="height: 32px" id="endTime" placeholder="选择开始时间" class="layui-input time-input" autocomplete="off"></span></li>
                        <#--选择状态-->
                        <li>
                            <span class="search-name">书本状态：</span>
                            <div id="stateSelector">
                                <input name="text" style="display: none">
<#--                                        <input name="text" style="white-space: nowrap;text-overflow: ellipsis;overflow: hidden;">-->
                                <span class="search-span mr-selector" style="white-space: nowrap;text-overflow: ellipsis;overflow: hidden;">选择状态</span>
                                <span class="search-span img-selector"
                                      style="float: right;background: url(static/images/ico6.png) no-repeat 97% center transparent;width: 25px;height: 20px;margin-top: -25px;margin-right: 15px;"></span>
                                <ul class="select select-state">
                                    <li><input type="checkbox" state="0" value="资源待编辑"/>资源待编辑</li>
                                    <li><input type="checkbox" state="7" value="待审核"/>待审核</li>
                                    <li><input type="checkbox" state="3,11" value="已审核"/>已审核</li>
                                    <div style="width: 100%;float: left;border-top: 1px solid #eceff8;margin: 5px 0;text-align: right;">
                                        <input type="button" id="stateSureBtn" class="pop-padding frame-Button-b"
                                               style="padding: 1px 10px;margin: 12px 10px 7px 10px;height: 23px;line-height: 20px;"
                                               value="确定"/>
                                    </div>
                                </ul>
                            </div>
                        </li>

                    </div>
                    <div class="search-other" style="display: none">
                        <Li><span class="search-name">标签名：</span><span class="search-span"><input name="text" type="text" id="label-name" maxlength="15" placeholder="请输入完整标签名" class="search-box search-width" /></span></Li>
                    </div>
                </ul>
              <#--领书模块的提示-->
              <div class="ref-module-hint">
                <a href="#" style="width: 20px;float: left">
                    <@checkDefaultTheme env="${Session.subDomainStyle.style!'original'}" match="TRUE">
                      <img src="<@staticPath/>/images/${Session.subDomainStyle.style!'original'}/hint-ico.jpg" style="width: 20px">
                    </@checkDefaultTheme>
                    <@checkDefaultTheme env="${Session.subDomainStyle.style!'original'}" match="FALSE">
                      <img src="<@staticPath/>/images/hint-ico.jpg" style="width: 20px">
                    </@checkDefaultTheme>
                </a>
                <div class="hint-content" style="float: left;width: 90%;">
                  <label class="text" style="font-weight: normal;line-height: 19px">请先在上方搜索您想要制作资源的书本，领取书本。<br/> 领取后，在“资源待编辑”菜单下，可对书本进行资源制作。</label>
                </div>
              </div>
              <div class="con-search-input" style="width: 100% !important;">
                <input name="" type="submit" value="搜索"  class="frame-Button-b search-Button" style="width:15%; margin-right:3%"/>
                <input name="" type="button" value="清空"  class="search-Button02" id="clearBtn" />
                <@checkPrivilege url="/cms/zipUpload.do" >
                <div id="importRepo" style="float: right">
                    <span style="width: 100%">导入资源</span>
                </div>
                </@checkPrivilege>
                  <div class="search-input" id="exprotSerach" style="float: right;margin-left: 2%;width: 10%">
                      <input name="" type="submit" value="导出"  class="frame-Button-b search-Button export" style="width: 100%;"/>
                  </div>
              </div>

            </div>
          </div>
          <#--领书模块-->
          <div id="referenceBookList" style="margin-top: 30px" class="active"></div>
          <#--资源待编辑模块-->
          <div id="editResourcesBookList" style="margin-top: 30px"></div>
          <#--书本资源到审核模块-->
          <div id="inExamineResourcesBookList" style="margin-top: 30px"></div>
          <#--书本资源已发布模块-->
          <div id="publishedResourcesBookList" style="margin-top: 30px"></div>
          <#--禁用中-->
          <div id="inForbiddenBookList" style="margin-top: 30px"></div>
          <#--查找所有书本-->
          <div id="searchAllBookList" style="margin-top: 30px"></div>
          <#--图片更新记录列表-->
          <div id="pictureUpdateRecordList"></div>
        </div>
      </div>
    </div>
    <!--图书管理结束-->
  </div>
</div>

<style>
  .el-dialog__header{
    border-bottom: 1px solid #eee;
    background-color: #f6f7fb;
  }
  <#--dialog 的脚部样式-->
  .el-dialog__footer{
    border-top: 1px solid #eceff8;
  }
  .message-group {
    margin-top: 40px;
  }

  .message-group .search-item {
    margin-top: 10px;
  }

  .message-group .search-item label {
    float: left;
    text-align: right;
    line-height: 40px;
    width: 80px;
  }

  .message-group .search-item input {
    width: 180px;
  }
  .webuploader-pick{
      border-radius: 0;
  }
  #importRepo div:nth-child(2){width:100%!important;height:100%!important;}

  #stateSelector {
      position: relative;
      height: 30px;
      font-size: 13px;
      line-height: 30px;
      text-align: left;
      user-select: none;
  }

  #stateSelector select {
      display: none;
  }

  #stateSelector .arrow {
      position: absolute;
      right: 5px;
      top: 12px;
      display: block;
      height: 0;
      width: 0;
      border-top: 8px solid lightgreen;
      border-right: 5px solid transparent;
      border-left: 5px solid transparent;
  }

  #stateSelector .mr-selector {
      display: block;
      height: 28px;
      padding-left: 10px;
      border: 1px solid #CCCCCC;
      cursor: default;
      overflow: hidden;
  }

  #stateSelector .select {
      display: none;
      margin-top: -1px;
      border: 1px solid #CCCCCC;
      background: rgb(255, 255, 255);
      width: 157px;
      float: left;
      position: fixed;
      z-index: 6;
      margin-top: 30px;
      margin-left: 3.6%;
  }

  #stateSelector .select li {
      padding-left: 10px;
      height: 30px;
      line-height: 30px;
      float: left;
      width: 130px;
  }

  #stateSelector .select li input{
      margin-right: 5px;
  }

</style>
<script>
  $(function () {
    wantong.cms.booklist_resource.init("${index}", "${bookIdAuth}");
  });
</script>
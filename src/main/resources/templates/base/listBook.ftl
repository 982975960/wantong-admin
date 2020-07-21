<@script src="/js/base/booklist.js"></@script>
<@script src="/js/base/booklist_search.js"></@script>
<@link href="/css/cms/picturebook.css" rel="stylesheet"/>
<script src="/static/js/3rd-party/xlsx.mini.min.js"></script>
<script src="/static/js/common/excel.js"></script>
<div id="bookList" xmlns="http://www.w3.org/1999/html" xmlns="http://www.w3.org/1999/html">

  <div class="main-w">
    <!--图书管理-->
    <div id="bookNavi" class="content-nav">
      <div class="con-nav-top" style="padding: unset;">
        <form style="padding: 6%;border-bottom: 1px solid #eceff8;width: 100%;float: left;">
          <label for="appId" style="margin-top: 3px;color: #343434;"><h3>选择图像库</h3></label>
          <select style="width: 100px;padding-right: 20px;border: 0; float: right;font-size: 14px;" name="modelId" id="modelId">
              <#list models as model>
                <option value="${model.id}"><label class="define-option">${model.name}</label></option>
              </#list>
          </select>
        </form>
      </div>
      <div class="con-nav-cen">
        <ul id="listTab">
          <li index="100" role="presentation" class="active"><a href="#">搜索全部</a></li>
            <@checkPrivilege url = "/base/editNyBook.do">
              <li index="10" role="presentation"><a href="#">NY书本</a></li>
            </@checkPrivilege>
          <li index="0" role="presentation"><a href="#">书本信息待创建</a></li>
          <li index="1" role="presentation"><a href="#">待采样</a></li>
          <li index="7" role="presentation"><a href="#">待审核</a></li>
          <li index="4" role="presentation"><a href="#">待训练</a></li>
          <li index="5" role="presentation"><a href="#">训练中</a></li>
          <li index="3" role="presentation"><a href="#">已发布</a></li>
          <@checkPrivilege url = "/base/similarSet.do">
            <li index="20" role="presentation"><a href="#">相似书本</a></li>
          </@checkPrivilege>
        </ul>
      </div>
    </div>
    <div class="content-right">
      <div class="content-wrap-w">
        <div class="content-r-path">图书管理 / 图片制作 / <span id="curContentTab">搜索全部</span></div>
        <div class="content-box">
          <div class="con-r-top">
            <div id = "isAuthExport" auth = "  <@checkPrivilege url = "/base/baseBookExport.do" def = "false">true</@checkPrivilege> "></div>
              <#--页面头查询组-->
            <div id="searchTermsBase" class="con-search" style="margin-top: 10px">
              <ul>
                <Li><span class="search-name">书名：</span><span class="search-span"><input name="text" type="text" id="bookName" placeholder="请输入书名" class="search-box search-width" /></span></Li>
                <Li><span class="search-name">ISBN：</span><span class="search-span"><input name="text" type="text" id="isbn" placeholder="请输入ISBN号" maxlength="13" class="search-box search-width" /></span></Li>
                <Li><span class="search-name">出版社：</span><span class="search-span"><input name="text" type="text" id="press" placeholder="请输入关键字" class="search-box search-width" /></span></Li>
                <Li><span class="search-name">系列名：</span><span class="search-span"><input name="text" type="text" id="dubble" placeholder="请输入关键字" class="search-box search-width" /></span></Li>
                <Li><span class="search-name">版次：</span><span class="search-span"><input name="text" type="text" id="edition" placeholder="请输入完整版次" class="search-box search-width" /></span></Li>
                <Li><span class="search-name">书本编号：</span><span class="search-span"><input name="text" type="text" id="bookNumber" maxlength="12" placeholder="请输入完整编号" class="search-box search-width" /></span></Li>
                <Li><span class="search-name">BookID：</span><span class="search-span"><input name="text" type="text" id="bookId" placeholder="请输入完整ID" class="search-box search-width" /></span></Li>
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
                        <li><input type="checkbox" state="0" value="书本信息待创建"/>书本信息待创建</li>
                        <li><input type="checkbox" state="1" value="待采样"/>待采样</li>
                        <li><input type="checkbox" state="7" value="待审核"/>待审核</li>
                        <li><input type="checkbox" state="5" value="训练中">训练中</li>
                        <li><input type="checkbox" state="4,6" value="待训练">待训练</li>
                        <li><input type="checkbox" state = "3" value="已发布"/>已发布</li>
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
                  <Li><span class="search-name">标签名：</span><span class="search-span"><input name="text" type="text" id="label-name" maxlength="15" placeholder="请输入标签名" class="search-box search-width" /></span></Li>
                </div>
              </ul>
              <div class="con-search-input" style="width: 100%!important;">
                <input name="" type="submit" value="搜索"  class="frame-Button-b search-Button" style="width:15.3%; margin-right:3%;"/>
                <input name="" type="button" value="清空"  class="search-Button02" id="clearBtn" />
                <div class="search-input" id="exprotSerach" style="float: right;margin-left: 2%;width: 10%">
                  <input name="" type="submit" value="导出"  class="frame-Button-b search-Button export" style="width: 100%;"/>
                </div>
              </div>
              <div id="btnGroup" class="con-r-top-r" style="float:right; width:30%; text-align:right;margin-top: 16px;display: inline;">
                  <#--判断有没有连接扫码器的权限-->
                  <@checkPrivilege url = "/virtual/bookEditor/connectTheCodeScanner.do">
                    <button type="button" id="connectScan" class="frame-Button Button-left">连接扫码器</button>
                  </@checkPrivilege>

                  <#--判断有没有创建书本按钮的权限-->
                  <@checkPrivilege url="/virtual/bookEditor/createBook.do">
                    <button type="button" id="createTaskBtn" class="frame-Button-b Button-left" style="margin-left: 10px">
                      创建书本信息
                    </button>
                  </@checkPrivilege>
                  <@checkPrivilege url="/cms/publishAll.do" >
                    <button type="button" id="publishAll" class="frame-Button-b Button-left" style="margin-left: 10px">训练所有绘本</button>
                  </@checkPrivilege>

                  <@checkPrivilege url="/base/excelFile.do" >
                    <button type="button" id="importExcelBtn" class="frame-Button-b Button-left" style="margin-left: 10px">批量创建书本信息</button>
                  </@checkPrivilege>
              </div>
              <div id="bookOriginDiv" style="display: none;float: left;width: 100%;padding-right: 20px;border: 0;font-size: 14px;
                  <#if !isShowOrigin>visibility: hidden;</#if>">
                <select id="bookOriginSelect">
                    <#list origin as o>
                      <option value="${o.origin}"><label class="define-option">${o.name}</label></option>
                    </#list>
                </select>
              </div>
            </div>

              <#--页面头按钮组-->

          </div>


            <#--ny书本-->
          <div id="nyBookList" style="margin-top: 30px"></div>
            <#--已发布-->
          <div id="publishedBookList" style="margin-top: 30px"></div>
            <#--书本信息待创建-->
          <div id="makingBookList" style="margin-top: 30px"></div>
            <#--待采样-->
          <div id="sampleBookList" style="margin-top: 30px"></div>
            <#--待审核-->
          <div id="inExamineBookList" style="margin-top: 30px"></div>
            <#--待训练-->
          <div id="unpublishedBookList" style="margin-top: 30px"></div>
            <#--训练中-->
          <div id="inProgressBookList" style="margin-top: 30px"></div>
            <#--连接扫码器-->
          <div id="connectScanIpContainer" style="display: none">
            <div class="modal-body create-dialog-body">
              <div class="input-group row short-input-group">
                <input type="text" class="form-control" id="connectIp" aria-describedby="basic-addon3"
                       placeholder="输入'ISBN扫码器'APP中的IP">
                <button type="button" id="saveButton" class="btn btn-default">连接</button>
              </div>
            </div>
            <div class="modal-body create-dialog-body" style="padding-top: 0;">
              <div style="margin-left: 15%;line-height: 23px">
                <p>连接ISBN扫码器操作：</p>
                <p>1.下载ISBN扫码器APK，并安装（暂只支持Android） </br>
                  下载地址：<a id="isbnApk"></a>
                </p>
                <p>2.打开APP</p>
                <p>3.输入手机IP地址，连接即可</p>
                <p style="color: red">注意：手机和PC需在同一网络环境下才能正常连接</p>
              </div>
            </div>
          </div>

            <#--查找所有书本-->
          <div id="searchAllBookList" style="margin-top: 30px"></div>

          <#--相似书本-->
          <div id="similarBookSet" style="">相似书</div>

        </div>
      </div>
    </div>
    <!--图书管理结束-->
  </div>
</div>

<div id = "excelImport" style="display: none">
  <div id="excelImportUpload">
    <button id="uploadExcelBtn27" class="layui-btn layui-btn-normal layui-btn-lg">导入书本信息表</button>
    <button id="uploadExcelBtn28" class="layui-btn layui-btn-normal layui-btn-lg">导入书本信息表</button>
    <button id="uploadExcelBtn29" class="layui-btn layui-btn-normal layui-btn-lg">导入书本信息表</button>
    <button id="excelTemplate" class="layui-btn layui-btn-primary layui-btn-lg"><a href="/base/excelFile.do?recordId=-1">下载模板 <i class="layui-icon">&#xe601;</i></a></button>
  </div>
  <div id="historyWord">
    创建历史:
  </div>

  <div id="excelImportHistory">
    <table id="excelHistory">
    </table>
    <p hidden id="adminemail">${adminemail}</p>
  </div>
</div>

<div id="replaceBookDiv" style="display: none">
  <div style="float: left;width: 100%;height: auto;">
    <label style="margin-left: 7%;margin-top: 20px;">请输入替换该书的图像库BookID:</label>
    <input type="text" id="replaceBookId" maxlength="17" style="border: 1px solid #CCCCCC;padding-left: 10px;width: 100px;margin-left: 22px;height: 32px;">
  </div>
  <div class="work-order-action" style="margin-top: 25px;float: left;width: 100%;border-top: 1px solid #EFEFEF;">
    <button type="button" class="pop-padding frame-Button-b confirm-button" style="margin-left: 155px;margin-top: 10px;">确定</button>
    <button type="button" class="pop-padding frame-Button cancel-button" style="margin-left: 20px;margin-top: 10px;">取消</button>
  </div>
</div>
<style>
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
    wantong.base.booklist.init();
  });
</script>
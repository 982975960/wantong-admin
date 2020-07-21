<#--搜索输入框引入-->
<@link href="/css/demo.css" rel="stylesheet"/>
<@link href="/css/3rd-party/zui/component-chosen.css" rel="stylesheet"/>
<@script src="/js/3rd-party/chosen.jquery.js"/>

<@script src="/js/supplier/supplierManager.js"></@script>
<@link href="/css/supplier/suppliermanager.css" rel="stylesheet"/>
<#--编辑框引入-->
<@link href="/css/tgeditor/fontAwesome/css/font-awesome.min.css" rel="stylesheet" />
<@link href="/css/tgeditor/richEditor.css" rel="stylesheet"/>
<@script src="/js/tgeditor/richEditor.min.js"></@script>

<div class="main-w">
  <div class="content-wrap-w">
    <div class="content-r-path">系统管理 / 客户信息维护</div>
    <div id="supplierManager" class="content-box">
      <form id="searchFrom" action="" method="get">
        <input type="hidden" name="currentPage" id="currentPage" value="${currentPage!}"/>
        <input type="hidden" name="status" id="partnerStatus" value="${partnerStatus}"/>
        <input type="hidden" name="searchText" id="searchText" value="${searchText}">
      </form>

      <div class="con-r-top">
        <div class="con-r-top-l" >
          <select class="con-r-top-l-frame frame-line" id="statusSelect" style="width: 80px;background: url(static/images/ico6.png) no-repeat 85% center transparent;height: 29px;">
            <option value="1">激活</option>
            <option value="0">禁用</option>
          </select>
          <input hidden type="text" style="width: 400px;margin-left: 10px" class="con-r-top-l-frame frame-line" id="searchInput"  value="${searchText}" placeholder="请输入客户名称开始搜索"/ >

          <button id="searchSupplierBtn" class="frame-Button" hidden="hidden">查找</button>

          <div class="col-xs-12 col-md-4 mb-5" style="min-width: 300px">
            <select id="searchSelect" class="form-control form-control-chosen"
                    data-placeholder="请输入要查找的合作商名称开始搜索">
              <option></option>
                <#list allPartners as p>
                  <option value="${p.name}">${p.name}</option>
                </#list>
            </select>
          </div>


        </div>
        <div class="con-r-top-r">
          <@checkPrivilege url="/supplier/createSupplier.do">
            <button class="frame-Button-b Button-left" id="createSupplier"> 添加新客户</button>
          </@checkPrivilege>
          <#if (partnerStatus==1)>
            <@checkPrivilege url="/supplier/sendEmail.do">
              <button class="frame-Button-b Button-left" id="sendEmail">发送邮件</button>
            </@checkPrivilege>
          </#if>
        </div>
      </div>

      <div class="content-pro">
        <div class="text-block-con row-t">
          <ul>
            <li>
              <table width="100%" border="0" cellpadding="0" cellspacing="0">
                <thead>
                <tr class="text-block-head">
                  <td width="10%" align="left" valign="middle" nowrap="nowrap" bgcolor="#f6f7fb" style="border-bottom:none;">序号</td>
                  <td width="17%" align="left" valign="middle" nowrap="nowrap" bgcolor="#f6f7fb" style="border-bottom:none;">客户</td>
                  <td width="13%" align="left" valign="middle" nowrap="nowrap" bgcolor="#f6f7fb" style="border-bottom:none;">客户类型</td>
                  <td width="16%" align="left" valign="middle" nowrap="nowrap" bgcolor="#f6f7fb" style="border-bottom:none;">创建时间</td>
                  <td width="17%" align="left" valign="middle" nowrap="nowrap" bgcolor="#f6f7fb" style="border-bottom:none;">创建者账户</td>
                  <td width="10%" align="left" valign="middle" nowrap="nowrap" bgcolor="#f6f7fb" style="border-bottom:none;">状态</td>
                  <td width="17%" align="left" valign="middle" nowrap="nowrap" bgcolor="#f6f7fb" style="border-bottom:none;">操作</td>
                </tr>
                </thead>
                <tbody>
                <#list list as l>
                  <tr>
                    <td align="left">
                      ${l_index+1}
                    </td>
                    <td align="left">
                      ${l.name}
                    </td>
                    <td align="left">
                      <#if (l.partnerType==0)>
                        故事机开发商
                       <#elseif (l.partnerType==1)>
                          出版社
                        <#else>
                          阅读室
                        </#if>
                    </td>
                    <td align="left">
                      ${l.createdTime?string("yyyy-MM-dd")}
                    </td>
                    <td align="left">
                      ${l.email}
                    </td>
                    <td class="status" align="left">
                      <#if l.status==0>
                        禁用
                      <#else>
                        激活
                      </#if>
                    </td>
                    <td align="left">
                      <#if (partnerStatus==1)>
                        <@checkPrivilege url="/supplier/supplierAdmin.do">
                          <button class="btn-edit Button-line btn-info" id="editSupplier" tid="${l.id}" temail="${l.email}"
                                  tname="${l.name}">
                            编辑
                          </button>
                        </@checkPrivilege>
                      </#if>
                      <@checkPrivilege url="/supplier/changeSupplierStatus.do">
                        <button class="btn-change Button-line btn-info" id="changeStatus" tid="${l.id}" tstatus="${l.status}">
                          <#if l.status==0>
                            激活
                          <#else >
                            禁用
                          </#if>
                        </button>
                      </@checkPrivilege>
                    </td>
                  </tr>
                </#list>
                </tbody>
              </table>
            </li>
          </ul>
        </div>
      </div>

<div class="con-page">
      <#if (pages > 1)>
        <div id="paginationContainer">
          <div>
            <nav aria-label="Page navigation">
              <ul id="pagination" class="" currentPage="${currentPage}" pages="${pages}"
                  pageSize="${pageSize}" style="margin-top: 0px;">
              </ul>
            </nav>
          </div>
        </div>
      </#if>
  </div>
      <!--分页-->


      <!-- 创建供应商 -->
      <div class="row create-partner-container" id="createSupplierContainer" style="display:none">
        <div class="col-md-12">
          <form id="createSupplierForm" method="post" action="">
            <div>
              <div style="display:inline-block;width: 60%">
                <div class="form-group" style="width:auto;margin-top: 15px" >
                  <label for="pageType"><h5 style=" width: auto;">合作商名称：<span style="color:red;float: right;width: 15px;">*</span></h5></label>
                  <input id="name" type="text" class="form-control" placeholder="不能大于45个字符" style="border-radius:0">
                  <input id="status" type="hidden" name="status" value="1" class="form-control">
                </div>
                <div class="form-group" style="width:auto;">
                  <label for="pageType"><h5 style=" width: auto;">联系电话：<span style="color:red;float: right;width: 15px;">*</span></h5></label>
                  <input type="phone" class="form-control" id="phoneNumber" placeholder="请输入合作商负责人手机号" onkeyup="this.value=this.value.replace(/[^0-9]+/,'');" style="border-radius:0">
                </div>
                <div class="form-group" style="width:auto;">
                  <label for="pageType"><h5 style=" width: auto;">管理员账户：<span style="color:red;float: right;width: 15px;">*</span></h5></label>
                  <input type="email" class="form-control" id="adminEmail" placeholder="jane.doe@example.com" style="border-radius:0">
                </div>
                <div class="form-group" style="width:auto;">
                  <label for="pageType"><h5 style=" width: auto;">客户类型：<span style="color:red;float: right;width: 15px;">*</span></h5></label>
                  <select id="partnerTypeSelect" style="width: 20%;height: 20px;">
                    <option value="0">故事机开发商</option>
                    <option value="1">出版社</option>
                    <option value="2">阅读室</option>
                  </select>
                </div>
              </div>
              <div style="display:inline-block;float: right;margin:2% 0 0 5%;">
                <label for="pageType"><h5>营业执照：</h5></label>
                <div id="thumbnailContainer" class="form-group text-center center-block picture-book-thumbnail-container">

                  <div id="thumbnail" class="picture-book-thumbnail">
                    <img id="coverImage"
                         src="data:image/jpeg;base64,/9j/4QAYRXhpZgAASUkqAAgAAAAAAAAAAAAAAP/sABFEdWNreQABAAQAAABQAAD/4QNvaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLwA8P3hwYWNrZXQgYmVnaW49Iu+7vyIgaWQ9Ilc1TTBNcENlaGlIenJlU3pOVGN6a2M5ZCI/PiA8eDp4bXBtZXRhIHhtbG5zOng9ImFkb2JlOm5zOm1ldGEvIiB4OnhtcHRrPSJBZG9iZSBYTVAgQ29yZSA1LjMtYzAxMSA2Ni4xNDU2NjEsIDIwMTIvMDIvMDYtMTQ6NTY6MjcgICAgICAgICI+IDxyZGY6UkRGIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyI+IDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PSIiIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIiB4bWxuczpzdFJlZj0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlUmVmIyIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bXBNTTpPcmlnaW5hbERvY3VtZW50SUQ9InhtcC5kaWQ6RDY5Qjc1OTRCNTVBRTkxMTlENTM5QjE1NEQwNDIzNzMiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6RTA1NzZEMjA1QUI2MTFFOTk5NDhCM0FDNENDMDJCMzkiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6RTA1NzZEMUY1QUI2MTFFOTk5NDhCM0FDNENDMDJCMzkiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpEODlCNzU5NEI1NUFFOTExOUQ1MzlCMTU0RDA0MjM3MyIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpENjlCNzU5NEI1NUFFOTExOUQ1MzlCMTU0RDA0MjM3MyIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6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"
                         style="" alt="上传营业执照照片" class="img-thumbnail">
                  </div>

                  <div id="uploadBtn" class="upload-btn-container">
                    <span class="glyphicon glyphicon-cloud-upload" aria-hidden="true"></span>
                  </div>
                </div>
              </div>
            </div>


            <div class="page-header authority-title" style="line-height: 40px;">
              <h5>给管理员添加默认权限：<span style="color:red;padding-bottom: 15px;">*</span></h5>
            </div>

            <div class="top" style="overflow-y: scroll;margin-bottom: 20px;height: 50%;">
              <#list topLevelAuthorities as topLevel>
                <#assign id = topLevel.id>
                <div class="topLevel_${id}">
                  <div class="panel-heading" style="width: 99%;float: left;background: #f6f7fb;padding: 8px 15px;font-size: 16px;color: #343434">
                    <input type="button"
                           style="background-image: url(static/images/hide.png);width: 18px;height:18px;border:none;margin-right: 10px"
                           order="0" authid="${topLevel.id}">
                    <input type="checkbox" levelType="topLevel" url="${topLevel.url}" value="${topLevel.id}"
                           order="0"<#if topLevel.checked == 1>
                      checked="checked" </#if> >&nbsp;&nbsp;${topLevel.name}
                  </div>
                  <#if secondLevelAuthorities["${id}"]??>
                    <#assign item = secondLevelAuthorities["${id}"]>
                    <div class="secondLevel_${id}" style="display: inline;width: 100%;float: left;padding-left: 7%">
                      <#list item as secondLevel>
                        <div class="second">
                          <div class="level_${secondLevel.id}" style="width: 100%;float: left;">
                            <div class="panel-body" style="padding:2% 0 10px 0px;width: 100%;float: left;font-size: 14px">
                              <input type="button"
                                     style="background-image: url(static/images/hide.png);width: 18px;height:18px;border:none;"
                                     order="1" authid="${secondLevel.id}">
                              <input type="checkbox" levelType="secondLevel" url="${secondLevel.url}" value="${secondLevel.id}"
                                     topId="${id}" order="1"<#if secondLevel.checked == 1>
                                checked="checked" </#if> >&nbsp;&nbsp;${secondLevel.name}
                            </div>
                          </div>
                        </div>
                        <#if thirdLevelAuthorities["${secondLevel.id}"]??>
                          <#assign item2 = thirdLevelAuthorities["${secondLevel.id}"]>
                          <div class="thirdLevel_${secondLevel.id}" style="display: inline;width: 100%;float: left;padding-left: 2%;">
                            <#list item2 as thirdLevel>
                              <div class="panel-body" style="width: 33%;float: left;line-height: 19px;padding: 2px 0;padding-left: 15px;height: 40px;">
                                <input type="checkbox" levelType="thirdLevel" url="${thirdLevel.url}" value="${thirdLevel.id}"
                                       secondId="${secondLevel.id}" topId="${id}"
                                       order="2"<#if thirdLevel.checked == 1>
                                  checked="checked" </#if> >&nbsp;&nbsp;${thirdLevel.name}
                              </div>
                            </#list>
                          </div>
                        </#if>
                      </#list>
                    </div>
                  </#if>

                </div>
              </#list>
            </div>

            <div class="modal-footer" style="width: 100%;float: left;">
              <button type="button" id="saveBtn" class="pop-padding frame-Button-b">保存</button>
              <button type="button" id="closeBtn" class="pop-padding frame-Button" data-dismiss="modal">关闭</button>
            </div>
          </form>
        </div>
      </div>
      <!-- 创建供应商 -->

      <!-- 发送邮件 -->
      <div class="row create-partner-container" id="emailContentContainer" style="display:none">
        <div class="col-md-12">
          <form id="emailContentForm" method="post" action="" style="width: 100%;height: 90%">
            <div class="form-group" style="margin-top: 15px;width: 100%;height: 90%">
              <div id="editor" ></div>
            </div>

            <div class="modal-footer">
              <label id="emailTip">注：点击发送后，该邮件内容会自动群发到所有合作商管理员账户</label>
              <button type="button" id="sendBtn" class="pop-padding frame-Button-b">发送</button>
              <button type="button" id="closeBtn" class="pop-padding frame-Button">关闭</button>
            </div>
          </form>
        </div>
      </div>
      <!-- 发送邮件 -->

    </div>
  </div>
</div>

<script>
  $(function () {
    wantong.supplierManager.init();
  });
  var editor = new RichEditor("#editor", {
    height:600,
    toolBg:"#eee",
    buttons: {
      heading:{
        title:"标题",
        icon:"\uf1dc"
      },
      code: {
        title: "引用",
        icon: "\uf10d"
      },
      bold: {
        title: "加粗",
        icon: "\uf032"
      },
      italic: {
        title: "斜体",
        icon: "\uf033"
      },
      underline: {
        title: "下划线",
        icon: "\uf0cd"
      },
      strikethrough: {
        title: "删除线",
        icon: "\uf0cc"
      },
      /*foreColor: {
        title: "字体颜色",
        icon: "\uf1fc"
      },*/
      /* backColor: {
         title: "背景色",
         icon: "\uf043"
       },*/
      justifyCenter: {
        title: "居中",
        icon: "\uf037"
      },
      justifyRight: {
        title: "居右",
        icon: "\uf038"
      },
      justifyFull: {
        title: "两端对齐",
        icon: "\uf039"
      },
      insertOrderedList: {
        title: "有序列表",
        icon: "\uf0cb"
      },
      insertUnorderedList: {
        title: "无序列表",
        icon: "\uf0ca"
      },
      createLink: {
        title: "链接",
        icon: "\uf0c1"
      },
      insertImage: {
        title: "插入图片",
        icon: "\uf03e"
      }
    }
  });
</script>

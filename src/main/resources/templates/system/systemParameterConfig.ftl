<@script src="/js/system/systemParameterConfig.js"></@script>
<@link href="/css/system/paramConfig.css" rel="stylesheet"/>
<div class="main-w">
  <div class="content-wrap-w">
    <div class="content-r-path">系统管理 / 系统参数配置</div>
      <div id="systemParamConfig" class="content-box partner-detail-panel">
        <form id="searchFrom" action="" method="get">
            <input type="hidden" name="currentPage" id="currentPage" value="${page.currentPage!}" />
        </form>
        <div class="con-r-top">
            <div class="con-r-top-r">
                <#if partnerId!=1>
                    <button class="frame-Button-b Button-left" partnerId=${partnerId!} totalCount=${page.totalCount!}
                            id="applyConfig">申请配置
                    </button>
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
                            <td width="7%" align="left" valign="middle" nowrap="nowrap" bgcolor="#f6f7fb" style="border-bottom:none;">序号</td>
                            <td width="10%" align="left" valign="middle" nowrap="nowrap" bgcolor="#f6f7fb" style="border-bottom:none;">类型</td>
                            <td width="25%" align="left" valign="middle" nowrap="nowrap" bgcolor="#f6f7fb" style="border-bottom:none;">公司名称</td>
                            <td width="25%" align="left" valign="middle" nowrap="nowrap" bgcolor="#f6f7fb" style="border-bottom:none;">家长端链接</td>
                            <td width="13%" align="left" valign="middle" nowrap="nowrap" bgcolor="#f6f7fb" style="border-bottom:none;">申请时间</td>
                            <td width="10%" align="left" valign="middle" nowrap="nowrap" bgcolor="#f6f7fb" style="border-bottom:none;">状态</td>
                            <td width="10%" align="left" valign="middle" nowrap="nowrap" bgcolor="#f6f7fb" style="border-bottom:none;">操作</td>
                        </tr>
                    </thead>
                    <tbody>
                    <#list page.data as l>
                        <tr>
                            <td align="left">
                                ${l_index+1}
                            </td>
                            <td align="left">
                                <#if l.type==0>
                                    微信公众号
                                <#else>
                                    其他
                                </#if>
                            </td>
                            <td align="left">
                                ${l.partnerName!}
                            </td>
                            <td align="left">
                                <#if l.status==0>
                                    待配置完成后才能生成
                                <#else>
                                    ${l.parentUrl}
                                </#if>
                            </td>
                            <td align="left">
                                ${l.createdTime?string("yyyy-MM-dd")}
                            </td>
                            <td class="status" align="left">
                                <#if l.status==0 && partnerId!=1>
                                    配置中
                                <#elseif l.status==0 && partnerId==1>
                                    待配置
                                <#elseif l.status==1>
                                    配置完成
                                </#if>
                            </td>
                            <td align="left">
                                <button class="Button-line btn-edit btn-info" flag="flag" parentUrl="${l.parentUrl}" partnerId=${partnerId!}  paramId=${l.id!} status="${l.status}" >
                                    <#if partnerId==1>
                                        查看参数
                                    <#elseif partnerId!=1 && l.status==0>
                                        编辑
                                    <#elseif partnerId!=1 && l.status==1>
                                        查看
                                    </#if>
                                </button>
                            </td>
                        </tr>
                    </#list>
                    </tbody>
                </table>
                </li>
                </ul>
            </div>
        </div>
          <!--分页-->
          <#if (page.totalPage>1)>
              <div id="pageline" class="con-page" style="border:none; margin-top:1%;">
                  <ul>
                      <#--<li><a href="#" page="${page.first}">首页</a></li>-->
                      <li class="page-back"><a href="#" page="${page.prev}"><img src="/static/images/ico9_03.png"></a></li>
                      <#list page.arrPage as p>
                          <#if p==page.currentPage>
                              <li class="page-back-b"><a page="0">${p}</a></li>
                          <#elseif p==-1>
                              <li class="disabled page-back-b2"><a href="#" onclick="return false;">...</a></li>
                          <#else >
                              <li class="page-back-b2"><a href="#" page="${p}">${p}</a></li>
                          </#if>
                      </#list>
                      <li class="page-back"><a href="#" page="${page.next}"><img src="/static/images/ico9_05.png"></a></li>
                      <Li>到第</Li>
                      <Li><input name="text" type="text" class="page-box page-back" id="pageText"/></Li>
                      <Li>页</Li>
                      <Li><input name="" type="submit" value="跳转" class="page-input" id="pageJump" totalPage="${page.totalPage}"/></Li>
                  </ul>
              </div>
          </#if>
          <!--分页-->

        <!--分页-->
        <#--<#if (page.totalPage>1)>
            <div id="pageline" class="text-center">
                <ul class="pagination pagination-sm">
                    &lt;#&ndash;<li><a href="#" page="${page.first}">首页</a></li>&ndash;&gt;
                    <li><a href="#" page="${page.prev}">上一页</a></li>
                    <#list page.arrPage as p>
                        <#if p==page.currentPage>
                            <li class="active"><a page="0">${p}</a></li>
                        <#elseif p==-1>
                            <li class="disabled"><a href="#" onclick="return false;">...</a></li>
                        <#else >
                            <li><a href="#" page="${p}">${p}</a></li>
                        </#if>
                    </#list>
                    <li><a href="#" page="${page.next}">下一页</a></li>
                    &lt;#&ndash;<li><a href="#" page="${page.last}">尾页</a></li>&ndash;&gt;
                </ul>
            </div>
        </#if>-->
        <!--分页-->

        <!-- 申请配置 -->
        <div style="display: none" id="paramConfigDialog" class="col-md-12">
            <form id="paramForm" method="post" action="" >
                <div id="paramDiv" >
                    <div class="layui-tab layui-tab-card">
                        <ul  class="layui-tab-title">
                            <li class="layui-this">微信公众号参数</li>
                        </ul>
                    </div>
                    <div class="layui-tab-content">
                        <div class="layui-tab-item layui-show">
                            <#--<div class="form-group" style="">
                                    <label for="domainName" style="margin-left: 10%"><h5>域名：</h5></label>
                                    <input type="text" class="form-control" id="domainName" readonly="readonly" style="margin-left: 3%">
                            </div>-->

                            <div>

                                <div class="levelDiv" id="div2">
                                    <div class="wxParam">
                                        <label for="nickname"><h5>公众号名称：<span style="color:red">*</span></h5></label>
                                        <input type="text" class="form-control" id="nickname">
                                    </div>
                                    <div class="wxParam" id="accountDiv">
                                        <label for="account"><h5>微信号：<span style="color:red">*</span></h5></label>
                                        <input type="text" class="form-control" id="account">
                                    </div>
                                    <div class="wxParam" id="appIdDiv">
                                        <label for="appId"><h5>appID：<span style="color:red">*</span></h5></label>
                                        <input type="text" class="form-control" id="appId">
                                    </div>
                                    <div class="wxParam" id="appSecretDiv">
                                        <label for="appSecret"><h5>appsecret：<span style="color:red">*</span></h5></label>
                                        <input type="text" class="form-control" id="appSecret">
                                    </div>
                                    <div style="margin-top: 20px;width: 70%;float: left;text-align: left;margin-left: 22%;">
                                      <@checkPrivilege url = "/system/changeDisplayBox.do">
                                        <input type="checkbox" id="displayBox" value="1" style="width: 15px;height: 15px;margin-right: 10px;"  >在家长端内置玩瞳盒子服务
                                        <img src="static/images/help.png" style="width: 15px;height: 15px;margin-bottom: 3px;" id="helpImg">
                                      </@checkPrivilege>
                                    </div>
                                </div>
                                <div id="parentUrlBtnDiv">
                                    <button type="button" id="parentUrlBtn" class="btn btn-default" style="background-color: rgb(238, 238, 238);color: rgb(0, 0, 0);border-radius: 0;margin-left: 38%;">验证参数并生成家长端链接</button>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                <div id="parentDiv">
                    <div id="qrCode" style="margin-top: 25px">
                        <p style="margin-left: 0px;text-align: center">商户公众号的二维码</p>
                        <img src="" id="qrImg"  style="width: 30%">
                    </div>
                    <div id="parentUrlDiv">
                        <p id="parentUrlP">家长端链接：待配置完成后才会生成</p>
                    </div>
                </div>
                <div class="modal-footer" id="saveAndCloseDiv">
                    <button type="button" id="saveBtn" class="pop-padding frame-Button-b">保存</button>
                    <button type="button" id="closeBtn" class="pop-padding frame-Button">关闭</button>
                </div>
            </form>
        </div>
    </div>
  </div>
</div>
<script>
    $(function () {
        wantong.systemParameterConfig.init();
    });
</script>

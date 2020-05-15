<@script src="/js/auth/authority.js"></@script>
<div class="main-w">
  <div class="content-wrap-w">
    <div class="content-r-path">系统管理 / 权限列表</div>
      <div class="content-box partner-detail-panel" id="authorityManager">
        <form id="serachForm" action="" method="get">
          <input type="hidden" name="currentPage" id="currentPage" value="${page.currentPage!}"/>
        </form>
        <div class="con-r-top">
          <div class="con-r-top-r">
            <@checkPrivilege url="/auth/create.do">
              <button id="createAuthBtn" class="frame-Button-b Button-left">创建权限</button>
            </@checkPrivilege>
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
                      <td width="20%" align="left" valign="middle" nowrap="nowrap" bgcolor="#f6f7fb" style="border-bottom:none;">权限名</td>
                      <td width="40%" align="left" valign="middle" nowrap="nowrap" bgcolor="#f6f7fb" style="border-bottom:none;">权限路径</td>
                      <td width="15%" align="left" valign="middle" nowrap="nowrap" bgcolor="#f6f7fb" style="border-bottom:none;">父级权限</td>
                      <td width="15%" align="left" valign="middle" nowrap="nowrap" bgcolor="#f6f7fb" style="border-bottom:none;">创建时间</td>
                      <#if false>
                        <td align="left" valign="middle" nowrap="nowrap" bgcolor="#f6f7fb" style="border-bottom:none;">操作</td>
                      </#if>
                    </tr>
                  </thead>
                  <tbody>
                          <#list page.data as l>
                  <tr>
                    <td>
                      ${l_index+1}
                    </td>
                    <td>
                      ${l.name}
                    </td>
                    <td style="word-break:break-all;">
                      ${l.url}
                    </td>
                    <td>
                      ${l.fatherName}
                    </td>
                    <td>
                      ${l.createdTime?string("yyyy-MM-dd")}
                    </td>
                    <!--
                                  <td>
                                      <@checkPrivilege url="unsupport functionality">
                                          <button class="btn-edit btn btn-warning btn-xs"
                                           tid="${l.id}"
                                           tname="${l.name}"
                                           turl="${l.url}"
                                           tfatherId="${l.fatherId}"
                                           tdescribe="${l.describe}"
                                           tfatherName="${l.fatherName}" data-toggle="modal" data-target="#editAuthority">
                                              编辑
                                          </button>
                                      </@checkPrivilege>
                                      <@checkPrivilege url="unsupport functionality">
                                          <button class="btn-del btn btn-warning btn-xs" tid="${l.id}">
                                              删除
                                          </button>
                                      </@checkPrivilege>
                                  </td>
                                  -->
                  </tr>
                  </#list>
                  </tbody>
                </table>
              </li>
            </ul>
          </div>
        </div>
        <div class="clearfix"></div>

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

        <!--   创建权限 -->
        <div id="createAuthority" style="display: none">
              <div class="modal-body">
                <div class="input-group form-group-sm col-xs-6" style="margin-bottom:5px;">
                  <span class="input-group-addon">权限名</span>
                  <input type="text" class="form-control" name="name" id="name" placeholder="不能大于15字符"/>
                </div>
                <div class="input-group form-group-sm col-xs-6" style="margin-bottom:5px;">
                  <span class="input-group-addon">权限路径</span>
                  <input type="text" class="form-control" name="url" id="url" placeholder="请输入权限路径..."/>
                </div>
                <div class="input-group form-group-sm col-xs-6" style="margin-bottom:5px;">
                  <span class="input-group-addon">父级权限</span>
                  <select class="con-r-top-l-frame frame-line" name="fatherId" id="fatherId">
                    <option value="0">无</option>
                                  <#list page.data as l>
                                      <option value="${l.id}">${l.name}</option>
                    </#list>
                  </select>
                </div>
                <div class="input-group form-group-sm col-xs-6" style="margin-bottom:5px;">
                  <textarea class="form-control" name="describe" id="describe" rows="5" placeholder="请输入描述..."></textarea>
                </div>

                <div class="input-group form-group-sm col-xs-6 text-left" style="margin-bottom:5px;">
                  <span class="input-group-addon" style="width:95px;border-right: 1px solid #ccc;border-bottom-right-radius: 4px; border-top-right-radius: 4px;">状态</span>
                  <lable class="btn btn-sm">
                    <input type="radio" name="status" value="1" checked/>启用
                  </lable>
                  <lable class="btn btn-sm">
                    <input type="radio" name="status" value="0"/>禁用
                  </lable>
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" id="saveBtn" class="pop-padding frame-Button-b">保存</button>
                <button type="button" id="closeBtn" class="pop-padding frame-Button">关闭</button>
              </div>
        </div>
        <!-- 创建权限 -->

        <!-- 修改 -->
        <div class="modal fade bs-example-modal-sm" id="editAuthority" tabindex="-1" role="dialog"
             aria-labelledby="myLargeModalLabel" aria-hidden="true">
          <div class="modal-dialog modal-xs-6">
            <form id="editAuthorityForm" method="post" action="">
              <input type="hidden" name="id" id="id"/>
              <div class="modal-content">
                <div class="modal-header">
                  <button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">&times;</span><span
                      class="sr-only">Close</span></button>
                  <h4 class="modal-title">创建权限</h4>
                </div>
                <div class="modal-body">
                  <div class="input-group form-group-sm col-xs-6" style="margin-bottom:5px;">
                    <span class="input-group-addon">权限名</span>
                    <input type="text" class="form-control" name="name" id="name" placeholder="请输入权限名..."/>
                  </div>
                  <div class="input-group form-group-sm col-xs-6" style="margin-bottom:5px;">
                    <span class="input-group-addon">权限路径</span>
                    <input type="text" class="form-control" name="url" id="url" placeholder="请输入权限路径..."/>
                  </div>
                  <div class="input-group form-group-sm col-xs-6" style="margin-bottom:5px;">
                    <span class="input-group-addon">父级权限</span>
                    <input type="hidden" name="fatherId" id="fatherId"/>
                    <input type="text" class="form-control" id="fatherName" readonly="readonly"/>
                  </div>
                  <div class="input-group form-group-sm col-xs-6" style="margin-bottom:5px;">
                    <textarea class="form-control" name="describe" id="describe" rows="5" placeholder="请输入描述..."></textarea>
                  </div>


                  <div class="input-group form-group-sm col-xs-6 text-left" style="margin-bottom:5px;">
                    <span class="input-group-addon" style="border-right: 1px solid #CCCCCC;border-bottom-right-radius: 4px;border-top-right-radius: 4px;width:95px;">状态</span>
                    <lable class="btn btn-sm">
                      <input type="radio" name="status" value="1" checked/>启用
                    </lable>
                    <lable class="btn btn-sm">
                      <input type="radio" name="status" value="0"/>禁用
                    </lable>
                  </div>
                </div>
                <div class="modal-footer">
                  <button type="button" id="saveBtn" class="pop-padding frame-Button-b">保存</button>
                  <button type="button" id="closeBtn" class="pop-padding frame-Button">关闭</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
  </div>
</div>
<script>
  $(function () {
    wantong.authority.init();
  });
</script>
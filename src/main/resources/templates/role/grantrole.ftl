<@link href="/js/layui/css/layui.css" rel="stylesheet"/>
<@script src="/js/3rd-party/jquery-2.2.4.min.js"/>
<@script src="/js/common/jquery.form.js"/>
<@script src="/js/layui/layui.js"/>
<@script src="/js/common/global.js"/>
<@script src="/js/common/frame.js"/>
<@link href="/css/style.css" rel="stylesheet"/>
<@link href="/css/branding-${Session.subDomainStyle.style!'original'}.css" rel="stylesheet" />
    <script>
      layui.use(['layer', 'form'], function () {
        var layer = layui.layer,
            form = layui.form;
      });
    </script>
	<style>
    .layui-unselect span {
      height: 38px;
      width: 135px;
    }
    .layui-form-checked[lay-skin=primary] i {
      border-color: #3dbeed;
      background-color: #3dbeed;
    }
    .layui-form-checkbox[lay-skin=primary]:hover i {
      border-color: #3dbeed;
    }
    body{
      background-color: white;
    }
  </style>
<div id="grantRole" style="background-color: white">
  <form class="layui-form" id="grantRoleFrom" action="" method="post" style="margin-top:30px;">
    <input type="hidden" name="adminId" value="${user.id}"/>
    <div class="layui-form-item">
      <div class="layui-inline">
        <label class="layui-form-label">用户</label>
        <div class="layui-input-inline" style="width:300px;">
          <input type="text" name="email" lay-verify="email" disabled="" value="${user.email}" autocomplete="off"
                 class="layui-input">
        </div>
      </div>
    </div>
    <div class="layui-form-item" pane="">
      <label class="layui-form-label">选择角色</label>
      <div class="layui-input-block" style="overflow-y:auto;height:250px;">
			<#list  list as l>
        <input type="checkbox" name="roleIds" lay-skin="primary" title="${l.name}" value="${l.id}"
				<#if l.checked == 1>
					checked="checked"
        </#if>
        >
        <div class="layui-unselect layui-form-checkbox layui-form-checked" lay-skin="primary">
        </div>
      </#list>
      </div>
    </div>

    <div class="modal-footer" style="border-top: 1px solid #eceff8;padding: 3% 0;width: 95%;margin: 0 2.5%;">
      <div style="float: right;">
        <button type="button" id="saveBtn" class="pop-padding frame-Button-b">保存</button>
        <button type="button" id="closeBtn" class="pop-padding frame-Button" data-dismiss="modal">关闭</button>
      </div>
    </div>

  </form>
<@script src="/js/role/grantrole.js"/>
  <script>
    $(function () {
      wantong.grantrole.init();
    });
  </script>
</div>
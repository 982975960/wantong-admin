<div id="authCodeListPanel" class="table">
 <h1 class="page-header">系统参数配置</h1>
 <div>
	<table class="table controls-table system-config-list-panel table-striped" id="systemConfigListPanel">
      <thead>
        <tr>
          <th>名称</th>
          <th>值</th>
          <th>描述</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
      	<#list allConfig?keys as key>
        <tr>
          <td class="keyCol">${key}</td>
          <td>
          	<textarea class="value">${allConfig[key].value!}</textarea>
          </td>
          <td>
          	<textarea class="comments">${allConfig[key].comments!}</textarea>
          </td>
          <td>
          	<button type="button" class="update-button btn btn-xs btn-warning">更新</button>
          </td>
        </tr>
		</#list>
      </tbody>
    </table>
 </div><!--/span-->
    <!--/row-->
</div>
</div>
<script>
$(function(){
	wanxuebang.systemConfigList.init();
});
</script>


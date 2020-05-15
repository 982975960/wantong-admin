<@script src="/js/app/imageConfig.js"></@script>
<@link href="/css/app/imageConfig.css" rel="stylesheet"/>
<div class="main-w">
  <div class="content-wrap-w">
    <div class="content-r-path">应用管理 / 图像参数配置</div>
    <div class="content-box partner-detail-panel" id="imageConfigManager">
      <div class="content-pro">
        <div class="text-block-con row-t">
          <ul>
            <li>
          <table width="100%" border="0" cellpadding="0" cellspacing="0">
            <thead>
            <tr class="text-block-head">
              <td width="10%" align="left" valign="middle" nowrap="nowrap" bgcolor="#f6f7fb" style="border-bottom:none;">序号</td>
              <td width="20%" align="left" valign="middle" nowrap="nowrap" bgcolor="#f6f7fb" style="border-bottom:none;">图像类型</td>
              <td width="50%" align="left" valign="middle" nowrap="nowrap" bgcolor="#f6f7fb" style="border-bottom:none;">备注</td>
              <td width="20%" align="left" valign="middle" nowrap="nowrap" bgcolor="#f6f7fb" style="border-bottom:none;">操作</td>
            </tr>
            </thead>
            <tbody>
            <#list list as l>
              <tr>
                <td align="left">
                  ${l_index+1}
                </td>
                <td align="left">
                  ${l.model}
                </td>
                <td align="left">
                  ${l.note}
                </td>
                <td align="left">
                    <button class="Button-line btn-edit btn-info" tid="${l.id}" tname="${l.model}" tnote='${l.note}'>
                      编辑
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
      <!-- 创建新机型 -->
      <div class="create-partner-container" id="editImageConfig" style="display:none;height: 90%">
        <div class="form-group" style="margin-top: 2%">
          <label for="pageType">图像类型：</label>
          <input id="name" type="text" class="form-control" style="width: 70%">
        </div>

        <div class="form-group" style="height: 40%">
          <label>图像类型参数:</label>
          <textarea id="configParam" value="" class="form-control" style="width: 70%;height: 100%;resize: none"></textarea>
        </div>

        <div class="form-group" style="height: 40%">
          <label>备注:</label >
          <textarea id="note" value="" class="form-control" style="width: 70%;height: 100%;resize: none"></textarea>
        </div>

        <div class="modal-footer">
          <button type="button" id="saveBtn" class="pop-padding frame-Button-b">保存</button>
          <button type="button" id="closeBtn" class="pop-padding frame-Button">关闭</button>
        </div>
      </div>
      <!-- 创建新机型 -->

    </div>
  </div>
</div>
<script>
  $(function () {
    wantong.imageConfig.init();
  });
</script>
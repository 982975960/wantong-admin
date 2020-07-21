<@script src="/js/app/leadingDeviceDialog.js"/>
<div id="leadingDeviceDialog" style="margin-top: 50px;">
  <div id="error" style="display: none;" class="alert alert-danger" role="alert"></div>

  <div class="input-group row  short-input-group" style="margin-left: auto;margin-right: auto;">
    <div id="uploader" class="wu-example">
      <div class="btns">
        <div id="uploadFilePicker">导入设备Id表</div>
        <div id="uploadFileList" class="alert alert-success"
             style="text-overflow:ellipsis;white-space:nowrap;overflow:hidden;width:300px;"
             role="alert">
          还没有选择任何xls格式的Excel文件
        </div>
      </div>
    </div>
  </div>

  <div id="uploadProgress" style="display:none" class="toy-upload-progress progress">
    <div class="toy-upload-progress-bar progress-bar progress-bar-success" role="progressbar"
         aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 0%">
      <span class="sr-only">0% Complete (success)</span>
    </div>
  </div>

  <div class="modal-footer">
    <button type="button" id="saveButton" class="pop-padding frame-Button-b">保存</button>
    <button type="button" id="closeButton" class="pop-padding frame-Button">关闭</button>
  </div>
</div>

<script>
  $(function () {
    wantong.leadingDeviceDialog.init({
      appId:"${appId}",
      recordId:"${recordId}"
    });
  });
</script>

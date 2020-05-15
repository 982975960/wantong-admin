<div class="batch-upload-image" style="display: none">
  <div id="imageUploadHint" style="margin-top: 5%;margin-left: 15%;margin-right: 15%">
    <div class="hint-text">
      <span style="font-size: 15px;line-height: 24px">您确定批量上传书页吗？批量上传后，之前书页将被全部删除。</span>
    </div>
    <div id="confirmUploadImageBtn" class="button" style="margin-left: 40%;margin-top: 20%">
      <span>确定</span>
    </div>
  </div>


  <div id="imageFileProgress">
    <div class="image-upload-hint"
         style="float: left;margin-top: -23px;margin-left: 15%;font-size: 16px;color: #c14a1a;display: none "><span>上传时间较长，请耐心等待</span>
    </div>
    <div class="progress progress-striped active" style="width: 70%;margin-top: 50px;margin-left: 15%">
      <div id="imageUploadProgress" class="progress-bar progress-bar-success" role="progressbar"
           aria-valuenow="60" aria-valuemin="0" aria-valuemax="100"
           style="width: 0%;">
      </div>
    </div>
    <div id="imageUploadProHint" style="margin-left: 15%">
      <span type="text">正在上传...<span id="proPrcent">0</span>%</span>
    </div>
  </div>


  <div id="imageUploadErrorResult">
    <div class="hint-title">
      <span id="hint">文件上传结果,以下图片文件存在异常,请检查！</span>
    </div>
    <div class="exception-file">
      <table style="margin-left: 31px;width: 90%">
      </table>
    </div>
  </div>

  <div id="imageCheckResult">
    <div class="result-hint">
      <span type="text" style="font-size: 16px">全部文件自检成功！</span>
    </div>
    <div class="confirm-control">
      <button id="checkConfrimBtn" type="button" class="btn btn-info">下一步</button>
    </div>
  </div>

  <div id="imageUploadRightResult">
    <div class="result-hint">
      <span type="text" style="font-size: 16px">全部文件上传成功！</span>
    </div>
    <div class="confirm-control">
      <button id="imageUploadNextBtn" type="button" class="btn btn-info">下一步</button>
    </div>
  </div>

  <div id="imageSaveDataResult">
    <div class="result-hint">
      <span type="text" style="font-size: 16px">写入成功，书页已全部完整上传！</span>
    </div>
    <div class="confirm-control">
      <button id="imageSaveDataConfrimBtn" type="button" class="btn btn-info">确定</button>
    </div>
  </div>

  <div class="text-box" id="imageHelpContent">
    <h2>上传的图片文件，需符合以下标准：</h2>
    <span><span id="imageHelpContent_imageLimitation">jpg格式、分辨率为1280*720</span><br/>
           整个上传的文件夹的名称不做命名限制，只对里面的图片文件命名做规范。<br/>
           上传的文件夹中的图片不能超过150张<br/>
          上传图片必须为1-0或1-1开始的连续物理页</span>

    <h2>图片命名规则：</h2>
    <span>必须为物理页-物理页状态</span>
    <span>物理页和物理页状态用 – 来做分隔<br/>
      物理页：必填，1以上的整数<br/>
      物理页状态：必填，没有物理页状态，请用0来代替；有物理页状态，请用1以上整数<br/>
    </span>
    <span>
      整个图片文件名为：1-0<br/>
      第一个，数字1，代表物理页；<br/>
      第二个，数字0，代表这个物理页没有多个状态，写0即可；有物理页状态需从1开始<br/>
      <br/>
    </span>
    <span>
      当想导入整本书的书页，请在本地，先把图片全部按照规则命名，示例如图所示：
    </span>
    <span><img src="/static/images/pic7.png" width="540" height="213"/></span>
    <span>然后再点击批量上传书页按钮，在上传前会先进行文件自检，仅当文件全部符合规范方可上传。若遇到图片文件自检有上传失败的情况，请检查图片文件是否符合上传标准。</span>
    <h2>以上说明若仍然未帮助到您，请详见：操作说明手册链接<a href="https://www.showdoc.cc/bailubtr?page_id=2971742983307841" target="_blank">https://www.showdoc.cc/bailubtr?page_id=2971742983307841</a>
    </h2>
  </div>


  <div class="upload-image" id="imageShowUploadProGroup" style="width: 100%;display: none">
    <div class="box-upload">
      <div class="box-upload-t">
        <dl>
        <#--<img  width="65" height="64" />-->
          <dt class="upload-line" id="imageFileCheck">1</dt>
          <dd>文件自检</dd>
        </dl>
      <#--红色的线-->
      <#--<div class="upload-gules"></div>-->
      <#--灰色的线-->
        <div class="upload-gray" id="imageCheckFinish"></div>
        <dl>
        <#--< img  width="65" height="64" />-->
          <dt class="upload-line" id="imageFileUpload">2</dt>
          <dd>上传文件</dd>
        </dl>
        <div class="upload-gray" id="imageUploadFinish"></div>
        <dl>
          <dt class="upload-line" id="imageDataSave">3</dt>
          <dd>写入保存</dd>
        </dl>
      </div>
    </div>
  </div>
</div>


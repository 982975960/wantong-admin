<div class="batch_audio" style="display: none">
  <div id="fingerUploadHint" style="margin-top: 5%;margin-left: 15%;margin-right: 15%">
    <div class="hint-text">
      <span style="font-size: 15px;line-height: 24px">您确定批量上传真人录音吗？批量上传后，之前书页的语音将被全部覆盖。</span>
    </div>
    <div id="confirmFingerBtn" class="button" style="margin-left: 40%;margin-top: 20%">
      <span>确定</span>
    </div>
  </div>


  <div id="fingerFileProgress">
    <div class="finger-upload-hint"
         style="float: left;margin-top: -23px;margin-left: 15%;font-size: 16px;color: #c14a1a;display: none "><span>上传时间较长，请耐心等待</span>
    </div>
    <div class="progress progress-striped active" style="width: 70%;margin-top: 50px;margin-left: 15%">
      <div id="uploadProgress" class="progress-bar progress-bar-success" role="progressbar"
           aria-valuenow="60" aria-valuemin="0" aria-valuemax="100"
           style="width: 0%;">
      </div>
    </div>
    <div id="fingerProHint" style="margin-left: 15%">
      <span type="text">正在上传...<span id="pro-prcent">0</span>%</span>
    </div>
  </div>


  <div id="fingerErrorUploadResult">
    <div class="hint-title">
      <span id="hint">文件上传结果,以下音频文件存在异常,请检查！</span>
    </div>
    <div class="exception-file">
      <table style="margin-left: 31px;width: 90%">
      </table>
    </div>
  </div>

  <div id="fingerCheckResult">
    <div class="result-hint">
      <span type="text" style="font-size: 16px">全部文件自检成功！</span>
    </div>
    <div class="confirm-control">
      <button id="fingerCheckConfrimBtn" type="button" class="btn btn-info">下一步</button>
    </div>
  </div>

  <div id="fingerUploadResult">
    <div class="result-hint">
      <span type="text" style="font-size: 16px">全部文件上传成功！</span>
    </div>
    <div class="confirm-control">
      <button id="fingerUploadConfrimBtn" type="button" class="btn btn-info">下一步</button>
    </div>
  </div>

  <div id="fingerErrorUploadResult">
    <div class="hint-title">
      <span id="hint">文件上传结果,以下音频文件存在异常,请检查！</span>
    </div>
    <div class="exception-file">
      <table style="margin-left: 31px;width: 90%">
      </table>
    </div>
    <div class="btn-control">
      <button id="fingerConfirmUpload" type="button" class="btn btn-info">忽略,下一步</button>
    </
    >
  </div>

  <div id="fingerSaveDataResult">
    <div class="result-hint">
      <span type="text" style="font-size: 16px">写入成功，真人录音已全部完整上传！</span>
    </div>
    <div class="confirm-control">
      <button id="fingerSaveDataConfrimBtn" type="button" class="btn btn-info">确定</button>
    </div>
  </div>

  <div class="text-box" id="fingerHelpContent">
    <h2>上传的音频文件，需符合以下标准：</h2>
    <span>MP3格式、采样率24000HZ、比特率56kbps、文件大小不超过8M<br/>
           整个上传的文件夹的名称不做命名限制，只对里面的音频文件命名做规范。</span>

    <h2>音频命名规则：</h2>
    <span>物理页-物理页状态_/-热区框</span>
    <span>物理页-物理页状态用 – 来做分隔,物理页状态和热区框用-或者_来做分隔<br/>
      物理页：必填，1以上的整数<br/>
      物理页状态：必填，没有物理页状态，请用0来代替；有物理页状态，请用1以上整数<br/>
      热框区：必填，1以上的整数<br/>
    </span>
    <span>
      整个音频文件名为：1-0-1或1-0_1<br/>
      第一个，数字1，代表物理页；<br/>
      第二个，数字0，代表这个物理页没有多个状态，写0即可；<br/>
      第三个，数字1，代表代表热区框序号；<br/>
    </span>
    <span>
      当想导入整本书的真人录音音频，请在本地，先把音频全部按照规则命名，示例如图所示：
    </span>
    <span><img src="/static/images/pic6.png" width="261" height="213"/></span>
    <span>然后再点击批量导入真人录音按钮，在上传前会先进行文件自检，仅当文件全部符合规范方可上传。若遇到音频文件自检有上传失败的情况，请检查音频文件是否符合上传标准。</span>
    <h2>以上说明若仍然未帮助到您，请详见：操作说明手册链接<a href="https://www.showdoc.cc/bailubtr?page_id=2933357674946501" target="_blank">https://www.showdoc.cc/bailubtr?page_id=2933357674946501</a>
    </h2>
  </div>


  <div class="upload-audio" id="fingerShowUploadProGroup" style="width: 100%;display: none">
    <div class="box-upload">
      <div class="box-upload-t">
        <dl>
        <#--<img  width="65" height="64" />-->
          <dt class="upload-line" id="fingerFileCheck">1</dt>
          <dd>文件自检</dd>
        </dl>
      <#--红色的线-->
      <#--<div class="upload-gules"></div>-->
      <#--灰色的线-->
        <div class="upload-gray" id="checkFingerFinish"></div>
        <dl>
        <#--< img  width="65" height="64" />-->
          <dt class="upload-line" id="fingerFileUpload">2</dt>
          <dd>上传文件</dd>
        </dl>
        <div class="upload-gray" id="fingerUploadFinish"></div>
        <dl>
          <dt class="upload-line" id="fingerDataSave">3</dt>
          <dd>写入保存</dd>
        </dl>
      </div>
    </div>
  </div>
</div>


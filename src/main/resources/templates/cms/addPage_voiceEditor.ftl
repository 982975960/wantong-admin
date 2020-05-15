<@script src="/js/wangEditor/wangEditor.min.js"/>
<div id="voiceEditorTemplate" class="picture-book-page-add-voice-editor" style="display:none"
     xmlns="http://www.w3.org/1999/html">
  <ul class="nav nav-tabs">
    <@checkPrivilege url = "/virtual/voiceEditor/multiroleSpeechSynthesis.do">
    <li id="tab_3" index="3" role="presentation"><a href="#">多角色语音合成</a></li>
    </@checkPrivilege>
    <@checkPrivilege url = "/virtual/voiceEditor/oneRoleSpeechSynthesis.do">
    <li id="tab_1" index="1" role="presentation"><a href="#">单角色语音合成</a></li>
    </@checkPrivilege>
    <@checkPrivilege url = "/virtual/voiceEditor/realPersonVoiceUpload.do">
    <li id="tab_0" index="0" role="presentation" class="active"><a href="#">真人录音</a></li>
    </@checkPrivilege>
  </ul>
  <div id="tab_0_content" class="row voice-panel" style="overflow: hidden">
    <div class="row voice-item">
      <div id="uploadButton" class="col-md-12 text-center">
        <span class="glyphicon glyphicon-cloud-upload icon" aria-hidden="true"></span>
        <span id="uploadFileName"> 点此上传音频文件</span>
        <span id="hint" style="display: block;margin-top: 15px;font-size: 90%">(mp3格式、采样率24000HZ、比特率56kbps)</span>
      </div>
    </div>

    <div style="display: none" id="uploadTemplate">
      <span class="glyphicon glyphicon-cloud-upload icon" aria-hidden="true"></span>
      <span id="uploadFileName"> 点此上传音频文件</span>
      <span id="hint" style="display: block;margin-top: 15px;font-size: 90%">(mp3格式、采样率24000HZ、比特率56kbps)</span>
    </div>
    <div class="row operation-container">
      <div class="col-md-12">
        <button type="button" id="saveBtn" class="btn btn-danger">保存</button>
      </div>
    </div>
  </div>
  <div id="tab_1_content" class="row voice-panel" style="display:none ;overflow: hidden">
    <div class="row">
      <div class="col-md-12">
        <div class="form-group">
          <label for="name">需要朗读的文本：</label>
          <!--event.returnValue=false placeholder="文本不能超过150个字数" maxlength="150" -->
          <textarea id="text" class="form-control" rows="5" style="font-size: 16px" ></textarea>
        </div>
      </div>
    </div>
    <div class="row" id="intelligenceTTS">
      <div class="col-md-12">
        <div class="form-group">
          <input type="checkbox" id="useIntelligenceTTS" value="1" checked="checked">
          <label for="name">智能语音合成</label>
        </div>
      </div>
    </div>

    <div class="row" id="checkDBtts" name="${partnerId}">
      <div class="col-md-12">
        <div class="form-group">
          <input type="checkbox" id="useDBTTS" value="3">
          <label for="name">TTS语音合成</label>
        </div>
      </div>
    </div>

    <div id="speakerArea" class="row">
      <div class="col-md-12">
        <ul class="nav nav-tabs">
          <li id="speaker_tab_0" index="0" role="presentation" class="active"><a href="#">中文发音人</a></li>
          <li id="speaker_tab_1" index="1" role="presentation"><a href="#">英文发音人</a></li>
        </ul>
        <div class="row speaker-container">
          <div class="col-md-12" id="chSpeakerRedio">

            <div class="row  voice-selector-line">
              <div class="col-md-12">
                <label for="name">女声：</label>
                <ul>
                  <li><input type="radio" name="chSpeaker" id="chSpeaker" value="2" checked>&nbsp;小孩</li><!--女声-3-->
                  <li><input type="radio" name="chSpeaker" id="chSpeaker" value="10">&nbsp;成女</li><!--女声-8-->
                  <li><input type="radio" name="chSpeaker" id="chSpeaker" value="11">&nbsp;温柔女</li><!--女声-9-->
                </ul>
              </div>
            </div>

            <div class="row  voice-selector-line">
              <div class="col-md-12">
                <label for="name">男声：</label>
                <ul>
                  <li><input type="radio" name="chSpeaker" id="chSpeaker" value="5">&nbsp;成男</li><!--男生-1-->
                </ul>
              </div>
            </div>

          </div>

          <div class="col-md-12" id="enSpeakerRedio">
            <div class="row  voice-selector-line">
              <div class="col-md-12">
                <label for="name">女声：</label>
                <ul>
                  <li><input type="radio" name="chSpeaker" id="chSpeaker" value="14">&nbsp;成女</li>
                </ul>
              </div>
            </div>

            <div class="row  voice-selector-line">
              <div class="col-md-12">
                <label for="name">男声：</label>
                <ul>
                  <li><input type="radio" name="chSpeaker" id="chSpeaker" value="15">&nbsp;成男</li>
                </ul>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
    <div id="DBspeakerArea" disabled="disabled" class="row" style="margin-left: 0px;margin-right: 0px">
      <div class="row  speaker-container" style="border-top: 1px solid #ddd;overflow: hidden;height: 119px">
        <div class="col-md-12">
          <ul>
            <li><input type="radio" name="chSpeak" id="chSpeak" value="3" checked>&nbsp;甜美女声</li>
            <li><input type="radio" name="chSpeak" id="chSpeak" value="8">&nbsp;邻家女声</li>
          </ul>
        </div>
      </div>
    </div>
    <div class="row operation-container">
      <div class="col-md-12">
        <input type="hidden" id="tempFileName">
        <input type="hidden" id="clientFileName">
        <button type="button" id="previewBtn" class="btn btn-warning">
          <img src="static/images/soundplaying.gif" width="15" height="15" style="display:none">&nbsp;试听
        </button>
        <button type="button" id="saveBtn" class="btn btn-danger">保存</button>
      </div>
    </div>

  </div>
  <div id="tab_3_content" class="row voice-panel" style="display:none ; overflow: hidden">
    <div class="row">
      <div class="col-md-12">
        <div class="form-group">
          <label for="role">角色定义(给书中的角色指定发音角色)：</label>
          <!--event.returnValue=false placeholder="文本不能超过150个字数" maxlength="150" -->
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col-md-12">
      <@checkPrivilege url="/cms/saveBookAudioRoles.do">
        <button type="button" id="addRole" class="btn btn-default btn-xs">
          <span class="glyphicon glyphicon-plus"></span>添加角色
        </button>
      </@checkPrivilege>
      </div>
    </div>
    <div class="row role-wrapper">
      <div class="col-md-12">
        <div class="role-container" style="margin: 5px 0; height: 120px; border: 1px solid #ccc;overflow-y:auto">
          <div id="roleTemplate" class="role-block" style="display: none;">
            <span maxlength="10" class="role-name" value=""></span>
            <label class="voice-name" voiceId="" colorCotent="">为角色选择发音</label>
            <label class="voice-color"></label>
          </div>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col-md-12">
        <div class="form-group">
          <label for="name">需要朗读的文本：</label>
          <!--event.returnValue=false placeholder="文本不能超过150个字数" maxlength="150" -->
          <form class="text-form" data-toggle="context">
            <div id="contextMenu">
              <ul class="dropdown-menu" role="menu">
              </ul>
            </div>
          </form>

          <div id="roleTextId" contenteditable="true" class="form-control" rows="5" placeholder="单个角色不得超过256个字符" maxlength="256" style="min-height: 320px">
          <input placeholder="输入文字后，选中文字，右键选发音角色，所选文字不能超过256个字。" style="border: none;width: 100%;">
          </div>
        </div>
      </div>
    </div>

    <!-- 语音试听 -->
    <div id="editorProgressBar" class="row create-page-form-3" style="width: auto;">
      <div class="col-md-12 text-center">
        <div class="voice-editor">
          <div class="voice-editor-progress" style="width: 80%">
            <span>试听</span>
            <span id="previewBtn" class="voice-editor-btn glyphicon glyphicon-play"></span>
            <span class="voice-editor-btn-stop glyphicon glyphicon-stop"></span>
            <span class="voice-editor-start"></span>
            <div class="voice-editor-progress-bar">
              <div class="voice-editor-now"></div>
            </div>
            <span class="voice-editor-end"></span>
          </div>
        </div>
      </div>
    </div>
    <!-- 语音试听结束 -->
    <div class="row operation-container">
      <div class="col-md-12">
        <input type="hidden" id="tempFileName">
        <input type="hidden" id="clientFileName">
<#--        <button type="button" id="previewBtn" class="btn btn-warning">-->
<#--          <img src="static/images/soundplaying.gif" width="15" height="15" style="display:none">&nbsp;试听-->
<#--        </button>-->
        <button type="button" id="saveBtn" class="btn btn-danger">保存</button>
      </div>
    </div>
  </div>

  <div id="audition" class="form-group" style="display: none;position: absolute;z-index: 99999999;background-color: #d0caca;height:26px ">
    <button  class="audio-play glyphicon glyphicon-volume-up" style="height: 24px;width: 29px"></button>
    <span class="audio-player" id="audio_player" style="text-align: center;width: 80px;display: inline-block"></span>
  </div>
  <div id="roleSelect" class="role-select-template" style="display: none;">
    <div class="role-name-input">
      <div class="input-name" style="display: inline-block;">输入角色名:</div>
      <input id="nameInput" class="form-control" maxlength="15" placeholder="请输入角色名">
    </div>
    <#--标贝多角色语音合成的表-->
    <ul class="nav nav-tabs" style="border: none;margin-left: 33px">
      <@checkPrivilege url = "/virtual/voiceEditor/multiroleSpeechSynthesis.do">
        <li id="commonTab_0" index="0" role="presentation" class="active"><a href="#">普通音色</a></li>
      </@checkPrivilege>

      <@checkPrivilege url = "/virtual/highQualitySound.do">
        <li id="highTab_1" index="1" role="presentation" ><a href="#">高质音色</a></li>
      </@checkPrivilege>
    </ul>
    <#--sprint 7-注释 -->
    <#--<div class="title-name" style="margin-left: 32px;font-weight: bold;margin-bottom: 10px;">-->
      <#--给角色选择音色：-->
    <#--</div>-->
    <div class="select-wrapper"  id="selectWrapper">
      <#--高级音色-->
      <div id = "commonTabContent" class="row role-item" style="overflow: hidden;margin-left: 0px">
        <div class="type-wrapper man-voice">
          <div class="type-name">成年男声:</div>
          <div class="type-select">
          </div>
        </div>
        <div class="type-wrapper woman-voice">
          <div class="type-name">成年女声:</div>
          <div class="type-select">
          </div>
        </div>
        <div class="type-wrapper child-voice">
          <div class="type-name" style="height: 50px;margin-top: 31px">童　　声:</div>
          <div class="type-select" style="height: 50px;margin-top: 31px">
          </div>
        </div>
      </div>
      <#--普通音色-->
      <div id="highTabContent" class="role-item" style="overflow: hidden;display: none;">
        <div class="type-wrapper" style="margin-top: 18px;margin-left: 32px">
          <#--选择角色-->
            <div class="type-select" style="width: 100%;height: 214px">
            </div>
        </div>
      </div>

      <div class="listen-form" style="margin-left: 28px">
        <span style="border: 1px solid #0C0C0C; background-color: #DEDEDE; display: inline-block; width: 79%; height: 44px;float: left;margin-top: 54px ; letter-spacing: 3px ; padding: 5px"  >玩瞳科技致力于教育领域的创新应用，引领多模交互的智能阅读。</span>
        <button type="button" style="float: left;margin-left: 5px; margin-top: 56px;" class="btn btn-primary">
        <img src="static/images/soundplaying.gif" width="15" height="15" style="display:none">&nbsp;发音试听
        </button>
      </div>
    </div>
    <div class="btn-container row" style="margin-left: 0px;margin-right: 0px">
      <div class="col-md-12" style="text-align: center; float: left; width: 100%;">
        <button type="button" id="notarize" class="btn btn-primary">确定</button>
        <button type="button" id="cancel" class="btn btn-primary">取消</button>
      </div>
    </div>
  </div>
  <div id="toneSelect" class="form-control" style="display: none;">
     <div class="col-lg-6">
       <div class="input-group">
         <input type="text" id="toneval" class="form-control" onkeyup="value = value.replace(/[^a-z]/g, '')"  onbeforepaste="clipboardData.setData('text',clipboardData.getData('text').replace(/[^a-z]/g,''))" style="margin-top: 30px ;margin-left: 20px" placeholder="输入拼音" maxlength="6">
       </div>
     </div>
     <div class="form-group" style="float: left;margin-top: 30px ;margin-left: 20px" >
       <select class="con-r-top-l-frame frame-line" id="toneNum" >
         <option value="-1" selected="true" disabled="true">选择声调</option>
         <option value="1">一声</option>
         <option value="2">二声</option>
         <option value="3">三声</option>
         <option value="4">四声</option>
         <option value="0">轻声</option>
       </select>
     </div>
    <div class="btn-container row" style="margin-left: 0px;margin-right: 0px;text-align: center">
      <div class="col-md-12" >
        <button type="button" id="saveTone" class="btn btn-primary">确定</button>
        <button type="button" id="cancelTone" class="btn btn-primary">取消</button>
      </div>
    </div>
  </div>
</div>

<style>
#roleText .audio-play {
  height: 20px;
  background: #CCC;
  line-height: 20px;
  padding: 0 5px;
  border-radius: 5px;
  border: 0px;
}
.audio-part {
  cursor: pointer;
  border-radius: 10px;
  padding: 2px 5px 2px 5px;
  border: 2px solid #ffffff;
  margin-right: 2px;
  color:white;
}


.audio-part:hover {
  -webkit-box-shadow: 0 0 10px #0CB;
  -moz-box-shadow: 0 0 10px #0CC;
  box-shadow: 3px 3px 3px 0px #d8dcdc;
  color:white;
  /* Border: 2px solid #ffffff; */
}

#roleText button {
  display: none;
}

.toolbar{
  display: none;
}

.select-wrapper {
  width: 90%;
  margin: 0 auto;
  height: 65%;
  border: 1px solid #ccc;
  background-color: white;
}
.select-wrapper .type-wrapper {
  margin-top: 5px;
  margin-left: 8px;
}

.btn-container button {
  margin: 10px 25px 0 25px;
}

.select-wrapper .type-name {
  display: inline-block;
  float: left;
  width: 20%;
  height: 57px;
  line-height: 20px;
}
.select-wrapper .type-select {
  display: inline-block;
  float: left;
  width: 79%;
  height: 73px;
}

.select-wrapper .radio-inline {
  height: 40px;
  margin-left: 0px;
  line-height: 20px;
  width: 25%;
}

.select-wrapper .child-voice .radio-inline {
  width: 16.6%;
}

#roleText {
  min-width: 100%;
  min-height: 100px;
  overflow-y: scroll;
  word-wrap: break-word;
}

.role-block {
  border: 1px solid #CCCCCC;
  border-radius: 5px;
  padding: 1 5px;
  background: #F3F3F3;
  height: 30px;
  text-align: center;
  line-height: 27px;
  margin-left: 10px;
  margin-top: 5px;
}

.role-block .role-name {
  width: 80px;
  background: #F3F3F3;
  padding: 0 5px 0 5px;
  margin: 0 3px 0 6px;
  border: 0px solid #CCCCCC;
  border-left: 1px;
  border-right: 1px;
}

.role-block .voice-name {
  cursor: pointer;
  background: white;
  padding: 0 5px;
  margin: 0 3px;
  background: white;
  padding: 0 5px;
  margin: 0 3px;
  border: 0px solid #CCCCCC;
  border-left: 1px;
  border-right: 1px;

}
.role-block .voice-color{
  background-color: red;
  width: 9px;
  height: 28px;
  vertical-align: middle;
  margin-left: -6px;
  border-radius: 5px;
}
.role-block .delete-button {
  border: 0px;
  height: 24px;
  margin-right: 5px;
  background: transparent;
}
.role-name-input{
  margin-left: 35px;
  margin-top: 26px;
  margin-bottom: 29px;
}
.role-name-input .input-name{
  display: inline-block;
}
.role-name-input .form-control{
  display: inline-block;
  width: 36%;
  height: 29px;
  margin-left: 37px;
}
</style>

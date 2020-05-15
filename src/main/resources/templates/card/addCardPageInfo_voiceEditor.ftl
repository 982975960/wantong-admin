
<div id="voiceEditorTemplate" class="picture-book-page-add-voice-editor" style="display:none"
     xmlns="http://www.w3.org/1999/html">
    <ul class="nav nav-tabs">
        <@checkPrivilege url = "/virtual/card/multiroleSpeechSynthesis.do">
            <li id="tab_1" index="1" role="presentation"><a href="#">单角色语音合成</a></li>
        </@checkPrivilege>
        <@checkPrivilege url = "/virtual/card/realPersonVoiceUpload.do">
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
                    <textarea id="text" class="form-control" rows="5" style="font-size: 16px;height: 200px" ></textarea>
                </div>
            </div>
        </div>
        <div class="row" id="checkDBtts" >
            <div class="col-md-12">
                <div class="form-group">
                    <label for="name">选择音色</label>
                </div>
            </div>
        </div>
        <div class="select-wrapper"  id="selectWrapper">
            <div id="DBspeakerArea" disabled="disabled" class="row" style="margin-left: 0px;margin-right: 0px">
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
            <div class="listen-form" style="margin-left: 28px">
                <span style="border: 1px solid #0C0C0C; background-color: #DEDEDE; display: inline-block; width: 79%; height: 44px;float: left; letter-spacing: 3px ; padding: 5px"  >玩瞳科技致力于教育领域的创新应用，引领多模交互的智能阅读。</span>
                <button type="button" style="float: left;margin-left: 5px; margin-top: 2px;" class="btn btn-primary">
                    <img src="static/images/soundplaying.gif" width="15" height="15" style="display:none">&nbsp;发音试听
                </button>
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
</div>

<style>
    .select-wrapper {
        width: 100%;
        margin: 0 auto;
        height: 46%;
        border: 1px solid #ccc;
        background-color: white;
    }
    .select-wrapper .type-wrapper {
        margin-top: 5px;
        margin-left: 8px;
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
</style>
<@link href="/css/card/cardAddPage.css" rel="stylesheet"/>
<@script src="/js/card/addCardPageInfo.js"></@script>
<@script src="/js/card/addCardPageInfo_voiceManager.js"></@script>
<@script src="/js/card/addCardPageInfo_voiceEditor.js"></@script>
<@script src="/js/common/Sortable.js"/>
<@script src="/js/common/jquery-sortable.js"/>
<@script src="/js/common/bootstrap-contextmenu.js" />
<#--书页和资源的界面-->
<div id="cardPageAdd" class="picture-book-page-add" tabindex="1" style="outline: none;height: 100%;">
    <nav class="navbar navbar-default navbar-static-top flt" style="background-color: #fff;width: 200px;border-right: 1px solid #c3c2bfbd;">
        <div id="frontAndBackButton">
            <div>
                <button id="frontBtn" class="btn-info Button-line set-repo-admin-btn " >正面</button>
                <button id="backBtn" class="btn-info Button-line set-repo-admin-btn" >反面</button>
            </div>
        </div>
    </nav>

    <div id="cardPageEdit" class="flt">
        <#-- 卡片名称     -->
        <div class="row create-page-form-1">
            <div class="col-md-12">

                <form class="form-inline" id="createPageForm" action="" method="post">
                    <div class="form-group" style="margin-left: 10px;">
                        <label for="cardName"><h5>卡片名称：</h5></label>
                        <input id="cardName" isAuthority=true style="width:200px" type="text" maxlength="40" class="form-control">
                    </div>
                </form>
            </div>
        </div>

        <!-- 图片上传及以及资源编辑模块 -->
        <div id="picManager" class="row pic-upload-panel" style="height:35%">
            <div id="sampleImageDiv">
                <div id="image1" class="uploadImage" style="position: relative;margin-left: 15%;width: 30%;margin-top: 2.2%;">
                    <label>上传采样图</label>
                    <label style="visibility: hidden;">请上传扫描图或设计样图（JPG格式）</label>
                    <div  class="page-status-container" style="position: absolute;margin-left: 50px;margin-top: 10px;">
                        <span id="status" class="label picture-book-status label-default">未标定</span>
                    </div>
                    <div id="previewImgDiv">
                            <img id="sampleImg"
                                 src="/static/images/caiyang1.jpg"
                                 style="" alt="绘本页拍照图" class="img-thumbnail" defaultSrc="/static/images/caiyang1.jpg">
                        </div>
                    <div id="btnBg" style="position: absolute;margin-left: 52px;top: 58px;display: none;left: 0px;">
                            <img src="/static/images/bigBg.png" style="width: 185px;height: 108px">
                        </div>
                    <div id="bigButton" style="position: absolute;margin-left: 120px;display: none;left: 0px;">
                            <span class="glyphicon glyphicon-zoom-in" aria-hidden="true"></span>
                    </div>

                    <div style="visibility: <@checkPrivilege url = "/card/uploadImage.do" def="hidden">unset</@checkPrivilege>;">
                        <div id="sampleUploadBtn" class="uploadImageBtn" style="float: left;margin-top: 10px;margin-left: 50px;">上传图片</div>
                        <button id="fingerBtn" class="frame-Button-b" style="margin-left: -40px;">标定卡片</button>
                    </div>
                </div>
                <div id="image2" class="uploadImage" style="position: relative;margin-left: 10%;width: 30%;margin-top: 2.2%;">
                    <label>上传扫描图</label>
                    <label>请上传扫描图或设计样图（JPG格式）</label>
                    <div id="previewImgDiv">
                        <img id="scanImg"
                             src="/static/images/caiyang1.jpg"
                             style="" alt="绘本页拍照图" class="img-thumbnail" defaultSrc="/static/images/caiyang1.jpg">
                    </div>
                    <div id="btnBg" style="position: absolute;margin-left: 52px;top: 58px;display: none;left: 0px;">
                        <img src="/static/images/bigBg.png" style="width: 185px;height: 108px">
                    </div>

                    <div id="bigButton" style="position: absolute;margin-left: 120px;display: none;left: 0px;">
                        <span class="glyphicon glyphicon-zoom-in" aria-hidden="true"></span>
                    </div>
                    <div style="visibility: <@checkPrivilege url = "/card/uploadImage.do" def="hidden">unset</@checkPrivilege>;">
                         <div id="scanUploadBtn" class="uploadImageBtn" style="margin-top: 10px;width: 88px;margin-left: 35%;">上传图片</div>
                     </div>
                </div>
            </div>
        </div>
        <div id="voiceManger" class="row create-page-form-2" style="height: 40%" >
            <div class="col-md-12">
                <ul class="nav nav-tabs">
                    <li role="presentation" index="0" class="voiceTabItem active"><a href="#">语音</a></li>
                    <li class="voiceTabItem" index="1" role="presentation"><a href="#">背景音乐</a></li>
                    <li class="voiceTabItem" index="2" role="presentation"><a href="#">音效</a></li>
                    <@checkPrivilege url = "/virtual/card/editExtraData.do">
                      <li class="voiceTabItem no-play-bar" index="3" role="presentation"><a href="#">ExtraData</a></li>
                    </@checkPrivilege>
                    <@checkPrivilege url = "/virtuak/card/editVideoUrl.do">
                        <li class="voiceTabItem no-play-bar" index="4" role="presentation"><a href="#">视频链接</a></li>
                    </@checkPrivilege>
                </ul>
                <audio id="mp3Player" style="display:none" autoplay="autoplay">
                    <source src=""></source>
                </audio>
                <div id="tab_0_content" class="row voice-panel" style="height: 246px;" >
                    <ul>
                        <li class="new-item">
                            <div class="row voice-item">
                                <div class="col-md-5">
                                    <div id="addNewVoiceBtn" class="button" style="display:
                                    <@checkPrivilege url = "/virtual/pageEditor/editingThePage.do" def="none">block</@checkPrivilege>
                                            ;">
                                        &nbsp;
                                        <span class="glyphicon glyphicon-plus-sign" aria-hidden="true"></span>
                                        <span> &nbsp;&nbsp;添加新语音...</span>
                                    </div>
                                </div>
                                <div class="col-md-7 time-setup-container">
                                    &nbsp;
                                </div>
                            </div>
                        </li>
                        <li id="voiceItemTemplate" style="display:none">
                            <div class="row voice-item">
                <span class="label label-info" id="voiceType"
                      style="display: inline-block;float: left;width: 65px;margin-top: 8px;margin-left: -3px;margin-right: 16px;font-weight: normal;font-size: 90%;display: none">信息标签</span>
                                <div style="display: inline-block" id="rowIndex" class="col-md-1">&nbsp;</div>
                                <div class="col-md-5" style="display: inline-block;width: 35%">
                                    <span id="playBtn" class="glyphicon glyphicon-volume-up"
                                          aria-hidden="true">&nbsp;</span>
                                    <img id="playingIcon" src="static/images/soundplaying.gif"
                                         style="display:none;width: 14px;height: 14px">
                                    <span id="fileName"> 编辑中...</span>
                                    <span id="editBtn" class="glyphicon glyphicon-edit" aria-hidden="true" style="display:
                                    <@checkPrivilege url = "/virtual/pageEditor/editingThePage.do" def="none">inline-block</@checkPrivilege>
                                            ;"></span>
                                </div>
                                <div class="col-md-4 time-setup-container0" style="display: inline-block;width: 31%">
                                    <h5>与上一条语音的间隔(秒)</h5>
                                    <input type="text" class="form-control" style="width:70px" value="0.70"
                                            <@checkPrivilege url = "/virtual/pageEditor/editingThePage.do" def="disabled='disabled'"></@checkPrivilege>
                                           id="intervalTime" placeholder="0.00">
                                    <input type="text" style="display: none" value="0.00" id="startAt"
                                           placeholder="0.00">
                                </div>
                                <div id="durationContainer" class="col-md-1" style="display: inline-block">&nbsp;</div>
                                <div class="col-md-1  text-right delete-button" style="display: inline-block;width:7%">&nbsp;
                                    <#--判断有没有书页的编辑权限，如果有权限，才会有删除音频的权限-->
                                    <@checkPrivilege url = "/virtual/pageEditor/editingThePage.do">
                                        <span id="deleteButton" class="glyphicon glyphicon-remove-sign" aria-hidden="true"
                                              style="display:none"></span>
                                    </@checkPrivilege>
                                </div>
                            </div>
                        </li>
                    </ul>
                </div>
                <div id="tab_1_content" class="row voice-panel" style="display:none;height: 246px">
                    <ul>
                        <li class="new-item">
                            <div class="row voice-item">
                                <div class="col-md-5">
                                    <div id="addNewVoiceBtn"
                                         class="button" style="width: 185px;display:
                                    <@checkPrivilege url = "/virtual/pageEditor/editingThePage.do" def="none">block</@checkPrivilege>
                                            ;">
                                        &nbsp;
                                        <span class="glyphicon glyphicon-plus-sign" aria-hidden="true"></span>
                                        <span> &nbsp;&nbsp;添加新背景音乐...</span>
                                    </div>
                                </div>
                                <div class="col-md-7 time-setup-container">
                                    &nbsp;
                                </div>
                            </div>
                        </li>
                        <li id="voiceItemTemplate" style="display:none">
                            <div class="row voice-item">
                                <div id="rowIndex" class="col-md-1" style="display: inline-block">&nbsp;</div>
                                <div style="display: inline-block" class="col-md-4">
                                    <span id="playBtn" class="glyphicon glyphicon-volume-up"
                                          aria-hidden="true">&nbsp;</span>
                                    <img id="playingIcon" src="static/images/soundplaying.gif"
                                         style="display:none;width: 14px;height: 14px">
                                    <span id="fileName"> 编辑中...</span>
                                    <span id="editBtn" class="glyphicon glyphicon-edit" aria-hidden="true" style="display:
                                    <@checkPrivilege url = "/virtual/pageEditor/editingThePage.do" def="none">inline-block</@checkPrivilege>
                                            ;"></span>
                                </div>
                                <div style="display: inline-block" class="col-md-3 time-setup-container">
                                    <input type="text" class="form-control" value="0.00" style="width:70px;margin-top: 0px" id="startAt"
                                            <@checkPrivilege url = "/virtual/pageEditor/editingThePage.do" def="disabled='disabled'"></@checkPrivilege>
                                           placeholder="0.00"><h5 style="margin-top: 8px">秒开始播放</h5>
                                </div>
                                <div style="display: inline-block" class="col-md-2 time-setup-container">
                                    <input type="checkbox" id="loop" checked style="margin-top: 8px !important;"><h5 style="margin-top: 8px">循环播放</h5>
                                </div>
                                <div style="display: inline-block" id="durationContainer" class="col-md-1">&nbsp;</div>
                                <div style="display: inline-block" class="col-md-1  text-right delete-button">&nbsp;
                                    <#--判断有没有书页的编辑权限，如果有权限，才会有删除音频的权限-->
                                    <@checkPrivilege url = "/virtual/pageEditor/editingThePage.do">
                                        <span id="deleteButton" class="glyphicon glyphicon-remove-sign" aria-hidden="true"
                                              style="display:none"></span>
                                    </@checkPrivilege>
                                </div>
                            </div>
                        </li>
                    </ul>
                </div>
                <div id="tab_2_content" class="row voice-panel" style="display:none;height: 246px">
                    <ul>
                        <li class="new-item">
                            <div class="row voice-item">
                                <div class="col-md-5">
                                    <div id="addNewVoiceBtn" class="button" style="display:
                                    <@checkPrivilege url = "/virtual/pageEditor/editingThePage.do" def="none">block</@checkPrivilege>
                                            ;">
                                        &nbsp;
                                        <span class="glyphicon glyphicon-plus-sign" aria-hidden="true"></span>
                                        <span> &nbsp;&nbsp;添加新音效...</span>
                                    </div>
                                </div>
                                <div class="col-md-7 time-setup-container">
                                    &nbsp;
                                </div>
                            </div>
                        </li>
                        <li id="voiceItemTemplate" style="display:none">
                            <div class="row voice-item">
                                <div style="display: inline-block" id="rowIndex" class="col-md-1">&nbsp;</div>
                                <div style="display: inline-block" class="col-md-5">
                                    <span id="playBtn" class="glyphicon glyphicon-volume-up"
                                          aria-hidden="true">&nbsp;</span>
                                    <img id="playingIcon" src="static/images/soundplaying.gif"
                                         style="display:none;width: 14px;height: 14px">
                                    <span id="fileName"> 编辑中...</span>
                                    <span id="editBtn" class="glyphicon glyphicon-edit" aria-hidden="true" style="display:
                                    <@checkPrivilege url = "/virtual/pageEditor/editingThePage.do" def="none">inline-block</@checkPrivilege>
                                            ;"></span>
                                </div>
                                <div style="display: inline-block" class="col-md-4 time-setup-container">
                                    <input type="text" class="form-control" style="width:70px" value="0.00" id="startAt"
                                           placeholder="0.00"
                                            <@checkPrivilege url = "/virtual/pageEditor/editingThePage.do" def="disabled='disabled'"></@checkPrivilege>
                                    ><h5>秒开始播放</h5>
                                </div>
                                <div style="display: inline-block" id="durationContainer" class="col-md-1">&nbsp;</div>
                                <div style="display: inline-block" class="col-md-1  text-right delete-button">&nbsp;
                                    <#--判断有没有书页的编辑权限，如果有权限，才会有删除音频的权限-->
                                    <@checkPrivilege url = "/virtual/pageEditor/editingThePage.do">
                                        <span id="deleteButton" class="glyphicon glyphicon-remove-sign" aria-hidden="true"
                                              style="display:none"></span>
                                    </@checkPrivilege>
                                </div>
                            </div>
                        </li>
                    </ul>
                </div>
                <div id="tab_3_content" class="row voice-panel" style="display:none;height: 246px">
                    <#--video-data-->
                    <div id="extra-data" class="video-text">
                        <div class="panel-body">
                            <textarea id="extraData" placeholder="请填写自定义的ExtraData" style="overflow-y: auto;resize: none" maxlength="256"></textarea>
                        </div>
                    </div>
                </div>
                <div id="tab_4_content" class="row voice-panel" style="display:none;height: 263px">
                    <#--video-data-->
                    <div id="video-data" class="video-text">
                        <div class="panel-body">
                            <textarea id="videoText" placeholder="请填写视频链接地址" style="overflow-y: auto;resize: none" maxlength="256"></textarea>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="voice-progress-bar row create-page-form-3">
            <div class="col-md-12 text-center">
                <div class="voice-test">
                    <div class="voice-test-progress">
                        <span>试听</span>
                        <span id="voice-test-btn" class="voice-test-btn glyphicon glyphicon-play"></span>
                        <span id="voice-test-btn-stop" class="voice-test-btn-stop glyphicon glyphicon-stop"></span>
                        <span class="voice-test-start"></span>
                        <div class="voice-test-progress-bar">
                            <div class="voice-test-now"></div>
                        </div>
                        <span class="voice-test-end"></span>
                    </div>
                    <div id="examineBtn" style="display: none">
                        <div id="examineSuccess" class="col-md-1" style="height: 66%; margin-left: 67%">
                            <button id="examineSuccessBtn"
                                    style="bottom:0px;position: absolute;min-width: 130px;margin-left: 3px;padding-top: 7px"
                                    type="button"
                                    class="btn btn-primary" >审核通过
                            </button>
                        </div>
                        <div id="examineFail" class="col-md-1" style=" height: 100%;">
                            <button id="examineFailBtn"
                                    style="bottom:0px;position: absolute;min-width: 130px ;margin-left: 77px;padding-top: 7px"
                                    type="button"
                                    class="btn btn-primary" >审核不通过
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div style="width: 100%;float: left;">
            <div class="save-button-container">
                <button id="saveAndNextButton" style="min-width: 130px" type="button" class="btn btn-primary"
                        >保存
                </button>
            </div>
        </div>
    </div>
</div>
<#include "addCardPageInfo_voiceEditor.ftl"/>
<style>
    #frontAndBackButton{
        padding-top: 100%
    }
    .navbar {
        background-color: #fff;
        width: 200px;
    }
    .btn-info{
        margin-left: 20%;
        margin-top: 20px;
        width: 120px;
        height: 40px;
    }
    .uploadImage{
        display: block;
        margin-left: 20%;
    }
    .frame-Button-b{
        margin-top: 10px;
    }
    #extraData {
        height: 218px;
        width: 100%;
        line-height: 1;
        font-size: 14px;
        letter-spacing: 2px;
        padding: 5px;
        resize: none;
    }
    #videoText{
        height: 213px;
        width: 100%;
        line-height: 1;
        font-size: 14px;
        letter-spacing: 2px;
        padding: 5px;
        resize: none;
    }
    .btnfoucs {
        color: #fff;
        background-color: #31b0d5;
        border-color: #1b6d85;
    }
</style>

<script>
    wantong.addCardPageInfo.init({
        cardId:${cardId},
        imageType:${imageType},
        groupId:${groupId},
        roles:${roles}
    });
</script>
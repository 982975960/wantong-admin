<@script src="/js/cms/pageadd.js"></@script>
<@script src="/js/cms/pageadd_pagelist.js"></@script>
<@script src="/js/cms/pageadd_voiceeditor.js"></@script>
<@script src="/js/cms/pageadd_voicemanager.js"></@script>
<@script src = "/js/cms/pageadd_batchuploadaudio.js"></@script>
<@script src="/js/common/Sortable.js"/>
<@script src="/js/common/jquery-sortable.js"/>
<@script src="/js/common/bootstrap-contextmenu.js" />
<div id="pageAdd" class="picture-book-page-add" tabindex="1" style="outline: none;" xmlns="http://www.w3.org/1999/html">
  <nav class="navbar navbar-default navbar-static-top flt" style="background-color: #fff">
    <div hidden id="allowNull" isAllow = "<@checkPrivilege url="/virtual/allowBookResourcesNull.do" def="false">true</@checkPrivilege>"></div>
    <div id="pageList" style="width: 200px;height: 100%;padding-top: 10px;">
      <#--批量上传语音的按钮-->
      <div id="batchUploadAudioBtn" class="button" onmouseover="this.style.backgroundColor='#D3D3D3'" onMouseOut="this.style.backgroundColor='white'" style="display: inline-block;margin-left: 16px;float: left;cursor: pointer">
        <span style="background: #42bcef;padding: 8px 10px;color: #ffffff; float: left;">批量上传真人录音</span>
      </div>
       <div id="helpBtn" class="button" style="margin-top: 5px;margin-left: 11px;float: left;">
         <img src="/static/images/help.png" style="width: 20px">
       </div>
      <#--批量上传音频文件按钮-->
      <#--<div id="hint" style="float: right">-->
        <#--<img src="/static/images/hint-ico.png" id="hint-span" onmouseover="this.style.backgroundColor='#D3D3D3'" onMouseOut="this.style.backgroundColor='white'"  style="background: url(/static/images/hint-ico.png)no-repeat;">-->
      <#--</div>-->

      <div id="pageListContainer" class="page-list-container" style="
        <@checkPrivilege url="/cms/packUpResource.do">height: 90%</@checkPrivilege>
        ">
        <div id="itemTemplate" class="col-md-2" style="display:none; width: 100%">
          <div id="thumbnailContainer" class="thumbnail-container text-center center-block">
            <div id="thumbnail" class="page-thumbnail-container">
              <img
                  src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIwAAACgBAMAAAAsgJlAAAAAGFBMVEXc29y7u7zExMXU09TNzM3JyMnQ0NHAv8ANuow4AAABgElEQVRo3u3UvW7CMBSG4dOG0LU2DazYhbI6MT8rgRRWirgA4AoKS2+/JyZEqoJUW2zoeyTWN/YnEgIAAAAAAAAAAHgk7XcqPffpLq0OlZ5eqV3UVpSLq05g5lnUJOW6MvLJRHbyZu0lE1k269oS5YZoUD3mf+4E8pJx0mojzsRd70y7WCTFKtNaySGVlKkzuVum5b9NejnTkacQurTnTFvy1iokU10qdxUltZpz5kvtKTrtW4ETu4tInuuVUs5kSZxQ3vXbJhWlab+ZsXM6/EjjlxkXpazTzBiK1iLxy7BoyT95zQhWnWZykjYX5yJgYmWqTK8o1pfMrDcwRBMVkjlsGpeamlicd3u/S8V6JPWQr3Rrm08l+kEvQ8tcM9Zm1wyzhoL+fs2JzYsuOBWYaZ4m46LcmcBMcxsaL07CNxMnW9W/nWFjv0sdBZObpVXff17NwK9f2huuDJESYu4yDmcCv8UROVv9Qe5STnWpers72PpBhgAAAAAAAAAAAB7EL5cHSvDhqEN7AAAAAElFTkSuQmCC"
                  style="" alt="封面图" class="img-thumbnail">
            </div>
            <div id="status" class="page-status-container" style="display:none">
              <span class="label picture-book-status">未审核</span>
            </div>
            <div id="editBtnContainer" class="edit-btn-container" style="display:none;">
              <span id="editBtn" class="edit-btn glyphicon glyphicon-edit" aria-hidden="true" style="display: none"></span>
              <span id="viewImageBtn" class="view-btn" aria-hidden="true"><img src="/static/images/magnify.png" style="width: 15px;height: 15px"></span>
            </div>
          </div>
          <div class="row picture-book-title-container">
            <div id="paginationText" class="picture-book-title text-center"></div>
          </div>
        </div>
      </div>
      <@checkPrivilege url="/cms/packUpResource.do">
        <div id="downloadResource" style="cursor: pointer;padding: 10px 40px;">
          <div style="padding: 8px 10px;color: #000; display: inline-block">批量下载</div>
          <div style="display: inline-block"><img src="/static/images/download.png" style="width: 20px"></div>
        </div>
      </@checkPrivilege>
    </div>


  </nav>
  <div class="row toolbar flt">
    <div id="togglePageListPanelBtn" class="col-md-2 toolbar-btn-container">
      <span class="glyphicon glyphicon-chevron-right" aria-hidden="true"></span>
    </div>
  </div>


  <div id="bookEdit" class="flt">
    <div class="row error-panel">
      <div class="col-md-12">
        <div id="error" class="alert alert-danger error" role="alert"></div>
      </div>
    </div>
    <!-- 书页类型选择 -->

    <div class="page-container" style="font-size: 14px;background: #f9fbff; border-radius: 0; line-height: 40px;border: 1px solid #eee; height: 40px">
      <div class="examine-tip" style="float: left">
        <span id="examineTip" style="color: red;margin-left: 10px"></span>
      </div>

      <div class="right-page-info" style="margin-right: 15px;float: right; color: #737373;">
        <span id="pageType"></span>第<span id="pagination" class="cur-page">1</span>页
        ,物理页第<span id="phyPage" class="cur-phy-page">1</span>页,
        物理页状态为<span id="phyState" class="cur-phy-state">1</span>
      </div>
    </div>

    <!-- 图片上传及点读配置区域 -->
    <div id="picManager" class="row pic-upload-panel" style="display: none">
    </div>


    <div id="voiceManager" class="row create-page-form-2" style="height: 70%">
      <div class="col-md-12">
        <ul class="nav nav-tabs">
          <li role="presentation" index="0" class="voiceTabItem active"><a href="#">语音</a></li>
          <li class="voiceTabItem" index="1" role="presentation"><a href="#">背景音乐</a></li>
          <li class="voiceTabItem" index="2" role="presentation"><a href="#">音效</a></li>
          <@checkPrivilege url="/vitrual/cms/addPageVideo.do">
              <li class="voiceTabItem no-play-bar" index="3" role="presentation"><a href="#">视频链接</a></li>
          </@checkPrivilege>
        </ul>
        <audio id="mp3Player" style="display:none" autoplay="autoplay">
          <source src=""></source>
        </audio>
        <div id="tab_0_content" class="row voice-panel" style="height: 490px">
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

        <div id="tab_1_content" class="row voice-panel" style="display:none;height: 490px">
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

        <div id="tab_2_content" class="row voice-panel" style="display:none;height:490px;">
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

        <div id="tab_3_content" class="row voice-panel" style="display:none;height:490px;">
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
    <#--添加extra-data-->
    <div  id="extra-data">
      <div class="extr-data-title">
        Extra Data:
        <button class="control-extra">
          <span  id="symbol" class="	glyphicon glyphicon-plus"></span>
        </button>
      </div>
      <div class="panel-body" style="display: none">
        <textarea
             <@checkPrivilege url="/virtual/books/editExtraData.do" def = "disabled = 'disabled'">
             </@checkPrivilege>
            id="extraDataText" placeholder="请输入扩展数据" style="overflow-y: auto;resize: none"></textarea>
      </div>
    </div>

    <div class="row save-button-container">
      <div class="col-md-12 text-center">
        <#--<保存按钮在默认情况下是不pageAdd可以点击的>-->
        <button id="saveAndNextButton" style="min-width: 130px" type="button" class="btn btn-primary">保存书页
        </button>
      </div>
    </div>



  </div>



  <div class="up-load-audio" id="showUploadProGroup" style="width: 100%;display: none">
    <div class="box-upload">
      <div class="box-upload-t">
        <dl>
          <#--<img  width="65" height="64" />-->
          <dt class="upload-line" id="file_check">1</dt>
          <dd>文件自检</dd>
        </dl>
        <#--红色的线-->
        <#--<div class="upload-gules"></div>-->
        <#--灰色的线-->
        <div class="upload-gray" id="checkFinish"></div>
        <dl>
          <#--< img  width="65" height="64" />-->
          <dt class="upload-line" id="file_upload">2</dt>
          <dd>上传文件</dd>
        </dl>
        <div class="upload-gray" id="uploadFinish"></div>
        <dl>
          <dt class="upload-line" id="data_save">3</dt>
          <dd>写入保存</dd>
        </dl>
      </div>
    </div>
  </div>




</div>


<#include "addPage_voiceEditor.ftl"/>

<script>
  $(function () {
    wantong.cms.pageAdd.init({
      bookId: '${bookId}',
      baseBookId:'${baseBookId}',
      examine: '${examine}',
      bookExamine: '${bookExamine}',
      partnerId: '${partnerId}',
      ttsRoles: $.parseJSON('${ttsRole}'),
      moduleValue:'${moduleValue}',
      bookState:'${bookState}',
      repoId: '${repoId}'
    });
  });
</script>
<style>
  .extr-data-title{
    font-weight: bold;
    margin-top: 10px;
    margin-left: 6px;
  }
  .control-extra{
    background-color: #fff;
    border: 1px solid #42bcef;
    width: 17px;
    border-width: 1px;
    height: 17px;
  }
  #extraDataText {
    overflow-y: auto;
    resize: none;
    height: 70px;
    width: 91%;
    margin-left: 83px;
    line-height: 1;
    font-size: 14px;
    letter-spacing: 2px;
    padding: 5px;
  }
  #videoText {
    overflow-y: auto;
    resize: none;
    height: 440px;
    width: 100%;
    line-height: 1;
    font-size: 14px;
    letter-spacing: 2px;
    padding: 5px;
  }
  #symbol{
    color: #42bcef;
    font-size: 9px;
    margin-left: 1px;
    margin-top: -3px;
  }
  .no-click{
    pointer-events: none;
  }

  /*上传结果*/

  .box-upload{ width:100%; float:left;}
  .box-upload-t{ width:100%; float:left;padding-left: 40px}
  .box-upload-t dl{ width:65px; text-align:center; float:left;}
  .box-upload-t dl dd{ font-size:14px; color:#737373;  margin-top:15px;}
  .upload-gray{ width:141px; height:2px; background:#eceff8; float:left; margin:50px 6px 0 6px;}
  .upload-gules{ width:141px; height:2px; background:#67cc66; float:left; margin:50px 6px 0 6px;}
  .upload-line{ width:63px; height:63px; border:1px solid #d2d2d2; border-radius:65px; line-height:63px; text-align:center; font-size:22px; color:#737373;}

  .result-hint{width:100%;text-align: center;padding-top: 158px}
  .confirm-control{padding-left: 258px;padding-top: 50px}

  .hint-title span{width: 90%;float: left;margin-left: 5%;text-align: center;line-height: 25px;font-size: 14px;margin-top: 15px;font-size: 16px;color:#ff1400;background-color: #ffeaea }

  .exception-file{overflow-y: auto;
    height: 350px;
    width: 100%;
    margin-top: 10px;
    float: left;}

  .text-box{ width:530px; float:left;}
  .text-box h2{ color:#3dbeed; font-size:14px; line-height:27px; width:100%;float:left;}
  .text-box span{ font-size:12px; line-height:18px;  width:100%; margin-bottom:10px;color: #737373;float:left;}

  .layui-layer-tips .layui-layer-content{background-color: #FFFFFF !important;}

  #batchUploadAudioBtn span:hover{background: #18b0e7 !important;}

</style>
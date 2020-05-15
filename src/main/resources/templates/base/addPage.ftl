<@script src="/js/base/pageadd.js"></@script>
<@script src="/js/base/pageadd_pagelist.js"></@script>
<@script src="/js/base/pageadd_picmanager.js"></@script>
<@script src="/js/base/pageadd_picmanager2.js"></@script>
<@script src="/js/base/pageadd_picmanager3.js"></@script>
<@script src="/js/base/pageadd_picmanager4.js"></@script>
<@script src="/js/base/pageadd_picmanager5.js"></@script>
<@script src="/js/base/pageadd_picmanager6.js"></@script>
<@script src="/js/base/pageadd_picmanager7.js"></@script>
<@script src="/js/base/pageadd_picbatchmanager.js"></@script>
<@script src="/js/common/Sortable.js"/>
<@script src="/js/common/jquery-sortable.js"/>
<@script src="/js/common/bootstrap-contextmenu.js" />
<#assign module = moduleValue>
<#assign originValue = origin>

<div id="pageAdd" class="picture-book-page-add" tabindex="1" style="outline: none;">

  <nav class="navbar navbar-default navbar-static-top flt" style="background-color: #fff;">
    <div id="pageList" style="width: 200px;height: 100%;padding-top: 10px;">
      <div id="addNewPageBtn" isAuthority=
      <@checkPrivilege url = "/virtual/pageEditor/uploadPage.do" def="false">true</@checkPrivilege>
           class="button" onmouseover="this.style.backgroundColor='#D3D3D3'" onMouseOut="this.style.backgroundColor='white'"  style="display:
          /*检测有没有上传图片的权限*/
      <@checkPrivilege url = "/virtual/pageEditor/uploadPage.do" def="none;">inline;</@checkPrivilege>
          <#if (module == 10)>visibility: hidden;</#if><#if ((originValue != 0)&&(bookInfoState == 3))>visibility: hidden;</#if>">
        &nbsp;
        <span class="glyphicon glyphicon-plus-sign" aria-hidden="true"></span>
        <span> &nbsp;&nbsp;添加新书页</span>
      </div>
      <#--判断书本在书本信息待采样模块-->
      <#if (bookState == 1)>
       <div id="batchImageItem" style="float: left;margin-bottom: 5px;margin-left: 5px;<#if (module == 10)>visibility: hidden;</#if>">
         <div id="batchUploadImageBtn" class="button" onmouseover="this.style.backgroundColor='#D3D3D3'"
              onMouseOut="this.style.backgroundColor='white'"
              style="display: inline-block;margin-left: 16px;float: left;cursor: pointer">
           <span class="batch-btn" style="background: #42bcef;padding: 8px 10px;color: #ffffff; float: left;cursor: pointer;text-align: center;width: 125px;" >批量上传书页</span>
         </div>

         <div id="helpUploadImageBtn" class="button" style="margin-top: 5px;margin-left: 11px;float: left;cursor: pointer">
           <img src="/static/images/help.png" style="width: 20px;">
         </div>
       </div>
      </#if>

      <div id="pageListContainer" class="page-list-container" style="height: 89%">
        <div id="itemTemplate" class="col-md-2" style="display:none; width: 100%">
          <div id="thumbnailContainer" class="thumbnail-container text-center center-block">
            <div id="thumbnail" class="page-thumbnail-container">
              <img
                  src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIwAAACgBAMAAAAsgJlAAAAAGFBMVEXc29y7u7zExMXU09TNzM3JyMnQ0NHAv8ANuow4AAABgElEQVRo3u3UvW7CMBSG4dOG0LU2DazYhbI6MT8rgRRWirgA4AoKS2+/JyZEqoJUW2zoeyTWN/YnEgIAAAAAAAAAAHgk7XcqPffpLq0OlZ5eqV3UVpSLq05g5lnUJOW6MvLJRHbyZu0lE1k269oS5YZoUD3mf+4E8pJx0mojzsRd70y7WCTFKtNaySGVlKkzuVum5b9NejnTkacQurTnTFvy1iokU10qdxUltZpz5kvtKTrtW4ETu4tInuuVUs5kSZxQ3vXbJhWlab+ZsXM6/EjjlxkXpazTzBiK1iLxy7BoyT95zQhWnWZykjYX5yJgYmWqTK8o1pfMrDcwRBMVkjlsGpeamlicd3u/S8V6JPWQr3Rrm08l+kEvQ8tcM9Zm1wyzhoL+fs2JzYsuOBWYaZ4m46LcmcBMcxsaL07CNxMnW9W/nWFjv0sdBZObpVXff17NwK9f2huuDJESYu4yDmcCv8UROVv9Qe5STnWpers72PpBhgAAAAAAAAAAAB7EL5cHSvDhqEN7AAAAAElFTkSuQmCC"
                  style="" alt="封面图" class="img-thumbnail">
            </div>
            <div id="status" class="page-status-container" style="display:none">
              <span class="label picture-book-status">未发布</span>
            </div>
            <div id="editBtnContainer" class="edit-btn-container" style="display:none">
              <#--<span id="editBtn" class="edit-btn glyphicon glyphicon-edit" aria-hidden="true" style="display: none"></span>-->

            <#--检测有没有删除书页的权限-->
              <@checkPrivilege url="/base/deletePage.do">
                <span id="deleteBtn" class="deleteBtn"
                      aria-hidden="true" style="<#if (module == 10)>visibility: hidden;</#if> <#if ((originValue != 0)&&(bookInfoState == 3))>visibility: hidden;</#if>"><img src="/static/images/deleteBtn.png"></span>
              </@checkPrivilege>
            </div>
          </div>
          <div class="row picture-book-title-container">
            <div id="paginationText" class="picture-book-title text-center"></div>
          </div>
        </div>
      </div>
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
    <div class="row create-page-form-1">
      <div class="col-md-12">

        <form class="form-inline" id="createPageForm" action="" method="post">
          <div class="form-group">
            <label for="pageType"><h5 style="line-height: 32px;height: 32px;">书页类型：</h5></label>
            <select class="con-r-top-l-frame frame-line"
                    style="width: 100px;float: none;
                    <@checkPrivilege url="/virtual/pageEditor/uploadPage.do" def="background: #eeeeee;cursor: not-allowed;">
                    </@checkPrivilege>
                        "
                    isAuthority=
                    <@checkPrivilege url="/virtual/pageEditor/uploadPage.do" def="'false' disabled= 'disabled'">
                    "true"
                    </@checkPrivilege>
                    style="width: 100px" name="pageType" id="pageType"
            <#if ((originValue != 0)&&(bookInfoState == 3))>disabled="disabled"</#if> >
              <option value="0">请选择</option>
              <option value="1">封面</option>
              <option value="2">封里</option>
              <option value="3">扉页</option>
              <option value="4">目录</option>
              <option value="5">正文</option>
              <option value="6">辅文（前言，后记，引文，注文，附录，索引，参考文献）</option>
              <option value="7">封底里</option>
              <option value="8">封底</option>
              <option value="-1">其它</option>
            </select>
          </div>
          <div class="form-group" style="margin-left: 10px;">
            <label for="pagination"><h5>第</h5></label>
            <input id="pagination" isAuthority=
            <@checkPrivilege url="/virtual/pageEditor/uploadPage.do" def="'false' disabled= 'disabled'">"true"</@checkPrivilege>
                   style="width:50px" type="text" class="form-control"
                   onkeyup="wantong.base.pageAdd.pageLimit(this)"
                    <#if ((originValue != 0)&&(bookInfoState == 3))>disabled="disabled"</#if>>
            <input type="text" style="display:none"/>
            <label for="pagination">页</label>
          </div>



          <div class="form-group" style="margin-left: 10px;float: right;<@checkPrivilege url="/virtual/books/startGraphicRecognition.do" def="display:none"> </@checkPrivilege>">
            <input type="checkbox" id="graphicRecognition">
            <label style="margin-top: 8px">启用图文识别</label>
          </div>

          <div class="form-group" style="float: right; margin-left: 10px;">
            <label for="phyState"><h5>物理状态：</h5></label>

            <select id="phyState" style="width: 70px;height: 32px;line-height: 32px;
            <@checkPrivilege url="/virtual/pageEditor/uploadPage.do" def="background: #eeeeee;cursor: not-allowed;">
              </@checkPrivilege>
            " class="frame-line" isAuthority =
            <#--检测有没有上传图片的权限-->
            <@checkPrivilege url="/virtual/pageEditor/uploadPage.do" def="'false' disabled= 'disabled'">
            "true"
                </@checkPrivilege>onkeyup="wantong.base.pageAdd.pageLimit(this)"
                    <#if ((originValue != 0)&&(bookInfoState == 3))>disabled="disabled"</#if>>
              <option value="0">无</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
              <option value="6">6</option>
              <option value="7">7</option>
              <option value="8">8</option>
              <option value="9">9</option>
              <option value="10">10</option>
            </select>
          </div>
          <div class="form-group" style="float: right;margin-left: 10px;">
            <label for="phyPage"><h5>物理页码：</h5></label>
            <label for="phyPage"><h5>第</h5></label>
            <input id="phyPage" isAuthority=
            <@checkPrivilege url="/virtual/pageEditor/uploadPage.do" def="'false' disabled= 'disabled'">"true"</@checkPrivilege>
                   style="width:50px" type="text" class="form-control"
                   onkeyup="wantong.base.pageAdd.pageLimit(this)"
                    <#if ((originValue != 0)&&(bookInfoState == 3))>disabled="disabled"</#if>>
            <input type="text" style="display:none"/>
            <label for="phyPage">页</label>
          </div>

        </form>
      </div>
    </div>

    <!-- 图片上传及点读配置区域 -->
    <div id="picManager" class="row pic-upload-panel">
      <div style="float: right;">
        <button id="showContent"  type="button" class="btn">查看文本</button>
      </div>

      <div id="image1" class="uploadImage" style="position: relative">
        <label>斜视跨页-中缝居中</label>
        <div id="previewImgDiv1">
          <img id="previewImg"
               src="/static/images/caiyang1.jpg"
               style="" alt="绘本页拍照图" class="img-thumbnail" defaultSrc="/static/images/caiyang1.jpg">
        </div>
        <div id="btnBg" style="position: absolute;top: 30px;margin-left: 5px">
          <img src="/static/images/bigBg.png" style="width: 185px;height: 108px">
        </div>

        <div id="bigButton" style="position: absolute;">
          <span class="glyphicon glyphicon-zoom-in" aria-hidden="true"></span>
        </div>

        <div id="uploadButton"  isAuthority =
        <@checkPrivilege url = "/virtual/pageEditor/uploadPage.do" def="false">true</@checkPrivilege>
             style="display:
             <@checkPrivilege url = "/virtual/pageEditor/uploadPage.do" def="none">inline-block</@checkPrivilege>;
                 margin-left: <@checkPrivilege url = "/base/fingerBook.do" def="60px">60px</@checkPrivilege>;
                 <#if (module == 10)>visibility: hidden;</#if> <#if ((originValue != 0)&&(bookInfoState == 3))>visibility: hidden;</#if>">上传图片
        </div>

          <@checkPrivilege url = "/base/fingerBook.do">
        <div>
          <button id="fingerBtn" class="frame-Button-b" style="display: none;<#if (module == 10)>visibility: hidden;</#if><#if ((originValue != 0)&&(bookInfoState == 3))>visibility: hidden;</#if>">标定书本</button>
        </div>
          </@checkPrivilege>
      </div>

      <div id="image5"  class="uploadImage"  style="position: relative">
        <label>斜视跨页-左页居中</label>
        <div id="previewImgDiv5">
          <img id="previewImg"
               src="/static/images/caiyang5.jpg"
               style="" alt="绘本页拍照图" class="img-thumbnail" defaultSrc="/static/images/caiyang5.jpg">
        </div>
        <div id="btnBg" style="position: absolute;top: 30px;margin-left: 5px">
          <img src="/static/images/bigBg.png" style="width: 185px;height: 108px">
        </div>

        <div id="bigButton" style="position: absolute;">
          <span class="glyphicon glyphicon-zoom-in" aria-hidden="true"></span>
        </div>
        <div id="uploadButton"  isAuthority =
        <@checkPrivilege url = "/virtual/pageEditor/uploadPage.do" def="false">true</@checkPrivilege>
             style="display:
             <@checkPrivilege url = "/virtual/pageEditor/uploadPage.do" def="none">inline-block</@checkPrivilege>
                 ;<#if (module == 10)>visibility: hidden;</#if> <#if ((originValue != 0)&&(bookInfoState == 3))>visibility: hidden;</#if>">上传图片
        </div>
      </div>

      <div id="image6"  class="uploadImage"  style="position: relative">
        <label>斜视跨页-右页居中</label>
        <div id="previewImgDiv6">
          <img id="previewImg"
               src="/static/images/caiyang6.jpg"
               style="" alt="绘本页拍照图" class="img-thumbnail" defaultSrc="/static/images/caiyang6.jpg">
        </div>
        <div id="btnBg" style="position: absolute;top: 30px;margin-left: 5px">
          <img src="/static/images/bigBg.png" style="width: 185px;height: 108px">
        </div>

        <div id="bigButton" style="position: absolute;">
          <span class="glyphicon glyphicon-zoom-in" aria-hidden="true"></span>
        </div>

        <div id="uploadButton"  isAuthority =
        <@checkPrivilege url = "/virtual/pageEditor/uploadPage.do" def="false">true</@checkPrivilege>
             style="display:
             <@checkPrivilege url = "/virtual/pageEditor/uploadPage.do" def="none">inline-block</@checkPrivilege>
                 ;<#if (module == 10)>visibility: hidden;</#if> <#if ((originValue != 0)&&(bookInfoState == 3))>visibility: hidden;</#if>">上传图片
        </div>
      </div>

      <div id="image2"  class="uploadImage"  style="position: relative">
        <label>正视跨页-中缝居中</label>
        <div id="previewImgDiv2">
          <img id="previewImg"
               src="/static/images/caiyang2.jpg"
               style="" alt="绘本页拍照图" class="img-thumbnail" defaultSrc="/static/images/caiyang2.jpg">
        </div>
        <div id="btnBg" style="position: absolute;top: 30px;margin-left: 5px">
          <img src="/static/images/bigBg.png" style="width: 185px;height: 108px">
        </div>

        <div id="bigButton" style="position: absolute;">
          <span class="glyphicon glyphicon-zoom-in" aria-hidden="true"></span>
        </div>
        <div id="uploadButton"  isAuthority =
        <@checkPrivilege url = "/virtual/pageEditor/uploadPage.do" def="false">true</@checkPrivilege>
             style="display:
             <@checkPrivilege url = "/virtual/pageEditor/uploadPage.do" def="none">inline-block</@checkPrivilege>
                 ;<#if (module == 10)>visibility: hidden;</#if> <#if ((originValue != 0)&&(bookInfoState == 3))>visibility: hidden;</#if>">上传图片
        </div>
      </div>

      <div id="image3"  class="uploadImage"  style="position: relative">
        <label>左单页</label>
        <div id="previewImgDiv3">
          <img id="previewImg"
               src="/static/images/caiyang3.jpg"
               style="" alt="绘本页拍照图" class="img-thumbnail" defaultSrc="/static/images/caiyang3.jpg">
        </div>
        <div id="btnBg" style="position: absolute;margin-top: -108px;margin-left: 56px">
          <img src="/static/images/bigBg.png" style="width: 80px;height: 103px">
        </div>

        <div id="bigButton" style="position: absolute;">
          <span class="glyphicon glyphicon-zoom-in" aria-hidden="true"></span>
        </div>

        <div id="uploadButton"  isAuthority =
        <@checkPrivilege url = "/virtual/pageEditor/uploadPage.do" def="false">true</@checkPrivilege>
             style="display:
             <@checkPrivilege url = "/virtual/pageEditor/uploadPage.do" def="none">inline-block</@checkPrivilege>
                 ;<#if (module == 10)>visibility: hidden;</#if> <#if ((originValue != 0)&&(bookInfoState == 3))>visibility: hidden;</#if>">上传图片
        </div>
      </div>

      <div id="image4"  class="uploadImage"  style="position: relative">
        <label>右单页</label>
        <div id="previewImgDiv4">
          <img id="previewImg"
               src="/static/images/caiyang4.jpg"
               style="" alt="绘本页拍照图" class="img-thumbnail" defaultSrc="/static/images//caiyang4.jpg">
        </div>
        <div id="btnBg" style="position: absolute;margin-top: -108px;margin-left: 56px">
          <img src="/static/images/bigBg.png" style="width: 80px;height: 103px">
        </div>

        <div id="bigButton" style="position: absolute;">
          <span class="glyphicon glyphicon-zoom-in" aria-hidden="true"></span>
        </div>

        <div id="uploadButton"  isAuthority =
        <@checkPrivilege url = "/virtual/pageEditor/uploadPage.do" def="false">true</@checkPrivilege>
             style="display:
             <@checkPrivilege url = "/virtual/pageEditor/uploadPage.do" def="none">inline-block</@checkPrivilege>
                 ;<#if (module == 10)>visibility: hidden;</#if> <#if ((originValue != 0)&&(bookInfoState == 3))>visibility: hidden;</#if>">上传图片
        </div>
      </div>


      <div id="image7"  class="uploadImage"  style="position: relative">
        <label>扫描图</label>
        <div id="previewImgDiv7">
          <img id="previewImg"
               src="/static/images/caiyang7.jpg"
               style="" alt="绘本页拍照图" class="img-thumbnail" defaultSrc="/static/images/caiyang7.jpg">
        </div>
        <div id="btnBg" style="position: absolute;top: 30px;margin-left: 5px">
          <img src="/static/images/bigBg.png" style="width: 185px;height: 108px">
        </div>

        <div id="bigButton" style="position: absolute;">
          <span class="glyphicon glyphicon-zoom-in" aria-hidden="true"></span>
        </div>

        <div id="uploadButton"  isAuthority ="false" style="display:none;<#if (module == 10)>visibility: hidden;</#if>">上传图片</div>
      </div>

    </div>

    <div style="width: 100%;float: left;">
      <div class="save-button-container">
        <button id="saveAndNextButton" style="min-width: 130px" type="button" class="btn btn-primary"
                disabled="disabled">保存书页
        </button>
      </div>

      <div id="examineBtn" style="display: none">
        <div id="examineSuccess" class="col-md-1" style=" margin-left: 67%">
          <button id="examineSuccessBtn"
                  style="bottom:0px;position: absolute;min-width: 130px;margin-left: 3px;padding-top: 7px"
                  type="button"
                  class="btn btn-primary">审核通过
          </button>
        </div>
        <div id="examineFail" class="col-md-1" style="">
          <button id="examineFailBtn"
                  style="bottom:0px;position: absolute;min-width: 130px ;margin-left: 77px;padding-top: 7px"
                  type="button"
                  class="btn btn-primary">审核不通过
          </button>
        </div>
      </div>
    </div>


    <div class="form-group" style="width: 100%;float: left;margin-top: 15px;display: none;" id="examineDiv">
      <div style="background: #fff4f4;padding: 1%;font-size: 14px;">
        <label>审核不通过备注：</label>
      </div>
      <div style="border: 1px solid #f2f2f2">
      <label>
        <h5 id="examineTip" style="color: #737373;margin-left: 10px;line-height: 20px;padding: 5px 0;"></h5>
      </label>
      </div>
    </div>

  </div>

</div>
<#include "batchUploadImage.ftl">

<script>
  $(function () {
    wantong.base.pageAdd.init({
      bookId: '${bookId}',
      examine: '${examine}',
      bookExamine: '${bookExamine}',
      partnerId: '${partnerId}',
      moduleValue:'${moduleValue}',
      bookState:'${bookState}',
      bookInfoState:'${bookInfoState}',
      modelId:'${modelId}',
      origin:'${origin}'
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
  #symbol{
    color: #42bcef;
    font-size: 9px;
    margin-left: 1px;
    margin-top: -3px;
  }
  .no-click{
    pointer-events: none;
  }
</style>
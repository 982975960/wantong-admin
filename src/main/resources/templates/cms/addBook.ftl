<@script src="/js/cms/bookadd.js"></@script>
<@link href="/css/cms/addBook.css" rel="stylesheet"/>
<@link href="/css/cms/surplusIsbn.css" rel="stylesheet"/>
<#assign originValue = origin>
<div id="createBook" class="picture-book-add" style="user-select: none">
  <div hidden id="allowBookNull" isAllow = "<@checkPrivilege url="/virtual/allowBookResourcesNull.do" def="false">true</@checkPrivilege>"></div>
  <div class="row">
    <div class="col-md-1">
    </div>
    <div class="col-md-10">

      <div id="error" class="alert alert-danger error" role="alert"></div>
      <form class="form" id="createBookFrom" action="" method="post" style="margin-top:30px;"
            enctype="multipart/form-data">

        <div class="form-group" style="min-height: 17px;">
          <label id="id" style="width: 30%;display:none;user-select:text">BookID:</label>
          <@checkPrivilege url="/virtual/bookEditor/editorBookLabel.do">
            <div id="editLabel" class="button" bookId="${bookId}" style="display: inline-block; float: right;cursor: pointer;padding: 7px 10px 7px 5px;border-radius: 4px " onmouseover="this.style.backgroundColor='#e9f6fe'" onMouseOut="this.style.backgroundColor='white'">
              &nbsp;
              <span class="glyphicon glyphicon-plus-sign" aria-hidden="true"></span>
              <span> &nbsp;&nbsp;添加书本标签</span>
            </div>
          </@checkPrivilege>
        </div>

        <div id="thumbnailContainer" class="form-group text-center center-block picture-book-thumbnail-container">

          <div id="thumbnail" class="picture-book-thumbnail">
            <img id="coverImage"
                 src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIwAAACgBAMAAAAsgJlAAAAAGFBMVEXc29y7u7zExMXU09TNzM3JyMnQ0NHAv8ANuow4AAABgElEQVRo3u3UvW7CMBSG4dOG0LU2DazYhbI6MT8rgRRWirgA4AoKS2+/JyZEqoJUW2zoeyTWN/YnEgIAAAAAAAAAAHgk7XcqPffpLq0OlZ5eqV3UVpSLq05g5lnUJOW6MvLJRHbyZu0lE1k269oS5YZoUD3mf+4E8pJx0mojzsRd70y7WCTFKtNaySGVlKkzuVum5b9NejnTkacQurTnTFvy1iokU10qdxUltZpz5kvtKTrtW4ETu4tInuuVUs5kSZxQ3vXbJhWlab+ZsXM6/EjjlxkXpazTzBiK1iLxy7BoyT95zQhWnWZykjYX5yJgYmWqTK8o1pfMrDcwRBMVkjlsGpeamlicd3u/S8V6JPWQr3Rrm08l+kEvQ8tcM9Zm1wyzhoL+fs2JzYsuOBWYaZ4m46LcmcBMcxsaL07CNxMnW9W/nWFjv0sdBZObpVXff17NwK9f2huuDJESYu4yDmcCv8UROVv9Qe5STnWpers72PpBhgAAAAAAAAAAAB7EL5cHSvDhqEN7AAAAAElFTkSuQmCC"
                 style="" alt="封面图" class="img-thumbnail">
          </div>
        </div>

        <input type="hidden" id="modelId" name="modelId" value="${modelId}">
        <div class="form-group">
          <label for="name">书本名称：<span class="red">*</span></label>
          <input type="text" id="name" class="form-control" disabled="disabled">
          <label for="publish" class="secondList">出版社：<span class="red">*</span></label>
          <input type="text" id="publish" class="form-control" maxlength="40" disabled="disabled">
        </div>

        <div class="form-group">
          <label for="author">作者名称：<span class="red">*</span></label>
          <input type="text" id="author" class="form-control" disabled="disabled">
          <label for="seriesTitle" class="secondList">所属系列：</label>
          <input type="text" id="seriesTitle" class="form-control" maxlength="40" disabled="disabled">
        </div>

        <div class="form-group">
          <label for="edition">版次：</label>
          <input type="text" id="edition" class="form-control" disabled="disabled">
          <label for="innerId" class="secondList">书本编号：</label>
          <input type="text" id="innerId" class="form-control" onkeyup="this.value=this.value.replace(/[^0-9]+/,'');" placeholder="书本编号不能大于12位" maxlength="12" disabled="disabled">
        </div>

        <div class="form-group">
          <label for="isbn">ISBN：<span class="red">*</span></label>
          <input type="text" id="isbn" class="form-control" maxlength="13" onkeyup="this.value=this.value.replace(/[^0-9]+/,'');" placeholder="请输入10或13位纯数字" disabled="disabled">
        </div>
        <div class="form-group">
          <label for="theme" style="float: left;width: 10%">附属ISBN：</label>
          <div id="surplusIsbn" style="color: #737373;float: left;width: 85%;min-height: 50px;"></div>
        </div>

        <div class="form-group">
          <label for="description" style="float: left">书本简介：</label>
          <textarea id="description" class="form-control" style="resize: none" disabled="disabled"></textarea>
        </div>

          <div class="form-group">
              <label for="description" style="float: left">Extra Data：</label>
              <textarea
                  <@checkPrivilege url="/virtual/books/editExtraData.do" def = "disabled = 'disabled'">
                  </@checkPrivilege>
                  id="extraData" class="form-control" style="resize: none" >
              </textarea>
          </div>

        <div class="form-group">
          <label for="theme" style="float: left;width: 10%">书本标签：</label>
          <div style="color: #737373;float: left;width: 85%;" id="theme">

          </div>
          <#--判断有没有编辑书页的权限-->
          <div class="show-grid" style="float: right;margin-top: 20px;">
          <@checkPrivilege url="/cms/saveBookInfo.do">
            <button type="button" id="saveAndNextBtn" style="display:  block;float: left; " class="btn btn-danger">保存</button>
          </@checkPrivilege>

            <button type="button"<#--判断有没有保存书页信息的权限-->
                    id="enterBooks" class="btn btn-danger" style="float: left;margin-left: 10px; display:
                    <@checkPrivilege url="/virtual/bookEditor/enterBook.do" def = "none;">
                               block;
                    </@checkPrivilege>;">制作领读资源 </button>

            <button type="button"<#--判断是否有制作点读数据权限-->
                    id="editFinger" class="btn btn-danger" style="float: left;margin-left: 10px; display:
            <@checkPrivilege url="/virtual/bookEditor/editFinger.do" def = "none;">
                block;
            </@checkPrivilege>;<#if (originValue!=0)>visibility: hidden;</#if>">制作点读资源 </button>
          </div>
        </div>

      </form>
      <div id="full" style="display: none;text-align: center;color: white;background: black;">

      </div>
    </div>
    <div class="col-md-1">
    </div>
  </div>
</div>

<div id="hintPanel" style="display: none">
  <div id="saveBookHint" class="picture-book-save-hint">
    <div id = "onlySave" style="text-align: center;margin-top: 40px">
      <button type="button" class="btn btn-primary">仅保存，信息还需完善</button>
    </div>
    <div id = "changeBookStatus" style="text-align: center;margin-top: 30px">
      <button type="button" class="btn btn-primary">已完成，移至下个环节</button>
    </div>
  </div>
</div>
<script>
  $(function () {
    wantong.cms.bookAdd.init({
      modelId: "${modelId}",
      baseModelId:"${baseModelId}",
      bookId: "${bookId}",
      baseBookId:"${baseBookId}",
      examine: "${examine?c}",
      moduleValue: "${moduleValue}",
      bookState:"${bookState}",
      bookInfoState:"${bookInfoState}"
      });
  });
</script>

<style>
  .no-click{
    pointer-events: none;
  }
  #surplusIsbn .surplus-isbn-container {
    padding-right: 10px;
    background: #EEE;
  }
</style>


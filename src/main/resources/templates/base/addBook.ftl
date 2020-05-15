<@script src="/js/base/bookadd.js"></@script>
<@link href="/css/base/addBook.css" rel="stylesheet"/>
<@link href="/css/cms/surplusIsbn.css" rel="stylesheet"/>
<div id="createBook" class="picture-book-add" style="user-select: none">
  <div style="height: 720px;overflow-y: scroll;">
    <div class="col-md-1">
    </div>
    <div class="col-md-10">

      <div id="error" class="alert alert-danger error" role="alert"></div>
      <form class="form" id="createBookFrom" action="" method="post" style="margin-top:30px;"
            enctype="multipart/form-data">

        <div class="form-group" style="min-height: 17px;">
          <label id="id" style="width: 30%;display:none;user-select:text">BookID:</label>
          <@checkPrivilege url="/virtual/baseBookEditor/editorBookLabel.do">
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
          <div style="display: <@checkPrivilege url="/virtual/bookEditor/uploadCoverImage.do" def="none"> inline </@checkPrivilege>">
            <div id="uploadBtn" isAuthority=true class="upload-btn-container" style="user-select: none;">
            <span id="editBtn2" style="display: none;" class="glyphicon glyphicon-edit" aria-hidden="true"
                  style="user-select: none"></span>
              <span id="upload" class="glyphicon glyphicon-cloud-upload" aria-hidden="true"
                    style="user-select: none"></span>
            </div>
          </div>

        </div>

        <input type="hidden" id="modelId" name="modelId" value="${modelId}">

        <div class="form-group">
          <label for="name">书本名称：<span class="red">*</span></label>

          <input
                  <@checkPrivilege url="/virtual/bookEditor/editorBookInformation.do" def = "disabled= 'disabled'">
                  </@checkPrivilege>
              type="text" id="name" class="form-control">

          <label for="publish" class="secondList">出版社：<span class="red">*</span></label>
          <input
                  <@checkPrivilege url="/virtual/bookEditor/editorBookInformation.do" def = "disabled= 'disabled'">
                  </@checkPrivilege>
              type="text" id="publish" class="form-control" maxlength="40">

        </div>

        <div class="form-group">

          <label for="author">作者名称：<span class="red">*</span></label>
          <input
                  <@checkPrivilege url="/virtual/bookEditor/editorBookInformation.do" def = "disabled= 'disabled'">
                  </@checkPrivilege>
              type="text" id="author" class="form-control">

          <label for="seriesTitle" class="secondList">所属系列：</label>
          <input
                  <@checkPrivilege url="/virtual/bookEditor/editorBookInformation.do" def = "disabled= 'disabled'">
                  </@checkPrivilege>
              type="text" id="seriesTitle" class="form-control" maxlength="40">
        </div>

        <div class="form-group">
          <label for="edition">版次：</label>
          <input
                  <@checkPrivilege url="/virtual/bookEditor/editorBookInformation.do" def = "disabled= 'disabled'">
                  </@checkPrivilege>
              type="text" id="edition" class="form-control">

          <label for="innerId" class="secondList">书本编号：</label>
          <input
                  <@checkPrivilege url="/virtual/bookEditor/editorBookInformation.do" def = "disabled= 'disabled'">
                  </@checkPrivilege>
              type="text" id="innerId" class="form-control" onkeyup="this.value=this.value.replace(/[^0-9]+/,'');"
              placeholder="书本编号不能大于12位" maxlength="12" readonly="true" >
        </div>

        <div class="form-group">
          <label for="isbn">ISBN：<span class="red">*</span></label>
          <input isAuthority=
                 <@checkPrivilege url="/virtual/bookEditor/editorBookInformation.do" def = "false disabled= 'disabled'">
                 true
                  </@checkPrivilege>
                 type="text" id="isbn" class="form-control" maxlength="13"
                 onkeyup="this.value=this.value.replace(/[^0-9]+/,'');" placeholder="请输入10或13位纯数字">

          <label for="skuId" class="secondList">sku：</label>
          <input type="text" id="skuId" class="form-control" onkeyup="this.value=this.value.replace(/[^0-9]+/,'');">
        </div>
        <div class="form-group">
          <label for="theme" style="float: left;width: 10%">附属ISBN：</label>
          <div id="surplusIsbn" style="color: #737373;float: left;width: 85%;min-height: 50px;">
            <div class="surplus-isbn-container isbn-btn" style="
              <@checkPrivilege url="/virtual/bookEditor/editorBookInformation.do" def ="display:none">
              </@checkPrivilege>
              ">
              <span class="glyphicon glyphicon-plus-sign" aria-hidden="true"></span>
              <span>添加附属ISBN</span>
            </div>
          </div>
        </div>

        <div class="form-group">
          <label for="description" style="float: left">书本简介：</label>
          <textarea
              <@checkPrivilege url="/virtual/bookEditor/editorBookInformation.do" def = "disabled = 'disabled'">

              </@checkPrivilege>
              id="description" class="form-control" style="resize: none"></textarea>
        </div>

        <div class="form-group">
          <label for="theme" style="float: left;width: 10%">书本标签：</label>
          <div style="color: #737373;float: left;width: 85%;" id="theme">

          </div>
            <#--判断有没有编辑书页的权限-->
          <div class="show-grid" style="float: right;margin-right: 2%;margin-top: 10px;">
              <@checkPrivilege url="/base/saveBookInfo.do">
                <button type="button" id="saveAndNextBtn" class="btn btn-danger" style="float: left;">保存</button>
              </@checkPrivilege>
              <@checkPrivilege url="/virtual/base/enterBook.do">
                <button type="button" saveBook="false" id="enterBooks" class="btn btn-danger" style="float: left;margin-left: 10px;">进入书页</button>
              </@checkPrivilege>
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
    <div id="onlySave" style="text-align: center;margin-top: 40px">
      <button type="button" class="btn btn-primary">仅保存，信息还需完善</button>
    </div>
    <div id="changeBookStatus" style="text-align: center;margin-top: 30px">
      <button type="button" class="btn btn-primary">已完成，移至下个环节</button>
    </div>
  </div>
</div>


<div id="isbnPanel" class="row" style="display: none">
  <div class="modal-body">
    <form id="addSurplusIsbn" method="post" action="">
      <div class="input-group form-group-sm col-xs-10" style="margin-bottom:15px;margin-top: 20px">
        <input type="text" class="form-control" id="isbnInput"  onkeyup="this.value=this.value.replace(/[^0-9]+/,'');" onkeydown="if(event.keyCode==13){return false;}" placeholder="请输入10或13位纯数字" maxlength="13"  style="margin-left: 10px">
        <input type="text" style="display: none;">
      </div>
    </form>
  </div>
  <div class="modal-footer" style="width: 100%;float: left" >
    <button type="button" id="saveIsbn" class="pop-padding frame-Button-b">保存</button>
    <button type="button" id="closeBtn" class="pop-padding frame-Button" data-dismiss="modal" >关闭</button>
  </div>

</div>
<script>
  $(function () {
    wantong.base.bookAdd.init({
      modelId: "${modelId}",
      bookId: "${bookId}",
      examine: "${examine?c}",
      moduleValue: "${moduleValue}",
      bookState: "${bookState}",
      bookInfoState: "${bookInfoState}",
      isWorkOrder: "${isWorkOrder!}"
    });
  });
</script>

<style>
  .no-click {
    pointer-events: none;
  }
</style>


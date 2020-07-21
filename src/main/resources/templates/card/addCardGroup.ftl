<@script src="/js/card/addCardGroup.js"></@script>
<@link href="/css/card/addCardGroup.css" rel="stylesheet"/>
<div id="createCardGroupDiv" class="picture-book-add" style="user-select: none">
  <div >
    <div class="col-md-1">
    </div>
    <div class="col-md-10">

      <form class="form" id="createCardFrom" action="" method="post" style="margin-top:30px;"
            enctype="multipart/form-data">

        <div class="form-group" style="min-height: 17px;">
          <label id="id" style="width: 30%;display:none;user-select:text">CardID:</label>
        </div>

        <div id="groupUploadDiv"
             class="form-group textuploadBtn-center center-block picture-book-thumbnail-container">

          <div id="thumbnail" class="picture-book-thumbnail">
            <img id="coverImage"
                 src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIwAAACgBAMAAAAsgJlAAAAAGFBMVEXc29y7u7zExMXU09TNzM3JyMnQ0NHAv8ANuow4AAABgElEQVRo3u3UvW7CMBSG4dOG0LU2DazYhbI6MT8rgRRWirgA4AoKS2+/JyZEqoJUW2zoeyTWN/YnEgIAAAAAAAAAAHgk7XcqPffpLq0OlZ5eqV3UVpSLq05g5lnUJOW6MvLJRHbyZu0lE1k269oS5YZoUD3mf+4E8pJx0mojzsRd70y7WCTFKtNaySGVlKkzuVum5b9NejnTkacQurTnTFvy1iokU10qdxUltZpz5kvtKTrtW4ETu4tInuuVUs5kSZxQ3vXbJhWlab+ZsXM6/EjjlxkXpazTzBiK1iLxy7BoyT95zQhWnWZykjYX5yJgYmWqTK8o1pfMrDcwRBMVkjlsGpeamlicd3u/S8V6JPWQr3Rrm08l+kEvQ8tcM9Zm1wyzhoL+fs2JzYsuOBWYaZ4m46LcmcBMcxsaL07CNxMnW9W/nWFjv0sdBZObpVXff17NwK9f2huuDJESYu4yDmcCv8UROVv9Qe5STnWpers72PpBhgAAAAAAAAAAAB7EL5cHSvDhqEN7AAAAAElFTkSuQmCC"
                 style="" alt="封面图" class="img-thumbnail">
          </div>
          <div>
            <div id="uploadBtn" class="upload-btn-container" style="user-select: none;">
              <span id="upload" class="glyphicon glyphicon-cloud-upload" aria-hidden="true"
                    style="user-select: none;margin-left: 30%;"></span>
            </div>
          </div>

        </div>

        <input type="hidden" id="modelId" name="modelId" value="${modelId}">

        <div class="form-group" style="width: 70%;padding-left: 30%;">
          <label for="name" style="font-weight: normal;width: 30%;">套装名称：<span class="red">*</span></label>
          <input type="text" id="name" class="form-control" style="width: 60%;">
        </div>

        <div class="form-group" style="width: 100%;padding-left: 30%;">
          <label for="name" style="line-height: 30px;width: 100%;font-weight: normal;">卡片尺寸：<span class="red">*</span></label>
          <div style="width: 100%;float: left;margin-bottom: 10px;">
            <label for="name" style="width: 66px;font-weight: normal;">Width：</label>
            <input type="text" id="cardWidth" class="form-control" style="width: 35%;" onkeyup="this.value=this.value.replace(/^(0+)|[^\d]+/g,'');">
          </div>
          <div style="width: 100%;float: left;">
            <label for="name" style="width: 66px;font-weight: normal;">Height：</label>
            <input type="text" id="cardHeight" class="form-control" style="width: 35%;" onkeyup="this.value=this.value.replace(/^(0+)|[^\d]+/g,'');">
          </div>
        </div>


        <div class="form-group">
            <#--判断有没有编辑书页的权限-->
          <div class="show-grid" style="float: right;margin-right: 2%;margin-top: 10px;">
            <button type="button" id="saveCardInfoBtn" class="btn frame-Button-b" style="float: left;">保存</button>
          </div>
        </div>

      </form>
  </div>
</div>

</div>
<script>
  $(function () {
    wantong.addCardGroup.init({
      modelId: "${modelId}",
      groupId: "${groupId}"
    });
  });
</script>


<@script src="/js/card/cardRecognitionCheck.js"></@script>
<div class="main-w">
  <div class="content-wrap-w">
    <div class="content-r-path">卡片管理 / 设计图评估</div>
    <div id="recognitionCheckDiv" class="content-box" style="text-align: center;">
      <div>
        <span style="line-height: normal;">上传JPG格式的设计图或成品图，可判断是否能被识别</span>
      </div>
      <div>
        <div class="form-group" style="margin-top: 20px;">
          <label>Width:</label>
          <input type="text" id="cardWidth" style="width: 5%;display: inline;height: 25px;border-radius: 0;" class="form-control" onkeyup="this.value=this.value.replace(/[^0-9]+/,'');">
          <label>cm</label>

          <label style="margin-left: 20px;">Heigth:</label>
          <input type="text" id="cardHeight" style="width: 5%;display: inline;height: 25px;border-radius: 0;" class="form-control" onkeyup="this.value=this.value.replace(/[^0-9]+/,'');">
          <label>cm</label>
        </div>
        <div>
          <div id="thumbnailContainer" class="form-group text-center center-block" style="width: 400px;height: 450px;">
            <div id="thumbnail" class="picture-book-thumbnail">
              <img id="coverImage" src="/static/images/newPage.jpg" class="img-thumbnail" defaultSrc="/static/images/newPage.jpg">
            </div>

            <div style="margin-top: 20px;text-align: center;">
              <div id="uploadBtn" style="width: 50%;float: left;">上传图片</div>
              <button id="startCheckBtn" class="frame-Button-b" style="border-radius: 3px;">开始检测</button>
            </div>

          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<script>
  $(function () {
    wantong.cardRecognitionCheck.init();
  });
</script>

<style>
  label {
    font-weight: unset;
  }
</style>
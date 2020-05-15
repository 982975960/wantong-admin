<@script src="/js/base/edit_img.js"></@script>
<@link href="/css/base/addBook.css" rel="stylesheet"/>

<div id="popwindow" class="popupcontent">
    <div class="tips"><h1>在封面的左上角和右下角单击鼠标，即可编辑</h1></div>
    <div class="innercontent">
      <canvas id="imgCavans" width="500px" height="500px"></canvas>
    </div>
    <div class="tips" id="errorTip" style="display:none;color: red"><h4>标记错误：请在封面的左上角和右下角打点</h4></div>
    <div class="btn-container" style="margin-top: 30px;">
      <button type="button" id="createImg" class="btn btn-primary">生成预览</button>
    </div>
</div>

<script>
    $(function () {
        wantong.base.editImage.init({
            bookId: "${bookId}",
            fileName: "${fileName}"
        });
    });
</script>
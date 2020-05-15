<@script src="/js/card/fingerBook.js"></@script>
<@script src="/js/card/finger.js"></@script>
<@link href="/css/card/fingerBook.css" rel="stylesheet"/>
<div id="fingerBookDiv">
  <div>
    <label>单击鼠标并拖动产生矩形框，将图中书本涵盖在矩形框内</label>
    <label style="margin-top: 5px">(完整涵盖卡片，尽少的涵盖其他区域)</label>
  </div>
  <div class="finger-image">
    <canvas id="myCanvas" width="1280" height="720" style="border:1px solid #d3d3d3;">
      Your browser does not support the HTML5 canvas tag.
    </canvas>
  </div>
  <div>
    <div class="modal-footer" style="float: none;text-align: center;">
      <button type="button" id="saveBtn" class="pop-padding frame-Button-b">保存</button>
    </div>
  </div>
</div>

<script>
  $(function () {

  });
</script>

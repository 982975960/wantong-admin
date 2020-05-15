<@script src="/js/3rd-party/jquery-2.2.4.min.js"></@script>
<@script src="/js/layui/layui.js"></@script>
<script>
  var _outTimeDiv = $("#outTimeDiv");
  layer.open({
    title: "信息",
    type: 1,
    maxmin: false,
    resize: false,
    area: ['250px', '160px'],
    content: _outTimeDiv,
    cancel: function () {
      window.location.href = GlobalVar.contextPath + "/showLogin.do";
    },
    success: function (layero) {
      var mask = $(".layui-layer-shade");
      mask.appendTo(layero.parent());
      //其中：layero是弹层的DOM对象
    }
  });

  $("#iknow").click(function () {
    layer.close();
    window.location.href = GlobalVar.contextPath + "/showLogin.do";
  });
</script>
<div id="outTimeDiv">
  <div style="text-align: center;line-height: 33px;font-size: 14px;margin-top: 15px;">登录超时，请重新登录。</div>
  <button id="iknow">我知道了</button>
</div>

<style type="text/css">
  #iknow:hover{
    background:#18b0e7;
  }
  #iknow{
    text-align: center;
    margin-left: 75px;
    width: 100px;
    height: 30px;
    float: left;
    margin-top: 10px;
    background:#3dbeed;
    color: white;
    cursor: pointer;
    border: none;
  }
</style>
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <@script src="/js/app/sdkNewManage.js"/>
  <@link href="/css/app/sdkManage.css" rel="stylesheet"/>
</head>
<body>
<div class="main-w">
  <div class="content-wrap-w">
    <div class="content-r-path">应用管理 / SDK下载</div>
    <div class="content-box">

      <div class="con-r-top">
        <div class="con-r-top-l">
          <a id="a_ios" name="a_ios" href="#" style="color:#666;font-size:15px;">IOS开发</a> &nbsp;&nbsp;&nbsp;/ &nbsp;&nbsp;&nbsp;<a id="a_android" name="a_android" href="#" style="color:#666;font-size:15px;">Android开发</a>&nbsp;&nbsp;&nbsp;/&nbsp;&nbsp;&nbsp;<a id="a_linux" href="#" style="color:#666;font-size:15px;">Linux/Rtos开发</a>
        </div>
      </div>

      <div id="sdkList" class="content-pro">

      </div>
    </div>

  </div>
</div>

</body>
</html>
<script>
  $(function () {
    wantong.app.sdkNewManage.init();
  });
</script>
<@script src="/js/ass/assFrame.js" />
<div id="logFrame" xmlns="http://www.w3.org/1999/html" xmlns="http://www.w3.org/1999/html">
  <div class="main-w">
    <!--图书管理-->
    <div id="logFrameNav" class="content-nav">
      <div class="con-nav-cen">
        <ul id="listTab">
          <@checkPrivilege url="/ass/recognitionLogsSearch.do">
          <li index="0" role="presentation"><a href="#">查看图片日志</a></li>
          </@checkPrivilege>
            <@checkPrivilege url="/ass/recognitionLogsFilter.do">
          <li index="1" role="presentation"><a href="#">设置保存图片日志</a></li>
          </@checkPrivilege>
        </ul>
      </div>
    </div>
    <div class="content-right">
      <div class="content-wrap-w">
        <div class="content-r-path">售后服务 / 图片识别日志 / <span id="curContentTab">无任何权限</span></div>
        <div class="content-box">
            <#--注销激活码-->
          <div id="logSearch"></div>
            <#--注销记录-->
          <div id="logFilter" style="display: none"></div>
        </div>
      </div>
    </div>
    <!--图书管理结束-->
  </div>
</div>

<script>
  $(function () {
    wantong.assFrame.init();
  });
</script>
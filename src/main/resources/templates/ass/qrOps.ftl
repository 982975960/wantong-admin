<@link href="/css/ass/qrOps.css" rel="stylesheet"/>
<@script src="/js/ass/qrOps.js" />
<div id="qrOps" xmlns="http://www.w3.org/1999/html" xmlns="http://www.w3.org/1999/html">
  <div class="main-w">
    <!--图书管理-->
    <div id="qrNav" class="content-nav">
      <div class="con-nav-cen">
        <ul id="listTab">
          <li index="0" role="presentation" class="active"><a href="#">激活码注销</a></li>
          <li index="1" role="presentation"><a href="#">注销记录</a></li>
        </ul>
      </div>
    </div>
    <div class="content-right">
      <div class="content-wrap-w">
        <div class="content-r-path">售后服务 / 激活码 / <span id="curContentTab">激活码注销</span></div>
        <div class="content-box">
            <#--注销激活码-->
          <div id="cancel"></div>
            <#--注销记录-->
          <div id="cancelRecord" style="display: none"></div>
        </div>
      </div>
    </div>
    <!--图书管理结束-->
  </div>
</div>

<script>
  $(function () {
    wantong.qrOps.init();
  });
</script>
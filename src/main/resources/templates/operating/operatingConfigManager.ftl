<@script src="/js/operating/operatingConfigManager.js"/>
<@script src = "/js/operating/appOperating.js"/>
<@link href="/css/3rd-party/zui/component-chosen.css" rel="stylesheet"/>
<@script src="/js/3rd-party/chosen.jquery.js"/>

<div id="operating_config_manager" xmlns="http://www.w3.org/1999/html" xmlns="http://www.w3.org/1999/html">
  <div class="main-w">
    <div class="content-nav">
      <div class="con-nav-top" style="padding: unset;">
        <form style="width: 100%;float: left;">
        </form>
      </div>

      <div class="con-nav-cen">
        <ul id="listTab">
          <li index="0" role="presentation" class="active"><a href="#">应用配置</a></li>
        </ul>
      </div>
    </div>

    <div class="content-right">
      <div class="content-wrap-w">
        <div class="content-r-path" id="tab_head">运营管理 / 运营配置 /<span id="curContentTab"></span></div>
      <#--右边显示内容块-->
        <div class="content-box" style="padding: 1%;">
          <div class="con-r-top">
          </div>
            <#--应用配置-->
          <div id="app_config"></div>
        </div>
      </div>
    </div>
  </div>
</div>
<script>
  $(function () {
    wantong.operating.init();
  });
</script>
<@link href="/css/frame/menu.css" rel="stylesheet"/>
<@script src="/js/frame/menu.js"/>

<div class="vt-frame-menu col-sm-3 col-md-2 sidebar">

	<div class="nav-header text-center menu-top-bar">
      	|||
  </div>
    <ul class="nav nav-sidebar" id="menu">
      <#list menu as a>
      <@checkPrivilege url="${a.url}">
      <li class="list-group-item-info">
      	<a class="menuItem" name="${a.name}" url="<@contextPath/>${a.url}" href="#">${a.name}</a>
      </li>
      </@checkPrivilege>
      </#list>
      
    </ul>

  <div id="myTabContent" class="tab-content" style="" disabled="none">
    <div style="margin-left: -2px;height: 26px">
      <div>
         <img src="static/images/help.png" width="16px" style="float: left">
      </div>
      <div style="margin-left: 24px">
        帮助
      </div>
    </div>
    <div class="tab-pane fade in active" id="home">
      <#--<div>
        <a href="https://www.showdoc.cc/254872066540898?page_id=1451989216003772" id="link1" target="_blank"> 图片采样-操作步骤</a>
      </div>
      <div>
        <a href="https://www.showdoc.cc/254872066540898?page_id=1452663493247851"  id="link2" target="_blank" style="margin-left: -6px;">【绘本管理后台】操作指南</a>
      </div>-->
      <div>
        <a href="https://www.showdoc.cc/254872066540898?page_id=1688590448422070" id="link3" target="_blank" style="margin-left: -6px;"> 【绘本管理】音频标准</a>
      </div>
    </div>
    </div>
  </div>
</div><!--/.well -->

<script>
  $(function(){
    wantong.frame.menu.init();
  });
</script>

  
  
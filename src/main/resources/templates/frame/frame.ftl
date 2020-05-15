<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
    "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html>
<head>
  <title>玩瞳慧读云控制台</title>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <!-- Bootstrap -->
    <@link href="/js/layui/css/layui.css" rel="stylesheet"/>
    <@link href="/css/frame/frame.css" rel="stylesheet"/>
    <@link href="/css/bootstrap.css" rel="stylesheet" media="screen"/>
    <@link href="/css/dashboard.css" rel="stylesheet"/>
    <@link href="/css/uploader/webuploader.css" rel="stylesheet"/>
    <@link href="/css/framework/framework.css" rel="stylesheet"/>
    <@link href="/css/style.css" rel="stylesheet"/>
  </head>
  <body>
  <div id="imageValidationConfig" hidden="hidden">${imageValidationConfig}</div>
  <div class="main-w-sidebar">
    <div class="main-w-logo">
      <a id="goHomeBtn" class="direct-menu" name="首页" href="#" url="<@contextPath/>/system/dashboard.do">
        <img src="<@staticPath/>/images/log2.png" />
      </a>
    </div>
    <div class="main-w-nav">
      <a class="list-title direct-menu" name="首页" href="#" url="<@contextPath/>/system/dashboard.do">
        <i><img src="<@staticPath/>/images/icoimg.png"/></i>
        <div class="arrow"><img src="<@staticPath/>/images/ico-r.png" width="8" height="12" /></div>
        <span style="color: #FFF">首页</span>
      </a>
      <ul id="accordion" class="accordion">
        <#list menus as menu>
          <li class="top-menu">
            <div class="link">
              <i class="fa-leaf"><img src="${menu.img}"/></i>
                ${menu.topMenu.name}
              <i class="fa-chevron-down"></i></div>
            <ul class="submenu">
                <#list menu.sceondsMenu as m>
                    <!-- 二级菜单url为空则不显示 -->
<#--                    <#if m.url?default("")?trim?length gt 1>-->
                    <!-- 只要不是虚拟节点开头的url菜单都显示 -->
                    <#if m.url?index_of("/virtual") != 0>
                        <@checkPrivilege url="${m.url}">
                          <li><a href="#" class="direct-menu" name="${m.name}" url="${m.url}"><#if (partnerId != 1 && m.name=="工单管理")>做书进度<#else>${m.name}</#if></a></li>
                        </@checkPrivilege>
                    </#if>
                </#list>
            </ul>
          </li>
        </#list>
    </ul>
  </div>
    <#--导航栏底部-->
  <div class="main-w-bottom">
      <#--<div class="link bottom-link">-->
    <a href="/menu/userAgreement.do" class="bottom-link" target="_blank">《用户使用协议》</a>
      <#--</div>-->
  </div>
</div>
<div class="bce-content-w">
  <div class="header-w">
    <a href="<@contextPath/>/system/loginOut.do">退出</a>
    <div class="assis-nav nav" style="display: inline-block; float: right;margin-right: 25px;">
      <div class="top-nav">
        <ul class="one-items">
          <li><a class="link" href="#" style="padding: 0 10px; margin: 0 10px;">帮助中心<div class="nav-more"></div></a>
            <ul class="two-items">
              <li><a href="https://www.showdoc.cc/visiontalk" target="_blank">开发文档</a></li>
              <li><a href="https://www.showdoc.cc/bailubtr?page_id=2361644354643369" target="_blank">内容制作</a></li>
              <li><a href="https://www.showdoc.cc/bailubtr?page_id=2146708009922720" target="_blank">应用管理</a></li>
              <li><a href="https://www.showdoc.cc/bailubtr?page_id=2146635900268915" target="_blank">运营管理</a></li>
              <li><a href="https://www.showdoc.cc/bailubtr?page_id=2146667817380310#" target="_blank">系统管理</a></li>
            </ul>
          </li>
        </ul>
      </div>
    </div>
    </div>
  <div class="container-fluid main-w-area" id="moduleBodyDiv">
  </div>
    <@script src="/js/3rd-party/json2.js"/>
    <@script src="/js/3rd-party/jquery-2.2.4.min.js"/>
    <@script src="/js/3rd-party/bootstrap.min.js"/>
    <@script src="/js/uploader/webuploader.js"/>
    <@script src="/js/common/global.js"/>
    <@script src="/js/common/frame.js"/>
    <@script src="/js/common/controls.js"/>
    <@script src="/js/common/jquery.form.js"/>
    <@script src="/js/layui/layui.js"/>
    <@script src="/js/cookie/jquery.cookie.js"/>
    
    <@script src="/js/framework/framework.js"/>
    <@script src="/js/common/scaner-connector.js"/>
    <@script src="/js/leftnav.js"/>
    <@script src="/js/frame/menu.js"/>

  <#--  <@script src="/js/system/systemconfiglist.js"/>-->
    <script>
	    layui.use(['layer', 'form'], function(){
			var layer = layui.layer,
				form = layui.form;
		});
	    $(function(){
	    	GlobalVar.services.FDS = "${FDSEndpoint}";
        GlobalVar.services.FDSES = JSON.parse('${FDSEndpoints}');
	    	GlobalVar.services.DOWNLOAD="${DOWNLOADEndpoint}";
	    	GlobalVar.services.ISBN="${ISBNEndpoint}";
	    	GlobalVar.services.BOOKIMAGEPATH="${BookImagePath}";
	    	GlobalVar.services.THUMBNAILPATH="${ThumbnailPath}";
	    	GlobalVar.services.APPOPERATINGCONFIGPATH = "${AppOperatingConfigPath}";
	    	GlobalVar.services.CARDIMAGEPATH = "${cardImagePath}";
	    	wantong.frame.init();
	    });
    </script>

<#--  <script aysnc="aysnc">-->
<#--    let $body = $("body");-->
<#--    $body.append($('<link rel="stylesheet" href="/static/js/3rd-party/element-ui/2.12.0/lib/theme-chalk/index.css" />'));-->
<#--    $body.append($('<script aysnc="aysnc" src="/static/js/3rd-party/vue/2.6.10/dist/vue.min.js" />'));-->
<#--    $body.append($('<script aysnc="aysnc" src="/static/js/3rd-party/element-ui/2.12.0/lib/index.js" />'));-->
<#--    $body.append($('<script aysnc="aysnc" src="/static/js/3rd-party/echarts/4.1.0/dist/echarts.min.js" />'));-->
<#--  </script>-->

  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/element-ui@2.12.0/lib/theme-chalk/index.css">
  <script aysnc="aysnc" src="https://cdn.jsdelivr.net/npm/vue@2.6.10/dist/vue.min.js"></script>
  <script aysnc="aysnc" src="https://cdn.jsdelivr.net/npm/element-ui@2.12.0/lib/index.js"></script>

  </body>
</html>
<@script src="/js/3rd-party/vue/2.6.10/dist/vue.min.js" />
<@link rel="stylesheet" href="/js/3rd-party/element-ui/2.12.0/lib/theme-chalk/index.css" />
<@script src="/js/3rd-party/element-ui/2.12.0/lib/index.js" />
<@link href="/css/cms/picturebook.css" rel="stylesheet"/>
<@script src="/js/cms/cmsInit.js" />
<@script src="/js/nbe/listBook.js" />

<div id="bookList" xmlns="http://www.w3.org/1999/html" xmlns="http://www.w3.org/1999/html">
  <div class="main-w">
    <!--图书管理-->
    <div id="bookNavi" class="content-nav">
      <div class="con-nav-top">
        <form>
        </form>
      </div>
      <div class="con-nav-cen">
        <ul id="listTab">
             <li index = "100" role="presentation" class="active"><a href="#">领书</a></li>
             <li index = "0" role="presentation"><a href="#">书库</a></li>
        </ul>
      </div>
    </div>
    <div class="content-right">
      <div class="content-wrap-w">
        <div class="content-r-path">AI课程制作 / 绘本制作 / <span id="curContentTab">领书</span></div>
        <div class="content-box">
          <div class="con-r-top">
            <input id="modelId" style="display: none;" value="${modelId}"></input>
            <#--页面头查询组-->
            <div id="searchTerms" class="con-search" style="margin-top: 10px">
              <ul>
                    <Li><span class="search-name">书名：</span><span class="search-span"><input name="text" type="text" id="bookName" placeholder="请输入书名" class="search-box search-width" /></span></Li>
                    <Li><span class="search-name">ISBN：</span><span class="search-span"><input name="text" type="text" id="isbn" placeholder="请输入完整ISBN号" maxlength="13" class="search-box search-width" /></span></Li>
                    <Li><span class="search-name">出版社：</span><span class="search-span"><input name="text" type="text" id="press" placeholder="请输入关键字" class="search-box search-width" /></span></Li>
                    <Li><span class="search-name">系列名：</span><span class="search-span"><input name="text" type="text" id="dubble" placeholder="请输入关键字" class="search-box search-width" /></span></Li>
                    <Li><span class="search-name">版次：</span><span class="search-span"><input name="text" type="text" id="edition" placeholder="请输入完整版次" class="search-box search-width" /></span></Li>
                    <#if partnerId == 1>
                        <Li><span class="search-name">书本编号：</span><span class="search-span"><input name="text" type="text" id="bookNumber" maxlength="12" placeholder="请输入完整编号" class="search-box search-width" /></span></Li>
                        <Li><span class="search-name">BookID：</span><span class="search-span"><input name="text" type="text" id="bookId" placeholder="请输入完整ID" class="search-box search-width" /></span></Li>
                   <#else>
                       <Li style="display: none"><span class="search-name">书本编号：</span><span class="search-span"><input name="text" type="text" id="bookNumber" maxlength="12" placeholder="请输入完整编号" class="search-box search-width" /></span></Li>
                       <Li style="display: none"><span class="search-name">BookID：</span><span class="search-span"><input name="text" type="text" id="bookId" placeholder="请输入完整ID" class="search-box search-width" /></span></Li>
                   </#if>

                    <Li><span class="search-name">标签名：</span><span class="search-span"><input name="text" type="text" id="label-name" maxlength="15" placeholder="请输入完整标签名" class="search-box search-width" /></span></Li>
                </ul>
              <#--领书模块的提示-->
              <div class="ref-module-hint">
                <a href="#" style="width: 20px;float: left">
                    <@checkDefaultTheme env="${Session.subDomainStyle.style!'original'}" match="TRUE">
                      <img src="<@staticPath/>/images/${Session.subDomainStyle.style!'original'}/hint-ico.jpg" style="width: 20px">
                    </@checkDefaultTheme>
                    <@checkDefaultTheme env="${Session.subDomainStyle.style!'original'}" match="FALSE">
                      <img src="<@staticPath/>/images/hint-ico.jpg" style="width: 20px">
                    </@checkDefaultTheme>
                </a>
                <div class="hint-content" style="float: left;width: 90%;">
                  <label class="text" style="font-weight: normal;line-height: 19px">请先在上方搜索您想要制作资源的书本，领取书本。<br/> 领取后，在“书库”菜单下，可对书本进行资源制作。</label>
                </div>
              </div>
              <div class="con-search-input" style="width: 100% !important;">
                <input name="" type="submit" value="搜索"  class="frame-Button-b search-Button" style="width:15%; margin-right:3%"/>
                <input name="" type="button" value="清空"  class="search-Button02" id="clearBtn" />
              </div>

            </div>
          </div>
          <#--领书模块-->
          <div id="referenceBookList" style="margin-top: 30px;" class="active showModule">
          </div>
          <#--书库-->
          <div id="nbeBookList" style="margin-top: 30px" class="hideModule">
          </div>
        </div>
      </div>
    </div>
    <!--图书管理结束-->
  </div>
</div>
<style>
.hideModule {
display: none;
}
.showModule{
display: block;
}
</style>
<script>
  $(function () {
      wantong.nbeListBook.init(
          ${index},
          ${repoId}
      );
  });
</script>

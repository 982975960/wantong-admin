<div class="main-w">
  <div class="content-wrap-w">
    <div class="user-profile-w">欢迎回来<span id="emailSpan" class="branding-textcolor" style="margin-left: 10px">${email}</span></div>
    <div class="blorck-con">
      <!-- 授权数据 min-width: 352px -->
      <div class="l-block row-r block-back" style="width: 22%;">
        <div class="l-block-title">
          <span class="branding-titleFontico"></span>
          <div class="l-block-title-left">装机量数据
            <div id="consumeHelp" class="button" style="margin-left: 5px;display: inline-block; cursor: pointer">
              <img src="/static/images/help.png" style="width: 15px">
            </div>
          </div>
          <div class="l-block-title-right" id="consumeMore"><a href="#">更多</a></div>
        </div>

        <div class="l-block-con big-font-size">
            <#-- 当前 -->
            <#--判断allUnpay是否为null-->
            <#if (consumeData.unpaidUnused??)>
                <#assign allUnpay = consumeData.unpaidUnused + consumeData.unpaidUsed>
                <#assign allPay = consumeData.payUnused + consumeData.payUsed>
            <#else>
                <#assign allUnpay = '0'>
                <#assign allPay = '0'>
            </#if>

                <!-- 仅预付费 -->
                <#assign all = allUnpay>
                <#assign used = consumeData.unpaidUsed>
                <#assign unused = all - used>
                <#assign increaseCount = consumeData.increase>

          <div id="usePie" class="use-pie"
               <@checkPrivilege url="/virtual/consumeData.do" def="all='0' used='0' unused='0'">
                 all="#{all!'1'}" used="#{used!'0'}" unused="#{unused!'1'}"
               </@checkPrivilege>
          ></div>
          <div id="useData" class="use-data">
            <div class="license-text">累计装机量</div>
            <div class="license-text-val">
                <@checkPrivilege url="/virtual/consumeData.do" def="--">
                  #{all!'0'}
                </@checkPrivilege>
            </div>
            <div class="dot-line">
              <span class="dot dot-blue"></span><span class="active-text">已激活　</span>
              <span class="used-text">
                <@checkPrivilege url="/virtual/consumeData.do" def="--">
                    #{used!'0'}
                </@checkPrivilege>
              </span>
            </div>
            <div class="dot-line">
              <span class="dot dot-gray"></span><span class="active-text">未激活　</span>
              <span class="unused-text">
                  <@checkPrivilege url="/virtual/consumeData.do" def="--">
                      #{unused!'0'}
                  </@checkPrivilege></span>
            </div>

            <div class="dot-line">
              <span class="dot dot-red"></span><span class="active-text">今日新增</span>
              <span class="increase-text">
                  <@checkPrivilege url="/virtual/consumeData.do" def="--">
                    #{increaseCount!'0'}
                  </@checkPrivilege>
                </span>
            </div>
          </div>
<#--          <div class="l-block-color"><span class="lv"></span><span class="hui"></span></div>-->
        </div>
      </div>
      <!-- 用户数据 -->
      <div class="c-block row-r block-back" style="width: 55%">
        <div class="c-block-title">
          <span class="branding-titleFontico"></span>
          <div class="c-block-title-left">用户数据
            <div id="customerHelp" class="button" style="margin-left: 5px;display: inline-block; cursor: pointer">
              <img src="/static/images/help.png" style="width: 15px">
            </div>
          </div>

          <div class="c-block-title-right ">
            <div class="dubble-toggle-btn" style="margin-top: -4px">
              <span tabId="yesterdayData" class="toggle left toggle-active">昨日</span>
              <span tabId="lastWeekData" class="toggle right">上周</span>
            </div>
          </div>
<#--          <div class="c-block-title-right" id="appMore"><a href="#">更多</a></div>-->
        </div>
        <div class="l-block-con" id="appDiv">
          <ul>
            <li>
              <table width="100%" border="0" cellpadding="0" cellspacing="0">
                <#assign yesterdayData = absData.yesterday>
                <tr id="yesterdayData">
                  <td width="25%" align="center">
                    <div class="circle-data">
                      <div class="text">新增用户</div>
                      <div class="data">
                          <@checkPrivilege url="/virtual/customerData.do" def="--">#{yesterdayData.userNewCount!'0'}</@checkPrivilege>
                      </div>
                    </div>
                  </td>
                  <td width="25%" align="center" class="data-title">
                    <div class="circle-data">
                      <div class="text">活跃用户</div>
                      <div class="data">
                        <@checkPrivilege url="/virtual/customerData.do" def="--">#{yesterdayData.userActiveCount!'0'}</@checkPrivilege>
                      </div>
                    </div>
                  </td>
                  <td width="25%" align="center" class="data-title">
                    <div class="circle-data">
                      <div class="text">启动次数</div>
                      <div class="data">
                      <@checkPrivilege url="/virtual/customerData.do" def="--">#{yesterdayData.countStartApp!'0'}</@checkPrivilege>
                      </div>
                    </div>
                  </td>
                  <td width="25%" align="center" class="data-title">
                    <div class="circle-data">
                      <div class="text">累计用户</div>
                      <div class="data">
                      <@checkPrivilege url="/virtual/customerData.do" def="--">#{yesterdayData.userTotalCount!'0'}</@checkPrivilege>
                      </div>
                    </div>
                  </td>
                </tr>
                  <#assign lastWeekData = absData.lastWeek>
                <tr id="lastWeekData" style="display: none;">
                  <td width="25%" align="center">
                    <div class="circle-data">
                      <div class="text">新增用户</div>
                      <div class="data">
                      <@checkPrivilege url="/virtual/customerData.do" def="--">#{lastWeekData.userNewCount!'0'}</@checkPrivilege>
                      </div>
                    </div>
                  </td>
                  <td width="25%"  align="center">
                    <div class="circle-data">
                      <div class="text">日均活跃</div>
                      <div class="data">
                      <@checkPrivilege url="/virtual/customerData.do" def="--">#{lastWeekData.userActiveCount!'0'}</@checkPrivilege>
                      </div>
                    </div>
                  </td>
                  <td width="25%" align="center">
                    <div class="circle-data">
                      <div class="text">启动次数</div>
                      <div class="data">
                      <@checkPrivilege url="/virtual/customerData.do" def="--">#{lastWeekData.countStartApp!'0'}</@checkPrivilege>
                      </div>
                    </div>
                  </td>
                  <td width="25%" align="center">
                    <div class="circle-data">
                      <div class="text">累计用户</div>
                      <div class="data">
                      <@checkPrivilege url="/virtual/customerData.do" def="--">#{lastWeekData.userTotalCount!'0'}</@checkPrivilege>
                      </div>
                    </div>
                  </td>
                </tr>
              </table>
            </li>
          </ul>
<#--          <div class="l-block-color"><span class="lan"></span><span class="lanhui"></span></div>-->
        </div>
      </div>
      <!-- 公告数据 -->
      <div class="r-block  block-back">
        <div class="r-block-title">
          <span class="branding-titleFontico"></span>
          <div class="r-block-title-left">公告</div>
            <#--          <div class="l-block-title-right" id="messageMore"><a href="#">更多</a></div>-->
          <div class="r-block-title-right"><a href="https://www.showdoc.cc/vtnotice" target="_blank">更多</a></div>
        </div>
        <div class="l-block-con big-font-size annos">
          <ul style="height: 167px;">
            <li style="line-height: 27px;">
              <table width="100%" border="0" cellpadding="0" cellspacing="0">
                  <#if (annos?size>0)>
                      <#list annos as anno >
                        <tr>
                          <td width="70%" align="left"
                              style="color:#737373;padding-left: 0;display:inline-block; overflow: hidden;white-space: nowrap;text-overflow: ellipsis;">
                            <a href="${anno.href}" target="_blank">${anno.title!}</a></td>
                          <td width="auto" align="right"
                              style="padding-right:0;float: right;display:inline-block;color:#b1b2b4;">${anno.createTime?substring(5,10)}</td>
                        </tr>
                      </#list>
                  </#if>
              </table>
            </li>
          </ul>
<#--          <div class="l-block-color"><span class="huang"></span><span class="hui"></span></div>-->
        </div>
      </div>
      <div class="pro-block row-r row-t block-back">
        <div class="pro-block-title">
          <span class="branding-titleFontico"></span>
          <div class="pro-block-title-left">最新上线</div>
          <div class="pro-block-title-right" id="moreBooks"><a href="#">更多</a></div>
        </div>
        <div class="pro-block-con row-t" id="booksDiv">
          <div class="pro-block-box">
              <#if (books?size>0)>
                  <#list books as book >
                    <dl>
                      <dt><img
                            src="<@filesServicePath bookImage="true" src="/${book.modelId!}/${book.id!}/${book.coverImage!}"></@filesServicePath>"
                            width="80" height="80"/></dt>
                      <dd>
                        <h2>${book.name!}</h2>
                        <span>${book.author!}</span>
                      </dd>
                    </dl>
                  </#list>
              </#if>
          </div>
        </div>
      </div>
      <div class="pro-right row-t"></div>
      <div class="text-block row-t block-back">
        <div class="text-block-title">
          <span class="branding-titleFontico"></span>
          <div class="text-block-title-left">书本需求反馈</div>
          <div class="text-block-title-right" id="moreFeekBack"><a href="#">更多</a></div>
        </div>
        <div class="text-block-con row-t" id="feekBackDiv">
          <ul>
            <li>
              <table class="frame-feedback" width="100%" border="0" cellpadding="0" cellspacing="0">
                <tr class="text-block-head">
                  <td width="32%" align="left" valign="middle" nowrap="nowrap" style="border-bottom:none;">书名
                  </td>
                  <td width="22%" align="left" valign="middle" nowrap="nowrap" style="border-bottom:none;">作者
                  </td>
                  <td width="22%" align="left" valign="middle" nowrap="nowrap" style="border-bottom:none;">出版社
                  </td>
                  <td width="18%" align="left" valign="middle" nowrap="nowrap" style="border-bottom:none;">ISBN
                  </td>
                  <td width="6%" align="left" valign="middle" nowrap="nowrap" style="border-bottom:none;">反馈人数
                  </td>
                </tr>
                  <#if (fbData?size>0)>
                      <#list fbData as l>
                        <tr class="big-font-size">
                          <td align="left">
                              ${l.name}
                          </td>
                          <td align="left">
                              ${l.author}
                          </td>
                          <td align="left">
                              ${l.publisher}
                          </td>
                          <td align="left">
                              ${l.isbn}
                          </td>
                          <td align="left">
                              ${l.bookCount}
                          </td>
                        </tr>
                      </#list>
                  </#if>
              </table>
            </li>
          </ul>

        </div>
      </div>
    </div>
  </div>
</div>
<@script src="/js/3rd-party/echarts/4.1.0/echarts.min.js" />
<@script src="/js/frame/dashboard.js"/>
<script>
  $(function () {
    wantong.dashboard.init();
  });
</script>
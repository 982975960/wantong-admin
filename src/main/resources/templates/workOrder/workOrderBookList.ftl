<#--定义工单里书本的数量-->
<#assign workOrderBookAmount = workOrderBookList?size>


<div class="con-r-top">
  <div>
      <div class="work-name"><h2 style="line-height: 38px"><#if (partnerId==1)>工单名称:<#else>需求批次名称&nbsp;:&nbsp;&nbsp;&nbsp;&nbsp;</#if></h2><span class="workOrderName">${workOrderName}</span></div>
  </div>
  <div class="work-con">
      <div class="work-search">
          <ul>
              <Li>
                  <span class="search-name">书名：</span>
                  <span class="search-span">
                    <input name="text" type="text" id="name" placeholder="请输入书名" class="search-box search-width" value="${searchVO.name!""}"/>
                  </span>
              </Li>
              <Li>
                  <span class="search-name">ISBN：</span>
                  <span class="search-span">
                    <input name="text" type="text" id="isbn" class="search-box search-width" value="${searchVO.isbn!""}"
                     onkeyup="this.value=this.value.replace(/[^0-9]+/,'');" placeholder="请输入10或13位纯数字"
                     maxlength="13"/>
                  </span>
              </Li>
              <Li>
                  <span class="search-name">作者名称：</span>
                  <span class="search-span">
                    <input name="text" type="text" id="author" placeholder="请输入作者名称" class="search-box search-width" value="${searchVO.author!""}"  />
                  </span>
              </Li>
              <Li>
                  <span class="search-name">出版社：</span>
                  <span class="search-span">
                    <input name="text" type="text" id="publisher" placeholder="请输入出版社" class="search-box search-width" value="${searchVO.publisher!""}" />
                  </span>
              </Li>
              <Li>
                  <span class="search-name">系列名：</span>
                  <span class="search-span">
                    <input name="text" type="text" id="seriesTitle" placeholder="请输入系列名" class="search-box search-width" value="${searchVO.seriesTitle!""}" />
                  </span>
              </Li>
              <#if (partnerId==1)>
              <Li>
                  <span class="search-name">书本编号：</span>
                  <span class="search-span">
                    <input name="text" type="text" id="innerId" class="search-box search-width" value="${searchVO.innerId!""}"
                         onkeyup="this.value=this.value.replace(/[^0-9]+/,'');"
                         placeholder="书本编号不能大于12位" maxlength="12"/>
                  </span>
              </Li>
              </#if>
          </ul>
      </div>
      <div class="work-search-input">
          <input name="" type="button" value="搜索" id="workOrderSearchBtn" class="frame-Button-b search-Button"
                 style="width:100%; padding:7px 15px;"/>
          <span style="width:100%; text-align:center; float:left; margin-top:20px;">
          <input type="button" value="清空" class="search-Button02" id="workOrderClearBtn"/>
        </span>
      </div>
  </div>
  <div style="width: 100%;float: left;margin-top: 15px;">
      <div class="work-left" style="width:50%;">

        <select size="1" id="state" class="con-r-top-l-frame frame-line" style=" width:180px; margin-right:10px;">
            <#if state ??>
              <option value="100">所有状态</option>
                <#list states as stateItem>
                  <option value="${stateItem.state}"
                          <#--判断加入一个属性-->
                          <#if state == stateItem.state>
                    selected="selected"
                          </#if>>
                      <#--todo 界面状态 需要再控制层加上状态 搜索 加上状态-->
                      ${stateItem.name}
                  </option>
                </#list>
            <#else>
              <option value="100" selected="selected">所有状态</option>
                <#list states as state>
                  <option value="${state.state}">${state.name}</option>
                </#list>
            </#if>
        </select>
      </div>
      <div class="work-right" style="width:50%;">
          <#if (workOrderId != huibenOrderId && workOrderId != testOrderId) >
              <@checkPrivilege url="/work/createWorkOrderBook.do">
                <input name="提交" type="submit" class="Button-left work-ico frame-Button-work" id="addOneWorkOrderBook"
                       value="添加任务"/>
                <input name="提交" type="submit" id="batchWorkOrderBooks" class="frame-Button-b Button-left" value="批量导入任务"/>
              </@checkPrivilege>
          </#if>
      </div>
  </div>
</div>
<#--主题书本详情显示-->
<div class="work-tab">
  <ul class="work-block-head">
    <#if (partnerId==1)>
      <li style=" width:4%; text-align:center;">序号</li>
      <li style=" width:9%;">书本编号</li>
      <li style=" width:13%;"><span class="red">*</span>ISBN</li>
      <li style=" width:10%;"><span class="red">*</span>书名</li>
      <li style=" width:10%;"><span class="red">*</span>作者名称</li>
      <li style=" width:10%;"><span class="red">*</span>出版社</li>
      <li style=" width:10%;">所属系列</li>
      <li style=" width:10%;">任务状态</li>
      <li style=" width:14%;">操作</li>
      <li style=" width:10%;">备注</li>
    <#else>
      <li style=" width:8%; text-align:center;">序号</li>
      <li style=" width:20%;"><span class="red">*</span>ISBN</li>
      <li style=" width:20%;"><span class="red">*</span>书名</li>
      <li style=" width:13%;"><span class="red">*</span>作者名称</li>
      <li style=" width:13%;"><span class="red">*</span>出版社</li>
      <li style=" width:13%;">所属系列</li>
      <li style=" width:13%;">任务状态</li>
    </#if>
  </ul>
  <div class="work-list" style="border:1px solid #eceff8; border-top:none; width:99.8%">
    <ul class="work-list-top">

        <#if (workOrderBookAmount>0)>
            <#list workOrderBookList as item>
              <#if (partnerId==1)>
                <li>
                  <span style=" width:4%; text-align:center;">${item_index+1}</span>
                  <span style=" width:9%;" title="<#if (item.innerId != 0)>${item.innerId}</#if>">
                     <#if (item.innerId != 0)>
                         ${item.innerId}
                     </#if>
                  </span>
                  <span style=" width:13%;" title="${item.isbn}">${item.isbn}</span>
                  <span style=" width:10%;" title="${item.name}"> ${item.name}</span>
                  <span style=" width:10%;" title="${item.author}"> ${item.author}</span>
                  <span style=" width:10%;" title="${item.publisher}">${item.publisher}</span>
                  <span style=" width:10%;" title="${item.seriesTitle}">${item.seriesTitle}</span>
                  <span style=" width:10%;">
                    ${item.stateDTO.name}
                  </span>
                  <span style=" width:14%;">
                    <#if (item.state < 3)>
                        <@checkPrivilege url="/work/updateWorkOrderBook.do">
                          <div class="Button-line height27 eidt_work_order_book" tid="${item.id}" style="margin-top:10px;height: 30px;padding: 2px 10px;cursor: pointer">编辑</div>
                        </@checkPrivilege>
                        <#else >
                        <@checkPrivilege url="/work/updateWorkOrderBook.do">
                          <div disabled class="Button-line2 height27" style="margin-top:10px;height: 30px;padding: 2px 10px;cursor: pointer;background: #f1f1f1;">编辑</div>
                        </@checkPrivilege>
                    </#if>
                    <#if (workOrderId != huibenOrderId && workOrderId != testOrderId) >
                        <@checkPrivilege url="/work/deleteWorkOrderBook.do">
                          <div class="Button-line height27 delete_work_order_book" tid="${item.id}" style="margin-top:10px;margin-bottom:10px;height: 30px;padding: 2px 10px;cursor: pointer;">删除</div>
                        </@checkPrivilege>
                        <#else >
                        <@checkPrivilege url="/work/deleteWorkOrderBook.do">
                          <div disabled class="Button-line2 height27" style="margin-top:10px;margin-bottom:10px;height: 30px;padding: 2px 10px;cursor: pointer;background: #f1f1f1;">删除</div>
                        </@checkPrivilege>
                    </#if>
                  </span>
                  <span style=" width:10%;white-space: nowrap;text-overflow: ellipsis;overflow: hidden;" title="${item.remark!""}">${item.remark!""}</span>
                </li>
              <#else>
                <li>
                  <span style=" width:8%; text-align:center;">${item_index+1}</span>
                  <span style=" width:20%;" title="${item.isbn}">${item.isbn}</span>
                  <span style=" width:20%;" title="${item.name}"> ${item.name}</span>
                  <span style=" width:13%;" title="${item.author}"> ${item.author}</span>
                  <span style=" width:13%;" title="${item.publisher}">${item.publisher}</span>
                  <span style=" width:13%;" title="${item.seriesTitle}">${item.seriesTitle}</span>
                  <span style=" width:13%;">
                    ${item.stateDTO.name}
                  </span>
                </li>
              </#if>
            </#list>
        </#if>
    </ul>

      <#--分页-->
    <div class="con-page" style="border-top: none">
        <#if (pages > 1)>
          <div id="paginationContainer">
            <div>
              <nav aria-label="Page navigation">
                <ul id="pagination" class="" currentPage="${currentPage}" pages="${pages}"
                    pageSize="${pageSize}" style="margin-top: 0px;">
                </ul>
              </nav>
            </div>
          </div>
        </#if>
    </div>
  </div>
</div>
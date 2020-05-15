<#--用来创建和编辑书本信息使用的-->

  <div class="popups-con" style="padding:0; width:100%;">
    <div class="popups-b">
      <ul class="work-block-head" style="background:#eceff8;">
        <li style=" width:13%;"><span class="red">*</span>ISBN</li>
        <li style=" width:15%;"><span class="red">*</span>书名</li>
        <li style=" width:14%;"><span class="red">*</span>作者名称</li>
        <li style=" width:14%;"><span class="red">*</span>出版社</li>
        <li style=" width:13%;">所属系列</li>
        <li style=" width:10%;">任务状态</li>
        <li style=" width:10%;">操作</li>
        <li style=" width:10%;">备注</li>
      </ul>
      <ul class="work-list-top">
        <li>
          <#if workOrderBook ??>
            <span style=" width:13%;">
              <input name="text" type="text" id="isbn" value="${workOrderBook.isbn}" maxlength="13"
                     onkeyup="this.value=this.value.replace(/[^0-9]+/,'');" class="popups-line"
                                       style="height:29px; margin-top:10px; width:110px; font-size:12px;"/>
            </span>
            <span style=" width:15%;">
              <input name="text" type="text" id="bookName" value="${workOrderBook.name}" class="popups-line"
                                       style="height:29px; margin-top:10px; width:130px; font-size:12px;"/>
            </span>
            <span style=" width:14%;">
              <input name="text" type="text" id="author" value="${workOrderBook.author}" class="popups-line"
                                       style="height:29px; margin-top:10px; width:120px; font-size:12px;"/>
            </span>
            <span style=" width:14%;">
              <input name="text" type="text" id="publisher" value="${workOrderBook.publisher}" class="popups-line"
                                       style="height:29px; margin-top:10px; width:120px; font-size:12px;"/>
            </span>
            <span style=" width:13%;">
              <input name="text" type="text" id="seriesTitle" maxlength="40" value="${workOrderBook.seriesTitle}" class="popups-line"
                                       style="height:29px; margin-top:10px; width:110px; font-size:12px;"/>
            </span>
            <span style=" width:10%;">
              <#if (workOrderBook.state>2)>
                <div id="state" tid="${workOrderBook.stateDTO.state}">${workOrderBook.stateDTO.name}</div>
              <#else>
                <select name="bookState" class="state-select" id="add-and-create-state-select"  style=" width:66px; margin-top:10px;height: 30px;line-height: 24px">
                  <#if workOrderBook.state == 0>
                    <option value="0" selected="selected">未处理</option>
                  <option value="1">待采购</option>
                  <option value="2">已采购</option>
                    <option value="13">不做处理</option>
                  <#elseif workOrderBook.state == 1>
                  <option value="0" >未处理</option>
                  <option value="1" selected="selected">待采购</option>
                  <option value="2">已采购</option>
                    <option value="13">不做处理</option>
                  <#elseif workOrderBook.state == 2 >
                    <option value="0" >未处理</option>
                  <option value="1">待采购</option>
                  <option value="2" selected="selected">已采购</option>
                    <option value="13">不做处理</option>
                  <#elseif workOrderBook.state == 13 >
                    <option value="0" >未处理</option>
                    <option value="1">待采购</option>
                    <option value="2">已采购</option>
                    <option value="13" selected="selected">不做处理</option>
                  </#if>
                </select>
              </#if>
            </span>
            <span style=" width:10%;">
              <div class="Button-line height27" id="search_repeat" tid="${workOrderBook.id}" style="cursor:pointer;margin-top:10px;height: 30px;line-height: 23px">人工查重</div>
            </span>
            <span id="remark" style="width:10%;white-space: nowrap;text-overflow: ellipsis;overflow: hidden;" title="${workOrderBook.remark}">${workOrderBook.remark}</span>
          <#else>
            <span style=" width:13%;">
              <input name="text" type="text" id="isbn" value="" maxlength="13"
                     onkeyup="this.value=this.value.replace(/[^0-9]+/,'');" class="popups-line"
                     style="height:29px; margin-top:10px; width:110px; font-size:12px;"/>
            </span>
            <span style=" width:15%;">
              <input name="text" type="text" id="bookName" value="" class="popups-line"
                     style="height:29px; margin-top:10px; width:130px; font-size:12px;"/>
            </span>
            <span style=" width:14%;">
              <input name="text" type="text" id="author" value="" class="popups-line"
                     style="height:29px; margin-top:10px; width:120px; font-size:12px;"/>
            </span>
            <span style=" width:14%;">
              <input name="text" type="text" id="publisher" value="" class="popups-line"
                     style="height:29px; margin-top:10px; width:120px; font-size:12px;"/>
            </span>
            <span style=" width:13%;">
              <input name="text" type="text" id="seriesTitle" maxlength="40" value="" class="popups-line"
                     style="height:29px; margin-top:10px; width:110px; font-size:12px;"/>
            </span>
            <span style=" width:10%;">
              <select size="1" class="state-select con-r-top-l-frame frame-line height30"
                      style=" width:66px; margin-top:10px;height: 30px">
                <option value="0" selected="selected">未处理</option>
                <option value="1">待采购</option>
                <option value="2">已采购</option>
                <option value="13">不做处理</option>
              </select>
            </span>
            <span style=" width:10%;">
              <div class="Button-line height27" id="search_repeat" tid="0" style="cursor:pointer;margin-top:10px;height: 30px;line-height: 23px">人工查重</div>
            </span>
            <span id="remark" style=" width:10%;white-space: nowrap;text-overflow: ellipsis;overflow: hidden;"></span>
          </#if>
        </li>
      </ul>
    </div>
  <#--查重列表显示模块-->
    <div id="work_order_book_repeat" style="float: left;width: 100%;height: 100%;margin-top: 10px">

    </div>

  <#--保存和取消按钮组-->
    <div class="btn-group popups-bot" style="float: right;margin-top: 10px;padding-right: 10px;margin-bottom: 20px;padding-top: 20px;">

      <span>
           <input name="提交" type="submit" class="pop-padding frame-Button Button-left cancel-button" value="取消" />
      </span>

       <#if workOrderBook ??>
        <span>
          <input name="提交" type="submit" class="pop-padding frame-Button-b Button-left confirm-button" tid="${workOrderBook.id}" value="保存" />
        </span>
       <#else>
        <span>
          <input name="提交" type="submit" class="pop-padding frame-Button-b Button-left confirm-button" tid="0" value="保存" />
        </span>
       </#if>
    </div>
  </div>
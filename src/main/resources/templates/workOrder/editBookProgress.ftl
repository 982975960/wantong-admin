<#--用来创建和编辑书本信息使用的-->

  <div class="popups-con" style="padding:0; width:100%;">
    <div class="popups-b">
      <ul class="work-block-head" style="background:#eceff8;">
        <li style=" width:20%;"><span class="red">*</span>ISBN</li>
        <li style=" width:20%;"><span class="red">*</span>书名</li>
        <li style=" width:20%;"><span class="red">*</span>作者名称</li>
        <li style=" width:20%;"><span class="red">*</span>出版社</li>
        <li style=" width:20%;">所属系列</li>
      </ul>
      <ul class="work-list-top">
        <li>
            <span style=" width:20%;">
              <input name="text" type="text" id="isbn" value="${book.isbn!}" maxlength="13"
                     onkeyup="this.value=this.value.replace(/[^0-9]+/,'');" class="popups-line"
                     style="height:29px; margin-top:10px; width:110px; font-size:12px;"/>
            </span>
            <span style=" width:20%;">
              <input name="text" type="text" id="bookName" value="${book.name!}" class="popups-line"
                     style="height:29px; margin-top:10px; width:130px; font-size:12px;"/>
            </span>
            <span style=" width:20%;">
              <input name="text" type="text" id="author" value="${book.author!}" class="popups-line"
                     style="height:29px; margin-top:10px; width:120px; font-size:12px;"/>
            </span>
            <span style=" width:20%;">
              <input name="text" type="text" id="publisher" value="${book.publisher!}" class="popups-line"
                     style="height:29px; margin-top:10px; width:120px; font-size:12px;"/>
            </span>
            <span style=" width:20%;">
              <input name="text" type="text" id="seriesTitle" maxlength="40" value="${book.seriesTitle!}" class="popups-line"
                     style="height:29px; margin-top:10px; width:110px; font-size:12px;"/>
            </span>
        </li>
      </ul>
    </div>

  <#--保存和取消按钮组-->
    <div class="btn-group popups-bot" style="float: right;margin-top: 10px;padding-right: 10px;margin-bottom: 20px;padding-top: 20px;">
        <span>
           <input type="button" class="pop-padding frame-Button Button-left cancel-button" value="取消" />
        </span>
        <span>
          <input type="button" class="pop-padding frame-Button-b Button-left confirm-button" tid="0" value="保存" />
        </span>

    </div>
  </div>
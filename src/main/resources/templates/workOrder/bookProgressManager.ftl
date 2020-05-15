<div class="content-pro" id="bookProgressDiv" style="min-height: 340px;">
    <div class="work-con">
      <div class="work-search">
        <ul>
          <Li>
            <span class="search-name">书名：</span>
            <span class="search-span">
                <input name="text" type="text" id="name" placeholder="请输入书名" class="search-box search-width"/>
              </span>
          </Li>
          <Li>
            <span class="search-name">ISBN：</span>
            <span class="search-span">
                <input name="text" type="text" id="isbn" class="search-box search-width"
                       onkeyup="this.value=this.value.replace(/[^0-9]+/,'');" placeholder="请输入10或13位纯数字"
                       maxlength="13"/>
              </span>
          </Li>
          <Li>
            <span class="search-name">作者名称：</span>
            <span class="search-span">
                <input name="text" type="text" id="author" placeholder="请输入作者名称" class="search-box search-width"/>
              </span>
          </Li>
          <Li>
            <span class="search-name">出版社：</span>
            <span class="search-span">
                <input name="text" type="text" id="publisher" placeholder="请输入出版社" class="search-box search-width"/>
              </span>
          </Li>
          <Li>
            <span class="search-name">系列名：</span>
            <span class="search-span">
                <input name="text" type="text" id="seriesTitle" placeholder="请输入系列名" class="search-box search-width"/>
              </span>
          </Li>
          <#if (tab = 1)>
          <Li>
            <span class="search-name">书本编号：</span>
            <span class="search-span">
                <input name="text" type="text" id="innerId" class="search-box search-width"
                       onkeyup="this.value=this.value.replace(/[^0-9]+/,'');"
                       placeholder="书本编号不能大于12位" maxlength="12"/>
              </span>
          </Li>
          </#if>
        </ul>
      </div>
      <div class="work-search-input">
        <input name="" type="button" value="搜索" id="searchBtn" class="frame-Button-b search-Button"
               style="width:100%; padding:7px 15px;"/>
        <span style="width:100%; text-align:center; float:left; margin-top:20px;">
            <input type="button" value="清空" class="search-Button02" id="clearBtn"/>
          </span>
      </div>
    </div>
    <div class="work-bot">
      <div class="work-left" style="width: 100%;">
        <input hidden type="text" style="width: 400px;margin-left: 10px" class="con-r-top-l-frame frame-line"
               id="workOrderInput" placeholder="请输入客户名称开始搜索" />
        <#if (tab = 1)>
        <div style=" height:33px;width: 300px;float: left;">
          <select id="workOrderSelect" class="form-control form-control-chosen"
                  data-placeholder="请输入工单名称查询">
            <option value="-1" ></option>
              <#list allWorkOrder as p>
                <option value="${p.id}">${p.name}</option>
              </#list>
          </select>
        </div>
        </#if>

        <div id="selector" tab="${tab}">
          <span class="mr-selector" style="white-space: nowrap;text-overflow: ellipsis;overflow: hidden;" title="请选择书本状态"><#if (tab = 1)>请选择任务状态<#else>玩瞳书本图像状态</#if></span>
          <span class="img-selector" style="float: right;background: url(static/images/ico6.png) no-repeat 97% center transparent;width: 25px;height: 20px;margin-top: -25px;margin-right: 10px;"></span>
          <ul class="select">
            <#if (tab = 1)>
              <li><input type="checkbox" value="-1" name = "全选"/>全选</li>
              <li><input type="checkbox" value="0" name = "未处理"/>未处理</li>
              <li><input type="checkbox" value="1" name = "待采购"/>待采购</li>
              <li><input type="checkbox" value="2" name = "已采购"/>已采购</li>
              <li><input type="checkbox" value="3" name = "书本信息已创建"/>书本信息已创建</li>
              <li><input type="checkbox" value="4" name = "图片待采样"/>图片待采样</li>
              <li><input type="checkbox" value="5" name = "图片待审核"/>图片待审核</li>
              <li><input type="checkbox" value="6" name = "图片待训练"/>图片待训练</li>
              <li><input type="checkbox" value="7" name = "图片训练中"/>图片训练中</li>
              <li><input type="checkbox" value="8" name = "图片已发布"/>图片已发布</li>
              <li><input type="checkbox" value="9" name = "资源待编辑"/>资源待编辑</li>
              <li><input type="checkbox" value="10" name = "资源待审核"/>资源待审核</li>
              <li><input type="checkbox" value="11" name = "资源已审核"/>资源已审核</li>
              <li><input type="checkbox" value="12" name = "资源禁用中"/>资源禁用中</li>
              <li><input type="checkbox" value="13" name = "不做处理"/>不做处理</li>
            <#else>
              <li><input type="checkbox" value="-1" name = "全选"/>全选</li>
              <li><input type="checkbox" value="0" name = "待处理"/>待处理</li>
              <li><input type="checkbox" value="2" name = "已采购"/>已采购</li>
              <li><input type="checkbox" value="3" name = "图片制作中"/>图片制作中</li>
              <li><input type="checkbox" value="8" name = "图片已完成"/>图片已完成</li>
            </#if>
            <div style="width: 100%;float: left;border-top: 1px solid #eceff8;margin: 5px 0;text-align: right;">
              <input type="button" id="stateSureBtn" class="pop-padding frame-Button-b" style="padding: 1px 15px;margin: 12px 10px 7px 10px;" value="确定"/>
            </div>
          </ul>
        </div>

        <input hidden type="text" style="width: 400px;margin-left: 10px" class="con-r-top-l-frame frame-line"
               id="sortTypeSelectInput" placeholder="请选择书本编号排列方式" />
        <#if (tab = 1)>
        <div style=" width:180px;height: 33px;float: left;">
          <select id="sortTypeSelect" class="form-control form-control-chosen"
                  data-placeholder="请选择书本编号排列方式">
            <option value="-1" ></option>
            <option value="0">升序</option>
            <option value="1">降序</option>
          </select>
        </div>
        </#if>
        <div class="work-right" style="width: auto">
            <@checkPrivilege url = "/work/download.do">
              <input name="提交" type="submit" class=" frame-Button Button-left" value="导出表格" id="leadOutExcelBtn"/>
            </@checkPrivilege>
        </div>
        <div style="float: right">
            <@checkPrivilege url = "/work/batchCreateBook.do">
              <input type="submit" class=" frame-Button Button-left" value="批量创建书本信息" id="batchCreateBookBtn" style="display: none"/>
            </@checkPrivilege>
        </div>
        <div style="float: right">
            <@checkPrivilege url = "/work/batchUpdateState.do">
              <input type="submit" class=" frame-Button Button-left" value="批量修改任务状态" id="batchUpdateStateBtn" style="display: none"/>
            </@checkPrivilege>
        </div>
      </div>
    </div>

    <div id="bookProgressListDiv">

    </div>

    <div id="bookProgressCheckDiv" style="display: none">
      <div id="taskCheckInfoDIV">
        <ul class="work-block-head" style="background:#eceff8;">
          <li style=" width:10%;">书本编号</li>
          <li style=" width:13%;"><span class="red">*</span>ISBN</li>
          <li style=" width:15%;"><span class="red">*</span>书名</li>
          <li style=" width:14%;"><span class="red">*</span>作者名称</li>
          <li style=" width:14%;"><span class="red">*</span>出版社</li>
          <li style=" width:13%;">所属系列</li>
          <li style=" width:10%;">任务状态</li>
        </ul>
        <ul class="work-list-top">
          <li>
                <span style=" width:10%;" id="bookNumber"></span>
                <span style=" width:13%;" id="isbn"></span>
                <span style=" width:15%;" id="bookName"></span>
                <span style=" width:14%;" id="author"></span>
                <span style=" width:14%;" id="publisher"></span>
                <span style=" width:13%;" id="seriesTitle"></span>
                <span style=" width:10%;" id="stateName"></span>
          </li>
        </ul>
      </div>
      <div id="checkDiv">

      </div>
    </div>

    <div id="bookPageInfoIDiv" style="display: none">
      <div id="itemTemplate" class="col-md-2" style="display:none; width: 150px;height: 112px;">
        <div id="thumbnailContainer" class="thumbnail-container text-center center-block">
          <div id="thumbnail" class="page-thumbnail-container">
            <img
                src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIwAAACgBAMAAAAsgJlAAAAAGFBMVEXc29y7u7zExMXU09TNzM3JyMnQ0NHAv8ANuow4AAABgElEQVRo3u3UvW7CMBSG4dOG0LU2DazYhbI6MT8rgRRWirgA4AoKS2+/JyZEqoJUW2zoeyTWN/YnEgIAAAAAAAAAAHgk7XcqPffpLq0OlZ5eqV3UVpSLq05g5lnUJOW6MvLJRHbyZu0lE1k269oS5YZoUD3mf+4E8pJx0mojzsRd70y7WCTFKtNaySGVlKkzuVum5b9NejnTkacQurTnTFvy1iokU10qdxUltZpz5kvtKTrtW4ETu4tInuuVUs5kSZxQ3vXbJhWlab+ZsXM6/EjjlxkXpazTzBiK1iLxy7BoyT95zQhWnWZykjYX5yJgYmWqTK8o1pfMrDcwRBMVkjlsGpeamlicd3u/S8V6JPWQr3Rrm08l+kEvQ8tcM9Zm1wyzhoL+fs2JzYsuOBWYaZ4m46LcmcBMcxsaL07CNxMnW9W/nWFjv0sdBZObpVXff17NwK9f2huuDJESYu4yDmcCv8UROVv9Qe5STnWpers72PpBhgAAAAAAAAAAAB7EL5cHSvDhqEN7AAAAAElFTkSuQmCC"
                style="" alt="封面图" class="img-thumbnail">
          </div>
          <div class="row picture-book-title-container">
            <div id="paginationText" class="picture-book-title text-center"></div>
          </div>
        </div>
      </div>
    </div>

    <div id="inputInnerIdDiv" style="display: none">
      <div class="col-md-12">
        <form method="post" action="" style="width: 100%;height: 90%">
          <div class="form-group" style="width:auto;margin-top: 15px">
            <input id="inputInnerId" type="text" class="form-control" placeholder="请输入书本编号" style="border-radius:0" maxlength="12" onkeyup="this.value=this.value.replace(/[^0-9]+/,'');">
          </div>
          <div class="modal-footer">
            <button type="button" id="createBtn" class="pop-padding frame-Button-b">继续创建</button>
            <button type="button" id="saveBtn" class="pop-padding frame-Button-b">仅保存</button>
            <button type="button" id="closeBtn" class="pop-padding frame-Button">取消</button>
          </div>
        </form>
      </div>
    </div>

    <div id="batchUpdateStateDiv" style="display: none">
      <div style="width: 100%;float: left;margin-bottom: 10px;padding-left: 9%;margin-top: 7px">
        <span style="float: left;line-height: 48px;margin-right: 10px;">将</span>
        <select id="oldStateSelect" class="con-r-top-l-frame frame-line height27" style="width:90px; margin-top:12px;line-height: 20px;">
          <option value="0">未处理</option>
          <option value="1">待采购</option>
          <option value="2">已采购</option>
        </select>
        <span style="float: left;line-height: 48px;margin-right: 10px;">改为</span>
        <select id="newStateSelect" class="con-r-top-l-frame frame-line height27" style="width:90px; margin-top:12px;line-height: 20px;">
          <option value="0">未处理</option>
          <option value="1">待采购</option>
          <option value="2">已采购</option>
        </select>
      </div>
      <div class="modal-footer" style="width: 100%;float: left">
        <button type="button" id="batchUpdateStateSaveBtn" class="pop-padding frame-Button-b">确定</button>
        <button type="button" id="batchUpdateStateCloseBtn" class="pop-padding frame-Button">取消</button>
      </div>
    </div>

</div>
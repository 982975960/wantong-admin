<#assign bookAmount = books?size>
<#assign rowSize = 6>
<#assign unpublishedAmount = 0>
<#assign rows = bookAmount/rowSize>
<#if (bookAmount%rowSize > 0)>
  <#assign rows = rows + 1>
</#if>

<#--是否是领取书本模块-->
<#if ref>
   <#--书本数量的判断-->
  <#if (bookAmount>0)>
      <#--领取书本的头部按钮-->
      <div class="ref-head">
        <div class="checkbox" style="float: left">
          <label>
            <input type="checkbox" id="checkAllBook" style="width: 20px;height: 20px;margin-top: -4px">
            <label >
            全选
            </label>
          </label>
        </div>
        <div class="ref-book-btn" style="float: left;margin-left: 20px">
          <@checkPrivilege url="/cms/pickUpBooks.do">
            <button type="button" id="refBookBtn" class="btn btn-info frame-Button-b" style="border-radius:0;padding:4px 12px; border:none;margin-top:2px;width: 70px">领书</button>
          </@checkPrivilege >
        </div>
      </div>
  </#if>
</#if>


<div class="content-pro">
  <div class="content-pro-pic">
    <#if (bookAmount > 0)>
      <#list 0..(rows - 1) as i >
        <#list 0..5 as j >
          <#assign index=i * rowSize + j>
        <#--判断是否是领书模块-->
          <#if ref>
              <#--判断书本的数量-->
             <#if (index<bookAmount)>
               <dl class="dlClass picture-hover">
                 <dt id="thumbnailContainer"
                     class="thumbnailContainer text-center center-block picture-book-thumbnail-container" style="position: relative">
                   <div id="thumbnail" class="picture-book-thumbnail">
                   <#--判断是不是领书模块-->
                     <img src="<@filesServicePath bookImage="true" src="/${books[index].source.model_id!}/${books[index].source.id!}/${books[index].source.cover_image!}"></@filesServicePath>"
                         style="" alt="封面图" width="109" height="109">
                   </div>
               <#--判断资源库没有这本书的对象-->
                   <#if (books[index].source.bookInfo)?? >
                     <div class="ref-label" style="position: absolute;left: 0;top: 5px; margin: 0;">
                       <span class="label label-default">已领取</span>
                     </div>
                   <#else >
                     <div class="checkbox" style="position: absolute;left: 0;top: 0; margin: 0;">
                       <label>
                         <input type="checkbox" class="ref-check-btn" name="checkbook" refBookId ="${books[index].source.id}" style="height: 20px;width: 20px">
                       </label>
                     </div>
                   </#if>
                     <#--书本领书查看玩瞳27库下书本有没有资源                     -->
                     <#if isShowWanTongState>
                     <@checkPrivilege url="/virtual/pickupTips.do">
                         <#list books[index].source.resources as resources>
                           <#if resources.repo_id == 27>
                                     <div class="picture-book-status-container">
                                         <#if resources.forbidden == 0>
                                             <#if resources.state == 0>
                                                <span class="picture-book-status">玩瞳待编辑</span>
                                             <#elseif resources.state == 3 || resources.state == 11>
                                                 <span class="picture-book-status">玩瞳已审核</span>
                                             <#elseif resources.state == 7>
                                                 <span class="picture-book-status">玩瞳待审核</span>
                                             </#if>
                                         <#else>
                                             <span class="picture-book-status">玩瞳禁用中</span>
                                         </#if>
                                     </div>
                               <#break>
                           <#else>
                               <#list cmsRepoId as repoId>
                                   <#if resources.repo_id == repoId>
                                       <div class="picture-book-status-container">
                                           <#if resources.forbidden == 0>
                                               <#if resources.state == 0>
                                                   <span class="picture-book-status">玩瞳待编辑</span>
                                               <#elseif resources.state == 3 || resources.state == 11>
                                                   <span class="picture-book-status">玩瞳已审核</span>
                                               <#elseif resources.state == 7>
                                                     <span class="picture-book-status">玩瞳待审核</span>
                                               </#if>
                                           <#else>
                                               <span class="picture-book-status">玩瞳禁用中</span>
                                           </#if>
                                       </div>
                                   </#if>
                               </#list>
                           </#if>
                         </#list>
                     </@checkPrivilege>
                     </#if>
                 </dt>
                  <dd>
                     <h3>${books[index].source.name!}</h3>
                     <span title="ISBN:${books[index].source.isbn!}<#list books[index].source.isbns! as isbn>/${isbn.isbn!}</#list>" style="width: 150px">ISBN:${books[index].source.isbn!}<#list books[index].source.isbns! as isbn>/${isbn.isbn!}</#list></span>
                     <span style="width: 150px">作者:${books[index].source.author!}</span>
                     <span style="width: 150px;padding-right: 10px">出版社:${books[index].source.publisher!}</span>
                     <span style="width: 150px;padding-right: 10px">所属系列:${books[index].source.series_title!}</span>
                     <#if !ref>
                       <div class="pro-window">
                          <div class="pro-window-ico"><img src="static/images/ico-p.png" width="15" height="3" /></div>
                          <div class="pro-window-box">
                            <ul>
                            </ul>
                          </div>
                       </div>
                     </#if>
                     <div class="pro-release">
                     </div>
                  </dd>
                  <div style="display:none;" class="row picture-book-title-container">
                     <div class="picture-book-examine text-center">
                     </div>
                  </div>
             </dl>
             </#if>
          <#elseif modu!= -1>
             <#if (index<bookAmount)>
                <dl class="dlClass picture-hover">
                  <dt id="thumbnailContainer" class="thumbnailContainer text-center center-block picture-book-thumbnail-container"style="position: relative">
                    <div id="thumbnail" class="picture-book-thumbnail" isEdit ="${books[index].source.book_editable?c}" isOnCopy="${books[index].source.on_copy?c}">
                      <img
                          src="<@filesServicePath bookImage = "true" src="/${books[index].source.model_id!}/${books[index].source.base_id!}/${books[index].source.cover_image!}"></@filesServicePath>"
                          style="" alt="封面图" width="109" height="109">
                    </div>
                    <#if (!books[index].source.book_editable)>
                        <div class="ref-label" style="position: absolute;left: 1px;top: 4px; margin: 0;">
                           <span class="label label-default">图片维护中</span>
                        </div>
                    <#elseif books[index].source.recordState && !isNbe>
                      <@checkPrivilege url="/cms/listRecordBooks.do" >
                         <div class="ref-label" style="position: absolute;left: 0px;top: 0px; margin: 0;">
                           <span class="label label-default" style="float: left;width: 100%">请到图片更新记录中编辑</span>
                         </div>
                      </@checkPrivilege>
                    </#if>
                    <#assign repoBookState = books[index].source.state>

                    <#--下面书本信息框-->
                    <div class="picture-book-status-container">
                      <#if (modu != 5)>
                          <#if (books[index].source.forbidden==1) && (repoBookState == 3 || repoBookState == 7)>
                              <span class="picture-book-status">禁用中</span>
                          </#if>
                          <#if (repoBookState == 11)>
                            <span class="picture-book-status">资源更新失败</span>
                          </#if>
                      <#else >
                         <#if (books[index].source.forbidden == 1)>
                           <span class="picture-book-status">禁用中</span>
                         <#else>
                           <#if (repoBookState == 0) >
                                <span class="picture-book-status">资源待编辑</span>
                           <#elseif (repoBookState == 3 ||repoBookState ==11) >
                                  <span class="picture-book-status">已审核</span>
                           <#elseif (repoBookState == 7) >
                                  <span class="picture-book-status">待审核</span>
                           </#if>
                         </#if>
                      </#if>
                    </div>

                     <#--书本是否可编辑-->
                    <#if (books[index].source.book_editable) && (books[index].source.on_copy == false)>
                    <#--看书本是否有修改记录未处理-->
                      <div id="buttonContainer" class="editBtn-container" bookId="${books[index].source.id!}">
                         <#--看书本是否可编辑-->
                           <#assign haveRecordUrl =false>
                           <@checkPrivilege url="/cms/listRecordBooks.do" >
                             <#assign haveRecordUrl = true>
                           </@checkPrivilege>
                           <div hidden>${haveRecordUrl?string} + ${books[index].source.recordState?string}</div>
                              <#if haveRecordUrl && !isNbe>
                                <#if !books[index].source.recordState>
                                  <#if (books[index].source.state==0)||(books[index].source.state==3)||(books[index].source.state==11)>
                                    <span id="editBtn" bookId="${books[index].source.id!}" bookState="${books[index].source.state!}" forbidden="${books[index].source.forbidden}" baseModelId = "${books[index].source.model_id}" baseBookId="${books[index].source.base_id}" class="glyphicon"
                                          aria-hidden="true"></span>
                                  </#if>
                                  <#if (books[index].source.state == 7)>
                                    <@checkPrivilege url="/cms/checkBook.do">
                                    <span id="checkBookBtn" bookId="${books[index].source.id!}" bookState="${books[index].source.state!}" forbidden="${books[index].source.forbidden}" baseModelId = "${books[index].source.model_id}" baseBookId="${books[index].source.base_id}" class="glyphicon"
                                          aria-hidden="true"></span>
                                    </@checkPrivilege>
                                  </#if>
                                </#if>
                              <#else >
                                <#if (books[index].source.state==0)||(books[index].source.state==3)||(books[index].source.state==11)>
                                    <span id="editBtn" bookId="${books[index].source.id!}" bookState="${books[index].source.state!}" forbidden="${books[index].source.forbidden}" baseModelId = "${books[index].source.model_id}" baseBookId="${books[index].source.base_id}" class="glyphicon"
                                          aria-hidden="true"></span>
                                </#if>
                                <#if (books[index].source.state == 7)>
                                  <@checkPrivilege url="/cms/checkBook.do">
                                    <span id="checkBookBtn" bookId="${books[index].source.id!}" bookState="${books[index].source.state!}" forbidden="${books[index].source.forbidden}" baseModelId = "${books[index].source.model_id}" baseBookId="${books[index].source.base_id}" class="glyphicon"
                                          aria-hidden="true"></span>
                                  </@checkPrivilege>
                                </#if>
                              </#if>
                        </div>
                    </#if>
                  </dt>
                  <dd>
                    <h3 title="${books[index].source.name!}">${books[index].source.name!}</h3>
                    <span title="ISBN:${books[index].source.isbn!}<#list books[index].source.isbns! as isbn>/${isbn.isbn!}</#list>" style="width: 150px">ISBN:${books[index].source.isbn!}<#list books[index].source.isbns! as isbn>/${isbn.isbn!}</#list></span>
                    <span style="width: 150px">作者:${books[index].source.author!}</span>
                    <span style="width: 150px;padding-right: 10px">出版社:${books[index].source.publisher!}</span>
                    <span style="width: 200px;padding-right: 10px">所属系列:${books[index].source.series_title!}
                        <#if (books[index].source.on_copy)></if><span style="width: 70px;float: right;color: red;">资源迁移中</span></#if>
                    </span>

                    <#--右上角的按钮列表-->
                     <#if (!books[index].source.on_copy)>
                    <div class="pro-window">
                      <div class="pro-window-ico"><img src="static/images/ico-p.png" width="15" height="3" /></div>
                      <div class="pro-window-box">
                        <ul>
                              <@checkPrivilege url="/cms/deleteBook.do">
                                  <LI id="deleteLi"><a href="#" bookId="${books[index].source.id!}" id="deleteBtn">删除</a></LI>
                              </@checkPrivilege>
                              <#if (books[index].source.state==11)>
                                <@checkPrivilege url="/cms/publish.do">
                                 <LI id="packupLi"><a href="#" id="packBookBtn" bookid="${books[index].source.id!}">重新打包</a></LI>
                                </@checkPrivilege>
                              </#if>
                              <#if (books[index].source.state!=0)>
                                <@checkPrivilege url="/cms/forbiddenBook.do">
                                    <LI id="forbiddenLi">
                                      <a href="#" bookId="${books[index].source.id!}" forbidden="${books[index].source.forbidden!}">
                                            <#if books[index].source.forbidden==1>
                                              启用
                                            <#elseif books[index].source.forbidden==0>
                                              禁用
                                            </#if>
                                      </a>
                                    </LI>
                                </@checkPrivilege>
                              </#if>
                          <#if (isPublish)>
                              <@checkPrivilege url="/cms/showQrcode.do">
                          <LI id="showQrcodeLi" bookId="${books[index].source.security_id!}">
                            <a href="#">查看激活码</a>
                              </@checkPrivilege>
                          </LI>
                          </#if>
                        </ul>
                      </div>
                    </div>
                     </#if>
                  </dd>
                </dl>
             </#if>
          <#else>

          <#--下面是图片记录模块-->
            <#if (index<bookAmount)>
              <dl class="dlClass picture-hover">
                <dt id="thumbnailContainer" class="thumbnailContainer text-center center-block picture-book-thumbnail-container"style="position: relative">
                  <div id="thumbnail" class="picture-book-thumbnail" isEdit ="${books[index].bookEditable?c}" isOnCopy="${books[index].onCopy?c}">
                    <img
                        src="<@filesServicePath bookImage = "true" src="/${books[index].bookBaseInfo.bookBaseInfo.modelId!}/${books[index].bookBaseInfo.bookBaseInfo.id!}/${books[index].bookBaseInfo.bookBaseInfo.coverImage!}"></@filesServicePath>"
                        style="" alt="封面图" width="109" height="109">
                  </div>
                    <#if (!books[index].bookEditable)>
                        <div class="ref-label" style="position: absolute;left: 1px;top: 4px; margin: 0;">
                          <span class="label label-default">图片维护中</span>
                        </div>
                    <#elseif books[index].recordState == -1>
                     <div class="ref-label" style="position: absolute;left: 1px;top: 4px; margin: 0;">
                       <span class="label label-default" style="background-color: #e82222">NEW</span>
                     </div>
                    </#if>
                    <#assign repoBookState = books[index].bookInfo.state>

                <#--下面书本信息框-->
                  <div class="picture-book-status-container">
                      <#if (modu != 5)>
                         <#if modu != -1>
                          <#if (books[index].bookInfo.forbidden==1) && (repoBookState == 3 || repoBookState == 7)>
                              <span class="picture-book-status">禁用中</span>
                          </#if>
                          <#if (repoBookState == 11)>
                            <span class="picture-book-status">资源更新失败</span>
                          </#if>
                         <#else>
                           <#if (books[index].bookInfo.forbidden == 1)>
                           <span class="picture-book-status">禁用中</span>
                           <#else>
                             <#if (repoBookState == 0) >
                                <span class="picture-book-status">资源待编辑</span>
                             <#elseif (repoBookState == 3 ||repoBookState ==11) >
                                  <span class="picture-book-status">已审核</span>
                             <#elseif (repoBookState == 7) >
                                  <span class="picture-book-status">待审核</span>
                             </#if>
                           </#if>
                         </#if>
                      <#else >
                        <#if (books[index].bookInfo.forbidden == 1)>
                           <span class="picture-book-status">禁用中</span>
                        <#else>
                          <#if (repoBookState == 0) >
                                <span class="picture-book-status">资源待编辑</span>
                          <#elseif (repoBookState == 3 ||repoBookState ==11) >
                                  <span class="picture-book-status">已审核</span>
                          <#elseif (repoBookState == 7) >
                                  <span class="picture-book-status">待审核</span>
                          </#if>
                        </#if>
                      </#if>
                  </div>

                <#--书本是否可编辑-->
                    <#if (books[index].bookEditable) && (books[index].onCopy == false)>
                    <#--看书本是否有修改记录未处理-->
                        <div id="buttonContainer" class="editBtn-container" bookId="${books[index].bookInfo.id!}">
                        <#--看书本是否可编辑-->
                          <span id="updateBook" bookId="${books[index].bookInfo.id!}" bookState="${books[index].bookInfo.state!}" forbidden="${books[index].bookInfo.forbidden}" baseModelId = "${books[index].bookBaseInfo.bookBaseInfo.modelId}" baseBookId="${books[index].bookBaseInfo.bookBaseInfo.id}" class="glyphicon"
                                        aria-hidden="true"></span>

                        </div>
                    </#if>
                </dt>
                <dd>
                  <h3 title="${books[index].bookBaseInfo.bookBaseInfo.name!}">${books[index].bookBaseInfo.bookBaseInfo.name!}</h3>
                  <span title="ISBN:${books[index].bookBaseInfo.bookBaseInfo.isbn!}<#list books[index].bookBaseInfo.isbns! as isbn>/${isbn.isbn!}</#list>" style="width: 150px">ISBN:${books[index].bookBaseInfo.bookBaseInfo.isbn!}<#list books[index].bookBaseInfo.isbns! as isbn>/${isbn.isbn!}</#list></span>
                  <span style="width: 150px">作者:${books[index].bookBaseInfo.bookBaseInfo.author!}</span>
                  <span style="width: 150px;padding-right: 10px">出版社:${books[index].bookBaseInfo.bookBaseInfo.publisher!}</span>
                  <span style="width: 200px;padding-right: 10px">所属系列:${books[index].bookBaseInfo.bookBaseInfo.seriesTitle!}
                        <#if (books[index].onCopy)></if><span style="width: 70px;float: right;color: red;">资源迁移中</span></#if>
                    </span>

                <#--右上角的按钮列表-->
                     <#if (!books[index].onCopy)>
                    <div class="pro-window">
                      <div class="pro-window-ico"><img src="static/images/ico-p.png" width="15" height="3" /></div>
                      <div class="pro-window-box">
                        <ul>
                          <LI id="lookOverLi"><a href="#" bookId="${books[index].bookInfo.id!}" id="lookOver" >查看更新记录</a></LI>
                        </ul>
                      </div>
                    </div>
                     </#if>
                </dd>
              </dl>
            </#if>
          </#if>
        </#list>
      </#list>
      <div class="row" style="height: 70px"></div>
    <#else>
      <#if ref>
        <div id="noBooks" class="alert alert-info" style="margin-top: 20px;" role="alert">未搜索到相关书本，如需为相关书本制作资源，请联系玩瞳内容中心工作人员，并提供您的书本清单。</div>
      <#elseif modu != -1>
        <div id="noBooks" class="alert alert-info" style="margin-top: 20px;" role="alert">未搜索到相关资源库书本</div>
      <#else>
          <div id="noBooks" class="alert alert-info" style="margin-top: 20px;" role="alert">没有图片修改记录</div>
      </#if>
    </#if>
  </div>
</div>
<!--翻页-->
<div class="con-page">
  <#if modu!= -1>
    <@checkPrivilege url ="/virtual/cms/repoBooksCount.do">
      <div class="books-count" id="bookCount" style="float: left;">
        <label style="font-size: 12px;font-weight: normal">当前模块共${currentTabBookCount}本 | 资源库总量共${modelBookCount}本</label>
      </div>
    </@checkPrivilege>
  </#if>
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

<div id="bookChangeRecord">
  <el-dialog title="更新记录" :bookId="bookId" width="60%" :close-on-press-escape="false" :close-on-click-modal="false" append-to-body="true" :before-close="handleClose" :visible.sync="dialogTableVisible">
    <el-table :data="gridData" max-height="600" width="100%">
      <el-table-column type="index" label="序号" width="150" ></el-table-column>
      <el-table-column align="center" property="changeTypeContent" label="更新事项" ></el-table-column>
      <el-table-column align="center" property="createTime" label="更新时间" width="300"></el-table-column>
    </el-table>
  </el-dialog>
</div>

<div style="display: none;margin-top: 20px;" id="downloadApkQrCode">
  <div class="modal-body create-dialog-body">
    <img src="" id="downloadApkImg">
    <div id="qrcode" style="margin-left: 15%"></div>
  </div>
</div>


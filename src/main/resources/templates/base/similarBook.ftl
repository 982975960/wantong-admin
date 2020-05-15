<#assign bookAmount = books?size>

<div class="work-box-pic" style="width: 100%;height: 150px;float: left;overflow-y: auto;padding-left: 2%;">
    <#if (bookAmount > 0)>
        <#list books as book>
            <dl>
                <dt>
                    <div id="thumbnail" class="picture-book-thumbnail">
                        <img
                                src="<@filesServicePath bookImage="true" src="/${book.bookBaseInfo.modelId!}/${book.bookBaseInfo.id!}/${book.bookBaseInfo.coverImage!}" bookImage="true"></@filesServicePath>"
                                style="" alt="封面图" width="109" height="109">
                    </div>
                </dt>
                <dd>
                    <h3 style="white-space: nowrap;text-overflow: ellipsis;overflow: hidden;width: 180px;" title="${book.bookBaseInfo.name!}">${book.bookBaseInfo.name!}</h3>
                    <span style="width: 150px;white-space: nowrap;text-overflow: ellipsis;overflow: hidden;" title="ISBN:${book.bookBaseInfo.isbn!}<#list book.isbns as isbn>/${isbn.isbn!}</#list>">ISBN:${book.bookBaseInfo.isbn!}<#list book.isbns as isbn>/${isbn.isbn!}</#list></span>
                    <span style="width: 150px;white-space: nowrap;text-overflow: ellipsis;overflow: hidden;">作者:${book.bookBaseInfo.author!}</span>
                    <span style="width: 150px;white-space: nowrap;text-overflow: ellipsis;overflow: hidden;">出版社:${book.bookBaseInfo.publisher!}</span>
                    <span style="width: 150px;white-space: nowrap;text-overflow: ellipsis;overflow: hidden;">所属系列:${book.bookBaseInfo.seriesTitle!}</span>
                </dd>
            </dl>
        </#list>
    </#if>
</div>
<div style="width: 100%;text-align: center;float: left;">
    <p style="font-size: 16px;line-height: 45px;">通过封面对比，检测到玩瞳图像库中已有相同图片的书本，请确认！</p>
    <button type="button" id="confirmBtn" class="pop-padding frame-Button-b">确定</button>
</div>
<#--<@script src="/js/base/bookadd.js"></@script>-->
<@script src="/js/base/editImageManager.js"></@script>
<@link href="/css/base/addBook.css" rel="stylesheet"/>

<div id="showImage" class="popupcontent" style="text-align: center;" >
    <div class="lastImage" style="margin-top: 5px">
        <img id="lastImage" src = "" width="520px" height="520px" >
    </div>

    <div style="margin-top: 30px">
        <button type="button" id="saveImage" class="btn btn-primary">保存</button>
        <button type="button" id="unSave" class="btn btn-danger">放弃</button>
    </div>
</div>

<script>
    $(function () {
        wantong.base.editImageManager.init({
            tempFileName: "${tempFileName}",
            coverImage:"${coverImage}",
            x1:"${x1}",
            y1:"${y1}",
            x2:"${x2}",
            y2:"${y2}",
            bookId:"${bookId}",
        });
    });

</script>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <!-- The above 3 meta tags *must* come first in the head; any other head content must come *after* these tags -->
    <meta name="description" content="">
    <meta name="author" content="">
    <link rel="icon" href="../../favicon.ico">

    <title>TIS后台管理系统</title>
    <style></style>
    <@link href="/css/bootstrap.min.css" rel="stylesheet" media="screen"/>


</head>
<body>



<div id="warpper">
    <div><h1 align="center">Vision Talk 书本搜索</h1></div>

    <div style="padding: 30px 30px 10px;">
        <form class="bs-example bs-example-form" role="form">
            <div class="row" >
                <div class="col-lg-6" style="width: 100%">
                    <div class="input-group" style="margin: 0 auto">
                        <input type="text" class="form-control" id="searchText">
                        <span class="input-group-btn" id="searchButton" >
									<button class="btn btn-default" type="button">搜索</button>
								</span>
                    </div><!-- /input-group -->
                </div><!-- /.col-lg-6 -->
            </div><!-- /.row -->
        </form>
    </div>

    <#--$('#container').append('<div id=" data.ddata.sdi" style="display: none;">')-->
    <div class="panel" style="font-size: 18px;height :500px;overflow-y: auto;margin: 0 auto;margin-left: 30px;margin-right: 30px">
    <div id="container" >
        <div class="pagination">

        </div>
    </div>
</div>
</div>
</div>
</body>
</html>


<@script src="/js/3rd-party/json2.js"/>
<@script src="/js/3rd-party/jquery-2.2.4.min.js"></@script>
<@script src="/js/3rd-party/bootstrap.min.js"></@script>
<@script src="/js/common/global.js"></@script>
<@script src="/js/cms/searchbook.js"></@script>
<@script src="/js/common/jquery.form.js"></@script>

<script>
    $(function(){
      searchBook.searchBook.init();
    });
</script>
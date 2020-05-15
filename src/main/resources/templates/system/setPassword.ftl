<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <!-- The above 3 meta tags *must* come first in the head; any other head content must come *after* these tags -->
  <meta name="description" content="">
  <meta name="author" content="">
  <title>玩瞳科技-设置密码</title>
    <@link href="/js/layui/css/layui.css" rel="stylesheet"/>
    <@link href="/css/bootstrap.min.css" rel="stylesheet" media="screen"/>
  <style>
    body {
      padding: 0;
      margin: 0;
    }

    h2, h3, p, span {
      padding: 0;
      margin: 0;
    }
  </style>

</head>
<body>
<div style="width:600px; margin:0 auto" id="setPassword">
  <form id="form" action="" method="post">
  <input type="hidden" name="identityId" value="${identityId}"/>
  <input type="hidden" name="identityCode" value="${identityCode}"/>
  <div style="width:100%; float:left; margin-top:50px; text-align:center;">
    <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHMAAAA1CAYAAAByQtSXAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA2ppVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDpDNDcxOUM0MEI5ODFFOTExQUEzM0I3QTUxRkYyOUM0NSIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDo5NzQ0OTVCQ0FERTYxMUU5QkM1N0RCM0JENERERjU5RSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDo5NzQ0OTVCQkFERTYxMUU5QkM1N0RCM0JENERERjU5RSIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ0MgMjAxOSAoV2luZG93cykiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpFRDBFM0VBRUJBQURFOTExQTBCNTkwMzk0MEREMUYzRSIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpDNDcxOUM0MEI5ODFFOTExQUEzM0I3QTUxRkYyOUM0NSIvPiA8L3JkZjpEZXNj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" width="115" height="53"/>
  </div>
  <div style="border:1px solid #f1f1f1; border-radius:4px; float:left; margin-top:50px; box-shadow: 0px 2px 4px #eaeaea; padding:25px; padding-bottom:0; width:600px;">
    <div style="width:100%; float:left;">
      <h2 style="font-size:22px; color:#343434; font-weight:normal; float:left;width:100%; margin-bottom:10px; margin-top:20px; text-align:center;">请设置您的用户密码</h2>
      <p style="float:left; width:100%;">
      <div style="width:497px; border:1px solid #d4d4d4; float:left; border-radius:5px; height:46px; margin-left:30px; margin-top:15px;">
        <h3 style="float:left; background:#f4f4f4; width:78px; font-size:16px; color:#737373; font-weight:normal; padding-left:10px; line-height:44px;border-radius:5px 0 0 5px;">EMAIL</h3>
        <input type="text" name="email" readonly value="${email}" style="float:left; width:417px; padding-left:10px; line-height:44px; border:none; font-size:16px; color:#adadad;"/>
      </div>
      <div style="width:497px; border:1px solid #d4d4d4; float:left; border-radius:5px; height:46px; margin-left:30px; margin-top:15px;">
        <h3 style="float:left; background:#f4f4f4; width:78px; font-size:16px; color:#737373; font-weight:normal; padding-left:10px; line-height:44px;border-radius:5px 0 0 5px;">密码</h3>
        <span>
        <input type="password" name="password" style="float:left; width:417px; padding-left:10px; line-height:44px; border:none; font-size:16px; color:#343434;" placeholder="请输入密码..."/>
      </span>
      </div>
      <div style="width:497px; border:1px solid #d4d4d4; float:left; border-radius:5px; height:46px; margin-left:30px; margin-top:15px;">
        <h3 style="float:left; background:#f4f4f4; width:78px; font-size:16px; color:#737373; font-weight:normal; padding-left:10px; line-height:44px;border-radius:5px 0 0 5px;">确认密码</h3>
        <span>
        <input type="password" name="cfpassword" placeholder="确认密码..." style="float:left; width:417px; padding-left:10px; line-height:44px; border:none; font-size:16px; color:#343434;"/>
      </span>
      </div>
      </p>
      <span style="float:left; width:100%; margin-top:10px; text-align:center;">
      <input type="button" id="saveBtn" value="确认" style="background:#18b0e7; font-size:18px; text-align:center; width:175px; height:42px; border:none; color:#ffffff; border-radius:5px; margin:30px 0; cursor:pointer;"/>
    </span>
    </div>
    <div style="width:100%; border-top:1px solid #f1f1f1; padding:15px 0; line-height:22px; float:left; color:#808080; margin-top:20px; text-align:center; font-size:12px;
background: -webkit-linear-gradient(left, #FFFFFF , #f7f7f7, #FFFFFF);  background: -o-linear-gradient(right, #FFFFFF , #f7f7f7, #FFFFFF);  background: -moz-linear-gradient(right, #FFFFFF , #f7f7f7, #FFFFFF);  background: linear-gradient(to right, #FFFFFF , #f7f7f7, #FFFFFF); ">
      地址：深圳福田保税区英达利数码科技园C栋302E/F <br/>
      联系电话：0755-26919530/13570860239 邮箱：bd@51wanxue.com<br/>
      深圳市玩瞳科技有限公司 © 2018 粤ICP备1505863
    </div>
  </div>
</div>
</body>
</html>
<@script src="/js/3rd-party/json2.js"/>
<@script src="/js/3rd-party/jquery-2.2.4.min.js"></@script>
<@script src="/js/3rd-party/bootstrap.min.js"></@script>
<@script src="/js/common/global.js"></@script>
<@script src="/js/common/jquery.form.js"/>
<@script src="/js/system/setpassword.js"></@script>
<@script src="/js/layui/layui.js"/>
<script>
  $(function () {
    wantong.setpassword.init();
  });
  layui.use(['layer', 'form'], function () {
    var layer = layui.layer,
        form = layui.form;
  });
</script>	
<@link href="/css/app/partnerdetail.css" rel="stylesheet"/>
<@script src="/js/app/updateResource.js"/>
<div id="tisAppResourceRoot">
<div class="container">
<h1 class="page-header">
 	合作商：${partnerVO.name}
 </h1>
<h3 class="page-header">
 	app名称 ：${appVO.name}
 </h1>
</div>
<div class="container">
	<div class="create-button-panel" style="text-align:center;">
	 	<input type="hidden" value="${appVO.id}" id="appId"/>
	 	<input type="hidden" value="${partnerVO.id}" id="partnerId"/>
	 	<button id="createResourceBtn" style="background:#E4A541;border-color:#E4A541;" type="button" class="btn btn-primary btn-lg">
		  创建新资源
		</button>
	 </div>
</div>
<!--创建新资源-->
<div class="container" id="createResourceDiv" style="margin-top:10px;">	
	<div class="row clearfix">
		  <div class="modal-dialog" role="document" >
		    <div class="modal-content">
		      <div class="modal-header" style="background:#E4A541;font-weight:bold;color:white;">
			      <h4 class="modal-title" >创建新资源</h4>
		      </div>
		      <form action="" method="">
		      <div class="modal-body create-dialog-body">
			      <div id="error" style="display:none" class="alert alert-danger" role="alert"></div>
			      <div class="input-group row short-input-group">
			          <span class="input-group-addon" id="basic-addon3" style="width:95px;">app名称</span>
			          <input type="text" class="form-control" readonly="readonly" value="${appVO.name}">
		          </div>
			      <div class="input-group row short-input-group">
		              <span class="input-group-addon" id="basic-addon3">新资源名称</span>
			          <input type="text" class="form-control" id="newResourName"  placeholder="请输入新资源名称..." value="" aria-describedby="basic-addon3">
			      </div>
		      </div>
		      <div class="modal-footer">
		          <button type="button" id="newResourceSaveButton" style="background:#E4A541;border-color:#E4A541;" class="btn btn-default btn-primary">保存</button>
				  <button type="reset" class="btn btn-default" style="background:#E4A541;border-color:#E4A541;color:white;" data-dismiss="modal">重置</button>
		      </div>
		      </form>
		    </div>
		  </div>
		</div>
</div>

<div class="container" style="margin-top:10px;" id="createResourceVer">
<!-- 更新资源包 -->
 	<div class="container">
	<div class="row clearfix">
	<div class="modal-dialog" role="document">
    <div class="modal-content">
	      <div class="modal-header" style="background:#E4A541;font-weight:bold;color:white;">
	        <h4 class="modal-title">更新资源包版本</h4>
	      </div>
		<div class="col-md-12 column">
			<form id="newResourceVersionForm" action="" method="post" enctype="multipart/form-data">
				<input type="hidden" value="${appVO.id}" name="appId"/>
				<div class="input-group row short-input-group"  style="margin-bottom:5px;width:600px;">
			        <span class="input-group-addon" id="basic-addon3" style="width:95px;">app名称</span>
			        <input type="text" class="form-control" readonly="readonly" value="${appVO.name}">
	            </div>
	            
				<div class="input-group row short-input-group"  style="margin-bottom:5px;width:600px;">
		            <span class="input-group-addon" id="basic-addon3" style="width:95px;">资源名称</span>
		            <div class="col-sm-8" style="width:180px;padding-left:0px;">
		                <select id="resourceId" name="resourceId" class="selectpicker show-tick con-r-top-l-frame frame-line">
		                <#list listAppResource as listar>
	                        <option value="${listar.id}">${listar.name}</option>
                        </#list>
		                </select>
		            </div>
		        </div>
		        
				<div class="input-group row short-input-group"  style="margin-bottom:5px;width:600px;">
		            <span class="input-group-addon" id="basic-addon3" style="width:95px;">所需最低版本号</span>
		            <div class="col-sm-8" style="width:152px;padding-left:0px;">
		                <select id="usertype" name="appVersionId" class="selectpicker show-tick con-r-top-l-frame frame-line">
	                    <#list listAppVersion as listav>    
	                        <option value="${listav.id}">${listav.version}</option>
		                </#list>
		                </select>
		            </div>
		        </div>
		        
		        <div class="input-group row short-input-group"  style="margin-bottom:5px;width:260px;">
			        <span class="input-group-addon" id="basic-addon3" style="width:95px;">版本号</span>
			        <input type="text" id="version" name="version" class="form-control" placeholder="请输入版本号...">
	            </div>
		        
				<div class="input-group row  short-input-group"  style="width:600px;">
		         	<span class="input-group-addon" style="text-align:left;width:600px;">版本更新内容描述</span>
			    </div>
				<div class="input-group row  short-input-group"  style="margin-bottom:5px;width:600px;">
			        <textarea class="form-control" name="summary" id="summary" rows="15" style="height:180px;" placeholder="请输入版本描述..."></textarea>
			    </div>
	            
				<div class="form-group" style="margin-bottom:5px;width:600px;">
				<label for="exampleInputFile"></label><input name="file" type="file" id="exampleInputFile" />
					<p class="warning">
						
					</p>
				</div>
				
				<button id="newResourceVision" type="button"  class="btn btn-warning btn-lg active">开始上传</button>
				<button id="backPrePageBtn" style="margin-left:1%;" type="button" class="btn btn-warning btn-default btn-lg">返回</button>
			</form>
		</div>
	</div>
</div>
</div>
</div>
</div>
<!-- 更新资源包 -->


<div id="tis-alert" class="text-center alert alert-danger">
	<span class="alert-link"> </span>
</div>
<div>
<script>
	$(function(){
		wantong.updateResource.init();
	})
</script>

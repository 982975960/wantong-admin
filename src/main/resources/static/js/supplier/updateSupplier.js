wantong.updateSupplier = (function () {
  var UPDATE_SUPPLIER_URL = GlobalVar.contextPath
      + "/supplier/updateSupplier.do",
      UPLOAD_URL = "upload.do",
      PREVIEW_IMAGE = "downloadTempFile.do",
      GET_DOMAINNAME_URL = GlobalVar.contextPath + "/supplier/getDomainName.do",
      _root = null,
      _initAuthJson = "[",
      _conf = {},
      _uploader = null,
      _uploadButtonIsShown = false,
      _uploadButton = null,
      _coverImage = null,
      _domainNameOld = null,
      _domainNameHand = null,
      _domainNameAuto = null,
      _domainNameType = 0,
      _domainNameInput = null,
      _init = function (conf) {
    $.extend(_conf, conf);
    _root = $("#updateSupplier");
    _uploadButton = _root.find("#uploadBtn");
    _domainNameInput = _root.find("#domainName");
    _initThumbnail();
    _initUploadBtn();
    _updateSupplier();
    _handleAuthoritySelector();
    _showAndHide();
    var _editSupplier = _root.find("#editSupplierContainer");
    _editSupplier.find("#name").focus();
    var _allAuthoritiesCheckBox = _editSupplier.find(
        "input[type=checkbox]");
    _allAuthoritiesCheckBox.each(function () {
      var thisCheckBox = $(this);
      var authId = thisCheckBox.val();
      if (this.checked) {
        _initAuthJson += "{authId:'" + authId + "'},";
      }
    });
    _initAuthJson = _initAuthJson.substring(0, _initAuthJson.length - 1);
    _initAuthJson += ']';
    var image = _root.find("#coverImage").attr("timage");
    if (image != null && image != "") {
      _coverImage = image;
      _root.find("#coverImage").attr("src",
          GlobalVar.services.FDS + "tis/partner/" +image);
    }
  },

      _handleAuthoritySelector = function () {
        _root.delegate("input[type=checkbox]", "click", function () {
          var currentCheckBox = $(this);
          var currentType = currentCheckBox.attr("levelType");
          var levelId = currentCheckBox.attr("value");
          if (currentType == "topLevel") {
            var subLevels = _root.find(".secondLevel_" + levelId).find(
                "input[type=checkbox]");
            if (currentCheckBox.get(0).checked) {
              subLevels.prop("checked", true);
              for (var i = 0; i < subLevels.length; i++) {
                var thirdLevelInput = _root.find(
                    ".thirdLevel_" + subLevels[i].value).find(
                    "input[type=checkbox]");
                thirdLevelInput.prop("checked", true);
              }
            } else {
              subLevels.prop("checked", false);
              for (var i = 0; i < subLevels.length; i++) {
                var thirdLevelInput = _root.find(
                    ".thirdLevel_" + subLevels[i].value).find(
                    "input[type=checkbox]");
                thirdLevelInput.prop("checked", false);
              }
            }
          } else if (currentType == "secondLevel") {
            var parentId = currentCheckBox.attr("topId");
            var parentLevel = _root.find(".topLevel_" + parentId).find(
                ".panel-heading").find("input[type=checkbox]");
            var allSameLevels = _root.find(".secondLevel_" + parentId).find(
                ".second").find("input[type=checkbox]");
            var thirdLevel = _root.find(".thirdLevel_" + levelId).find(
                "input[type=checkbox]");
            if (currentCheckBox.get(0).checked) {
              parentLevel.prop("checked", true);
              thirdLevel.prop("checked", true);
            } else {
              var allSubLevelUnselected = true;
              allSameLevels.each(function (index, item) {
                if (item.checked) {
                  allSubLevelUnselected = false;
                }
              });
              if (allSubLevelUnselected) {
                parentLevel.prop("checked", false);
              }
              thirdLevel.prop("checked", false);
            }
          } else {
            var topId = currentCheckBox.attr("topid");
            var secondId = currentCheckBox.attr("secondid");
            var secondLevel = _root.find(".level_" + secondId).find(
                "input[type=checkbox]");
            var topLevel = _root.find(".topLevel_" + topId).find(
                ".panel-heading").find("input[type=checkbox]");
            if (currentCheckBox.get(0).checked) {
              topLevel.prop("checked", true);
              secondLevel.prop("checked", true);
            } else {
              var allThirdLevelUnselected = true;
              var allThirdLevel = _root.find(".thirdLevel_" + secondId).find(
                  "input[type=checkbox]");
              allThirdLevel.each(function (index, item) {
                if (item.checked) {
                  allThirdLevelUnselected = false;
                }
              });
              if (allThirdLevelUnselected) {
                secondLevel.prop("checked", false);
                var allSecondLevelUnselected = true;
                var allSecondLevel = _root.find(".secondLevel_" + topId).find(
                    ".second").find("input[type=checkbox]");
                allSecondLevel.each(function (index, item) {
                  if (item.checked) {
                    allSecondLevelUnselected = false;
                  }
                });
                if (allSecondLevelUnselected) {
                  topLevel.prop("checked", false);
                }
              }
            }
          }
        });
      },

      _updateSupplier = function () {
        var _editSupplier = _root.find("#editSupplierContainer"),
            _saveBtn = _editSupplier.find("#saveBtn"),
            _closeBtn = _editSupplier.find("#closeBtn");
        var index = layer.index;
        _closeBtn.click(function () {
          _saveBtn.removeAttr("disabled");
          layer.close(index);
        });
        _saveBtn.on("click", function () {
          _saveBtn.attr("disabled", "disabled");
          var name = _editSupplier.find("#name").val();
          var adminEmail = _editSupplier.find("#adminEmail").val();
          var _allAuthoritiesCheckBox = _editSupplier.find(
              "input[type=checkbox]");
          var _id = _editSupplier.find("#partnerId").val();
          var domainName = _root.find("#domainName").val();
          var phoneNum = _editSupplier.find("#phoneNumber").val();
          var authJson = "[";
          _allAuthoritiesCheckBox.each(function () {
            var thisCheckBox = $(this);
            var authId = thisCheckBox.val();
            if (this.checked) {
              authJson += "{authId:'" + authId + "'},";
            }
          });
          authJson = authJson.substring(0, authJson.length - 1);
          authJson += ']';

          if (name == null || name == "") {
            layer.msg("合作商名称不能为空");
            _saveBtn.removeAttr("disabled");
            return;
          }
          if(name.length>45){
            layer.msg("合作商名称不能大于45个字符");
            _saveBtn.removeAttr("disabled");
            return ;
          }
          var txt = new RegExp(/[<>/|]/);
          if (txt.test(name)){
              layer.msg("合作商名称不能含有非法字符");
            _saveBtn.removeAttr("disabled");
              return;
          }
          if (phoneNum == null || phoneNum == "") {
            layer.msg("请输入合作商负责人手机号");
            _saveBtn.removeAttr("disabled");
            return;
          }
          var phoneReg = /^[1][0,1,2,3,4,5,6,7,8,9][0-9]{9}$/;
          if (!phoneReg.test(phoneNum) || phoneNum.length != 11) {
            layer.msg("请输入11位的手机号");
            _saveBtn.removeAttr("disabled");
            return;
          }
          if (adminEmail == "") {
            layer.msg("管理员账户不能为空");
            _saveBtn.removeAttr("disabled");
            return;
          }
          var reg = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+((.[a-zA-Z0-9_-]{2,3}){1,2})$/;
          /*if (!reg.test(adminEmail.toLowerCase())) {
            layer.msg("邮箱格式不正确。");
            _saveBtn.removeAttr("disabled");
            return;
          }*/
          /*if (adminEmail.length > 45) {
            layer.msg("邮箱长度不能超过45字符。");
            _saveBtn.removeAttr("disabled");
            return;
          }*/
          var _isChangeAuth = 0;

          if (_initAuthJson != authJson) {
            _isChangeAuth = 1;
          }

            /*var domainNameReg = "^[0-9]{1,20}$";
            var domainNameRe = new RegExp(domainNameReg);
            var firstDomain = domainName.substring(domainName.length - 13);
            var secondDomain = domainName.substring(0,domainName.length - 13);
            if (domainName == ""){
                layer.msg("域名不能为空");
                return;
            }else if(secondDomain.length > 20){
                layer.msg("二级域名长度不能超过20位");
                return;
            }
            if(!domainNameRe.test(secondDomain)){
                layer.msg("域名格式不正确");
                return;
            }
            if(firstDomain != ".51wanxue.com"){
                layer.msg("域名格式不正确");
                return;
            }
            var isEdit = true;
            if (_domainNameOld == domainName){
                var isEdit = false;
            }*/
            var partnerType = _editSupplier.find("#partnerTypeSelect").val();

          $.post(UPDATE_SUPPLIER_URL, {
            id: _id,
            name: name,
            adminEmail: adminEmail,
            authData: authJson,
            isChangeAuth: _isChangeAuth,
            phone: phoneNum,
            image: _coverImage,
            partnerType: partnerType
           /* domainNameType:_domainNameType,
            domainName:domainName,
            isEdit:isEdit*/
          }, function (data) {
            if (data.code == 0) {
              layer.close(index);
              layer.msg("修改成功");
              /*setTimeout(function () {
                wantong.frame.showPage(GlobalVar.backPath, GlobalVar.data);
              }, 500);*/
            } else {
              layer.msg("修改失败：" + data.msg);
              _saveBtn.removeAttr("disabled");
            }
          });
        });
      },
      _showAndHide = function () {
        _root.delegate("input[type=button]", "click", function () {
          var curImage = $(this);
          var order = curImage.attr("order");
          var id = curImage.attr("authid");
          if (order == 0) {
            var second = $(".secondLevel_" + id);
            if (second.css("display") == "none") {
              second.css("display", "inline");
              curImage.css("background-image", "url(static/images/hide.png)")
            } else {
              second.css("display", "none");
              curImage.css("background-image", "url(static/images/show.png)")
            }
          } else {
            var third = $(".thirdLevel_" + id);
            if (third.css("display") == "none") {
              third.css("display", "inline");
              curImage.css("background-image", "url(static/images/hide.png)")
            } else {
              third.css("display", "none");
              curImage.css("background-image", "url(static/images/show.png)")
            }
          }
        });
      },
      _initThumbnail = function () {
    //must hide upload button after a while, otherwise the uploder cannot be init successful.
      setTimeout(function () {
        _uploadButton.hide();
      }, 100);
    _root.find("#thumbnail").mouseover(function () {
      _showUploadButton();
    });
    _uploadButton.mouseover(function () {
      _showUploadButton();
    });
    _root.find("#thumbnail").mouseout(function () {
      _hideUploadButton();
    });
    _uploadButton.mouseout(function () {
      _hideUploadButton();
    });
  },
      _showUploadButton = function () {
        if (!_uploadButtonIsShown) {
          _uploadButton.show();
          _uploadButtonIsShown = true;
        }
      },
      _hideUploadButton = function () {
        if (_uploadButtonIsShown) {
          _uploadButton.hide();
          _uploadButtonIsShown = false;
        }
      },
        _initUploadBtn = function () {
          _uploader = WebUploader.create({
            swf: GlobalVar.contextPath + '/js／uploader/Uploader.swf',
            server: UPLOAD_URL,
            fileSingleSizeLimit: 5 * 1024 * 1024,
            pick: {
              id: _uploadButton,
              multiple: false
            },
            dnd: "#editSupplierForm #thumbnailContainer",
            accept: {
              title: 'JPG',
              extensions: 'jpg,jpeg',
              mimeTypes: 'image/jpg,image/jpeg'
            },
            auto: true,
            method: "POST",
            duplicate: true,
            disableGlobalDnd: false
          });
          _uploader.on('fileQueued', function (file) {
          });
          _uploader.on('uploadProgress', function (file, percentage) {
            /*var width = file._info.width;
            var height = file._info.height;
            var fileSize = file.size;
            if (width < 640 || height < 480) {
              layer.msg("请上传分辨率大于 640px * 480px 的JPG格式文件");
              _uploader.cancelFile(file);
              return;
            }*/
          });
          _uploader.on('uploadSuccess', function (file, response) {
            if (response.code == 0) {
              console.log("filename:" + response.data.fileName);
              _coverImage = response.data.fileName;
              _root.find("#coverImage").attr("src",
                  PREVIEW_IMAGE + "?fileName=" + _coverImage);
            } else {
              layer.msg("上传图片失败");
            }

          });
          _uploader.on("error", function (type) {
            if (type == "Q_TYPE_DENIED") {
              /*layer.msg("请上传分辨率大于 640px * 480px 的JPG格式文件");*/
              layer.msg("请上传JPG格式的图片");
            } else if (type == "F_EXCEED_SIZE") {
              layer.msg("封面图大小不能超过5M");
            }
          });
        };

  return {
    init: function (conf) {
      _init(conf);
    }
  }
})();
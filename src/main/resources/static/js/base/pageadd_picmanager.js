wantong.base.pageAdd.picManager = (function () {
  var
      _root = null,
      _coverImage = null,
      _conf = {
        UPLOAD_URL: "upload.do",
        PREVIEW_IMAGE: "downloadTempFile.do"
      },
      _authorityManagement = {
        uploadImage: false,
      },
      _init = function (conf) {
        $.extend(_conf, conf);
        console.log("pic");
        _root = _conf.rootNode;
        _initUploadButton();
        _initDragImg();
        _initAuth();
      },
      _initAuth = function () {
        _authorityManagement.uploadImage = JSON.parse(
            _root.find("#uploadButton").attr("isAuthority"));
      },
      _imgUploadEnable = true, //默认可选择图片上传
      _imgUploadCtrl = function (enable) { //控制图片区是否可选择图片
        _imgUploadEnable = enable;

      },
      _initDragImg = function () {
        /*var previewImgDiv = document.getElementById("previewImgDiv1");
        previewImgDiv.ondragenter = function () {
          console.log("ondragenter");

        };
        previewImgDiv.ondragover = function (ev) {
          var uploadButton = _root.find("#uploadButton");
          /!*uploadButton.hide();*!/
          var bigButton = _root.find("#bigButton");
          bigButton.hide();
          var btnBg = _root.find("#btnBg");
          btnBg.hide();
          ev.preventDefault();
        };
        previewImgDiv.ondragleave = function () {
        };
        previewImgDiv.ondrop = function (ev) {
          if (!_authorityManagement.uploadImage) {
            return;
          }
          var uploadButton = _root.find("#uploadButton");
          /!*if(_authorityManagement.uploadImage) {
            uploadButton.show();
          }*!/
          var bigButton = _root.find("#bigButton");
          bigButton.show();
          var btnBg = _root.find("#btnBg");
          btnBg.show();
          $("#bookEdit").find(".save-button-container").find(
              "#saveAndNextButton").removeAttr("disabled");
          $("#bookEdit").find(".save-button-container").find(
              "#saveAndNextButton").css('display', 'inline');
          $("#bookEdit").find(".save-button-container").find(
              "#startExamine").removeAttr("disabled");
          $("#bookEdit").find(".save-button-container").find(
              "#startExamine").css('display', 'none');
          ev.preventDefault();
          if (!_imgUploadEnable) {
            return;
          }
          var files = ev.dataTransfer.files;
          var file = files[0];
          if (!file) {
            return;
          }
          //图片类型判断
          if (file.type.indexOf('image') == -1) {
            layer.msg("请上传jpeg格式的文件，如img.jpg或img.jpeg等");
            return;
          }
          if (file.type.indexOf('jpg') == -1 && file.type.indexOf('jpeg')
              == -1 && file.type.indexOf('JPEG') == -1 && file.type.indexOf(
                  'JPG')
              == -1) {
            layer.msg("请上传jpeg格式的文件，如img.jpg或img.jpeg等");
            return;
          }
          //图片大小判断
          if (file.sizes > (5 * 1024 * 1024)) {
            layer.msg("文件大小不能超过5M");
            return;
          }
          //图片分辨率判断
          var width = 640; //默认可以上传图片，
          var height = 480;
          var reader = new FileReader();
          reader.onload = function (e) {
            var data = e.target.result;
            var image = new Image();
            image.onload = function () {
              width = image.width;
              height = image.height;
            };
            image.src = data;
          };
          reader.readAsDataURL(file);

          setTimeout(function () { //需要延迟一会儿执行，不然得不到图片分辨率数据
            /!*if (width < 640 || height < 480) {
              layer.msg("请上传分辨率大于 640px * 480px 的JPG格式文件");
              return;
            }

            if ((width / height) != (16 / 9) || (width / height) != (4 / 3)) {
              console.log("1111111111");
              layer.msg("图片比例不符合要求(16:9)或者(4:3)");
              return;
            }

            _uploadImg(file);*!/ // 拖拽图片时使用jQuery上传文件
          }, 200);
        };*/
      },
      _uploadImg = function (file) {//上传图片，拖拽图片的方式上传图片
        var formData = new FormData();
        formData.append('file', file);
        $.ajax({
          url: _conf.UPLOAD_URL + "?check=" + true + "&checkScale=" + true,
          type: 'POST',
          cache: false,
          data: formData,
          processData: false,
          contentType: false
        }).success(function (response) {
          _afterUploadImg(response);
        }).error(function (response) {
          _afterUploadImg(response);
        });
      },
      _afterUploadImg = function (response) {//图片上传之后返回结果处理
        if (response != null && response.code == 0) {
          _coverImage = response.data.fileName;
          _updateImagePreviewSrc(
              _conf.PREVIEW_IMAGE + "?fileName=" + _coverImage);
          _root.find("#fingerBtn").css("display","inline");
          _root.find("#uploadButton").css("margin-left","10px");
        } else {
          if (response._raw != null) {
            if (response._raw.toUpperCase().indexOf('!DOCTYPE') != -1) {
              window.location.href = GlobalVar.contextPath + "/main.do";
              return;
            }
          }
          layer.msg(response.msg);
        }
      },
      _loadData = function (data) {
        var previewImg = _root.find("#previewImg");
        if (data.coverImage.imageName != null) {
          _coverImage = data.coverImage.imageName;
          var bookId = data.baseBookId;
          var modelId = data.modelId;
          _updateImagePreviewSrc(
              GlobalVar.services.FDS + GlobalVar.services.BOOKIMAGEPATH + "/" + modelId + "/"
              + bookId + "/" + _coverImage);
          _root.find("#fingerBtn").css("display","inline");
          _root.find("#uploadButton").css("margin-left","10px");
        };
         var position = data.position;
         var fingerBtn = _root.find("#fingerBtn");
         if (fingerBtn != null) {
           console.log("position:" + position);
           fingerBtn.html(position == "" ? "标定书本" : "重新标定");
         }
      },
      _updateImagePreviewSrc = function (newSource) {
        var previewImg = _root.find("#previewImg");
        var defaultSrc = previewImg.attr("src");
        if (defaultSrc.substring(0, 10) == "data:image") {
          previewImg.attr("defaultSrc", defaultSrc);
        }
        previewImg.attr("src", newSource);
      },
      _restoreImageDefaultSrc = function () {
        var previewImg = _root.find("#previewImg");
        var currentSrc = previewImg.attr("src");
        if (currentSrc.substring(0, 10) == "data:image") {
          return;
        }
        var defaultSrc = previewImg.attr("defaultSrc");
        previewImg.attr("src", defaultSrc);
      },
      _initUploadButton = function () {
        var uploadButton = _root.find("#uploadButton");
        var bigButton = _root.find("#bigButton");
        var btnBg = _root.find("#btnBg");
        uploadButton.on("click", function () {
        });
        bigButton.on("click", function () {
          var previewImg = _root.find("#previewImg");
          var currentSrc = previewImg.attr("src");
          if (currentSrc.substring(1, 7) == "static") {
            layer.msg("请上传图片！");
            return;
          }
          //window.open(currentSrc);
          layer.photos({
            photos: {
              "title": "", //相册标题
              "id": "", //相册id
              "start": 0, //初始显示的图片序号，默认0
              "data": [   //相册包含的图片，数组格式
                {
                  "alt": "",
                  "pid": "", //图片id
                  "src": currentSrc, //原图地址
                  "thumb": "" //缩略图地址
                }
              ]
            }
          });
        });
        _root.mouseover(function () {
          bigButton.show();
          btnBg.show();
        }).mouseout(function () {
          bigButton.hide();
          btnBg.hide();
        });
        _uploader = WebUploader.create({
          swf: GlobalVar.contextPath + '/js／uploader/Uploader.swf',
          server: _conf.UPLOAD_URL + "?check=" + true + "&checkScale=" + true,
          fileSingleSizeLimit: 5 * 1024 * 1024,
          pick: {
            id: uploadButton,
            multiple: false
          },
          dnd: "#image1",
          accept: {
            title: 'JPG',
            extensions: 'jpg,jpeg',
            mimeTypes: 'image/jpeg'
          },
          auto: true,
          method: "POST",
          duplicate: true,
          disableGlobalDnd: true
        });

        wantong.base.booklist.bindUploaderValidator(_uploader, 'a');

        _uploader.on('uploadSuccess', function (file, response) {
          console.log(response.status);
          _root.find("#fingerBtn").html("标定书本");
          _afterUploadImg(response);
        });
        _uploader.on("error", function (type) {
          if (type == "Q_TYPE_DENIED") {
            layer.msg("请上传jpeg格式的文件，如img.jpg或img.jpeg等");
          } else if (type == "F_EXCEED_SIZE") {
            layer.msg("文件大小不能超过5M");
          }
        });
        setTimeout(function () { //必须等_uploader初始化之后才能隐藏，不然_uploader的有效大小是1px*1px，无法点击上传文件
          /*uploadButton.hide();*/
          bigButton.hide();
          btnBg.hide();
        }, 200);
      },
      _renewAll = function () {
        _coverImage = null;
        _restoreImageDefaultSrc();
        _root.find("#fingerBtn").css("display","none");
        _root.find("#uploadButton").css("margin-left","60px");
        _root.find("#fingerBtn").html("标定书本");
      },
      _getData = function () {
        return {
          imageName: _coverImage
        }
      };

  return {
    /* conf:{
     * 	rootNode:
      initData: {
        bookId:
        imageName:
      }
     * }
     */
    init: function (conf) {
      _init(conf);
    },
    getData: function () {
      return _getData();
    },
    loadData: function (data) {
      _loadData(data);
    },
    renewAll: function () {
      _renewAll();
    },
    imgUploadCtrl: function (enable) {
      _imgUploadCtrl(enable);
    }
  }
})();

wantong.addCardPageInfo = (function () {

  let _conf = {
        cardId: 0,
        groupId: 0,
        //正面是0 反面是 1
        imageType: 0,
        sampleImageId: 0,
        sampleImage: "",
        scanImageId: 0,
        scanImage: "",
        LOAD_CARD_INFO_URL: "/card/loadCardInfo.do",
        FINGER_IMAGE_URL: "/card/fingerBook.do",
        panelData: null,
        currentPanelData: null,
      },
      isLoad = false,
      first = false,
      _root = null,
      _subManager = {},
      _sampleUpload = null,
      _scanUpload = null,
      _sampleImgDiv = null,
      _scanImgDiv = null,
      _isChangeSample = false,
      UPLOAD_URL = "upload.do",
      PREVIEW_IMAGE = "/downloadTempFile.do",
      SAVE_CARD_INFO_URL = "/card/saveCardInfo.do",
      _managerBtnClickState = {
        isClickSavePageBtn: false,
      };

  function _init(conf) {
    $.extend(_conf, conf);
    _conf.cardId = conf.cardId;
    _conf.imageType = conf.imageType;
    _conf.groupId = conf.groupId;
    _root = $("#cardPageAdd");
    _sampleImgDiv = _root.find("#image1");
    _scanImgDiv = _root.find("#image2");
    _subManager.voiceManager = wantong.addCardPageInfo.voiceManager;
    _subManager.voiceManager.init({
      _rootNode: $("#voiceManager"),
      ttsRoles: _conf.roles,
      cardId: _conf.cardId
    });
    _initItemEvent();
    _loadCardData();
    _initSampleUpload();
  };

  function _loadCardData(callBack) {
    if (_conf.cardId == 0) {
      isLoad = false;
      first = true;
      $("#frontBtn").click();
    } else {
      $.ajax({
        url: _conf.LOAD_CARD_INFO_URL,
        type: "POST",
        data: {cardId: _conf.cardId},
        async: false,
        success: function (data) {
          if (data.code == 0) {
            _conf.cardId = data.data.cardId;
            _conf.panelData = data.data;
            isLoad = true;
            first = true;
            wantong.cardMakingNav.changeTip(false);
            if (!$("#frontBtn").hasClass("btnfoucs") && !$("#backBtn").hasClass(
                "btnfoucs")) {
              $("#frontBtn").click();
            } else if (!$("#frontBtn").hasClass("btnfoucs") && $(
                "#backBtn").hasClass("btnfoucs")) {
              $("#backBtn").removeClass("btnfoucs");
              $("#backBtn").click();
            } else {
              $("#frontBtn").removeClass("btnfoucs")
              $("#frontBtn").click();
            }
          } else {
            layer.msg(data.msg);
          }
        },
        error: function () {
          layer.msg("服务异常");
        }
      })
    }
  };

  //初始化正面数据
  function _initFrontData(data) {
    _conf.currentPanelData = data;
    _subManager.voiceManager.renewAll();
    _subManager.voiceManager.stopAllAudio();
    if (data != null) {
      $("#cardName").val(_conf.panelData.cardName);
      _conf.sampleImageId = data.imageId == null ? 0 : data.imageId;
      _conf.scanImageId = data.scanImageId == null ? 0 : data.scanImageId;
      _conf.sampleImage = data.sampleImageName;
      _conf.scanImage = data.scanImageName;
      $("#image1").find("#sampleImg").attr("src",
          data.imageUrl == null ? "/static/images/caiyang1.jpg"
              : data.imageUrl);
      $("#image2").find("#scanImg").attr("src",
          data.scanImageUrl == null ? "/static/images/caiyang1.jpg"
              : data.scanImageUrl);
      $("#tab_3_content").find("#extraData").val(
          data.extraData == null ? "" : data.extraData);
      $("#tab_4_content").find("#videoText").val(
          data.videoUrl == null ? "" : data.videoUrl);
      if (data.position != null && data.position != "") {
        $("#fingerBtn").html("重新标定");
        $("#status").removeClass("label-default").addClass("label-success").text("已标定").css("display","inline");;
      } else {
        $("#fingerBtn").html("标定卡片");
        $("#status").removeClass("label-success").addClass("label-default").text("未标定").css("display","inline");;
      }
    } else {
      $("#fingerBtn").html("标定卡片");
      $("#status").removeClass("label-success").addClass("label-default").text("未标定").css("display","none");;
    }
    _subManager.voiceManager.loadData(data);
    _conf.imageType = 0;
  };

  function _initBackData(data) {
    _conf.currentPanelData = data;

    _subManager.voiceManager.renewAll();
    _subManager.voiceManager.stopAllAudio();
    if (data != null) {
      $("#cardName").val(_conf.panelData.cardName);
      _conf.scanImageId = data.scanImageId == null ? 0 : data.scanImageId;
      _conf.sampleImageId = data.imageId == null ? 0 : data.imageId;
      _conf.sampleImage = data.sampleImageName;
      _conf.scanImage = data.scanImageName;
      $("#image1").find("#sampleImg").attr("src",
          data.imageUrl == null ? "/static/images/caiyang1.jpg"
              : data.imageUrl);
      $("#image2").find("#scanImg").attr("src",
          data.scanImageUrl == null ? "/static/images/caiyang1.jpg"
              : data.scanImageUrl);
      $("#tab_3_content").find("#extraData").val(
          data.extraData == null ? "" : data.extraData);
      $("#tab_4_content").find("#videoText").val(
          data.videoUrl == null ? "" : data.videoUrl);
      if (data.position != null && data.position != "") {
        $("#fingerBtn").html("重新标定");
        $("#status").removeClass("label-default").addClass("label-success").text("已标定").css("display","inline");
      } else {
        $("#fingerBtn").html("标定卡片");
        $("#status").removeClass("label-success").addClass("label-default").text("未标定").css("display","inline");
      }
    } else {
      $("#fingerBtn").html("标定卡片");
      $("#status").removeClass("label-success").addClass("label-default").text("未标定").css("display","none");
      $("#image1").find("#sampleImg").attr("src","/static/images/caiyang1.jpg");
      $("#image2").find("#scanImg").attr("src", "/static/images/caiyang1.jpg");
      $("#tab_3_content").find("#extraData").val("");
      $("#tab_4_content").find("#videoText").val("");
    }
    _subManager.voiceManager.loadData(data);
    _conf.imageType = 1;
  };

  function _initItemEvent() {
    $("#saveAndNextButton").on("click", function (event) {
      //停止事件传播
      event.stopPropagation();
      $(this).blur();
      _subManager.voiceManager.voiceTestStop();
      let value = $(document.activeElement).val()
      if (isNaN(value)) {
        return;
      }
      if (!_managerBtnClickState.isClickSavePageBtn) {
        _managerBtnClickState.isClickSavePageBtn = true;
        // todo 保存数据
        saveCardInfo();
      }
    });
    $("#frontBtn").on("click", function () {
      if (!isLoad) {
        if (_checkNoCreate()) {
          $(this).blur();
          layer.msg("请先保存书页数据");
          return;
        }
      }else {
        if(!first) {
          if (_checkDataChange()) {
            layer.msg("请先保存书页数据");
            return;
          }
        } else {
          first = false;
        }
      }
      if ($(this).hasClass("btnfoucs")) {
        return;
      }
      $(this).addClass("btnfoucs");
      $("#backBtn").removeClass("btnfoucs");

      _initFrontData(
          _conf.panelData == null ? null : _conf.panelData.frontImageDTO);
    });
    $("#backBtn").on("click", function () {
      if (!isLoad) {
        if (_checkNoCreate()) {
          layer.msg("请先保存书页数据");
          return;
        }
      } else {
        if(!first) {
          if (_checkDataChange()) {
            layer.msg("请先保存书页数据");
            return;
          }
        }else {
          first = false;
        }
      }
      if ($(this).hasClass("btnfoucs")) {
        return;
      }
      $(this).addClass("btnfoucs");
      $("#frontBtn").removeClass("btnfoucs");
      _initBackData(
          _conf.panelData == null ? null : _conf.panelData.backImageDTO);
    });
    _root.find("#cardName").click(function () {
      _changeSaveBtnState(true);
    });

    _root.find("#fingerBtn").click(function () {
      $(this).blur();
      _fingerImage();
    });
    _sampleImgDiv.mouseover(function () {
      _root.find("#image1").find("#btnBg").css("display", "inline");
      _root.find("#image1").find("#bigButton").css("display", "inline");
    }).mouseout(function () {
      _root.find("#image1").find("#btnBg").css("display", "none");
      _root.find("#image1").find("#bigButton").css("display", "none");
    });

    _scanImgDiv.mouseover(function () {
      _root.find("#image2").find("#btnBg").css("display", "inline");
      _root.find("#image2").find("#bigButton").css("display", "inline");
    }).mouseout(function () {
      _root.find("#image2").find("#btnBg").css("display", "none");
      _root.find("#image2").find("#bigButton").css("display", "none");
    });

    _root.find("#image1").find("#bigButton").click(function () {
      var previewImg = _root.find("#sampleImg");
      var currentSrc = previewImg.attr("src");
      if (currentSrc.substring(1, 7) == "static" || currentSrc.substring(1, 7)
          == "") {
        layer.msg("请上传图片！");
        return;
      }
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

    _root.find("#image2").find("#bigButton").click(function () {
      var previewImg = _root.find("#scanImg");
      var currentSrc = previewImg.attr("src");
      if (currentSrc.substring(1, 7) == "static" || currentSrc.substring(1, 7)
          == "") {
        layer.msg("请上传图片！");
        return;
      }
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
  };

  function _fingerImage() {
    if (_conf.sampleImageId == null || _conf.sampleImageId == 0) {
      layer.msg("请先上传并保存采样图");
      return;
    }

    console.log("111111");

    var position = _conf.imageType == 0 ? _conf.panelData.frontImageDTO.position
        : _conf.panelData.backImageDTO.position;
    $.get(_conf.FINGER_IMAGE_URL, {},
        function (data) {
          layer.open({
            title: "标定卡片",
            type: 1,
            maxmin: false,
            area: ['100%', '100%'],
            content: data,
            success: function () {
              wantong.cardFingerBook.init({
                groupId: _conf.groupId,
                image: _conf.sampleImage,
                imageId: _conf.sampleImageId,
                position: position
              });
            },
            end: function () {
              _loadCardData();
            }
          });

        });

  };

  function _checkNoCreate() {
    if(_conf.sampleImage != null && _conf.sampleImage != ""){
      return true;
    }
    if(_conf.scanImage != null && _conf.scanImage != ""){
      return true;
    }
    if($('#videoText').val() != ""){
      return true;
    }
    if($("#extraData").val()!= ""){
      return true;
    }
    let voice = _subManager.voiceManager.getData();
    if (isNaN(voice)) {
      if (_checkAudio(_conf.currentPanelData.voiceVO, voice)) {
        return true;
      }
    }
    return false;
  };

  function _checkDataChange() {
    if (_conf.panelData == null) {
      return false;
    }
    if (_conf.panelData.cardName != $("#cardName").val()) {
      return true;
    }
    if (_conf.currentPanelData.imageId != null && _conf.currentPanelData.imageId
        != _conf.sampleImageId) {
      return true;
    }
    if (_conf.currentPanelData.sampleImageName != _conf.sampleImage) {
      return true;
    }
    if (_conf.scanImageId != (_conf.currentPanelData.scanImageId == null ? 0
        : _conf.currentPanelData.scanImageId)) {
      return true;
    }
    if (_conf.scanImage != _conf.currentPanelData.scanImageName) {
      return true;
    }
    if ((_conf.currentPanelData.videoUrl == null ? ""
        : _conf.currentPanelData.videoUrl) != $('#videoText').val()) {
      return true;
    }
    if ((_conf.currentPanelData.extraData == null ? ""
        : _conf.currentPanelData.extraData) != $("#extraData").val()) {
      return true;
    }
    let voice = _subManager.voiceManager.getData();
    if (isNaN(voice)) {
      if (_checkAudio(_conf.currentPanelData.voiceVO, voice)) {
        return true;
      }
    }
    return false;
  };

  function _checkAudio(panelData, voice) {
    let str = JSON.stringify(panelData);
    if (voice.voice.length > 0) {
      for (let i = 0; i < voice.voice.length; i++) {
        if (str.indexOf(JSON.stringify(voice.voice[i])) == -1) {
          return true;
        }
      }
    } else {
      if (str.indexOf(JSON.stringify(voice.voice)) == -1) {
        return true;
      }
    }
    if (voice.bgMusic.length > 0) {
      for (let i = 0; i < voice.bgMusic.length; i++) {
        if (str.indexOf(JSON.stringify(voice.bgMusic[i])) == -1) {
          return true;
        }
      }
    } else {
      if (str.indexOf(JSON.stringify(voice.bgMusic)) == -1) {
        return true;
      }
    }
    if (voice.effectSound.length > 0) {
      for (let i = 0; i < voice.effectSound.length; i++) {
        if (str.indexOf(JSON.stringify(voice.effectSound[i])) == -1) {
          return true;
        }
      }
    } else {
      if (str.indexOf(JSON.stringify(voice.effectSound)) == -1) {
        return true;
      }
    }
    return false;
  };

  function _initSampleUpload() {
    _sampleUpload = WebUploader.create({
      swf: GlobalVar.contextPath + '/js／uploader/Uploader.swf',
      server: UPLOAD_URL + "?check=" + true,
      fileSingleSizeLimit: 5 * 1024 * 1024,
      pick: {
        id: sampleUploadBtn,
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
      disableGlobalDnd: false
    });
    _sampleUpload.on('fileQueued', function (file) {
        let render = new FileReader();
        render.onload = function (e) {
          let image = new Image();
          image.src = String(e.target.result);
          image.onload = function () {
            if (image.width!=1280 || image.height!=720){
              layer.msg("请上传分辨率为1280*720的图片");
              _sampleUpload.cancelFile(file);
            }
          };
        };
        render.readAsDataURL(file.source.source);
    });
    _sampleUpload.on('uploadProgress', function (file, percentage) {

    });
    _sampleUpload.on('uploadSuccess', function (file, response) {
      if (response.code == 0) {
        console.log("filename:" + response.data.fileName);
        var _coverImage = response.data.fileName;
        _root.find("#sampleImg").attr("src",
            PREVIEW_IMAGE + "?fileName=" + _coverImage);
        _conf.sampleImage = _coverImage;
        $("#status").removeClass("label-success").addClass("label-default").text("未标定").css("display","inline");
        _isChangeSample = true;
      } else {
        layer.msg(response.msg);
      }

    });
    _sampleUpload.on("error", function (type) {
      if (type == "Q_TYPE_DENIED") {
        /*layer.msg("请上传分辨率大于 640px * 480px 的JPG格式文件");*/
        layer.msg("请上传JPG格式的图片");
      } else if (type == "F_EXCEED_SIZE") {
        layer.msg("封面图大小不能超过5M");
      }
    });

    _scanUpload = WebUploader.create({
      swf: GlobalVar.contextPath + '/js／uploader/Uploader.swf',
      server: UPLOAD_URL + "?check=" + true,
      fileSingleSizeLimit: 5 * 1024 * 1024,
      pick: {
        id: scanUploadBtn,
        multiple: false
      },
      dnd: "#image2",
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
    _scanUpload.on('fileQueued', function (file) {
    });
    _scanUpload.on('uploadProgress', function (file, percentage) {

    });
    _scanUpload.on('uploadSuccess', function (file, response) {
      if (response.code == 0) {
        _changeSaveBtnState(true);
        console.log("filename:" + response.data.fileName);
        var _coverImage = response.data.fileName;
        _root.find("#scanImg").attr("src",
            PREVIEW_IMAGE + "?fileName=" + _coverImage);
        _conf.scanImage = _coverImage;
      } else {
        layer.msg(response.msg);
      }

    });
    _scanUpload.on("error", function (type) {
      if (type == "Q_TYPE_DENIED") {
        /*layer.msg("请上传分辨率大于 640px * 480px 的JPG格式文件");*/
        layer.msg("请上传JPG格式的图片");
      } else if (type == "F_EXCEED_SIZE") {
        layer.msg("封面图大小不能超过5M");
      }
    });

    _sampleUpload.addButton({
      id: "#sampleUploadBtn"
    });
    _scanUpload.addButton({
      id: "#scanUploadBtn"
    });

  };

  function _changeSaveBtnState(state) {
    if (state) {
      _root.find("#saveAndNextButton").removeAttr("disabled");
    } else {
      _root.find("#saveAndNextButton").attr("disabled", "disabled");
    }
  };

  function saveCardInfo() {
    var allData = _getAllData();
    if (!allData) {
      _managerBtnClickState.isClickSavePageBtn = false;
      return;
    }
    $.ajax({
      url: SAVE_CARD_INFO_URL,
      type: "POST",
      async: true,
      contentType: "application/json",
      data: JSON.stringify(allData),
      dataType: 'json',
      success: function (data) {
        if (data.code == 0) {
          layer.msg("保存成功");
          _conf.cardId = data.data.cardId;
          _loadCardData();
          if (isLoad && _isChangeSample){
            wantong.cardMakingNav.changeTip(true);
          }
        } else {
          layer.msg(data.msg);
        }
      },
      error: function () {
        layer.msg("服务无响应");
      }
    }).always(function () {
      _managerBtnClickState.isClickSavePageBtn = false;
    });
  };

  function _getAllData() {
    console.log("1111");

    var cardName = _root.find("#cardName").val();
    var sampleImageId = _conf.panelData == null ? 0 : (_conf.imageType == 0
        ? _conf.panelData.frontImageDTO.imageId
        : _conf.panelData.backImageDTO.imageId);
    sampleImageId = (sampleImageId == undefined || sampleImageId == null) ? 0
        : sampleImageId;
    var sampleImage = _conf.sampleImage;
    var scanImageId = _conf.panelData == null ? 0 : (_conf.imageType == 0
        ? _conf.panelData.frontImageDTO.scanImageId
        : _conf.panelData.backImageDTO.scanImageId);
    scanImageId = (scanImageId == undefined || scanImageId == null) ? 0
        : scanImageId;
    var scanImage = _conf.scanImage;
    var voiceData = _subManager.voiceManager.getData();
    var videoText = $('#videoText').val();
    var extraData = $("#extraData").val();
    if (cardName == "") {
      layer.msg("请输入卡片名称");
      _managerBtnClickState.isClickSavePageBtn = false;
      return false;
    }

    if (sampleImage == undefined || sampleImage == "") {
      layer.msg("请上传采样图");
      _managerBtnClickState.isClickSavePageBtn = false;
      return false;
    }

    if (scanImage == undefined || scanImage == "") {
      layer.msg("请上传扫描图");
      _managerBtnClickState.isClickSavePageBtn = false;
      return false;
    }

    if (voiceData == "1") {
      layer.msg("数据有误，无法保存,请检查语音、背景音乐和音效！");
      _managerBtnClickState.isClickSavePageBtn = false;
      return false;
    }
    if (voiceData == "3") {
      layer.msg("请重新添加语音间隔！");
      _managerBtnClickState.isClickSavePageBtn = false;
      return false;
    }
    if (voiceData == "4") {
      layer.msg("请添加语音");
      _managerBtnClickState.isClickSavePageBtn = false;
      return false;
    }
    if (!voiceData) {
      //获取voice data出错，什么都不做
      layer.msg("语音过长");
      _managerBtnClickState.isClickSavePageBtn = false;
      return false;
    }
    if (!isNaN(voiceData)) {
      voiceData = null;
    }
    var data = {
      id: _conf.cardId,
      groupId: _conf.groupId,
      type: _conf.imageType,
      name: cardName,
      sampleImageId: sampleImageId,
      sampleImage: sampleImage,
      scanImageId: scanImageId,
      scanImage: scanImage,
      voice: voiceData,
      extraData: extraData,
      videoText: videoText
    };

    return data;
  };

  function _savePage() {

  };
  function _destory() {
    _subManager.voiceManager.stopAllAudio();
    _subManager.voiceManager.voiceTestStop();
  }
  return {
    init: function (conf) {
      _init(conf);
    },
    getCardId: function () {
      return _conf.cardId;
    },
    checkDataChange: function () {
      return _checkDataChange();
    },
    checkNoCreate: function () {
      return _checkNoCreate;
    },
    destory: function () {
      _destory();
    }
  }
})();

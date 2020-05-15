wantong.deviceManager = (function () {
      var CREATE_DEVICE_URL = GlobalVar.contextPath + "/app/createDevice.do",
          GET_DEVICELIST_URL = GlobalVar.contextPath + "/app/phoneparm.do",
          CHECK_DEVICE_NAME_URL = GlobalVar.contextPath
              + "/app/checkDeviceName.do",
          UPLOAD_URL = "upload.do",
          PREVIEW_IMAGE = "downloadTempFile.do",
          _root = null,
          _index = null,
          _flipParm = "",
          _rotateParm = "",
          _serachForm = null,
          _realUpload = null,
          _stencilUpload = null,
          _realUploadBtn = null,
          _stencilUploadBtn = null,
          _realImageName = "",
          _stencilrImageName = "",
          _isDefault = false,
          _frontGapClose = 0,
          _frontGapOpen = 0,
          _coverGapClose = 0,
          _coverGapOpen = 0,
          _uploadGapClose = 0,
          _uploadGapOpen = 0,
          _fingerDelayClose = 0,
          _fingerDelayOpen = 0,
          _conf = {},
          _init = function (conf) {
            $.extend(_conf, conf);
            _root = $("#mobileParmManager");
            _serachForm = _root.find("#searchFrom");
            _serachForm.attr("action", GET_DEVICELIST_URL);
            _realUploadBtn = _root.find("#uploadRealBtn");
            _stencilUploadBtn = _root.find("#uploadStencilrBtn");
            _initButton();
            _initRefMachine();
            _loadPageContent();
            $('.lcs_check').lc_switch();
          },
          _initRefMachine = function () {
            _root.find("#ref_machine").change(function () {
              if (_root.find("#baseMobile").get(0).checked) {
                _root.find("#ref_machine").val("0");
              } else {
                var options = $("#ref_machine option:selected");
                console.log("option:"+options.text());
                _loadSelect(options.text());
              }
            });

            _root.find("#baseMobile").click(function () {
              if ($(this).get(0).checked) {
                $("#ref_machine").val("0").attr("disabled", "disabled").css(
                    "background-color", "#EEEEEE");
              } else {
                $("#ref_machine").val("0").removeAttr("disabled").css(
                    "background-color", "#FFFFFF");
              }
            });
            _root.find("#flip").click(function () {
              if ($(this).get(0).checked) {
                _flipParm = "\"flip_type\":" + $("#flipSelect").val();
                if (_rotateParm.length != 0) {
                  _root.find("#cloudParm").val(
                      "{" + _flipParm + "," + _rotateParm + "}");
                  _root.find("#edgeParm").val(
                      "{" + _flipParm + "," + _rotateParm + "}");
                } else {
                  _root.find("#cloudParm").val("{" + _flipParm + "}");
                  _root.find("#edgeParm").val("{" + _flipParm + "}");
                }
              } else {
                _flipParm = "";
                if (_rotateParm.length != 0) {
                  _root.find("#cloudParm").val("{" + _rotateParm + "}");
                  _root.find("#edgeParm").val("{" + _rotateParm + "}");
                } else {
                  _root.find("#cloudParm").val("");
                  _root.find("#edgeParm").val("");
                }

              }
            });
            _root.find("#rotate").click(function () {
              if ($(this).get(0).checked) {
                _rotateParm = '"rotate":' + $("#rotateSelect").val();
                if (_flipParm.length != 0) {
                  _root.find("#cloudParm").val(
                      "{" + _flipParm + "," + _rotateParm + "}");
                  _root.find("#edgeParm").val(
                      "{" + _flipParm + "," + _rotateParm + "}");
                } else {
                  _root.find("#cloudParm").val("{" + _rotateParm + "}");
                  _root.find("#edgeParm").val("{" + _rotateParm + "}");
                }
              } else {
                _rotateParm = "";
                if (_flipParm.length != 0) {
                  _root.find("#cloudParm").val("{" + _flipParm + "}");
                  _root.find("#edgeParm").val("{" + _flipParm + "}");
                } else {
                  _root.find("#cloudParm").val("");
                  _root.find("#edgeParm").val("");
                }
              }
            });
            _root.find("#flipSelect").change(function () {
              if ($("#flip").get(0).checked) {
                _flipParm = "\"flip_type\":" + $("#flipSelect").val();
                if (_rotateParm.length != 0) {
                  _root.find("#cloudParm").val(
                      "{" + _flipParm + "," + _rotateParm + "}");
                  _root.find("#edgeParm").val(
                      "{" + _flipParm + "," + _rotateParm + "}");
                } else {
                  _root.find("#cloudParm").val(
                      "{" + _flipParm + "}");
                  _root.find("#edgeParm").val(
                      "{" + _flipParm + "}");
                }

              } else {
                _flipParm = "";
              }
            });
            _root.find("#rotateSelect").change(function () {
              if ($("#rotate").get(0).checked) {
                _rotateParm = "\"rotate\":" + $("#rotateSelect").val();
                if (_flipParm.length != 0) {
                  _root.find("#cloudParm").val(
                      "{" + _flipParm + "," + _rotateParm + "}");
                  _root.find("#edgeParm").val(
                      "{" + _flipParm + "," + _rotateParm + "}");
                } else {
                  _root.find("#cloudParm").val(
                      "{" + _rotateParm + "}");
                  _root.find("#edgeParm").val(
                      "{" + _rotateParm + "}");
                }

              } else {
                _rotateParm = "";
              }

            });

            _root.find("#paramConfigTab").click(function () {
              _changeUploadTab(true);
            });
            _root.find("#uploadTimeTab").click(function () {
              _changeUploadTab(false);
            });
          },
          _initButton = function () {
            _root.find("#addMobileParmBtn").click(function () {
              $(this).blur();
              _showCreateDialog();
            });

            _root.find("#defaultParamBtn").click(function () {
              $(this).blur();
              var thisbtn = $(this);
              var name = thisbtn.attr("tname");
              console.log("name:" + name);
              _showDefaultDialog(name);
            });
            _root.find("#searchBookBtn").click(function () {
              _searchDevice();
            });
            _root.find("#deviceCheckBtn").click(function () {
              _checkDeviceName();
            });
            _root.find("#search").bind("keydown", function (e) {
              // 兼容FF和IE和Opera
              var theEvent = e || window.event;
              var code = theEvent.keyCode || theEvent.which
                  || theEvent.charCode;
              if (code == 13) {
                //回车执行查询
                _root.find("#searchBookBtn").click();
              }
            });
            _root.find("#examineStatusSelect").change(function () {
              var status = $("#examineStatusSelect").val();
              var searchText = _root.find("#searchInput").val();
              wantong.frame.showPage(GET_DEVICELIST_URL, {
                searchText: searchText,
                examine: status
              });
            });
            _root.find(".btn-look").click(function () {
              var thisbtn = $(this);
              var name = thisbtn.attr("tname");
              thisbtn.blur();
              $.post(CHECK_DEVICE_NAME_URL, {
                model: name
              }, function (data) {
                if (data.code == 0) {
                  var _createDeviceContainer = _root.find(
                      "#createMobileParmContainer");
                  layer.open({
                    title: "查看机型参数",
                    type: 1,
                    maxmin: false,
                    resize: false,
                    area: ['40%', '80%'],
                    scrollbar: true,
                    content: _createDeviceContainer,
                    end: function () {
                      _refreshPage();
                    },
                    cancel: function () {
                    },
                    success: function (layero) {
                      var mask = $(".layui-layer-shade");
                      mask.appendTo(layero.parent());
                      //其中：layero是弹层的DOM对象
                    }
                  });
                  _initUploadBtn();
                  _index = layer.index;
                  _loadDeviceInfo(data.data, false, false);
                }
              });
            });
            _root.find(".btn-edit").click(function () {
              var thisbtn = $(this);
              var name = thisbtn.attr("tname");
              thisbtn.blur();
              $.post(CHECK_DEVICE_NAME_URL, {
                model: name
              }, function (data) {
                if (data.code == 0) {
                  var _createDeviceContainer = _root.find(
                      "#createMobileParmContainer");
                  layer.open({
                    title: "修改机型参数",
                    type: 1,
                    maxmin: false,
                    resize: false,
                    area: ['800px', '80%'],
                    scrollbar: true,
                    content: _createDeviceContainer,
                    end: function () {
                      _refreshPage();
                    },
                    cancel: function () {
                    },
                    success: function (layero) {
                      var mask = $(".layui-layer-shade");
                      mask.appendTo(layero.parent());
                      //其中：layero是弹层的DOM对象
                    }
                  });
                  _initUploadBtn();
                  _index = layer.index;
                  _loadDeviceInfo(data.data, true, true);
                }
              });
            });
            $('body').delegate('.lcs_check', 'lcs-statuschange', function () {
              if ($(this).is(':checked')) {
                if (_isDefault) {
                  $(this).parents(".request-set").next().children(
                      "#rate").removeAttr("disabled").val(_getDefaultValue(true,
                      $(this).parents(".parent-div")[0].id));
                } else {
                  $(this).parents(".request-set").next().children(
                      "#rate").removeAttr("disabled").val("");
                }

              } else {
                if (_isDefault) {
                  $(this).parents(".request-set").next().children(
                      "#rate").removeAttr("disabled").val(
                      _getDefaultValue(false,
                          $(this).parents(".parent-div")[0].id));
                } else {
                  $(this).parents(".request-set").next().children("#rate").attr(
                      "disabled", "disabled").val("");
                }
              }
            });
          },
          _searchDevice = function () {
            var status = $("#examineStatusSelect").val();
            var searchText = _root.find("#searchInput").val();
            console.log(searchText);
            if (searchText == null) {
              layer.msg("请输入搜索内容");
              return;
            }
            wantong.frame.showPage(GET_DEVICELIST_URL, {
              searchText: searchText,
              examine: status
            });
          },
          _showCreateDialog = function () {
            var _checkDeviceNameContainer = _root.find("#deviceCheckContainer");
            layer.open({
              title: "配置机型参数",
              type: 1,
              maxmin: false,
              resize: false,
              area: ['500px', '140px'],
              scrollbar: false,
              content: _checkDeviceNameContainer,
              end: function () {
                //_refreshPage();
              },
              cancel: function () {
              },
              success: function (layero) {
                var mask = $(".layui-layer-shade");
                mask.appendTo(layero.parent());
                //其中：layero是弹层的DOM对象
              }
            });
            _checkDeviceNameContainer.find("#name").val("");
            _index = layer.index;
          },
          _showDefaultDialog = function (name) {
            $.post(CHECK_DEVICE_NAME_URL, {
              model: name
            }, function (data) {
              if (data.code == 0) {
                var _createDeviceContainer = _root.find(
                    "#createMobileParmContainer");
                layer.open({
                  title: "传图全局控制设置",
                  type: 1,
                  maxmin: false,
                  resize: false,
                  area: ['800px', '80%'],
                  scrollbar: true,
                  content: _createDeviceContainer,
                  end: function () {
                    _refreshPage();
                  },
                  cancel: function () {
                  },
                  success: function (layero) {
                    var mask = $(".layui-layer-shade");
                    mask.appendTo(layero.parent());
                    //其中：layero是弹层的DOM对象
                  }
                });
                _initUploadBtn();
                _index = layer.index;
                _loadDeviceInfo(data.data, true, false);
                _hiseDefaultDiv();
              }
            });
          }
      _checkDeviceName = function () {
        var _checkDeviceNameContainer = _root.find("#deviceCheckContainer");
        var name = _checkDeviceNameContainer.find("#name").val();
        if (name == "" || name == null) {
          layer.msg("请输入机器型号");
          return;
        } else if (name.length > 64) {
          layer.msg("机器型号长度不能超过64");
          return;
        }
        $.post(CHECK_DEVICE_NAME_URL, {
          model: name
        }, function (data) {
          if (data.code == 0) {
            //设备名称已存在
            layer.confirm(
                '<div> <p><span style="color: red;">请注意：</span></p>\n'
                + '    <p><span style="color: red;">1.该机型已经配置过，如再次配置会导致已配置过的机型无法识别，请慎重！！！</span></p>\n'
                + '    <p><span style="color: red;">2.如该机型已出货，建议商家更换机型。</span></p></div>',
                {
                  btn: ['去配置', '暂不'],
                  title: '查重结果'
                }, function (index) {
                  //确定
                  layer.close(_index);
                  layer.close(index);
                  var _createDeviceContainer = _root.find(
                      "#createMobileParmContainer");
                  layer.open({
                    title: "修改机型参数",
                    type: 1,
                    maxmin: false,
                    resize: false,
                    area: ['800px', '80%'],
                    scrollbar: true,
                    content: _createDeviceContainer,
                    end: function () {
                      _refreshPage();
                    },
                    cancel: function () {
                    },
                    success: function (layero) {
                      var mask = $(".layui-layer-shade");
                      mask.appendTo(layero.parent());
                      //其中：layero是弹层的DOM对象
                    }
                  });
                  _initUploadBtn();
                  _index = layer.index;
                  _loadDeviceInfo(data.data, true, false);
                }, function () {
                  //取消
                });
          } else {
            //设备名称不存在
            layer.confirm(
                '该机型未被配置，需要配置吗？',
                {
                  btn: ['去配置', '暂不'],
                  title: '查重结果'
                }, function (index) {
                  //确定
                  layer.close(_index);
                  layer.close(index);
                  var _createDeviceContainer = _root.find(
                      "#createMobileParmContainer");
                  layer.open({
                    title: "配置机型参数",
                    type: 1,
                    maxmin: false,
                    resize: false,
                    area: ['40%', '80%'],
                    scrollbar: false,
                    content: _createDeviceContainer,
                    end: function () {
                      _refreshPage();
                    },
                    cancel: function () {
                    },
                    success: function (layero) {
                      var mask = $(".layui-layer-shade");
                      mask.appendTo(layero.parent());
                      //其中：layero是弹层的DOM对象
                    }
                  });
                  _initUploadBtn();
                  _index = layer.index;
                  var name2 = _createDeviceContainer.find("#name");
                  name2.val(name);
                  name2.attr("disabled", "disabled");
                  var _saveBtn = _createDeviceContainer.find("#saveBtn");
                  var _closeBtn = _createDeviceContainer.find(
                      "#closeBtn");
                  _saveBtn.click(function () {
                    _createSubmit(-1, false);
                  });
                  _closeBtn.click(function () {
                    layer.close(_index);
                  });
                }, function () {
                  //取消
                });
          }
        });
      },
          _createSubmit = function (deviceId, examine) {
            var createMobileParmContainer = _root.find(
                "#createMobileParmContainer");
            var _saveBtn = createMobileParmContainer.find("#saveBtn");
            var vo = _getData();
            vo.id = deviceId;
            vo.examine = examine;

            _saveBtn.attr("disabled", "disabled");

            $.ajax({
              type: "post",
              dataType: "json",
              url: CREATE_DEVICE_URL,
              contentType: "application/json",
              data: JSON.stringify(vo),
              async: false,
              success: function (data) {
                if (data.code == 0) {
                  layer.msg("保存成功");
                  layer.close(_index);
                  _saveBtn.removeAttr("disabled");
                } else {
                  layer.msg("保存失败：" + data.msg);
                  _saveBtn.removeAttr("disabled");
                }
              },
              error: function () {
                layer.msg("服务器错误");
              }
            });

          },
          _loadPageContent = function () {
            var search = _root.find("#searchInput").val();
            $("#searchText").val(search);
            var status = _root.find("#examine").val();
            $("#examineStatusSelect").val(status);
            var _pageline = _root.find("#pageline");
            var _lis = _pageline.find("li");
            _lis.on("click", function () {
              var currentPage = $(this).find("a").attr("page");
              if (currentPage == null) {
                return;
              }
              if (currentPage == 0) {
                return;
              }
              _serachForm.find("#currentPage").val(
                  $(this).find("a").attr("page"));
              var option = {
                dataType: "text",
                success: function (data) {
                  $("#moduleBodyDiv").html(data);
                },
                error: function (data) {
                  layer.alert("error");
                }
              };
              _serachForm.ajaxSubmit(option);
            });
            _root.find("#pageJump").click(function () {
              var searchText = _root.find("#searchText").val();
              var page = _root.find("#pageText").val();
              var status = _root.find("#examineStatusSelect").val();
              wantong.frame.showPage(GET_DEVICELIST_URL, {
                searchText: searchText,
                currentPage: page,
                examine: status
              });
            });
          },
          _loadDeviceInfo = function (data, isSaveShow, isExamine) {
            var _createDeviceContainer = _root.find(
                "#createMobileParmContainer");
            var name = _createDeviceContainer.find("#name");
            var baseMobile = _createDeviceContainer.find("#baseMobile");
            var ref_machine = _createDeviceContainer.find("#ref_machine");
            var flip = _createDeviceContainer.find("#flip");
            var flipSelect = _createDeviceContainer.find("#flipSelect");
            var rotate = _createDeviceContainer.find("#rotate");
            var rotateSelect = _createDeviceContainer.find(
                "#rotateSelect");
            var highParam = _createDeviceContainer.find("#highParam");
            var cloudParm = _createDeviceContainer.find("#cloudParm");
            var edgeParm = _createDeviceContainer.find("#edgeParm");
            var proParam = _createDeviceContainer.find("#proParam");
            var edgeAljParam = _createDeviceContainer.find("#edgeAljParam");
            var fixAljParam = _createDeviceContainer.find("#fixAljParam");
            var _saveBtn = _createDeviceContainer.find("#saveBtn");
            var _saveAndExamineBtn = _createDeviceContainer.find(
                "#saveAndExamineBtn");
            var _closeBtn = _createDeviceContainer.find("#closeBtn");
            var _realImage = _createDeviceContainer.find("#realImage");
            var _stencilImage = _createDeviceContainer.find("#stencilImage");
            var _otherName = _createDeviceContainer.find("#otherName");
            var note = _createDeviceContainer.find("#note");
            var deviceId = data.deviceId;
            name.val(data.name || "");
            name.attr("disabled", "disabled");
            note.val(data.note || "");
            _otherName.val(data.modelOtherName || "");

            if (data.realImage != null && data.realImage != "") {
              _realImageName = data.realImage;
              _realImage.attr("src",
                  GlobalVar.services.FDS + "tis/devicephoto/" + data.realImage);
            }
            if (data.stencilImage != null && data.stencilImage != "") {
              _stencilrImageName = data.stencilImage;
              _stencilImage.attr("src",
                  GlobalVar.services.FDS + "tis/devicephoto/"
                  + data.stencilImage);
            }

            baseMobile.prop("checked",
                data.ref_machine == 0 ? true : false);
            ref_machine.val(data.ref_machine);
            if (data.ref_machine == 0) {
              $("#ref_machine").attr("disabled", "disabled").css(
                  "background-color", "#EEEEEE");
            }
            //根绝参数设置flip和rorate
            var _cloudParm = data.cloudParm;
            var _edgeParm = data.edgeParm;
            var _cloudIndex = _cloudParm.indexOf("flip_type");
            var _edgeIndex = _edgeParm.indexOf("rotate");
            console.log("cloudIndex:" + _cloudIndex);
            console.log("edgeIndex:" + _edgeIndex);
            if (_cloudIndex != -1) {
              flip.prop('checked', true);
            }
            if (_edgeIndex != -1) {
              rotate.prop('checked', true);
            }
            if (_cloudIndex != -1 && _edgeIndex != -1) {
              var _cloudVal1 = _cloudParm.charAt(_cloudIndex + 11);
              var _cloudVal2 = _cloudParm.charAt(_cloudIndex + 12);
              if (_cloudVal1 == " ") {
                _cloudVal1 = _cloudParm.charAt(_cloudIndex + 12);
                _cloudVal2 = _cloudParm.charAt(_cloudIndex + 13);
              }
              var _edgeVal1 = _edgeParm.charAt(_edgeIndex + 8);
              var _edgeVal2 = _edgeParm.charAt(_edgeIndex + 9);
              var _edgeVal3 = _edgeParm.charAt(_edgeIndex + 10);
              if (_edgeVal1 == " ") {
                _edgeVal1 = _edgeParm.charAt(_edgeIndex + 9);
                _edgeVal2 = _edgeParm.charAt(_edgeIndex + 10);
                _edgeVal3 = _edgeParm.charAt(_edgeIndex + 11);
              }

              if (isNaN(_cloudVal2)) {
                flipSelect.val(_cloudVal1);
              } else {
                flipSelect.val(_cloudVal1 + _cloudVal2);
              }
              if (isNaN(_edgeVal2)) {
                rotateSelect.val(_edgeVal1);
              } else {
                if (isNaN(_edgeVal3)) {
                  rotateSelect.val(_edgeVal1 + _edgeVal2);
                } else {
                  rotateSelect.val(
                      _edgeVal1 + _edgeVal2 + _edgeVal3);
                }
              }
            }
            _flipParm = '"flip_type":' + $("#flipSelect").val();
            _rotateParm = '"rotate":' + $("#rotateSelect").val();
            cloudParm.val(_cloudParm);
            edgeParm.val(_edgeParm);
            proParam.val(data.proParam || "");
            edgeAljParam.val(data.edgeAljParam || "");
            fixAljParam.val(data.fixAljParam || "");

            //端算法参数
            if (data.frontGap != null) {
              if (data.frontGap.open) {
                var _frontGapCheck = _createDeviceContainer.find(
                    "#frontGapDiv .lcs_check");
                _frontGapCheck.lcs_on();
                var _frontGapInput = _createDeviceContainer.find(
                    "#frontGapDiv #rate");
                _frontGapInput.val(data.frontGap.value);
              }
            }

            if (data.uploadGap != null) {
              if (data.uploadGap.open) {
                var _uploadGapCheck = _createDeviceContainer.find(
                    "#uploadGapDiv .lcs_check");
                _uploadGapCheck.lcs_on();
                var _uploadGapInput = _createDeviceContainer.find(
                    "#uploadGapDiv #rate");
                _uploadGapInput.val(data.uploadGap.value);
              }
            }

            if (data.coverGap != null) {
              if (data.coverGap.open) {
                var _coverGapCheck = _createDeviceContainer.find(
                    "#coverGapDiv .lcs_check");
                _coverGapCheck.lcs_on();
                var _coverGapInput = _createDeviceContainer.find(
                    "#coverGapDiv #rate");
                _coverGapInput.val(data.coverGap.value);
              }
            }

            if (data.fingerDelay != null) {
              if (data.fingerDelay.open) {
                var _fingerDelayCheck = _createDeviceContainer.find(
                    "#fingerDelayDiv .lcs_check");
                _fingerDelayCheck.lcs_on();
                var _fingerDelayInput = _createDeviceContainer.find(
                    "#fingerDelayDiv #rate");
                _fingerDelayInput.val(data.fingerDelay.value);
              }
            }

            if (data.handleEdge != null) {
              if (data.handleEdge.open) {
                var _handleEdgeCheck = _createDeviceContainer.find(
                    "#handleEdgeDiv .lcs_check");
                _handleEdgeCheck.lcs_on();
              }
            }

            if (data.proposeHand != null) {
              if (data.proposeHand.open) {
                var _proposeHandCheck = _createDeviceContainer.find(
                    "#proposeHandDiv .lcs_check");
                _proposeHandCheck.lcs_on();
              }
            }

            //
            _isDefault = data.isDefault;
            if (_isDefault) {
              _frontGapClose = data.fontGapClose;
              _frontGapOpen = data.fontGapOpen;
              _coverGapClose = data.coverGapClose;
              _coverGapOpen = data.coverGapOpen;
              _uploadGapClose = data.uploadGapClose;
              _uploadGapOpen = data.uploadGapOpen;
              _fingerDelayClose = data.fingerDelayClose;
              _fingerDelayOpen = data.fingerDelayOpen;
              _createDeviceContainer.find("#frontGapDiv #rate").removeAttr(
                  "disabled").val(data.frontGap.value);
              _createDeviceContainer.find("#uploadGapDiv #rate").removeAttr(
                  "disabled").val(data.uploadGap.value);
              _createDeviceContainer.find("#coverGapDiv #rate").removeAttr(
                  "disabled").val(data.coverGap.value);
              _createDeviceContainer.find("#fingerDelayDiv #rate").removeAttr(
                  "disabled").val(data.fingerDelay.value);
            }

            _saveBtn.click(function () {
              _createSubmit(deviceId, false);
            });
            _saveAndExamineBtn.click(function () {
              _createSubmit(deviceId, true);
            });
            _closeBtn.click(function () {
              layer.close(_index);
            });
            if (isExamine) {
              _saveAndExamineBtn.css("display", "inline");
            } else {
              _saveAndExamineBtn.css("display", "none");
            }
            if (!isSaveShow) {
              _saveBtn.css("display", "none");
              baseMobile.attr("disabled", "disabled");
              ref_machine.attr("disabled", "disabled");
              flip.attr("disabled", "disabled");
              flipSelect.attr("disabled", "disabled");
              rotate.attr("disabled", "disabled");
              rotateSelect.attr("disabled", "disabled");
              cloudParm.attr("disabled", "disabled");
              edgeParm.attr("disabled", "disabled");
            } else {
              _saveBtn.css("display", "inline");
            }
          },
          _initUploadBtn = function () {
            _realUpload = WebUploader.create({
              swf: GlobalVar.contextPath + '/js／uploader/Uploader.swf',
              server: UPLOAD_URL,
              fileSingleSizeLimit: 5 * 1024 * 1024,
              pick: {
                id: _realUploadBtn,
                multiple: false
              },
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
            _realUpload.on('fileQueued', function (file) {
            });
            _realUpload.on('uploadProgress', function (file, percentage) {
              /*var width = file._info.width;
              var height = file._info.height;
              var fileSize = file.size;
              if (width < 640 || height < 480) {
                layer.msg("请上传分辨率大于 640px * 480px 的JPG格式文件");
                _uploader.cancelFile(file);
                return;
              }*/
            });
            _realUpload.on('uploadSuccess', function (file, response) {
              if (response.code == 0) {
                _realImageName = response.data.fileName;
                _root.find("#realImage").attr("src",
                    PREVIEW_IMAGE + "?fileName=" + _realImageName);
              } else {
                layer.msg("上传图片失败");
              }

            });
            _realUpload.on("error", function (type) {
              if (type == "Q_TYPE_DENIED") {
                /*layer.msg("请上传分辨率大于 640px * 480px 的JPG格式文件");*/
                layer.msg("请上传JPG格式的图片");
              } else if (type == "F_EXCEED_SIZE") {
                layer.msg("封面图大小不能超过5M");
              }
            });

            _stencilUpload = WebUploader.create({
              swf: GlobalVar.contextPath + '/js／uploader/Uploader.swf',
              server: UPLOAD_URL,
              fileSingleSizeLimit: 5 * 1024 * 1024,
              pick: {
                id: _stencilUploadBtn,
                multiple: false
              },
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
            _stencilUpload.on('fileQueued', function (file) {
            });
            _stencilUpload.on('uploadProgress', function (file, percentage) {
              /*var width = file._info.width;
              var height = file._info.height;
              var fileSize = file.size;
              if (width < 640 || height < 480) {
                layer.msg("请上传分辨率大于 640px * 480px 的JPG格式文件");
                _uploader.cancelFile(file);
                return;
              }*/
            });
            _stencilUpload.on('uploadSuccess', function (file, response) {
              if (response.code == 0) {
                _stencilrImageName = response.data.fileName;
                _root.find("#stencilImage").attr("src",
                    PREVIEW_IMAGE + "?fileName=" + _stencilrImageName);
              } else {
                layer.msg("上传图片失败");
              }

            });
            _stencilUpload.on("error", function (type) {
              if (type == "Q_TYPE_DENIED") {
                /*layer.msg("请上传分辨率大于 640px * 480px 的JPG格式文件");*/
                layer.msg("请上传JPG格式的图片");
              } else if (type == "F_EXCEED_SIZE") {
                layer.msg("封面图大小不能超过5M");
              }
            });
          },
          _refreshPage = function () {
            _realUpload = null;
            _stencilUpload = null;
            var currentPage = _root.find("#currentPage").val();
            var status = _root.find("#examineStatusSelect").val();
            var searchText = _root.find("#searchInput").val();
            wantong.frame.showPage(GlobalVar.backPath,
                {
                  currentPage: currentPage,
                  examine: status,
                  searchText: searchText
                });
            layer.closeAll();
          },
          _getData = function () {
            var createMobileParmContainer = _root.find(
                "#createMobileParmContainer");
            var modelname = createMobileParmContainer.find("#name").val();
            var ref_machine = createMobileParmContainer.find(
                "#ref_machine").val();
            var cloudparm = createMobileParmContainer.find("#cloudParm").val();
            var edgeparm = createMobileParmContainer.find("#edgeParm").val();
            var proParam = createMobileParmContainer.find("#proParam").val();
            var edgeAljParam = createMobileParmContainer.find(
                "#edgeAljParam").val();
            var fixAljParam = createMobileParmContainer.find(
                "#fixAljParam").val();
            var otherName = createMobileParmContainer.find("#otherName").val();
            var note = createMobileParmContainer.find("#note").val();
            var _isFrontGapSet = createMobileParmContainer.find(
                "#frontGapDiv .lcs_switch").hasClass("lcs_on");
            var _isUploadGapSet = createMobileParmContainer.find(
                "#uploadGapDiv .lcs_switch").hasClass("lcs_on");
            var _isCoverGapSet = createMobileParmContainer.find(
                "#coverGapDiv .lcs_switch").hasClass("lcs_on");
            var _isFingerDelaySet = createMobileParmContainer.find(
                "#fingerDelayDiv .lcs_switch").hasClass("lcs_on");
            var _isHandleEdgeSet = createMobileParmContainer.find(
                "#handleEdgeDiv .lcs_switch").hasClass("lcs_on");
            var _isProposeHandSet = createMobileParmContainer.find(
                "#proposeHandDiv .lcs_switch").hasClass("lcs_on");
            let frontGap = {open: false, value: 0};
            let uploadGap = {open: false, value: 0};
            let coverGap = {open: false, value: 0};
            let fingerDelay = {open: false, value: 0};
            let handleEdge = {open: false, value: 0};
            let proposeHand = {open: false, value: 0};

            if (_isFrontGapSet) {
              var rate = createMobileParmContainer.find(
                  "#frontGapDiv #rate").val();
              if (rate.length == 0) {
                layer.msg("输入框中不能为空！");
                return;
              }
              frontGap = {open: _isFrontGapSet, value: rate};
            } else if (_isDefault) {
              var rate = createMobileParmContainer.find(
                  "#frontGapDiv #rate").val();
              if (rate.length == 0) {
                layer.msg("输入框中不能为空！");
                return;
              }
              frontGap = {open: _isFrontGapSet, value: rate};
            }

            if (_isUploadGapSet) {
              var rate = createMobileParmContainer.find(
                  "#uploadGapDiv #rate").val();
              if (rate.length == 0) {
                layer.msg("输入框中不能为空！");
                return;
              }
              uploadGap = {open: _isUploadGapSet, value: rate};
            } else if (_isDefault) {
              var rate = createMobileParmContainer.find(
                  "#uploadGapDiv #rate").val();
              if (rate.length == 0) {
                layer.msg("输入框中不能为空！");
                return;
              }
              uploadGap = {open: _isUploadGapSet, value: rate};
            }

            if (_isCoverGapSet) {
              var rate = createMobileParmContainer.find(
                  "#coverGapDiv #rate").val();
              if (rate.length == 0) {
                layer.msg("输入框中不能为空！");
                return;
              }
              coverGap = {open: _isCoverGapSet, value: rate};
            } else if (_isDefault) {
              var rate = createMobileParmContainer.find(
                  "#coverGapDiv #rate").val();
              if (rate.length == 0) {
                layer.msg("输入框中不能为空！");
                return;
              }
              coverGap = {open: _isCoverGapSet, value: rate};
            }

            if (_isFingerDelaySet) {
              var rate = createMobileParmContainer.find(
                  "#fingerDelayDiv #rate").val();
              if (rate.length == 0) {
                layer.msg("输入框中不能为空！");
                return;
              }
              fingerDelay = {open: _isFingerDelaySet, value: rate};
            } else if (_isDefault) {
              var rate = createMobileParmContainer.find(
                  "#fingerDelayDiv #rate").val();
              if (rate.length == 0) {
                layer.msg("输入框中不能为空！");
                return;
              }
              fingerDelay = {open: _isFingerDelaySet, value: rate};
            }
            handleEdge = {open: _isHandleEdgeSet, value: 0};
            proposeHand = {open: _isProposeHandSet, value: 0};


            if (modelname.length == 0) {
              layer.msg("机器型号不能为空！");
              return;
            }
            if (modelname.length > 64) {
              layer.msg("机器型号长度不能超过64");
              return;
            }

            var vo = {
              modelname: modelname,
              ref_machineId: ref_machine,
              cloudparm: cloudparm,
              edgeparm: edgeparm,
              realImage: _realImageName,
              stencilImage: _stencilrImageName,
              note: note,
              modelOtherName: otherName,
              proParam: proParam,
              edgeAljParam: edgeAljParam,
              fixAljParam: fixAljParam,
              frontGap: frontGap,
              uploadGap: uploadGap,
              coverGap: coverGap,
              fingerDelay: fingerDelay,
              handleEdge: handleEdge,
              proposeHand: proposeHand
            };

            console.log("vo:" + JSON.stringify(vo));

            return vo;
          },
          _changeUploadTab = function (isParamSet) {
            var _createMobileDiv = _root.find("#createMobileParmContainer");
            if (isParamSet) {
              _createMobileDiv.find("#paramConfigTab").addClass("layui-this");
              _createMobileDiv.find("#uploadTimeTab").removeClass("layui-this");
              _createMobileDiv.find("#paramConfigDiv").css("display", "inline");
              _createMobileDiv.find("#uploadTimeDiv").css("display", "none");
            } else {
              _createMobileDiv.find("#paramConfigTab").removeClass(
                  "layui-this");
              _createMobileDiv.find("#uploadTimeTab").addClass("layui-this");
              _createMobileDiv.find("#paramConfigDiv").css("display", "none");
              _createMobileDiv.find("#uploadTimeDiv").css("display", "inline");
            }
          },
          _hiseDefaultDiv = function () {
            var _createMobileDiv = _root.find("#createMobileParmContainer");
            _changeUploadTab(false);
            _createMobileDiv.find(".layui-tab-brief").css("display", "none");
            _createMobileDiv.find("#defaultTipDiv").css("display", "inline");
          },
          _getDefaultValue = function (_isOpen, divValue) {
            var result = 0;
            switch (divValue) {
              case "frontGapDiv":
                result = _isOpen ? _frontGapOpen : _frontGapClose;
                break;
              case "uploadGapDiv":
                result = _isOpen ? _uploadGapOpen : _coverGapClose;
                break;
              case "coverGapDiv":
                result = _isOpen ? _coverGapOpen : _coverGapClose;
                break;
              case "fingerDelayDiv":
                result = _isOpen ? _fingerDelayOpen : _fingerDelayClose;
                break;
              default:
                break;
            }
            return result;
          },
          _loadSelect = function (name) {
            $.post(CHECK_DEVICE_NAME_URL, {
              model: name
            }, function (data) {
              if (data.code == 0) {
                var _createDeviceContainer = _root.find(
                    "#createMobileParmContainer");
                var flip = _createDeviceContainer.find("#flip");
                var flipSelect = _createDeviceContainer.find("#flipSelect");
                var rotate = _createDeviceContainer.find("#rotate");
                var rotateSelect = _createDeviceContainer.find(
                    "#rotateSelect");
                var cloudParm = _createDeviceContainer.find("#cloudParm");
                var edgeParm = _createDeviceContainer.find("#edgeParm");
                var proParam = _createDeviceContainer.find("#proParam");
                var edgeAljParam = _createDeviceContainer.find("#edgeAljParam");
                var fixAljParam = _createDeviceContainer.find("#fixAljParam");
                //根绝参数设置flip和rorate
                var _cloudParm = data.data.cloudParm;
                var _edgeParm = data.data.edgeParm;
                var _cloudIndex = _cloudParm.indexOf("flip_type");
                var _edgeIndex = _edgeParm.indexOf("rotate");
                console.log("cloudIndex:" + _cloudIndex);
                console.log("edgeIndex:" + _edgeIndex);
                if (_cloudIndex != -1) {
                  flip.prop('checked', true);
                } else {
                  flip.prop('checked', false);
                }
                if (_edgeIndex != -1) {
                  rotate.prop('checked', true);
                } else {
                  rotate.prop('checked', false);
                }
                if (_cloudIndex != -1 && _edgeIndex != -1) {
                  var _cloudVal1 = _cloudParm.charAt(_cloudIndex + 11);
                  var _cloudVal2 = _cloudParm.charAt(_cloudIndex + 12);
                  if (_cloudVal1 == "") {
                    _cloudVal1 = _cloudParm.charAt(_cloudIndex + 12);
                    _cloudVal2 = _cloudParm.charAt(_cloudIndex + 13);
                  }
                  var _edgeVal1 = _edgeParm.charAt(_edgeIndex + 8);
                  var _edgeVal2 = _edgeParm.charAt(_edgeIndex + 9);
                  var _edgeVal3 = _edgeParm.charAt(_edgeIndex + 10);
                  if (_edgeVal1 == "") {
                    _edgeVal1 = _edgeParm.charAt(_edgeIndex + 9);
                    _edgeVal2 = _edgeParm.charAt(_edgeIndex + 10);
                    _edgeVal3 = _edgeParm.charAt(_edgeIndex + 11);
                  }

                  if (isNaN(_cloudVal2)) {
                    flipSelect.val(_cloudVal1);
                  } else {
                    flipSelect.val(_cloudVal1 + _cloudVal2);
                  }
                  if (isNaN(_edgeVal2)) {
                    rotateSelect.val(_edgeVal1);
                  } else {
                    if (isNaN(_edgeVal3)) {
                      rotateSelect.val(_edgeVal1 + _edgeVal2);
                    } else {
                      rotateSelect.val(
                          _edgeVal1 + _edgeVal2 + _edgeVal3);
                    }
                  }
                }
                _flipParm = '"flip_type":' + $("#flipSelect").val();
                _rotateParm = '"rotate":' + $("#rotateSelect").val();
                cloudParm.val(_cloudParm);
                edgeParm.val(_edgeParm);
                proParam.val(data.data.proParam || "");
                edgeAljParam.val(data.data.edgeAljParam || "");
                fixAljParam.val(data.data.fixAljParam || "");
              }
            });
          };
      return {
        init: function (conf) {
          _init(conf);
        }
      }
    }
)
();
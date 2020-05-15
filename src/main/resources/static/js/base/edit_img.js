wantong.base.editImage = (function () {
  var _root = null;
  var two;
  var canvas;
  var context;
  var s2;
  var img;
  var bookId;
  var _index;
  var _conf = {
        GET_PROCESSED_IMAGE: "base/getProcessImg.do",
        GET_RDIT_IMAGE: "base/showEditPage.do",
        GET_PREVIEW_IMAGE: "base/getPreviewImg.do"
      },
      _init = function (conf) {
        _root = $("#popwindow");
        $.extend(_conf, conf);
        initPopWindow(_conf);
        _hideCreate();
        initButton();
      },
      initButton = function () {
        _root.find("#createImg").click(function () {
          $(this).blur();
          create();
        });
      },
      _closeLayer = function () {
        layer.close(two);
        // wantong.base.bookAdd.closeLayer();
      },
      closeSelf = function () {
        var i = window.parent.layer.getFrameIndex();
        window.parent.layer.close(i);
      },
      _hideCreate = function () {
        $('#createImg').css('display', 'none');
      },
      _showCreate = function () {
        $('#createImg').css('display', 'inline-block');
        $('#errorTip').css('display', 'none');
      },
      _roughEqual = function(a, b) {
        var min = a - 5;
        var max = a + 5;
        return b > min && b < max
      },
      _isDotExist = function (p) {
        var items = s2.getAll();
        for (var i = 0; i < items.length; i++) {
          if (_roughEqual(items[i].x, p.x) && _roughEqual(items[i].y, p.y)) {
            return i;
          }
        }

        return -1;
      },
      initPopWindow = function (imgData) {
        s = new Stack();
        s2 = new Stack();
        img = new Image();
        img.src = "downloadTempFile.do?fileName=" + _conf.fileName;
        canvas = document.getElementById("imgCavans");
        img.onload = function () {
          canvas.height = img.height;
          canvas.width = img.width;
          context = canvas.getContext("2d");
          var Imagedata2 = context.getImageData(0, 0, context.canvas.height,
              context.canvas.width);//每次把画图转换为对象保存起来
          s.push(Imagedata2);
          context.drawImage(img, 0, 0);
        }

        canvas.onmouseup = function (e) {
          var mouseX = e.clientX - canvas.getBoundingClientRect().left;
          var mouseY = e.clientY - canvas.getBoundingClientRect().top;
          console.log("mouseX:" + mouseX, "mouseY:" + mouseY);
          var p = {};
          p.x = parseInt(mouseX);
          p.y = parseInt(mouseY);
          var cur = _isDotExist(p);
          console.log('dot exist', cur, p.x, p.y);
          if (cur > -1) {
            s2.getAll().splice(cur, 1);
            _hideCreate();
            redraw();
            return;
          }

          if (s2.size() >= 2) {
            return;
          } else if (s2.size() == 1) {

            _showCreate();
          }

          s2.push(p);
          if (s2.size() == 2 && !_isRect()) {
            //无效打点
            $('#errorTip').css('display', 'block');
            layer.msg("标记错误：请在封面的左上角和右下角打点",{time: 1*1000}, function() {
              //$('#errorTip').css('display', 'none');
            });
            s2.pop();
            _hideCreate();
            return;
          }

          draw(p);
        }
      },

      _isRect = function() {
        var items = s2.getAll();
        var p1 = items[0];
        var p2 = items[1];
        //必须有一定斜率
        if (p1.x > p2.x+50 && p1.y > p2.y+50) {
          return true;
        }

        if (p1.x+50 < p2.x && p1.y+50 < p2.y) {
          return true;
        }

        return false;
      },
      draw = function draw(p) {
        drawStar(context, p.x, p.y);
      },
      //随机画圆点
      drawStar = function drawStar(ctx, mouseX, mouseY) {
        ctx.beginPath();
        ctx.fillStyle = '#08EA08';
        ctx.arc(mouseX, mouseY, 5, 0, 2 * Math.PI);
        ctx.fill();
      },
      redraw = function () {
        //重新画原始图
        context.drawImage(img, 0, 0);
        //画点
        var items = s2.getAll();
        for(var i = 0; i < items.length; i++) {
          draw(items[i]);
        }
      },
      //生成预览
      create = function () {
        if (s2.size() < 2) {

          _hideCreate();
          return;
        }

        //将图片编辑点坐标据传回
        var left_top = s2.pop();
        var right_buttom = s2.pop();
        //点排序
        if (left_top.x > right_buttom.x) {
          var temp = left_top;
          left_top = right_buttom;
          right_buttom = temp;
        }

        _conf.x1 = left_top.x;
        _conf.y1 = left_top.y;
        _conf.x2 = left_top.x;
        _conf.y2 = left_top.y;

        $.post(_conf.GET_PREVIEW_IMAGE, {
          bookId: _conf.bookId,
          x1: left_top.x,
          y1: left_top.y,
          x2: right_buttom.x,
          y2: right_buttom.y,
          coverImage: _conf.fileName,
        }, function (html) {
         wantong.base.bookAdd.exitFullSreen();
          two = layer.open({
            title: "预览图片",
            type: 1,
            maxmin: false,
            resize: false,
            area: ['900px', '730px'],
            content: html,
            end: function () {
              layer.close(_index);
            },
            cancel: function () {
            }
          });
        });

      };

  class Stack {
    constructor() {
      this.items = [];
    };

    getAll() {
      return this.items;
    };

    push(value) {
      this.items.push(value);
    };

    pop() {
      return this.items.pop();
    };

    peek() {
      return this.items[this.items.length - 1];
    };

    isEmpty() {
      return this.items.length === 0;
    };

    clear() {
      return this.items = [];
    };

    size() {
      return this.items.length;
    }
  };
  return {
    init: function (conf) {
      console.log("edit初始化加载");
      _init(conf);
    },
    refresh: function (page) {
      _refreshList(page);
    }
    ,
    refreshCurrentPage: function () {
      _refreshCurrentPage();
    },
    closeLayer: function () {
      _closeLayer();
    },
    closeSelf1: function () {
      closeSelf();
    }
  }

})();
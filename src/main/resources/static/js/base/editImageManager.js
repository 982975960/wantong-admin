wantong.base.editImageManager = (function () {
        var _root = null;
        var img = null;
        var _conf = {
           SAVE_IMAGE:"base/saveImage.do"
        },
        _init = function (conf) {
            $.extend(_conf, conf);
            img = $("#lastImage");
            _root = $("#showImage");
            initPopWindow(_conf);
            initButton();
        },
        initPopWindow = function(_conf){
            img.attr("src", "downloadTempFile.do?fileName="+_conf.coverImage);

        };
        initButton = function(){
            _root.find("#saveImage").click(function () {
                $(this).blur();
                saveImage();
            });
            _root.find("#unSave").click(function () {
                $(this).blur();
                unSave();
            });
        }
        unSave = function () {
          var index2 = layer.index;
          layer.close(index2);
          wantong.base.bookAdd.editCover();
        }
        saveImage = function () {
            $.post(_conf.SAVE_IMAGE,{
                        tempFileName : _conf.tempFileName,
                        coverImage : _conf.coverImage,
                        bookId: _conf.bookId,
                        x1 : _conf.x1,
                        y1 : _conf.y1,
                        x2 : _conf.x2,
                        y2 : _conf.y2,
            },function (response) {
                console.log("coverImage:"+response.coverImage);
                //layer.msg("编辑图片成功");
                var index2 = layer.index;
                layer.close(index2);
                wantong.base.bookAdd.loadCover(response.coverImage);

            },"json").fail (function f() {
                 layer.msg("编辑图片失败");
            });
        }

    return {
        init: function (conf) {
            console.log("editImageManager初始化加载");
            _init(conf);
        },
        refresh: function (page) {
            _refreshList(page);
        }
        ,
        refreshCurrentPage: function () {
            _refreshCurrentPage();
        }
    }

})();
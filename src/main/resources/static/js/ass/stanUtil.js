var loadImageToBlob  = function(url, fileName, callback) {
  if(!url || !callback) return false;

  var xhr = new XMLHttpRequest();
  xhr.open('get', url, true);
  xhr.responseType = 'blob';
  xhr.onload = function() {
    // 注意这里的this.response 是一个blob对象 就是文件对象
    callback(fileName, this.status == 200 ? this.response : false);
  }

  xhr.send();

  return true;
}

function urlToFile(url, name, fn) {
  urltoImage(url, function (img) {
    var cvs = imagetoCanvas(img);
    canvasResizetoFile(cvs, 1, function (blob) {
      fn(name, blob);
    });
  });
}

function urltoImage (url,fn){
  var img = new Image();
  img.setAttribute('crossOrigin', 'anonymous');
  img.src = url;
  img.onload = function(){
    fn(img);
  }
};


function imagetoCanvas(image){
  var cvs = document.createElement("canvas");
  var ctx = cvs.getContext('2d');
  cvs.width = image.width;
  cvs.height = image.height;
  ctx.drawImage(image, 0, 0, cvs.width, cvs.height);
  return cvs ;
};


function canvasResizetoFile(canvas,quality,fn){
  canvas.toBlob(function(blob) {
    fn(blob);
  },'image/jpeg',quality);
};

function getFileName(url) {
  return url.substring(url.lastIndexOf('/')+1);
}
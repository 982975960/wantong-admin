var GlobalVar = {};
var GlobalFunc = {};
GlobalVar.contextPath = "";
GlobalVar.backPath = null;
GlobalVar.services ={
	FDS: null,
  FDSES:null,
	BRS: null,
	DOWNLOAD:null,
  ISBN:null,
  BOOKIMAGEPATH:null,
  THUMBNAILPATH:null,//左侧缩略图目录
  APPOPERATINGCONFIGPATH:null,
  CARDIMAGEPATH:null //卡片图片路径
}
GlobalVar.data = {};
// $(document).ajaxError(function() {
//   console.log("error");
// });
console.log('init func');
GlobalFunc = {
  /**
   * 根据DC ID获取file域名
   * @param dcId
   * @returns {*}
   */
  getEndpoint: function(dcId) {
    return GlobalVar.services.FDSES[dcId];
  },
  /**
   * 根据traceId 获取DC ID
   * @param traceId
   * @returns {number}
   */
  getDataCenterId: function(traceId) {
    // return traceId >> 17 & 31;
    return traceId >> 12 & 31;
  },
  /**
   * 根据traceId获取节点
   */
  getEndpointByTraceId: function(traceId) {
    return GlobalFunc.getEndpoint(GlobalFunc.getDataCenterId(traceId));
  }
};

//重写ajax
(function($){
  $.fn.getHexBackgroundColor = function() {
    var rgb = $(this).css('background-color');
    if(!/msie/.test(navigator.userAgent.toLowerCase())){
      rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
      function hex(x) {
        return ("0" + parseInt(x).toString(16)).slice(-2);
      }
      if(rgb == null){
        return "";
      }
      rgb= "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
    }
    return rgb;
  }
  //首先备份下jquery的ajax方法
  var _ajax = $.ajax;

  //重写jquery的ajax方法
  $.ajax=function(opt){
    //备份opt中error和success方法
    var fn = {
      error:function(XMLHttpRequest, textStatus, errorThrown){},
      success:function(data, textStatus){},
      done:function(response){}
    }
    if(opt.error){
      fn.error=opt.error;
    }
    if(opt.success){
      fn.success=opt.success;
    }
    // if (opt.done){
    //   fn.done = opt.done;
    // }

    //扩展增强处理
    var _opt = $.extend(opt,{
      error:function(XMLHttpRequest, textStatus, errorThrown){
        //错误方法增强处理
        // console.log(textStatus);
        // console.log(errorThrown);
        // console.log("aaaaaaa");
        if (textStatus == 'parsererror') {
          window.location.href = GlobalVar.contextPath + "/main.do";
        }
        fn.error(XMLHttpRequest, textStatus, errorThrown);
      },
      // done: function (response) {
      //   console.log("aaaaaaaaasa");
      //   fn.done(response);
      // },
      success:function(data, textStatus){
        // console.log(data.status);
        //成功回调方法增强处理
        fn.success(data, textStatus);
      },
      beforeSend:function(XHR){
        //提交前回调方法
        // $('body').append("<div id='ajaxInfo' style=''>正在加载,请稍后...</div>");
      },
      complete:function(XHR, TS){
        //请求完成后回调函数 (请求成功或失败之后均调用)。
        // $("#ajaxInfo").remove();;
      }
    });
    return _ajax(_opt);
  };
})(jQuery);

//为jq增加捕获阶段触发支持
(function(debug){
  // 用WeakMap省的dom被移除了还持有引用无法gc
  const listeners = new WeakMap();
  // core
  const capture = (elem,type,callback,once=false) => {
    // 看看有没有这个dom,避免重复注册
    if(!listeners.has(elem)){
      listeners.set(elem,new Map());
      // https://developer.mozilla.org/zh-CN/docs/Web/API/EventTarget/addEventListener
      elem.addEventListener(type,fnCenter,{
        capture:true,
        once,
      });
    }
    const map = listeners.get(elem);
    // 看看有没有这个type的事件被注册
    if(map.has(type)){
      map.get(type).push(callback);
    }else{
      map.set(type,[callback]);
    }
  };

  // 所有注册都用同一个函数引用，方便解除
  const fnCenter = function(event){
    // currentTarget和target的区别参见mdn
    const {currentTarget,type} = event;
    // currentTarget,type就是找到回调的两把钥匙
    if(listeners.has(currentTarget) && listeners.get(currentTarget).has(type)){
      const callbacksArray = listeners.get(currentTarget).get(type);
      // 循环执行回调们
      callbacksArray.forEach(callback=>callback(event));
    }else{
      //找不到么应该有问题，你可以选择在此抛出错误或者警告或者移除注册
    }
  }

  // 卸载
  const remove = (elem,type) => {
    // 看看注没注册过，没注册过就退出
    if(!listeners.has(elem)){
      return false;
    }
    // 没写type全移除，写了type，只移除这个类型的
    if(!type){
      listeners.delete(elem);
    }else{
      const map = listeners.get(elem);
      map.delete(type);
    }
    elem.removeEventListener(type,fnCenter);
  }

  // 注册到jQuery的原型上去
  // 监听捕获
  $.fn.capture=function(type,callback){
    // this is a jQuery Object
    if(!this.length){
      throw new Error("没有有效的selector")
    }
    for(let i=0;i<this.length;i++){
      const dom = this.get(i);
      capture(dom,type,callback);
    }
  };
  // 仅监听一次捕获
  $.fn.captureOnce=function(type,callback){
    // this is a jQuery Object
    if(!this.length){
      throw new Error("没有有效的selector")
    }
    for(let i=0;i<this.length;i++){
      const dom = this.get(i);
      capture(dom,type,callback,true);
    }
  };
  // 解除监听
  $.fn.removeCapture=function(type){
    // this is a jQuery Object
    if(!this.length){
      throw new Error("没有有效的selector")
    }
    for(let i=0;i<this.length;i++){
      const dom = this.get(i);
      remove(dom,type);
    }
  };

  if(debug){
    window.listeners = listeners;
  }

})(true);

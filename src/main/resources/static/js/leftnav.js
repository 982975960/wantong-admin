$(function() {
  var Accordion = function(el, multiple) {
    this.el = el || {};
    this.multiple = multiple || false;

    // Variables privadas
    var links = this.el.find('.link');
    // Evento
    links.on('click', {el: this.el, multiple: this.multiple}, this.dropdown)
  };

  Accordion.prototype.dropdown = function(e) {
    var $el = e.data.el;
    $this = $(this);
    $next = $this.next();

    $next.slideToggle();
    $this.parent().toggleClass('open');

    if (!e.data.multiple) {
      $el.find('.submenu').not($next).slideUp().parent().removeClass('open');
    }
  };

  var accordion = new Accordion($('#accordion'), false);
  $('.submenu li').click(function () {
    $('.list-title').removeClass('open-top');
    $(this).parent().parent().siblings('li').find('.current').removeClass('current');
    $(this).addClass('current').siblings('li').removeClass('current');
  });

  //首页菜单控制
  $('.list-title').click(function() {
    //收起其他菜单
    $('.open').find('.submenu').slideUp().parent().removeClass('open');
    $('.current').removeClass('current');
    $(this).addClass('open-top');
  });
});
wantong.dashboard=(function(){
	var _conf = {
	},
	_init = function(conf){
		$.extend(_conf,conf);
		_root = $("#dashboard");
		_initModuleSelector();
		_moreButton();
		_helpBtn();
		_initPie();
		_initToggleBtn();
	},
	_initToggleBtn = function() {
		$('.dubble-toggle-btn .toggle').on('click', function() {
			var $this = $(this);
			if (!$this.hasClass('toggle-active')) {
				var $lastActive = $('.dubble-toggle-btn .toggle-active');
				//按钮样式
				$lastActive.removeClass('toggle-active');
				$this.addClass('toggle-active');
				//激活tab
				$('#'+$lastActive.attr('tabId')).css('display', 'none');
				$('#'+$this.attr('tabId')).css('display', 'block');
			}
		});
	},
	_helpBtn = function() {
		$("#consumeHelp").off("click").on("click", function () {
			var index = layer.tips('累计装机量数据。点击“更多”进入应用列表详细展示装机量数据。', '#consumeHelp',{
				time: -1,
				tips: 3,
				shade: 0.01,
				shadeClose: true
			});
		});
		$("#customerHelp").off("click").on("click", function () {
			var index = layer.tips('<p>展示昨天和上周累计的重要用户数据。</p>'
					+ '<p>上周: 周一到周天为一周。</p>'
					+ '<p>新增用户: 第一次启动应用的用户数(去重定义：以设备为判断标准。对于授权码激活的设备，同一授权码激活多台设备，只记录为一个用户)。</p>'
					+ '<p>活跃用户: 启动过应用的用户数(去重)，启动过一次的用户即视为活跃用户，包括新用户与老用户。上周日均活跃：上周活跃用户数日均值。</p>'
					+ '<p>启动次数: 打开应用视为启动。</p>'
					+ '<p>累计用户: 启动过应用的所有独立用户数(去重)。上周累计用户：截至上周天的累计用户总数。</p>', '#customerHelp',{
				time: -1,
				tips: 2,
				area: ['400px', 'auto'],
				shade: 0.01,
				shadeClose: true
			});
		});
	},
	_initPie= 	function () {
		var used = $('#usePie').attr('used');
		var unused =  $('#usePie').attr('unused');
		var chart = echarts.init(document.getElementById('usePie'))
		chart.setOption({
			// legend: {
			//   orient:'vertical',
			//   left:'left',
			//   data: ['II', 'III', 'IV', 'V', '劣V']
			// },
			series: {
				left:'center',//离容器左侧的距离
				top: 'center',//距离容器上测的距离
				center: ['42%', '50%'],
				radius: ['83%', '57%'],
				//radius: ['60px', '40px'],
				type: 'pie',
				minShowLabelAngle: 360,
				// clockwise: false,
				hoverAnimation: false,
				legendHoverLink: false,
				selectedMode: false,
				silent: true,
				data: [
					{ name: '已激活', value: used },
					{ name: '未激活', value: unused }
				],
				itemStyle: {
					emphasis: {
						shadowBlur: 0,
						shadowOffsetX: 0,
						shadowColor: 'rgba(0, 0, 0, 0)'
					},
					normal:{
						label: {
							show : false,
						},
						color:function(params) {
							//自定义颜色
							var colorList = [
								'#3dbceb', '#f6f7fb'
							];
							return colorList[params.dataIndex]
						}
					}
				}
			}
		});
		window.addEventListener("resize", () => {
			chart.resize();
		});
	},
	_initModuleSelector = function(){
		_root.find(".thumbnail-item").mouseover(function(){
			$(this).addClass("mouse-hover");
		}).mouseout(function(){
			$(this).removeClass("mouse-hover");
		});

		_root.find("#picturebook").click(function(){
			$("#topMenu li a[name='图书管理']").click();
		});

		_root.find("#teachingTools").click(function(){
			wantong.frame.switchModule("dashboard","system/teachingtools.do");
		});
	};
	_moreButton = function () {
		$("#appMore").click(function () {
			var aDom = $("a[url='/app/listpartners.do']");
			aDom.parent().parent().prev().click();
			aDom.click();
		});

		$('#consumeMore').click(function () {
			var aDom = $("a[url='/app/listpartners.do']");
			aDom.parent().parent().prev().click();
			aDom.click();
		});

		$('#messageMore').click(function () {
			var aDom = $("a[url='/system/messageCenter.do']");
			aDom.parent().parent().prev().click();
			aDom.click();
		});

		$("#moreBooks").click(function () {
			var aDom = $("a[url='/cms/resourceBookListFrame.do']");
			aDom.attr('url', '/cms/resourceBookListFrame.do?index=3');
			aDom.parent().parent().prev().click();
			aDom.click();
		});

		$("#moreFeekBack").click(function () {
			var aDom = $("a[url='/feedback/listbookfeedback.do']");
			aDom.parent().parent().prev().click();
			aDom.click();
		});

	};

	return {
		init: function(conf){
			_init(conf);
		}
	}
})();


wantong.teachingTools=(function(){
	var _conf = {
	},
	_init = function(conf){
		$.extend(_conf,conf);
		_root = $("#teachingtools");
		_initModuleSelector();
	},
	_initModuleSelector = function(){
		_root.find(".thumbnail-item").mouseover(function(){
			$(this).addClass("mouse-hover");
		}).mouseout(function(){
			$(this).removeClass("mouse-hover");
		});
	};



	return {
		init: function(conf){
			_init(conf);
		}
	}
})();
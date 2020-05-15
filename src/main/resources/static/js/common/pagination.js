//by ljy 0829
var util = {};
util.makePagination = function (param) {
    let currentPage = parseInt(param.currentPage);
    let totalPages = parseInt(param.totalPages);
    let parentElement = param.parentElement;
    let callback = param.callback;

    $(parentElement).addClass("con-page");
    //删除dom节点，重新创建
    $(parentElement+"_pagination").remove();

    if(totalPages <=1){
        return;
    }
    
    let paginationDom = $("<ul id='"+parentElement.replace("#","")+"_pagination'>");
    paginationDom.appendTo($(parentElement));
    if (0 == totalPages) {
        return;
    } else {
        let lastPageAppend = 0;
        for (let i = 1; i < totalPages + 1; i++) {
            if (totalPages > 4 && Math.abs(currentPage - i) > 1 && i != 1 && i != totalPages) {
                //跳过
                continue;
            }

            if (lastPageAppend + 1 != i) {
                paginationDom.append(
                    '<li class="page-back-b2">...</a></li>');
            }
            if (i == 1) {
                paginationDom.append(
                    '<li page="<" class="page-back"><img src="static/images/ico9_03.png"></a></li>');
            }

            if (i == currentPage) {
                paginationDom.append(
                    '<a href="#"><li class="active" page="' + i + '">' + i
                    + '</li></a>');
            } else {
                paginationDom.append(
                    '<li class="page-back-b2" @click="paginationChanged('+i+')" page="' + i + '"><a href="#">' + i
                    + '</a></li>');
            }

            if (i == totalPages) {
                paginationDom.append(
                    '<li page=">" class="page-back"><img src="static/images/ico9_05.png"></a></li>');
            }
            lastPageAppend = i;
        }
        paginationDom.append(
            '<Li>到第</Li><Li><input type="text" id="jumpPage" class="page-box page-back"/></Li><Li>页</Li><button type="button" class="page-input" id="jumpButton">跳转</button>');
    }
    paginationDom.find("#jumpButton").on("click", function () {
        let jumpPage = parseInt(paginationDom.find("#jumpPage").val());
        if (jumpPage != NaN && jumpPage > 0 && jumpPage <= totalPages) {
            $("html,body").animate({scrollTop: 0}, 10);
            callback(jumpPage);
        } else {
            layer.msg("请输入正确页数");
        }
    });
    paginationDom.find("#jumpPage").keypress(function (e) {
        if (e.which == 13) {
            paginationDom.find("#jumpButton").click();
        }
    });
    paginationDom.delegate("li", "click", function (event) {
        let paginationTag = $(event.currentTarget);
        let page = paginationTag.attr("page");
        if (page == "<") {
            //点击<时
            let prevPage = currentPage - 1;
            if (prevPage >= 1) {
                callback(prevPage);
            }
        } else if (page == ">") {
            //点击>时
            let nextPage = currentPage + 1;
            if (nextPage <= totalPages) {
                callback(nextPage);
            }
        } else {
            //点击页数
            if (page != undefined) {
                callback(parseInt(page));
            }
        }
    });
}
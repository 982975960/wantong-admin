package com.wantong.admin.view.ass;

import com.alibaba.dubbo.config.annotation.Reference;
import com.wantong.admin.session.AdminSession;
import com.wantong.admin.view.BaseController;
import com.wantong.common.exception.ServiceException;
import com.wantong.common.model.Pagination;
import com.wantong.common.response.ApiResponse;
import com.wantong.common.response.ResponseCode;
import com.wantong.content.domain.vo.BookFromNetPO;
import com.wantong.content.service.IBrsSearchBookService;
import com.wantong.elasticsearch.domain.BookQuery;
import com.wantong.elasticsearch.domain.dto.BookListDTO;
import com.wantong.elasticsearch.service.IBookSearchService;
import com.wantong.record.domain.dto.UserFeedbackArrayDTO;
import com.wantong.record.domain.vo.UserFeedBackVO;
import com.wantong.record.service.UserFeedbackRecordService;
import java.util.List;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.servlet.ModelAndView;

/**
 * 用户反馈的操作
 *
 * @author :ly
 * @version : 1.0
 * @date :  2020-03-02
 **/
@Slf4j
@Controller
@RequestMapping("/ass")
public class UserFeedbackController extends BaseController {

    /**
     * 基础库的搜索服务
     */
    @Reference
    private UserFeedbackRecordService userFeedbackRecordService;

    @Reference
    private IBookSearchService searchService;

    /**
     * 豆瓣搜索查书
     */
    @Reference
    private IBrsSearchBookService brsSearchBookService;

    private final static int PICTURE_BOOK = 1;

    private final static int K12_BOOK = 2;

    private final static int DOUBAN_BOOK = 3;


    private final static int PICTURE_BOOK_MODEL = 27;

    private final static int K12_BOOK_MODEL = 29;


    private final static int[] BOOK_STATE_ARR = new int[]{0,1,3,4,5,6,7};
    /**
     * 加载二级菜单首页
     */
    @RequestMapping("feedbackFrame.do")
    public ModelAndView recognitionLogsFrame() {
        ModelAndView mv = new ModelAndView("ass/feedback");

        return mv;
    }

    @RequestMapping("feedbackList.do")
    @ResponseBody
    public ApiResponse userFeedBackList(@RequestBody UserFeedBackVO userFeedBackVO) throws ServiceException {
        AdminSession adminSession = getAdminSession();
        if(adminSession == null){
            return ApiResponse.creatFail(ResponseCode.Base.ERROR,"请先登录后台");
        }
        userFeedBackVO.setPartnerId(adminSession.getPartnerId());
        Pagination pagination = new Pagination();
        if(userFeedBackVO.getCurrentPage() == null) {
            userFeedBackVO.setCurrentPage(1);
        }
        pagination.setCurrentPage(userFeedBackVO.getCurrentPage());
        pagination.setPageSize(12);
        userFeedBackVO.setPagination(pagination);
        if("".equals(userFeedBackVO.getIsbn())){
            userFeedBackVO.setIsbn(null);
        }
        if("".equals(userFeedBackVO.getOpenId())){
            userFeedBackVO.setOpenId(null);
        }
        UserFeedbackArrayDTO dto = userFeedbackRecordService.getUserFeedBackArray(userFeedBackVO);

        return ApiResponse.creatSuccess(dto);
    }

    /**
     * 根据ISBN获得相关的书本信息
     * @param isbn
     * @param type 1 默认是绘本图像库 2 K12图像库 3 是豆瓣查询
     * @param currentPage
     * @return
     * @throws ServiceException
     */
    @RequestMapping("getBookInfoByIsbn.do")
    @ResponseBody
    public ApiResponse bookInfoByIsbn(@RequestParam(value = "isbn") String isbn,@RequestParam(value = "type",defaultValue = "1") int type,@RequestParam(value = "currentPage",required = false,defaultValue = "1") int currentPage)
            throws ServiceException{
        Pagination pagination = new Pagination();
        pagination.setPageSize(4);
        pagination.setCurrentPage(currentPage);
        //1是绘本图像库 2是K12图像库 3 是豆瓣书库
        if(type == PICTURE_BOOK){
            BookListDTO dto = searchService.listBaseBook(PICTURE_BOOK_MODEL,BOOK_STATE_ARR,pagination, BookQuery.builder().bookId("")
                    .bookNumber("").bookName("").dubble("").edition("").press("")
                    .isbn(isbn).labelName("").origin(null).build());
            return ApiResponse.creatSuccess(dto);
        } else if(type == K12_BOOK){
            BookListDTO dto = searchService.listBaseBook(K12_BOOK_MODEL,BOOK_STATE_ARR,pagination, BookQuery.builder().bookId("")
                    .bookNumber("").bookName("").dubble("").edition("").press("")
                    .isbn(isbn).labelName("").origin(null).build());
            return ApiResponse.creatSuccess(dto);
        } else if(type == DOUBAN_BOOK){
            List<BookFromNetPO> netBooks = brsSearchBookService.searchBookFromNet(isbn);
            return ApiResponse.creatSuccess(netBooks);
        }
        return ApiResponse.creatFail(ResponseCode.Base.ERROR,"位置书本库类型");
    }

}

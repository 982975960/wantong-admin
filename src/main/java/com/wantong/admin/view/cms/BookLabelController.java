package com.wantong.admin.view.cms;

import com.alibaba.dubbo.config.annotation.Reference;
import com.alibaba.fastjson.JSONObject;
import com.wantong.admin.domain.dto.LabelsDTO;
import com.wantong.admin.session.AdminSession;
import com.wantong.admin.view.BaseController;
import com.wantong.common.exception.ServiceException;
import com.wantong.common.response.ApiResponse;
import com.wantong.common.model.Pagination;
import com.wantong.common.utils.json.JsonUtil;
import com.wantong.content.domain.dto.BookLabelDTO;
import com.wantong.content.domain.dto.BookLableNameDTO;
import com.wantong.content.domain.vo.BookLabelInfoVO;
import com.wantong.content.service.IBookLabelService;
import com.wantong.record.domain.vo.ChangeBookRecordVO;
import com.wantong.record.service.IRecordRelatedService;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.Executor;
import javax.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.servlet.ModelAndView;

/**
 * BookLabelController
 *
 * @author : win7
 * @version : 1.0
 * @date :  2018-12-25 17:34
 **/
@Controller
@RequestMapping("/cms")
public class BookLabelController extends BaseController {

    private static final Logger logger = LoggerFactory.getLogger(BookLabelController.class);
    @Reference
    private IBookLabelService bookLabelManagerService;

    @Reference
    private IRecordRelatedService recordRelatedService;

    @Autowired
    private Executor executor;


    private static final int NORMAL_LABEL = 0;

    private static final  int BASE_BOOK_TYPE = 0;

    private static final  int REPO_BOOK_TYPE = 1;

    @RequestMapping("labelManager.do")
    public ModelAndView handleRequest(@RequestParam(value = "page", required = false, defaultValue = "1") int page,
            @RequestParam(value = "enabled", defaultValue = "0") int enabled,@RequestParam(value = "partnerId", defaultValue = "0")long partnerId,
            HttpServletRequest request) {

        AdminSession adminSession = getAdminSession();
        Pagination pagination = new Pagination();
        pagination.setPageSize(12);
        pagination.setCurrentPage(page);
        Long partnerIdSession = adminSession.getPartnerId();

        boolean isCreateBtnShow = partnerId==0?true:(partnerId==partnerIdSession)?true:false;
        String tabSelect = "";
        if (partnerId == 1){
            partnerIdSession = partnerId;
            tabSelect = "wt";
        }
        ModelAndView mv = new ModelAndView();
        BookLabelDTO dto = bookLabelManagerService.getAllBookLabels(partnerIdSession, pagination, enabled);
        mv.addObject("list", dto.getLabels());
        mv.addObject("pagination", dto.getPagination());
        mv.addObject("currentPage", dto.getPagination().getCurrentPage());
        mv.addObject("pages", dto.getPagination().getPages());
        mv.addObject("pageSize", dto.getPagination().getPageSize());
        mv.addObject("partnerId", adminSession.getPartnerId());
        mv.addObject("userPartnerId",partnerId);
        mv.addObject("isCreateLabel",isCreateBtnShow);
        mv.addObject("enabled",enabled);
        mv.addObject("tabSelect",tabSelect);
        mv.setViewName("/cms/bookLabelManager");
        return mv;
    }

    /**
     * 创建标签 将数据在JS端将数据转成JSON
     * @param data
     */
    @RequestMapping("createLabel.do")
    @ResponseBody
    public ApiResponse createLabel(@RequestParam("data") String data) throws ServiceException {
        AdminSession adminSession = getAdminSession();
        Long partnerId = adminSession.getPartnerId();

       //    修改为传JSON数据进行格式化
        JSONObject json = JSONObject.parseObject(data);
        BookLabelInfoVO labelInfoVO = JSONObject.toJavaObject(json,BookLabelInfoVO.class);
        labelInfoVO.setPartnerId(partnerId.intValue());
        //给labelInfoVO的子元素赋值partnerId
        assignment(labelInfoVO,partnerId);
        bookLabelManagerService.createBookLabel(labelInfoVO);

        return ApiResponse.creatSuccess();
    }

    /**
     * 更新标签  JS端请求参数中把对象转成了JSON 在这里需要将JSON转换为对象
     * @param jsonData
     */
    @RequestMapping("updateLabel.do")
    @ResponseBody
    public ApiResponse updateLabel(@RequestParam("data")String jsonData )
            throws ServiceException {
        AdminSession adminSession = getAdminSession();
        Long partnerId = adminSession.getPartnerId();
//        BookLabelInfoVO bookLabelInfoVO = new BookLabelInfoVO();
        JSONObject json = JSONObject.parseObject(jsonData);
        BookLabelInfoVO labelInfoVO = JSONObject.toJavaObject(json,BookLabelInfoVO.class);
        labelInfoVO.setPartnerId(partnerId.intValue());
        assignment(labelInfoVO,partnerId);
        bookLabelManagerService.updateBookLabel(labelInfoVO);

        return ApiResponse.creatSuccess();
    }

    /**
     * 创建标签或者更新标签是，给vo赋值partnerId
     * @param vo
     * @param partnrId
     */
    private BookLabelInfoVO assignment(BookLabelInfoVO vo,Long partnrId){
        vo.getChildLabels().parallelStream().forEach(p->{
            p.setPartnerId(partnrId.intValue());
            if(p.getChildLabels().size()!=0){
                p.getChildLabels().parallelStream().forEach(p1->{
                    p1.setPartnerId(partnrId.intValue());
                });
            }
        });

        return  vo;
    }

    /**
     * 删除一整条标签的方法
     * @param id
     */
    @RequestMapping("deleteLabel.do")
    @ResponseBody
    public ApiResponse deleteLabel(@RequestParam("id") int id) throws ServiceException {
        bookLabelManagerService.deleteBookLabels(id);
        return ApiResponse.creatSuccess();
    }

    /**
     * 标签的废用和还原的方法
     * @param id
     */
    @RequestMapping("discardAndRestoreLabel.do")
    @ResponseBody
    public ApiResponse discardAndRestoreLabel(@RequestParam("id") int id) {
        bookLabelManagerService.discardAndRestoreLabel(id);
        return ApiResponse.creatSuccess();
    }

    @RequestMapping("addLabel.do")
    @ResponseBody
    public ModelAndView getAddLabelView(@RequestParam(value = "bookId",required = false,defaultValue = "0") int bookId,@RequestParam("isMakePic")boolean isMakePic,@RequestParam(value = "isSearch",required = false,defaultValue = "false")boolean isSearch,@RequestParam(value = "isBase",required = false,defaultValue ="false")boolean isBase) {
        AdminSession session = getAdminSession();

        Long partnerId = session.getPartnerId();
        ModelAndView modelAndView = new ModelAndView();
        //判断是哪个模块
        if(!isSearch) {
            modelAndView.setViewName("cms/addLabel");
        } else {
            if(isBase == true){
                modelAndView.setViewName("base/searchLabels");
            } else {
                modelAndView.setViewName("cms/searchLabels");
            }
        }
        Pagination pagination = null;
        //获取所有一二级标签
        BookLabelDTO partnerLabels = null;
        BookLabelDTO wtLabels = null;
        List<BookLabelInfoVO> partnerBookLabels = null;
        List<BookLabelInfoVO> wtBookLabels = null;

        if (partnerId != 1){
            partnerLabels = bookLabelManagerService.getAllBookLabels(partnerId, pagination, NORMAL_LABEL);
            partnerBookLabels = bookLabelManagerService.getBookLabels(bookId,partnerId,isMakePic);
            wtLabels = bookLabelManagerService.getAllBookLabels(1, pagination, NORMAL_LABEL);
            wtBookLabels = bookLabelManagerService.getBookLabels(bookId,1,isMakePic);
        }else {
            wtLabels = bookLabelManagerService.getAllBookLabels(1, pagination, NORMAL_LABEL);
            wtBookLabels = bookLabelManagerService.getBookLabels(bookId,1,isMakePic);
        }
        modelAndView.addObject("partnerLabels", partnerLabels == null? new ArrayList<>() : partnerLabels.getLabels());
        modelAndView.addObject("wtLabels", wtLabels == null? new ArrayList<>() :wtLabels.getLabels());
        modelAndView.addObject("partnerBookLabels", JsonUtil.toJSONString(partnerBookLabels));
        modelAndView.addObject("wtBookLabels", JsonUtil.toJSONString(wtBookLabels));
        modelAndView.addObject("partnerId", partnerId);
        modelAndView.addObject("bookId",bookId);
        modelAndView.addObject("isMakePic",isMakePic);
        return modelAndView;
    }

    @RequestMapping("getLabelNames")
    @ResponseBody
    public ApiResponse getSelectLabelNames(@RequestBody List<Integer> ids){
        List<BookLableNameDTO> selectLabelNames = bookLabelManagerService.getSelectLabelNames(ids);
        List<BookLableNameDTO> wtLabels = new ArrayList<>();
        List<BookLableNameDTO> partnerLabels = new ArrayList<>();
        for (BookLableNameDTO label : selectLabelNames) {
            if (label.getPartnerId() == 1) {
                wtLabels.add(label);
            } else {
                partnerLabels.add(label);
            }
        }
        LabelsDTO labelsDTO = new LabelsDTO();
        labelsDTO.setWtLabels(wtLabels);
        labelsDTO.setPartnerLabels(partnerLabels);

        return ApiResponse.creatSuccess(labelsDTO);
    }

    @RequestMapping("saveBookLabel.do")
    @ResponseBody
    public ApiResponse saveBookLabel(Long bookId,@RequestParam(value = "labels", required = false, defaultValue = "") String labels, boolean isMakePic){

        AdminSession adminSession = getAdminSession();
        Map<String, String> data = new HashMap<>();
        data.put("bookId", String.valueOf(bookId));
        if (labels != null) {
            int id = Integer.parseInt(data.getOrDefault("bookId", "0"));
            bookLabelManagerService.setBookLabels(id, labels, isMakePic?BASE_BOOK_TYPE:REPO_BOOK_TYPE);
        }

        ChangeBookRecordVO changeBookRecordVO = new ChangeBookRecordVO();
        changeBookRecordVO.setAdminId(adminSession.getId());
        changeBookRecordVO.setBookId(bookId);
        changeBookRecordVO.setPageId(-1);
        changeBookRecordVO.setStatus(7);

        String message = "保存" + bookId + ",标签:"
                + labels;
        changeBookRecordVO.setText(message);
        executor.execute(() -> {
            try {
                recordRelatedService.changeBookRecord(changeBookRecordVO);
            } catch (Exception e) {
                logger.info(e.getMessage());
            }
        });

        return ApiResponse.creatSuccess();
    }
}

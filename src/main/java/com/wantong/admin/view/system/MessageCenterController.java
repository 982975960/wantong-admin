package com.wantong.admin.view.system;

import com.alibaba.dubbo.config.annotation.Reference;
import com.wantong.admin.session.AdminSession;
import com.wantong.admin.view.BaseController;
import com.wantong.common.exception.ServiceException;
import com.wantong.common.model.Pagination;
import com.wantong.common.response.ApiResponse;
import com.wantong.common.response.ResponseCode.Base;
import com.wantong.config.domain.po.system.AnnoPO;
import com.wantong.config.domain.vo.system.AnnoVO;
import com.wantong.config.domain.vo.system.MessageVO;
import com.wantong.config.service.system.IAnnoService;
import java.util.List;

import org.apache.ibatis.annotations.Param;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.servlet.ModelAndView;

/**
 * MessageCenterController 消息中心的控制层
 *
 * @author : LY
 * @version : 1.0
 * @date :  2019-10-22 10:13
 **/
@Controller
@RequestMapping("/system")
public class MessageCenterController extends BaseController {

    @Reference
    private IAnnoService annoService;


    @RequestMapping("/messageCenter.do")
    @ResponseBody
    public ModelAndView messageCenter(){
        ModelAndView model = new ModelAndView();
        model.setViewName("/system/messageCenter");

        return model;
    }

    @RequestMapping("/messageList.do")
    @ResponseBody
    public ApiResponse listMessage(@RequestParam(value = "currentPage",defaultValue = "1") int currentPage){
        Pagination pagination = new Pagination();
        pagination.setCurrentPage(currentPage);
        pagination.setPageSize(10);
        MessageVO vo = new MessageVO();
        vo.setPagination(pagination);

        return ApiResponse.creatSuccess(annoService.messageDates(vo));
    }

    @RequestMapping("/deleteMessage.do")
    @ResponseBody
    public ApiResponse deleteMessage(long id) throws ServiceException {
        annoService.deleteAnnoData(id);

        return ApiResponse.creatSuccess();
    }

    @RequestMapping("/updateData.do")
    @ResponseBody
    public ApiResponse updateData(@RequestBody AnnoVO vo) throws ServiceException{
        annoService.updateAnnoData(vo);

        return ApiResponse.creatSuccess();
    }

    @RequestMapping("/createData.do")
    @ResponseBody
    public ApiResponse createData(@RequestBody AnnoVO vo) throws ServiceException {
        annoService.createAnnoData(vo);

        return ApiResponse.creatSuccess();
    }

    @RequestMapping("/changeDataIndex.do")
    @ResponseBody
    public ApiResponse changeDataIndex(@Param("changeId") long changeId, @Param("prevId") long prevId, @Param("nextId") long nextId) throws ServiceException{
        annoService.changeDataIndex(changeId,prevId,nextId);

        return ApiResponse.creatSuccess();
    }
}

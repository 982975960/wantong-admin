package com.wantong.admin.view.card;

import com.alibaba.dubbo.config.annotation.Reference;
import com.wantong.admin.domain.dto.ModelUserDTO;
import com.wantong.admin.session.AdminSession;
import com.wantong.admin.view.BaseController;
import com.wantong.card.domain.dto.CardModelDTO;
import com.wantong.card.domain.po.ModelPO;
import com.wantong.card.domain.vo.ModelVO;
import com.wantong.card.service.IBrsModelService;
import com.wantong.common.exception.ServiceException;
import com.wantong.common.model.Pagination;
import com.wantong.common.response.ApiResponse;
import com.wantong.common.response.ServiceError;
import com.wantong.config.domain.po.system.AdminPO;
import com.wantong.config.domain.vo.app.PartnerVO;
import com.wantong.config.service.app.IPartnerRelatedService;
import com.wantong.config.service.system.IUserRelatedService;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.servlet.ModelAndView;

import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Controller
@RequestMapping("/card")
public class CardModelController extends BaseController {
    @Reference
    private IPartnerRelatedService partnerRelatedService;

    @Reference
    private IBrsModelService modelService;

    @Reference
    private IUserRelatedService userRelatedService;

    @RequestMapping("createAndEdit.do")
    public ModelAndView createAndEdit(@RequestParam(value = "partnerId")Integer partnerId,
            @RequestParam(value = "partnerName")String partnerName,
            @RequestParam(value = "modelId")Integer modelId,
            @RequestParam(value = "modelName")String modelName) throws ServiceException{
        AdminSession adminSession = getAdminSession();
        if(adminSession == null){
            throw new ServiceException(ServiceError.creatFail("请先登录后台"));
        }
        List<PartnerVO> partners = new ArrayList<>();
        List<PartnerVO> partnerVOS = partnerRelatedService.listPartner();
        if(adminSession.getPartnerId() == 1) {
            partners = partnerVOS;
        } else {
            for (PartnerVO vo : partnerVOS ){
                if(vo.getId() == adminSession.getPartnerId()){
                    partners.add(vo);
                }
            }

        }
        ModelAndView mv = new ModelAndView();
        mv.setViewName("card/createAndEditModel");
        mv.addObject("partners",partners);
        mv.addObject("partnerId",partnerId);
        mv.addObject("partnerName",partnerName);
        mv.addObject("modelId",modelId);
        mv.addObject("modelName",modelName);
        return mv;
    }

    @RequestMapping("cardModelManage.do")
    public ModelAndView cardModelManage(){
        AdminSession adminSession = getAdminSession();
        List<PartnerVO> partnerVOS = partnerRelatedService.listPartner();
        List<PartnerVO> partnerVOList = new ArrayList<>();
        if(adminSession.getPartnerId() == 1){
            partnerVOList = partnerVOS;
        } else {
            for (PartnerVO partnerVO : partnerVOS){
                if(adminSession.getPartnerId() == partnerVO.getId()){
                    partnerVOList.add(partnerVO);
                }
            }
        }
        ModelAndView mv = new ModelAndView();
        mv.setViewName("/card/cardModelManage");
        mv.addObject("partners",partnerVOList);

        return mv;
    }

    @RequestMapping("listModel.do")
    public ModelAndView listModel(@RequestParam(value = "partnerId")Long partnerId,
            @RequestParam(value = "modelName",required = false)String modelName,
            @RequestParam(value = "currentPage",defaultValue = "1")Integer currentPage) throws ServiceException {
        AdminSession adminSession = getAdminSession();
        if(adminSession == null){
            throw new ServiceException(ServiceError.creatFail("请先登录后台"));
        }
        ModelVO vo = new ModelVO();
        if(modelName != null){
            if("".equals(modelName.trim())){
                modelName =null;
            }
        }
        Pagination pagination = new Pagination();
        pagination.setPageSize(12);
        pagination.setCurrentPage(currentPage);
        if(adminSession.getPartnerId() == 1){
            vo.setPartnerId(partnerId == 0 ? null:partnerId);
        } else {
            vo.setPartnerId(adminSession.getPartnerId());
        }
        vo.setModelName(modelName);
        vo.setPagination(pagination);
        CardModelDTO cardModelDTO = modelService.listModels(vo);
        pagination = cardModelDTO.getPagination();
        List<ModelPO> modelPOS = cardModelDTO.getModelPOS();

        List<Long> adminIds = modelPOS.stream().map(ModelPO::getCreateAdminId).collect(Collectors.toList());

        List<AdminPO> userList = userRelatedService.getUserList(adminIds);

        List<PartnerVO> partnerVOS = partnerRelatedService.listPartner();

        List<ModelUserDTO> modelUserDTOS = new ArrayList<>();
        for (ModelPO modelPO : modelPOS) {
            ModelUserDTO modelUserDTO = new ModelUserDTO();
            for (AdminPO adminPO : userList) {
                if (modelPO.getCreateAdminId().longValue() == adminPO.getId()){
                    BeanUtils.copyProperties(modelPO,modelUserDTO);
                    Date date = Date.from(modelPO.getCreateTime().atZone(ZoneId.systemDefault()).toInstant());
                    modelUserDTO.setCreateTime(new java.sql.Date(date.getTime()));
                    modelUserDTO.setEmail(adminPO.getEmail());
                }
            }
            for (PartnerVO partnerVO : partnerVOS) {
                if (modelPO.getPartnerId().longValue() == partnerVO.getId()){
                    modelUserDTO.setPartnerName(partnerVO.getName());
                }
            }
            modelUserDTOS.add(modelUserDTO);
        }

        ModelAndView mv = new ModelAndView();
        mv.setViewName("/card/cardModel_list");
        mv.addObject("currentPage",pagination.getCurrentPage());
        mv.addObject("pages",pagination.getPages());
        mv.addObject("pageSize",pagination.getPageSize());
        mv.addObject("models",modelUserDTOS);
        return mv;

    }

    @ResponseBody
    @RequestMapping("/saveModel.do")
    public ApiResponse saveModel(@RequestParam(value = "partnerId")Long partnerId,
            @RequestParam(value = "modelName")String modelName) throws ServiceException{
        AdminSession adminSession = getAdminSession();
        if(adminSession == null){
            throw new ServiceException(ServiceError.creatFail("请先登录后台"));
        }
        ModelVO vo = new ModelVO();
        vo.setModelName(modelName);
        vo.setPartnerId(partnerId);
        vo.setCreateAdminId(adminSession.getId());
        modelService.saveModel(vo);

        return ApiResponse.creatSuccess();
    }

    @ResponseBody
    @RequestMapping("/editModel.do")
    public ApiResponse editModel(@RequestParam(value = "id")Long id,
            @RequestParam(value = "partnerId")Long partnerId,
            @RequestParam(value = "modelName")String modelName) throws ServiceException{
        AdminSession adminSession = getAdminSession();
        if(adminSession == null){
            throw new ServiceException(ServiceError.creatFail("请先登录后台"));
        }
        ModelVO vo = new ModelVO();
        vo.setId(id);
        vo.setPartnerId(partnerId);
        vo.setModelName(modelName);
        modelService.editModel(vo);

        return ApiResponse.creatSuccess();
    }

}

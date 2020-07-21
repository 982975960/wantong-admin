package com.wantong.admin.view.card;

import com.alibaba.dubbo.config.annotation.Reference;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.wantong.admin.session.AdminSession;
import com.wantong.admin.view.BaseController;
import com.wantong.card.domain.dto.CardGroupManagerDTO;
import com.wantong.card.domain.po.CardGroupInfoPO;
import com.wantong.card.domain.po.ModelPO;
import com.wantong.card.service.IBrsCardGroupInfoService;
import com.wantong.card.service.IBrsModelService;
import com.wantong.common.exception.ServiceException;
import com.wantong.common.response.ApiResponse;
import com.wantong.common.response.ResponseCode.Base;
import com.wantong.common.utils.json.JsonUtil;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.servlet.ModelAndView;

/**
 * 卡片套装controller
 *
 * @author jsj
 * @date 2020年3月27日 17:53:37
 */
@Controller
@RequestMapping("/card")
public class CardGroupController extends BaseController {

    @Reference
    private IBrsModelService modelService;

    @Reference
    private IBrsCardGroupInfoService cardGroupInfoService;

    @RequestMapping("cardGroupManager.do")
    @ResponseBody
    public ModelAndView bookListFrame(
            @RequestParam(value = "groupName", defaultValue = "", required = false) String groupName,
            @RequestParam(value = "groupId", defaultValue = "0", required = false) Long groupId,
            @RequestParam(value = "currentPage", defaultValue = "1", required = false) Integer currentPage,
            @RequestParam(value = "isSearch", defaultValue = "0", required = false) Integer isSearch) {
        AdminSession adminSession = getAdminSession();
        Integer pageSize = 18;
        CardGroupManagerDTO dto = null;
        ModelAndView mv = new ModelAndView("/card/cardGroupManager");
        List<CardGroupInfoPO> list = new ArrayList<>();
        try {
            dto = cardGroupInfoService
                    .cardGroupManager(adminSession.getPartnerId(), groupName, groupId, currentPage, pageSize);
        } catch (Exception e) {
            //当前合作商暂无卡片模型
            mv.addObject("list", list);
            mv.addObject("noModel", 1);
            return mv;
        }

        ModelPO modelPO = dto.getModelPO();
        IPage<CardGroupInfoPO> group = dto.getCardGroups();
        list = group.getRecords();
        mv.addObject("model", modelPO);
        mv.addObject("groupName", groupName);
        mv.addObject("groupId", groupId.equals(0L) ? "" : groupId);
        mv.addObject("list", list);
        mv.addObject("currentPage", currentPage);
        mv.addObject("pages", group.getPages());
        mv.addObject("pageSize", pageSize);
        mv.addObject("noModel", 0);
        mv.addObject("isSearch", isSearch);

        return mv;
    }

    @RequestMapping("addCardGroup.do")
    public String addCardGroup(Model model, Long modelId, Long groupId) throws ServiceException {
        model.addAttribute("modelId", modelId).addAttribute("groupId", groupId);

        return "card/addCardGroup";
    }

    /**
     * 获取卡片信息
     */
    @RequestMapping("loadCardGroupInfo.do")
    @ResponseBody
    public ApiResponse loadCardGroupInfo(Long groupId) throws Exception {
        AdminSession adminSession = getAdminSession();
        if (adminSession == null) {
            return ApiResponse.creatSuccess("无权限访问此接口");
        }

        CardGroupInfoPO po = cardGroupInfoService.getCardGroupInfoById(groupId);

        JsonNode node = JsonUtil.toJson(po);
        ObjectNode objectNode = (ObjectNode) node;

        return ApiResponse.creatSuccess(objectNode);
    }

    @RequestMapping("saveCardGroupInfo.do")
    @ResponseBody
    public ApiResponse saveCardGroupInfo(Long modelId, Long groupId,
            @RequestParam(value = "name") String name,
            @RequestParam(value = "coverImage", required = false, defaultValue = "") String coverImage,
            @RequestParam(value = "width") Integer width, @RequestParam(value = "height") Integer height)
            throws Exception {

        AdminSession adminSession = getAdminSession();

        if (modelId == 0) {
            return ApiResponse.creatFail(Base.ERROR, "model ID is missing.");
        }

        CardGroupInfoPO po = CardGroupInfoPO.builder().coverImage(coverImage).name(name).modelId(modelId)
                .width(width).height(height).build();
        if (groupId > 0) {
            //更新卡片信息
            po.setId(groupId);
            cardGroupInfoService.updateCardGroupInfo(po);
        } else {
            //创建卡片信息
            groupId = cardGroupInfoService.createCardGroupInfo(po);
        }

        Map<String, String> data = new HashMap<>();
        data.put("groupId", String.valueOf(groupId));

        return ApiResponse.creatSuccess(data);
    }


    @RequestMapping("deleteCardGroup.do")
    @ResponseBody
    public ApiResponse deleteCardGroup(@RequestParam(value = "groupId") Long groupId)
            throws Exception {
        cardGroupInfoService.deleteGroup(groupId);
        return ApiResponse.creatSuccess();
    }
}

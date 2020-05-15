package com.wantong.admin.view.card;

import com.alibaba.dubbo.config.annotation.Reference;
import com.wantong.admin.session.AdminSession;
import com.wantong.admin.view.BaseController;
import com.wantong.card.domain.dto.CardGroupDTO;
import com.wantong.card.domain.dto.CardInfoImagesDTO;
import com.wantong.card.domain.dto.CardInfoListDTO;
import com.wantong.card.domain.po.CardInfoPO;
import com.wantong.card.domain.po.ModelPO;
import com.wantong.card.domain.vo.CardInfoVO;
import com.wantong.card.domain.vo.VoiceVO;
import com.wantong.card.service.IBrsCardGroupInfoService;
import com.wantong.card.service.IBrsCardInfoService;
import com.wantong.card.service.IBrsTrainTaskService;
import com.wantong.common.cms.CmsConfig;
import com.wantong.common.exception.ServiceException;
import com.wantong.common.model.Pagination;
import com.wantong.common.response.ApiResponse;
import com.wantong.common.response.ServiceError;
import com.wantong.common.utils.json.JsonUtil;
import com.wantong.content.domain.DbTtsRole;
import com.wantong.content.service.ITTSService;
import org.checkerframework.checker.units.qual.C;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import java.util.List;

/**
 * 卡片相关的控制层
 * @author ly
 * @date 2020-03-26
 */
@Controller
@RequestMapping("/card")
public class CardController extends BaseController {

    @Reference
    private IBrsCardGroupInfoService cardGroupInfoService;

    @Reference
    private IBrsCardInfoService cardInfoService;

    @Reference
    private ITTSService ittsService;

    @Reference
    private IBrsTrainTaskService trainTaskService;

    @RequestMapping("/cardFrame.do")
    public String cardFrame() throws ServiceException {
        checkUser();
        return "/card/cardMakingNav";
    }

    @Autowired
    private CmsConfig cmsConfig;

    /**
     * 获得用户卡片套装列表
     */
    @RequestMapping("/cardGroup.do")
    @ResponseBody
    public ApiResponse cardGroup() throws ServiceException {
        AdminSession adminSession = checkUser();
        CardGroupDTO dto = cardGroupInfoService.userCardGroup(adminSession.getPartnerId());

        return ApiResponse.creatSuccess(dto);
    }

    @RequestMapping("/cardInfoList.do")
    @ResponseBody
    public ApiResponse cardInfoList(@RequestBody CardInfoVO cardInfoVO) throws ServiceException {
        if (cardInfoVO == null) {
            throw new ServiceException(ServiceError.creatFail("请上传参数"));
        }
        if("".equals(cardInfoVO.getCardName())){
            cardInfoVO.setCardName(null);
        }
        checkUser(cardInfoVO.getCardGroupId());
        if (cardInfoVO.getPagination() == null) {
            Pagination pagination = new Pagination();
            pagination.setPageSize(16);
            pagination.setCurrentPage(1);
            cardInfoVO.setPagination(pagination);
        }
        CardInfoListDTO cardInfoListDTO = cardInfoService.getCardInfoList(cardInfoVO);

        return ApiResponse.creatSuccess(cardInfoListDTO);
    }

    /**
     * 删除卡片信息
     *
     * @param cardId
     */
    @RequestMapping("deleteCardInfo.do")
    @ResponseBody
    public ApiResponse deleteCardInfo(Long cardId) throws ServiceException {
        if (cardId == null || cardId == 0) {
            throw new ServiceException(ServiceError.creatFail("请上传参数"));
        }
        CardInfoPO cardInfoPO = cardInfoService.getById(cardId);
        if (cardInfoPO == null) {
            throw new ServiceException(ServiceError.creatFail("当前卡片已被删除"));
        }
        checkUser(cardInfoPO.getGroupId());
        cardInfoService.deleteCardInfo(cardInfoPO);

        return ApiResponse.creatSuccess();
    }

    /**
     * 修改套装里的卡片的状态
     * @param cardInfoVO
     * @return
     * @throws ServiceException
     */
    @RequestMapping("changeCardGroupCardState.do")
    @ResponseBody
    public ApiResponse changeCardGroupCardState(@RequestBody CardInfoVO cardInfoVO) throws ServiceException {
        if(cardInfoVO == null || cardInfoVO.getCardGroupId() == null || cardInfoVO.getTargetState() == null || cardInfoVO.getCurrentState() == null){
            throw new ServiceException(ServiceError.creatFail("缺少必要参数"));
        }
        checkUser(cardInfoVO.getCardGroupId());
        cardInfoService.changeCardGroupCardsState(cardInfoVO);
        return ApiResponse.creatSuccess();
    }

    /**
     * 修改某张卡片的数据
     * @param cardInfoVO
     * @return
     * @throws ServiceException
     */
    @RequestMapping("changeCardStateIntoResource.do")
    @ResponseBody
    public ApiResponse changeCardState( Long cardId) throws ServiceException {
        if(cardId == 0 || cardId == null ){
            throw new ServiceException(ServiceError.creatFail("缺少必要参数"));
        }
        CardInfoPO  cardInfoPO = cardInfoService.getById(cardId);
        if(cardInfoPO == null){
            throw new ServiceException(ServiceError.creatFail("当前卡片已被删除"));
        }
        checkUser(cardInfoPO.getGroupId());
        //todo 修改卡片的状态
        cardInfoService.changeCardState(cardInfoPO,CardInfoPO.RESOURCE);
        return ApiResponse.creatSuccess();
    }


    @RequestMapping("changeCardStateIntoWaitTrain.do")
    @ResponseBody
    public ApiResponse changeCardStateIntoWaitTrain(Long cardId) throws ServiceException{
        if(cardId == null || cardId == 0){
            throw new ServiceException(ServiceError.creatFail("请先保存图片"));
        }
        CardInfoPO  cardInfoPO = cardInfoService.getById(cardId);
        if(cardInfoPO == null){
            throw new ServiceException(ServiceError.creatFail("当前卡片已被删除"));
        }
        checkUser(cardInfoPO.getGroupId());
        cardInfoService.changeCardState(cardInfoPO,CardInfoPO.WAIT_TRAINING);

        return ApiResponse.creatSuccess();
    }

    @RequestMapping("showCardPageFrame.do")
    public String showCardPageFrame(Model model, @RequestParam(value = "cardId") Long cardId,
            @RequestParam(value = "imageType", defaultValue = "0", required = false) Integer imageType,
            @RequestParam(value = "groupId") Long groupId) throws ServiceException {
        checkUser();
        List<DbTtsRole> dbTtsRole = ittsService.getDBTTSRole();
        model.addAttribute("cardId", cardId);
        model.addAttribute("imageType", imageType);
        model.addAttribute("groupId", groupId);
        model.addAttribute("roles", JsonUtil.toJSONString(dbTtsRole));
        return "/card/addCardPageInfo";
    }

    /**
     * 获得卡片的详细数据
     * @param cardId
     * @return
     * @throws ServiceException
     */
    @RequestMapping("loadCardInfo.do")
    @ResponseBody
    public ApiResponse loadCardInfo(Long cardId) throws ServiceException {
        CardInfoPO cardInfoPO = cardInfoService.getById(cardId);
        if (cardInfoPO == null) {
            throw new ServiceException(ServiceError.creatFail("当前卡片已被删除"));
        }
        CardInfoVO cardInfoVO = new CardInfoVO();
        checkUser(cardInfoPO.getGroupId());
        cardInfoVO.setCardId(cardId);
        CardInfoImagesDTO cardInfoImagesDTO = cardInfoService.loadCardInfoImagesData(cardInfoVO);

        return ApiResponse.creatSuccess(cardInfoImagesDTO);
    }

    @RequestMapping("loadImageAudio.do")
    @ResponseBody
    public ApiResponse loadImageAudio(Long imageId) throws ServiceException {
        VoiceVO voice = cardInfoService.loadImageAudio(imageId);

        return ApiResponse.creatSuccess(voice);
    }

    /**
     * 将卡片全部移至资源待编辑权限
     * @param groupId
     * @return
     * @throws ServiceException
     */
    @RequestMapping("moveCardIntoResourceEditState.do")
    @ResponseBody
    public ApiResponse moveCardIntoResourceEditState(Long groupId) throws ServiceException{
        checkUser(groupId);
        CardInfoVO cardInfoVO = new CardInfoVO();
        cardInfoVO.setCardGroupId(groupId);
        cardInfoVO.setCurrentState(CardInfoPO.MAKING);
        cardInfoVO.setTargetState(CardInfoPO.RESOURCE);
        cardInfoService.changeCardGroupCardsState(cardInfoVO);

        return ApiResponse.creatSuccess();
    }

    /**
     * 将卡片全部移至dai
     * @param groupId
     * @return
     * @throws ServiceException
     */
    @RequestMapping("intoTrain.do")
    @ResponseBody
    public ApiResponse moveCardIntoTrain(Long groupId) throws ServiceException{
        checkUser(groupId);
        CardInfoVO cardInfoVO = new CardInfoVO();
        cardInfoVO.setCardGroupId(groupId);
        cardInfoVO.setCurrentState(CardInfoPO.RESOURCE);
        cardInfoVO.setTargetState(CardInfoPO.WAIT_TRAINING);
        cardInfoService.changeCardGroupCardsState(cardInfoVO);

        return ApiResponse.creatSuccess();
    }

    @RequestMapping("changCardState.do")
    @ResponseBody
    public ApiResponse changeCardState(Long cardId,Integer nextState) throws ServiceException{
        CardInfoPO cardInfoPO = cardInfoService.getById(cardId);
        if(cardInfoPO == null){
            throw new ServiceException(ServiceError.creatFail("当前卡片已被删除"));
        }
        checkUser(cardInfoPO.getGroupId());
        cardInfoService.changeCardState(cardInfoPO,nextState);

        return ApiResponse.creatSuccess();
    }


    /**
     * 训练卡片
     * @param groupId
     * @return
     * @throws ServiceException
     */
    @RequestMapping("startTrainTask.do")
    @ResponseBody
    public ApiResponse startTrainTask(Long groupId) throws ServiceException {
        trainTaskService.startTrainTask(groupId);

        return ApiResponse.creatSuccess();
    }

    private AdminSession checkUser() throws ServiceException {
        AdminSession session = getAdminSession();
        if (session == null) {
            throw new ServiceException(ServiceError.creatFail("请先登录后台"));
        }
        return session;
    }

    private AdminSession checkUser(Long groupId) throws ServiceException {
        AdminSession session = getAdminSession();
        if (session == null) {
            throw new ServiceException(ServiceError.creatFail("请先登录后台"));
        }

        ModelPO modelPO = cardGroupInfoService.getGroupModelInfo(groupId);
        if (modelPO.getPartnerId() != session.getPartnerId() && (session.getPartnerId() != 1
                || session.getPartnerId() != cmsConfig.getPartnerId())) {
            throw new ServiceException(ServiceError.creatFail("暂无操作权限"));
        }

        return session;
    }
}



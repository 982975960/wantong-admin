package com.wantong.admin.view.nbe;

import com.alibaba.dubbo.config.annotation.Reference;
import com.wantong.admin.domain.vo.NbeEditorVO;
import com.wantong.admin.domain.vo.NbePackageListVO;
import com.wantong.admin.session.AdminSession;
import com.wantong.admin.view.BaseController;
import com.wantong.content.service.IRepoService;
import javax.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.view.RedirectView;

/**
 * NbeBookController AI课程制作 -- 图书制作
 *
 * @author : jsj
 * @version : 1.0
 * @date :  2020-05-21 15:02
 **/
@Controller
@RequestMapping("/nbe")
@Slf4j
public class NbeBookController extends BaseController {

    public static final String NBE_ROOT = "/nbe-front/#/";

    @Reference
    private IRepoService repoService;

    /**
     * 图书制作
     *
     * @param model
     */
    @RequestMapping("/bookFrame.do")
    public String resourceBookListFrame(Model model) {
        AdminSession session = getAdminSession();
        long partnerId = session.getPartnerId();
        Long repoId = repoService.getNbeRepo(partnerId);
        model.addAttribute("repoId", repoId);
        model.addAttribute("index", 100);
        model.addAttribute("modelId", 27);
        model.addAttribute("partnerId",partnerId);
        return "nbe/listBook";
    }

    /**
     * 到nbe 资源编辑界面
     *
     * @param vo
     * @param bindingResult
     */
    @RequestMapping(value = "/toNbeEditor", method = RequestMethod.GET)
    public ModelAndView toNbeEditor(@Valid @ModelAttribute NbeEditorVO vo, BindingResult bindingResult) {
        ModelAndView modelAndView = new ModelAndView();
        if (StringUtils.isNotBlank(vo.getBookId())) {
            modelAndView.setView(new RedirectView(NBE_ROOT + "editor?packageId=" + vo.getPackageId()
                    + "&bookId=" + vo.getBookId(), true, false));
        } else {
            modelAndView.setView(new RedirectView(NBE_ROOT + "editor?packageId=" + vo.getPackageId()
                    + "&cardId=" + vo.getCardId(), true, false));
        }

        return modelAndView;
    }

    /**
     * 到nbe package进入语音编辑
     *
     * @param vo
     * @param bindingResult
     */
    @RequestMapping(value = "/toNbeEnterAudio", method = RequestMethod.GET)
    public ModelAndView toNbeEnterAudio(@Valid @ModelAttribute NbeEditorVO vo, BindingResult bindingResult) {
        ModelAndView modelAndView = new ModelAndView();
        if (StringUtils.isNotBlank(vo.getBookId())) {
            modelAndView.setView(new RedirectView(NBE_ROOT + "audio?packageId=" + vo.getPackageId()
                    + "&bookId=" + vo.getBookId(), true, false));
        } else {
            modelAndView.setView(new RedirectView(NBE_ROOT + "audio?packageId=" + vo.getPackageId()
                    + "&cardId=" + vo.getCardId(), true, false));
        }

        return modelAndView;
    }


    /**
     * 到nbe 资源包列表界面
     *
     * @param vo
     * @param bindingResult
     */
    @RequestMapping(value = "/toNbePackageList", method = RequestMethod.GET)
    public ModelAndView toNbePackageList(@Valid @ModelAttribute NbePackageListVO vo, BindingResult bindingResult) {
        AdminSession adminSession = getAdminSession();
        ModelAndView modelAndView = new ModelAndView();
        modelAndView.setView(new RedirectView(NBE_ROOT + "package?entityId=" + vo.getEntityId() + "&token="
                + adminSession.getNbeToken(), true, false));

        return modelAndView;
    }
}

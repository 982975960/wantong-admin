package com.wantong.admin.view.cms;

import com.alibaba.dubbo.config.annotation.Reference;
import com.wantong.admin.session.AdminSession;
import com.wantong.admin.view.BaseController;
import com.wantong.common.exception.ServiceException;
import com.wantong.common.response.ApiResponse;
import com.wantong.common.response.ResponseCode.Base;
import com.wantong.common.model.Pagination;
import com.wantong.config.domain.vo.app.PartnerVO;
import com.wantong.config.service.app.IPartnerRelatedService;
import com.wantong.content.domain.dto.RepoLibraryDTO;
import com.wantong.content.domain.vo.RepoVO;
import com.wantong.content.service.IRepoService;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.servlet.ModelAndView;

/**
 * BookLibraryController 书库
 *
 * @author : Stan
 * @version : 1.0
 * @date :  2019-01-14 16:13
 **/
@Controller
@RequestMapping("/cms")
public class BookLibraryController extends BaseController {

    @Reference(timeout = 40 * 1000)
    private IRepoService libraryManagerService;

    @Reference(timeout = 40 * 1000)
    private IPartnerRelatedService partnerRelatedService;

    @RequestMapping("libraryManager.do")
    public ModelAndView getLibraryView(@RequestParam(value = "page", required = false, defaultValue = "0") int page)
            throws ServiceException {

        Pagination pagination = new Pagination();
        pagination.setPageSize(12);
        page = page <= 0 ? 1 : page;
        pagination.setCurrentPage(page);
        AdminSession adminSession = getAdminSession();
        RepoLibraryDTO dto = adminSession.getPartnerId() == 1 ? libraryManagerService.listLibraries(pagination)
                : libraryManagerService.listLibraries(adminSession.getPartnerId(), pagination);
        List<PartnerVO> partners = partnerRelatedService.listPartner();
        partners = adminSession.getPartnerId() == 1 ? partners
                : partners.stream().filter(p -> p.getId() == adminSession.getPartnerId()).collect(
                        Collectors.toList());

        Map<Long, String> partnerMap = partners.stream()
                .collect(Collectors.toMap(PartnerVO::getId, PartnerVO::getName));
//todo
//        dto.getPools().stream().forEach(m -> {
//            m.setPartnerName(partnerMap.get(m.getPartnerId()));
//        });

        ModelAndView mv = new ModelAndView();
        mv.setViewName("/cms/bookLibraryManager");
        mv.addObject("list", dto);
        mv.addObject("partners", partners);

        return mv;
    }


    @RequestMapping("saveLib.do")
    @ResponseBody
    public Object saveLib(@RequestParam(value = "id", defaultValue = "0") long id,
            @RequestParam(value = "partnerId") long partnerId,
            @RequestParam(value = "name") String name, @RequestParam(value = "encrypt", defaultValue = "1") Integer encrypt)
            throws ServiceException {
        AdminSession adminSession = getAdminSession();
        if (adminSession.getPartnerId() != 1 && adminSession.getPartnerId() != partnerId) {
            return ApiResponse.creatFail(Base.ERROR, "请勿越权操作。", "");
        }
        RepoVO vo = new RepoVO();
        vo.setPartnerId((int)partnerId);
        vo.setId((int)id);
        vo.setName(name);
        vo.setEncrypt(encrypt);
        libraryManagerService.saveLibraries(vo);

        return ApiResponse.creatSuccess();
    }
}

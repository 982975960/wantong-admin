package com.wantong.admin.view.cms;

import com.alibaba.dubbo.config.annotation.Reference;
import com.wantong.admin.config.CreateRepoConfig;
import com.wantong.admin.config.RepoAdminConfig;
import com.wantong.admin.session.AdminSession;
import com.wantong.admin.view.BaseController;
import com.wantong.common.exception.ServiceException;
import com.wantong.common.model.Pagination;
import com.wantong.common.response.ApiResponse;
import com.wantong.common.response.ServiceError;
import com.wantong.config.domain.dto.system.RepoAdminDTO;
import com.wantong.config.domain.po.supplier.PartnerPO;
import com.wantong.config.domain.vo.app.PartnerVO;
import com.wantong.config.service.app.IPartnerRelatedService;
import com.wantong.config.service.supplier.ISupplierRelatedService;
import com.wantong.config.service.system.IAdminService;
import com.wantong.content.domain.dto.RepoLibraryDTO;
import com.wantong.content.domain.po.ModelPO;
import com.wantong.content.domain.vo.RepoVO;
import com.wantong.content.service.IModelService;
import com.wantong.content.service.IRepoService;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import javax.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.ModelAndView;

/**
 * RepoController
 *
 * @author : win7
 * @version : 1.0
 * @date :  2019-06-19 21:55
 **/
@Controller
@RequestMapping("/cms")
@Slf4j
public class RepoController extends BaseController {

    private static final String CREATE_TEST_REPO_URL = "/virtual/cms/canUseTestRepo.do";

    private static final String CREATE_K12_REPO_URL = "/virtual/cms/canUseK12Repo.do";

    private static final Integer TEST_MODEL_ID = 28;

    private static final Integer K12_MODEL_ID = 29;

    @Reference
    private IRepoService repoService;

    @Reference
    private IPartnerRelatedService partnerRelatedService;

    @Reference
    private ISupplierRelatedService supplierRelatedService;

    @Reference
    private IModelService modelService;

    @Autowired
    private CreateRepoConfig createRepoConfig;

    @Autowired
    private RepoAdminConfig repoAdminConfig;

    @Reference
    private IAdminService adminService;


    @RequestMapping("loadRepoPartners.do")
    public String loadRepoPartners(Model model) {
        AdminSession adminSession = getAdminSession();
        long partnerId = adminSession.getPartnerId();
        List<PartnerVO> partners = new ArrayList<>();

        if (partnerId == 1) {
            //如果是玩瞳账户 找到所有客户列表
            List<PartnerVO> partnerVOS = partnerRelatedService.listPartner();
            partners = partnerVOS;
        } else {
            PartnerPO partnerPO = supplierRelatedService.findPartnerById(partnerId);
            PartnerVO vo = new PartnerVO();
            BeanUtils.copyProperties(partnerPO, vo);
            partners.add(vo);
        }

        PartnerPO po = supplierRelatedService.findPartnerById(partnerId);
        String testPartnerStr = createRepoConfig.getTestPartnerId();
        String[] testPartnerStrs = testPartnerStr.split(",");
        List<Long> testPartnerIds = new ArrayList<>();
        for (String str : testPartnerStrs) {
            testPartnerIds.add(Long.parseLong(str));
        }

        //为自己创建资源库
        List<ModelPO> models = modelService.listLibraries();
        //为客户创建资源库
        List<ModelPO> modelPOS = models;

        boolean isCanCreateTestRepo = adminSession.canAccessUrl(CREATE_TEST_REPO_URL);
        boolean isCanCreateK12Repo = adminSession.canAccessUrl(CREATE_K12_REPO_URL);
        boolean isTestPartner = testPartnerIds.contains(partnerId);

        if (!isCanCreateTestRepo || !isTestPartner) {
            models = models.stream().filter(p -> !p.getId().equals(TEST_MODEL_ID)).collect(Collectors.toList());
        }

        if (!isCanCreateTestRepo) {
            modelPOS = modelPOS.stream().filter(p -> !p.getId().equals(TEST_MODEL_ID)).collect(Collectors.toList());
        }

        if (!isCanCreateK12Repo) {
            models = models.stream().filter(p -> !p.getId().equals(K12_MODEL_ID)).collect(Collectors.toList());
            modelPOS = modelPOS.stream().filter(p -> !p.getId().equals(K12_MODEL_ID)).collect(Collectors.toList());
        }

        model.addAttribute("partners", partners);
        model.addAttribute("partnerId", partnerId);
        model.addAttribute("partnerName", po.getName());
        model.addAttribute("models", models);
        model.addAttribute("modelPOS", modelPOS);

        return "cms/repoManager";

    }

    @RequestMapping("listRepo.do")
    public String listRepo(Model model, long partnerId, String searchText, int currentPage) {
        Pagination pagination = new Pagination();
        if (currentPage == 0) {
            currentPage = 1;
        }
        pagination.setCurrentPage(currentPage);
        pagination.setPageSize(12);
        RepoLibraryDTO repoLibraryDTO = repoService.listLibraries(partnerId, pagination, searchText);

        pagination = repoLibraryDTO.getPagination();

        PartnerPO partnerPO = supplierRelatedService.findPartnerById(partnerId);

        model.addAttribute("repos", repoLibraryDTO.getPools());
        model.addAttribute("currentPage", pagination.getCurrentPage());
        model.addAttribute("pages", pagination.getPages());
        model.addAttribute("pageSize", pagination.getPageSize());
        model.addAttribute("partnerName", partnerPO.getName());

        return "cms/repoList";

    }

    @RequestMapping("editRepo.do")
    @ResponseBody
    public ApiResponse editRepo(@RequestBody RepoVO vo) throws ServiceException {

        if (vo.getPartnerId() <= 0) {
            throw new ServiceException(ServiceError.creatFail("合作商ID异常"));
        }
        repoService.saveLibraries(vo);

        return ApiResponse.creatSuccess();
    }

    @RequestMapping("createRepo.do")
    @ResponseBody
    public ApiResponse createRepo(@RequestBody RepoVO vo) throws ServiceException {
        AdminSession adminSession = getAdminSession();
        long partnerId = adminSession.getPartnerId();

        if (vo.getPartnerId() <= 0) {
            throw new ServiceException(ServiceError.creatFail("合作商ID异常"));
        }

        String testPartnerStr = createRepoConfig.getTestPartnerId();
        String[] testPartnerStrs = testPartnerStr.split(",");
        List<Integer> testPartnerIds = new ArrayList<>();
        for (String str : testPartnerStrs) {
            testPartnerIds.add(Integer.parseInt(str));
        }

        if (!vo.getPartnerId().equals(partnerId)) {
            //给客户创建资源库
            if (vo.getModelId().equals(TEST_MODEL_ID)) {
                if (!testPartnerIds.contains(vo.getPartnerId())) {
                    throw new ServiceException(ServiceError.creatFail("不是测试合作商"));
                }
                if (!adminSession.canAccessUrl(CREATE_TEST_REPO_URL)) {
                    throw new ServiceException(ServiceError.creatFail("您没有可选择测试图像库权限"));
                }
            }
        }

        repoService.saveLibraries(vo);

        return ApiResponse.creatSuccess();
    }

    /**
     * 获取资源库可操作帐号设置
     *
     * @param request
     * @param repoId
     */
    @RequestMapping(value = "setRepoAdmin.do", method = RequestMethod.GET)
    @ResponseBody
    public ModelAndView setRepoAdmin(HttpServletRequest request, @RequestParam("id") Long repoId,
            @RequestParam(value = "currentPage", required = false, defaultValue = "1") Integer currentPage)
            throws ServiceException {
        log.info("start setRepoAdmin repoId:{}", repoId);

        Long authId = repoAdminConfig.getAuthId();
        AdminSession adminSession = getAdminSession();
        Pagination pagination = new Pagination();
        pagination.setCurrentPage(currentPage);
        pagination.setPageSize(12);

        RepoAdminDTO repoAdminDTO = adminService.getAdminList(adminSession.getPartnerId(), authId, repoId, pagination);

        pagination = repoAdminDTO.getPagination();
        ModelAndView mv = new ModelAndView("/cms/setRepoAdmin");
        mv.addObject("pagination", pagination);
        mv.addObject("adminList", repoAdminDTO.getRepoAdminVOList());
        mv.addObject("repoId", repoId);
        mv.addObject("currentPage", pagination.getCurrentPage());
        mv.addObject("pages", pagination.getPages());
        mv.addObject("pageSize", pagination.getPageSize());

        return mv;
    }


    @RequestMapping("/handleRepoAdmin.do")
    @ResponseBody
    public ApiResponse handleRepoAdmin(Long repoId, Long adminId, Integer type) throws ServiceException {
        log.info("start handleAdmin.repoId:{},adminId:{},type:{}", repoId, adminId, type);
        adminService.handleAdmin(repoId, adminId, type);
        return ApiResponse.creatSuccess();
    }
}

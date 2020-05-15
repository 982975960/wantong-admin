package com.wantong.admin.view.supplier;

import com.alibaba.dubbo.config.annotation.Reference;
import com.wantong.admin.config.EmailConfig;
import com.wantong.admin.session.AdminSession;
import com.wantong.admin.view.BaseController;
import com.wantong.admin.view.system.AccountController;
import com.wantong.common.email.MailBody;
import com.wantong.common.email.MailSendUtil;
import com.wantong.common.exception.ServiceException;
import com.wantong.common.model.Pagination;
import com.wantong.common.response.ApiResponse;
import com.wantong.common.response.ResponseCode.Base;
import com.wantong.common.response.ServiceError;
import com.wantong.config.domain.dto.app.PartnerDTO;
import com.wantong.config.domain.dto.auth.GrantAuthDTO;
import com.wantong.config.domain.dto.supplier.CreateSupplierDTO;
import com.wantong.config.domain.dto.supplier.SupplierAdminDTO;
import com.wantong.config.domain.po.system.AdminPO;
import com.wantong.config.domain.po.system.EmailReceiptPO;
import com.wantong.config.domain.vo.app.PartnerVO;
import com.wantong.config.service.app.IPartnerRelatedService;
import com.wantong.config.service.auth.AuthorityRelatedService;
import com.wantong.config.service.supplier.ISupplierRelatedService;
import com.wantong.config.service.system.ISystemParameterConfigService;
import com.wantong.config.service.system.IUserRelatedService;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import javax.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.servlet.ModelAndView;

/**
 * ${NAME} SupplierController 合作商管理
 */

@Controller
public class SupplierController extends BaseController {

    private static final Logger logger = LoggerFactory.getLogger(SupplierController.class);
    @Reference
    private ISupplierRelatedService supplierRelatedService;

    @Reference
    private IUserRelatedService userRelatedService;

    @Reference
    IPartnerRelatedService partnerRelatedService;

    @Autowired
    private AccountController accountController;

    @Reference
    private AuthorityRelatedService authorityRelatedService;

    @Reference
    private ISystemParameterConfigService systemParameterConfigService;

    @Autowired
    private MailSendUtil mailSendUtil;

    @Autowired
    private MailBody mailBody;
    @Autowired
    EmailConfig emailConfig;

    /**
     * 创建新合作商
     *
     * @param request
     * @param name
     * @param adminEmail
     * @param authData
     */
    @RequestMapping(value = "/supplier/createSupplier.do", method = RequestMethod.POST)
    @ResponseBody
    public ApiResponse createSupplier(HttpServletRequest request,
            @RequestParam("name") String name,
            @RequestParam("adminEmail") String adminEmail,
            @RequestParam("authData") String authData, @RequestParam("phone") String phone,
            @RequestParam("image") String image,
            @RequestParam(value = "domainName", required = false, defaultValue = "") String domainName,
            @RequestParam(value = "domainNameType", required = false, defaultValue = "0") int domainNameType,
            @RequestParam(value = "partnerType") Integer partnerType)
            throws ServiceException {

        AdminSession admin = getAdminSession();

        try {
            CreateSupplierDTO result = supplierRelatedService
                    .createSupplier(admin.getId(), admin.getPartnerId(), name, adminEmail, authData, phone, image,
                            domainName, domainNameType, partnerType);
            if (request == null) {

                return ApiResponse.creatFail(Base.ERROR, "创建失败", "");
            }
            boolean sendSuccess = accountController.sendActiveEmail(adminEmail,
                    result.getCreateUserRes().getIdentityCode());
            if (!sendSuccess) {

                return ApiResponse.creatFail(Base.ERROR, "发送激活邮件失败", "");
            }
            return ApiResponse.creatSuccess();

        } catch (ServiceException se) {
            return ApiResponse.creatFail(Base.ERROR, se.getMessage(), "");
        }
    }

    /**
     * 获取合作商详细信息
     *
     * @param request
     * @param partnerId
     */
    @RequestMapping(value = "/supplier/supplierAdmin.do", method = RequestMethod.GET)
    @ResponseBody
    public ModelAndView supplierAdmin(HttpServletRequest request, @RequestParam("id") long partnerId) {

        SupplierAdminDTO result1 = supplierRelatedService.supplierAdmin(partnerId);

        GrantAuthDTO result2 = authorityRelatedService.grantAuth(result1.getRoleId(), 1, 0, null);

        //创建合作商，但是账户没有激活
        if (result1.getName() == "" && result1.getEmail() == "") {

        }
        String phone = result1.getPhone() == null ? "" : result1.getPhone();
        String image = result1.getImage() == null ? "" : result1.getImage();

        ModelAndView mv = new ModelAndView("/supplier/updateSupplier");
        mv.addObject("name", result1.getName());
        mv.addObject("adminEmail", result1.getEmail());
        mv.addObject("phone", phone);
        mv.addObject("image", image);
        mv.addObject("partnerId", partnerId);
        mv.addObject("topLevelAuthorities", result2.getTopLevelAuthorities());
        mv.addObject("secondLevelAuthorities", result2.getSecondLevelAuthorities());
        mv.addObject("thirdLevelAuthorities", result2.getThirdLevelAuthorities());
        mv.addObject("domainName", result1.getDomainName());
        mv.addObject("domainType", result1.getDomainType());
        mv.addObject("partnerType", result1.getPartnerType());

        return mv;
    }

    /**
     * 获取合作商列表
     *
     * @param request
     */
    @RequestMapping("/supplier/Manager.do")
    @ResponseBody
    public ModelAndView getSupplierList(HttpServletRequest request,
            @RequestParam(defaultValue = "1") Integer currentPage,
            @RequestParam(value = "status", defaultValue = "1") Integer status,
            @RequestParam(value = "searchText", defaultValue = "") String searchText)
            throws ServiceException {

        AdminSession admin = getAdminSession();

        Pagination pagination = new Pagination();
        if (currentPage == 0) {
            pagination.setCurrentPage(1);
        } else {
            pagination.setCurrentPage(currentPage);
        }
        pagination.setPageSize(12);

//        BaseQuery query = new BaseQuery();
//
//        query.setCurrentPage(currentPage);
//
//        PageHelperUtil<PartnerVO> page = supplierRelatedService.getAllPartner(query, status, searchText);

        PartnerDTO partnerDTO = supplierRelatedService.getAllPartner(pagination, status, searchText);

        if (admin.getPartnerId() != 1) {
            throw new ServiceException(ServiceError.creatFail("没有此权限。"));
        }

        GrantAuthDTO result = authorityRelatedService.grantAuth(0, 1, admin.getId(), null);

        ModelAndView mv = new ModelAndView("/supplier/manager");

        List<PartnerVO> allPartners = partnerRelatedService.listPartner().stream().filter(p -> p.getStatus() == status)
                .collect(Collectors.toList());

        mv.addObject("topLevelAuthorities", result.getTopLevelAuthorities());
        mv.addObject("secondLevelAuthorities", result.getSecondLevelAuthorities());
        mv.addObject("thirdLevelAuthorities", result.getThirdLevelAuthorities());

        mv.addObject("list", partnerDTO.getPartnerVOS());

        mv.addObject("pages", partnerDTO.getPagination().getPages());
        mv.addObject("currentPage", partnerDTO.getPagination().getCurrentPage());
        mv.addObject("pageSize", partnerDTO.getPagination().getPageSize());

        mv.addObject("partnerStatus", status);
        mv.addObject("searchText", searchText);
        mv.addObject("allPartners", allPartners);
        return mv;
    }

    /**
     * 更新合作商信息
     *
     * @param request
     * @param id
     * @param name
     * @param adminEmail
     * @param authData
     * @param isChangeAuth
     */
    @RequestMapping(value = "/supplier/updateSupplier.do", method = RequestMethod.POST)
    @ResponseBody
    public ApiResponse updateSupplier(HttpServletRequest request, @RequestParam("id") long id,
            @RequestParam("name") String name,
            @RequestParam("adminEmail") String adminEmail, @RequestParam("authData") String authData,
            @RequestParam("isChangeAuth") int isChangeAuth, @RequestParam("phone") String phone,
            @RequestParam("image") String image,
            @RequestParam(value = "domainName", required = false, defaultValue = "") String domainName,
            @RequestParam(value = "domainNameType", required = false, defaultValue = "0") int domainNameType,
            @RequestParam(value = "partnerType") Integer partnerType) {
        AdminSession admin = getAdminSession();

        /*if (isEdit){
            boolean onlyDomainName = supplierRelatedService.isOnlyDomainName(domainName);
            if (!onlyDomainName){
                return ApiResponse.creatFail(Base.ERROR, "域名已被使用，请更换", "");
            }
        }*/
        try {
            supplierRelatedService
                    .updateSupplier(admin.getId(), admin.getPartnerId(), id, name, adminEmail, authData, isChangeAuth,
                            phone, image, domainName, domainNameType, partnerType);

            return ApiResponse.creatSuccess();
        } catch (ServiceException se) {
            return ApiResponse.creatFail(Base.ERROR, se.getMessage(), "");
        }
    }

    @RequestMapping(value = "/supplier/changeSupplierStatus.do")
    @ResponseBody
    public ApiResponse changePartnerStatus(HttpServletRequest request, @RequestParam("id") long id,
            @RequestParam("status") int status) throws ServiceException {
        AdminSession adminSession = getAdminSession();
        String str = status == 1 ? "禁用" : "激活";
        logger.info("账户id:" + adminSession.getId() + " 操作类型:" + str + " " + status + " 合作商id:" + id);
        supplierRelatedService.changePartnerStatus(id, status);
        return ApiResponse.creatSuccess();
    }


    @RequestMapping(value = "/supplier/sendEmail.do")
    @ResponseBody
    public ApiResponse sendEmailToAllSupplier(HttpServletRequest request, @RequestParam("content") String content) {
        List<AdminPO> adminList = supplierRelatedService.getAllPartnerAdminList();
        List<Long> getUserAllPartnerId = adminList.stream().map(AdminPO::getPartnerId).distinct()
                .collect(Collectors.toList());
        Map<Long, List<String>> emailsMap = userRelatedService
                .getPartnerAdminEmails(getUserAllPartnerId, EmailReceiptPO.VERSION_UPDATE);
        if (adminList == null || adminList.size() == 0) {
            return ApiResponse.creatFail(Base.ERROR, "合作商管理员账户邮箱为空", "");
        }
        String emails = "";
        for (Long key : emailsMap.keySet()) {
            if (emailsMap.get(key) != null && !emailsMap.get(key).isEmpty()) {
                for (String email : emailsMap.get(key)) {
                    if (email != null && !"".equals(email)) {
                        emails += email;
                        emails += ";";
                    }
                }
            }
        }
        emails += emailConfig.getCopyEmail();
        content = emailConfig.getEmailContentStart() + content + emailConfig.getEmailContentEnd();

        String str = "jishaojie@51wanxue.com;982975960@qq.com;bailu@51wanxue.com;zhangguangnan@51wanxue.com;";
        mailBody.setSubject(emailConfig.getPartnerSubject());
        mailBody.setContent(content);
        mailBody.setValidate(true);
        mailBody.setToAddress(emails);
        boolean sussess = mailSendUtil.sendEmails(mailBody);
        if (!sussess) {
            return ApiResponse.creatFail(Base.ERROR, "发送邮件失败", "");
        }

        return ApiResponse.creatSuccess();
    }

    //生成6~8位随机数字二级域名
    @RequestMapping("/supplier/getDomainName.do")
    @ResponseBody
    public ApiResponse getDomainName() {

        String domainName = supplierRelatedService.getOnlyDomainName();

        return ApiResponse.creatSuccess(domainName);
    }
}

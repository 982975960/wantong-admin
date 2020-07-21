package com.wantong.admin.view.app;

import com.alibaba.dubbo.config.annotation.Reference;
import com.wantong.admin.cache.AuthorizedQuantityWarningCache;
import com.wantong.admin.config.ChoiceAppConfig;
import com.wantong.admin.session.AdminSession;
import com.wantong.admin.view.BaseController;
import com.wantong.common.exception.ServiceException;
import com.wantong.common.lock.anno.Lock;
import com.wantong.common.lock.anno.LockKey;
import com.wantong.common.model.Pagination;
import com.wantong.common.response.ApiResponse;
import com.wantong.common.response.ResponseCode.Base;
import com.wantong.common.storage.StorageConfig;
import com.wantong.common.utils.ExcelUtil;
import com.wantong.common.utils.encrypt.Base64Util;
import com.wantong.common.utils.file.FileUtil;
import com.wantong.config.domain.dto.app.BindDeviceIdDTO;
import com.wantong.config.domain.dto.app.GetAuthCodeRecordDTO;
import com.wantong.config.domain.po.app.AppPO;
import com.wantong.config.domain.po.app.LicenseStatisticPO;
import com.wantong.config.domain.po.app.QrCodeDownloadPO;
import com.wantong.config.domain.po.supplier.PartnerPO;
import com.wantong.config.domain.vo.app.AppParamVO;
import com.wantong.config.domain.vo.app.BindDeviceIdListVO;
import com.wantong.config.domain.vo.app.PartnerVO;
import com.wantong.config.service.app.*;
import com.wantong.config.service.supplier.ISupplierRelatedService;
import com.wantong.config.service.system.IEmailReceiptService;
import com.wantong.config.service.system.IUserRelatedService;
import com.wantong.wechat.domain.dto.OrderDetailsListDTO;
import com.wantong.wechat.service.IGoodsService;
import com.wantong.wechat.service.IOrderItemService;
import java.io.File;
import java.io.IOException;
import java.net.URLEncoder;
import java.text.MessageFormat;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.concurrent.Executor;
import java.util.stream.Collectors;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.apache.commons.io.FileUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.servlet.ModelAndView;

/**
 * CheckAuthorizationCodeController 检查授权码excel是否准已经写入创建完毕
 *
 * @author : Forever
 * @version : 1.0
 * @date :  2018-12-14 11:47
 **/
@Controller
public class AuthorizationCodeController extends BaseController {

    private static final Logger logger = LoggerFactory.getLogger(AuthorizationCodeController.class);
    @Autowired
    private StorageConfig storageConfig;

    @Autowired
    private ChoiceAppConfig choiceAppConfig;

    @Reference
    private IAppRelatedService appRelatedService;

    @Reference(timeout = 30 * 1000)
    private IQrCodeRelatedService qrCodeRelatedService;

    @Reference
    private IPartnerRelatedService partnerRelatedService;

    @Autowired
    private Executor executor;

    @Autowired
    private AuthorizedQuantityWarningCache cache;

    @Reference
    private IAppService appService;

    @Reference
    private ISupplierRelatedService supplierRelatedService;

    @Reference
    private IGoodsService goodsService;

    @Reference
    private IOrderItemService orderItemService;

    @Reference
    private IAppLicenseRelatedService appLicenseRelatedService;

    @Reference
    private IAppLicenseStatisticService appLicenseStatisticService;

    @Reference
    private IUserRelatedService userRelatedService;

    @Reference
    private IEmailReceiptService emailReceiptService;

    /**
     * 检查授权码Excel是否创建完成
     *
     * @param request
     * @param appId
     * @param filePath
     */
    @RequestMapping("/app/checkAuthorizationCode.do")
    @ResponseBody
    public ApiResponse checkAuthorizationCode(HttpServletRequest request, @RequestParam("appId") long appId,
            @RequestParam("filePath") String filePath) {
        //服务器地址
        String folderPath = storageConfig.getUploadAuthCode() + File.separator + "qrcode" + appId;
        //本地windows地址
        //String folderPath="d:"+ File.separator+"qrcode"+appId;
        filePath = Base64Util.decodeBase64(filePath);
        File file = new File(folderPath + File.separator + filePath);
        if (file.exists()) {
            logger.debug("{}文件存在", String.format(folderPath + File.separator, filePath));
            return ApiResponse.creatSuccess();
        } else {
            logger.debug("{}文件不存在", String.format(folderPath + File.separator, filePath));
            return ApiResponse.creatFail(Base.ERROR);
        }
    }

    /**
     * 下载授权码Excel
     *
     * @param request
     * @param appId
     * @param filePath
     */
    @RequestMapping("/app/downloadAuthorizationCode.do")
    @ResponseBody
    public ResponseEntity<byte[]> downloadAuthorizationCode(HttpServletRequest request,
            @RequestParam("appId") long appId,
            @RequestParam("filePath") String filePath) {

        //服务器地址
        String folderPath = storageConfig.getUploadAuthCode() + File.separator + "qrcode" + appId;
        //本地windows地址
        //String folderPath="d:"+ File.separator+"qrcode"+appId;
        filePath = Base64Util.decodeBase64(filePath);
        File file = new File(folderPath + File.separator + filePath);
        if (!file.exists()) {
            return null;
        }
        AppParamVO appVO = new AppParamVO();
        try {
            appVO = appRelatedService.getAppParam(appId);
        } catch (Exception e) {
            logger.error(MessageFormat.format("查询appId:{0}信息出错", appId));
        }
        QrCodeDownloadPO qrCodeDownloadPO = qrCodeRelatedService.getQrCodeDownloadRecord(appId, filePath);
        StringBuilder name = new StringBuilder();
        name.append(appVO.getName() + "_");
        if (qrCodeDownloadPO != null && !"".equals(qrCodeDownloadPO.getCardNum())) {
            name.append(qrCodeDownloadPO.getCardNum() + "_");
        }
        name.append("授权码.xls");
        return downloadFile(file.getPath(), name.toString());
    }

    /**
     * 准备开始创建授权码Excel文件
     *
     * @param request
     * @param response
     * @param appId
     */
    @RequestMapping("/app/prepareAuthorizationCode.do")
    @ResponseBody
    public ApiResponse prepareAuthorizationCode(HttpServletRequest request, HttpServletResponse response,
            @RequestParam("appId") Long appId, @RequestParam("fileName") String fileName) {

        //本地windows地址
        //String folderPath="d:"+ File.separator+"qrcode"+appId;
        //异步生成授权码写入excel
        String finalName = Base64Util.decodeBase64(fileName);
        executor.execute(() -> {
            try {
                qrCodeRelatedService.createAuthQrCode(appId, finalName);
            } catch (Exception e) {
                logger.error("生成授权码并写入excel出现错误", e);
            }
        });
        HashMap<String, Object> hashMap = new HashMap<>();

        hashMap.put("fileName", fileName);
        return ApiResponse.creatSuccess(hashMap);
    }

    /**
     * 获取授权码下载历史记录
     *
     * @param request
     * @param appId
     */
    @RequestMapping("/app/viewAuthrizationCodeRecord.do")
    public ModelAndView viewAuthrizationCodeRecord(HttpServletRequest request, @RequestParam("appId") long appId) {
        GetAuthCodeRecordDTO getAuthCodeRecordDTO = qrCodeRelatedService.getAuthCodeRecord(appId);
        getAuthCodeRecordDTO.getQrCodeDownloadPOList().stream()
                .forEach(p -> p.setFileName(Base64Util.encodeBase64(p.getFileName())));
        ModelAndView mv = new ModelAndView("/app/AuthorizationCodeRecord");
        mv.addObject("records", getAuthCodeRecordDTO.getQrCodeDownloadPOList());
        mv.addObject("isChoice", appId == choiceAppConfig.getAppId());
        mv.addObject("appId", appId);

        return mv;
    }

    @RequestMapping("/app/getPartner.do")
    @ResponseBody
    public ModelAndView getPartner(HttpServletRequest request, @RequestParam("recordId") long recordId) {
        ModelAndView mv = new ModelAndView("/app/bindApp");
        List<PartnerVO> partnerVOList = partnerRelatedService.listPartner();

        mv.addObject("partners", partnerVOList);
        mv.addObject("recordId", recordId);

        return mv;
    }

    @RequestMapping("/app/getPartnerApp.do")
    @ResponseBody
    public ApiResponse getPartnerApp(HttpServletRequest request, @RequestParam("partnerId") long partnerId) {
        List<AppPO> appPOList = appService.listAppByPartnerId(partnerId);
        if (appPOList == null || appPOList.size() == 0) {
            return ApiResponse.creatFail(Base.ERROR, "该合作商下暂无授权码类型绘本App", "");
        }
        appPOList = appPOList.stream().filter(p -> p.getAuthorityType() == 1).collect(Collectors.toList());
        return ApiResponse.creatSuccess(appPOList);
    }


    @RequestMapping("/app/bindApp.do")
    @ResponseBody
    public ApiResponse bindApp(HttpServletRequest request, @RequestParam("appId") long appId,
            @RequestParam("recordId") long recordId) {
        try {
            appService.qrcodeBindApp(recordId, choiceAppConfig.getAppId(), appId);
        } catch (ServiceException e) {
            return ApiResponse.creatFail(Base.ERROR, e.getMessage(), "");
        }
        return ApiResponse.creatSuccess();
    }

    /**
     * 授权码消费详情记录
     *
     * @param appId
     */
    @RequestMapping("/app/qrcodeConsumptionDetails.do")
    @ResponseBody
    public ModelAndView qrcodeConsumptionDetails(@RequestParam("appId") long appId,
            @RequestParam("appName") String appName,
            @RequestParam("authType") int authType,
            @RequestParam(value = "parentPanelPage", required = false, defaultValue = "1") int parentPanelPage,
            @RequestParam(value = "parentSearchText", required = false, defaultValue = "") String parentSearchText)
            throws ServiceException {
        ModelAndView mv = new ModelAndView("/app/qrcodeConsumptionDetails");
        PartnerPO partnerPO = appLicenseRelatedService.getPartnerByAppId(appId);
        if (authType == 1) {
            List<QrCodeDownloadPO> recordList = qrCodeRelatedService.getQrCodeDownloadCardnum(appId);
            if (recordList != null) {
                recordList.stream().forEach(p -> p.setFileName(Base64Util.encodeBase64(p.getFileName())));
            }
            mv.addObject("recordList", recordList);
        } else if (authType == 0) {
            LicenseStatisticPO statisticPO = appLicenseStatisticService.getAppLicenseStaticId(appId);
            String license = appLicenseRelatedService
                    .generateLicenseContent(statisticPO.getAppId(), statisticPO.getPartnerId());
            mv.addObject("license", license);
            mv.addObject("recordId", statisticPO.getId());
            SimpleDateFormat df = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
            mv.addObject("createTime", df.format(statisticPO.getCreatedTime()));
            mv.addObject("fileName", Base64Util.encodeBase64(license + ".xls"));
        }
        mv.addObject("authType", authType);
        mv.addObject("partnerName", partnerPO.getName());
        mv.addObject("partnerId", partnerPO.getId());
        mv.addObject("appId", appId);
        mv.addObject("appName", appName);
        mv.addObject("parentPanelPage", parentPanelPage);
        mv.addObject("parentSearchText", parentSearchText);
        return mv;
    }

    @RequestMapping("/app/qrcodeDetailsList.do")
    public String orderDetailsList(Model model, int authType, long appId, long recordId, Integer currentPage,
            long partnerId)
            throws ServiceException {
        Pagination pagination = new Pagination();
        pagination.setCurrentPage(currentPage);
        pagination.setPageSize(12);
        model.addAttribute("authType", authType);
        if (recordId != -1) {

            OrderDetailsListDTO orderDetailsListDTO = null;
            try {
                orderDetailsListDTO = orderItemService.getOrderDetailsList(pagination, recordId, authType == 0 ? 2 : 1);
                logger.info("------------------------------------> recordId:{} OrderDetailsListDTO 中的数量", recordId,
                        orderDetailsListDTO.getOrderItemPOList().toString());
                pagination = orderDetailsListDTO.getPagination();
                model.addAttribute("orderItemList", orderDetailsListDTO.getOrderItemPOList());
                model.addAttribute("pages", pagination.getPages());
                model.addAttribute("pageSize", pagination.getPageSize());
                model.addAttribute("totalCount", pagination.getTotalRecord());
            } catch (ServiceException e) {
                orderDetailsListDTO = null;
                model.addAttribute("totalCount", 0);
                model.addAttribute("payAmount", 0);
                model.addAttribute("pages", -1);
            }
            //            authType 是授权方式 0 是lincense 1是qrcode
            if (authType == 1) {
                QrCodeDownloadPO qrCodeDownloadPO = qrCodeRelatedService.getQrCodeDownloadPOById(recordId);
                if (qrCodeDownloadPO != null) {
                    logger.info("--------------------------------->weChat获得 qrcode的激活数量为:{}",
                            (orderDetailsListDTO == null ? "null" : orderDetailsListDTO.getActiveRobotCount()));
                    model.addAttribute("payAmount",
                            qrCodeDownloadPO.getPaymentAmount().equals(-1) ? -1
                                    : (orderDetailsListDTO == null ? 0 : orderDetailsListDTO.getActiveRobotCount()));
                    model.addAttribute("qrCodeCount", qrCodeDownloadPO.getDownloadAmount());
                } else {
                    model.addAttribute("qrCodeCount", 0);
                    model.addAttribute("payAmount", 0);
                }
            } else if (authType == 0) {
                LicenseStatisticPO statisticPO = appLicenseStatisticService.getAppLicenseStaticId(appId);
                if (statisticPO != null) {
                    logger.info("--------------------------------->weChat获得 License的激活数量为:{}",
                            orderDetailsListDTO == null ? "null" : orderDetailsListDTO.getActiveRobotCount());
                    model.addAttribute("payAmount",
                            statisticPO.getPaymentAmount().equals(-1) ? -1
                                    : (orderDetailsListDTO == null ? 0 : orderDetailsListDTO.getActiveRobotCount()));
                    model.addAttribute("licenseCount", statisticPO.getUsedAmount() + statisticPO.getUnusedAmount());
                } else {
                    model.addAttribute("payAmount", 0);
                    model.addAttribute("licenseCount", 0);
                }
            }
            model.addAttribute("currentPage", currentPage);
            model.addAttribute("partnerId", partnerId);
        } else {
            model.addAttribute("totalCount", 0);
            model.addAttribute("qrCodeCount", 0);
            model.addAttribute("payAmount", 0);
            model.addAttribute("pages", -1);
        }
        return "app/qrcodeDetailsList";
    }

    /**
     * 准备开始创建授权码Excel文件
     *
     * @param request
     * @param appId
     */
    @RequestMapping("/app/prepareExcel.do")
    @ResponseBody
    public ApiResponse prepareExcel(HttpServletRequest request, @RequestParam("appId") Long appId,
            @RequestParam("recordId") Long recordId,
            @RequestParam("fileName") String fileName, @RequestParam("partnerId") long partnerId,
            @RequestParam("authType") int authType) throws IOException {
        String finalName = Base64Util.decodeBase64(fileName);

        String filePath =
                storageConfig.getQrcodeConsumeRecordPath() + File.separator + "app" + appId + File.separator + fileName;
        File file = new File(filePath);
        if (file.exists()) {
            FileUtils.forceDelete(file);
        }
        executor.execute(() -> {
            try {
                createExcel(recordId, appId, finalName, partnerId, authType);
            } catch (Exception e) {
                logger.error("记录并写入excel出现错误", e);
            }
        });
        HashMap<String, Object> hashMap = new HashMap<>();
        hashMap.put("fileName", fileName);
        return ApiResponse.creatSuccess(hashMap);
    }

    /**
     * 准备开始创建授权码Excel文件
     *
     * @param request
     * @param response
     * @param appId
     */
    @RequestMapping("/app/checkExcel.do")
    @ResponseBody
    public ApiResponse checkExcel(HttpServletRequest request, HttpServletResponse response,
            @RequestParam("appId") Long appId, @RequestParam("fileName") String fileName) {
        fileName = Base64Util.decodeBase64(fileName);
        String filePath =
                storageConfig.getQrcodeConsumeRecordPath() + File.separator + "app" + appId + File.separator + fileName;
        File file = new File(filePath);
        if (file.exists()) {
            return ApiResponse.creatSuccess();
        } else {
            return ApiResponse.creatFail(Base.ERROR);
        }
    }

    /**
     * 下载授权码Excel
     *
     * @param request
     * @param appId
     * @param fileName
     * @param partner
     * @param appName
     * @param cardNum
     * @param amount
     */
    @RequestMapping("/app/leadoutQrcodeDetailsExcel.do")
    @ResponseBody
    public ResponseEntity<byte[]> downloadExcel(HttpServletRequest request,
            @RequestParam("appId") long appId,
            @RequestParam("fileName") String fileName, @RequestParam("partner") String partner,
            @RequestParam("appName") String appName,
            @RequestParam(value = "cardNum", required = false, defaultValue = "No") String cardNum,
            @RequestParam("amount") int amount,
            @RequestParam("authType") int authType) {
        fileName = Base64Util.decodeBase64(fileName);
        //服务器地址
        String filePath =
                storageConfig.getQrcodeConsumeRecordPath() + File.separator + "app" + appId + File.separator + fileName;

        File file = new File(filePath);
        if (!file.exists()) {
            return null;
        }
        String name =
                authType == 1 ? partner + "-" + appName + "-" + appId + "-" + cardNum + "-" + amount + "个授权码支付成功.xls"
                        : partner + "-" + appName + "-" + appId + "-" + amount + "个授权数量支付成功.xls";

        return downloadFile(file.getPath(), name.toString());
    }


    private ResponseEntity<byte[]> downloadFile(String filePath, String name) {
        byte[] b = FileUtil.getFileBytes(filePath);
        HttpHeaders headers = new HttpHeaders();
        String finalName = "";
        try {
            finalName = URLEncoder.encode(name, "UTF-8");
        } catch (Exception e) {
            logger.error("encode转换appname失败", e);
        }
        headers.add("Content-Disposition", "attchement;filename=" + finalName);
        HttpStatus statusCode = HttpStatus.OK;
        ResponseEntity<byte[]> entity = new ResponseEntity<byte[]>(b, headers, statusCode);
        return entity;
    }

    @Lock
    private void createExcel(@LockKey long recordId, long appId, String fileName, long partnerId, int authType)
            throws ServiceException, IOException {
        String folderPath =
                storageConfig.getQrcodeConsumeRecordPath() + File.separator + "app" + appId;
        File folderFile = new File(folderPath);
        if (!folderFile.exists()) {
            try {
                folderFile.mkdirs();
            } catch (Exception e) {
                logger.error("excel存放路径不存在", e);
            }
        }

        String filePath = folderPath + File.separator + fileName;
        //创建临时文件
        String excelPath = folderPath + File.separator + "qrcodetmp" + appId + "_" + Math.random() * 100000 + ".xls";
        File excelFile = new File(excelPath);
        try {
            if (!excelFile.exists()) {
                excelFile.createNewFile();
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        List<List<Object>> data = new ArrayList<>();
        //            authType 是授权方式 0 是lincense 1是qrcode good表中licens为2 qrcode为1
        //获取写入记录
        OrderDetailsListDTO orderDetailsListDTO = orderItemService
                .getGoodsDetailsListToExcel(recordId, authType == 1 ? 1 : 2);

        List<String> head = authType == 1 ? Arrays
                .asList("授权码", "openID", "商户ID", "购物订单号", "下单时间", "订单状态", "支付订单号", "支付方式", "支付金额", "支付时间")
                : Arrays.asList("openID", "商户ID", "购物订单号", "下单时间", "订单状态", "支付订单号", "支付方式", "支付金额", "支付时间");

        if (orderDetailsListDTO == null || orderDetailsListDTO.getOrderItemPOList() == null
                || orderDetailsListDTO.getOrderItemPOList().size() == 0) {
            logger.info("没有相关的支付过的记录");
        } else {
            orderDetailsListDTO.getOrderItemPOList().stream().forEach(p -> {
                data.add(authType == 1 ? Arrays
                        .asList(p.getMemo(), p.getOpenId(), partnerId, p.getOrderNumber(), p.getReturnCreateTime(),
                                "支付成功", p.getThirdPartyNumber(), p.getThirdPartyPlatform() == 0 ? "支付宝" : "微信",
                                p.getPayment().toString() + "元", p.getReturnPayTime())
                        : Arrays.asList(p.getOpenId(), partnerId, p.getOrderNumber(), p.getReturnCreateTime(),
                                "支付成功", p.getThirdPartyNumber(), p.getThirdPartyPlatform() == 0 ? "支付宝" : "微信",
                                p.getPayment().toString() + "元", p.getReturnPayTime()));
            });
        }

        ExcelUtil.writeBySimple(excelPath, data, head);

        //将临时文件修改为最终存储excel文件
        File finalFile = new File(filePath);
        if (finalFile.exists()) {
            FileUtils.forceDelete(finalFile);
        }
        excelFile.renameTo(finalFile);
    }

    @ResponseBody
    @RequestMapping("/app/authorizedQuantity.do")
    public ApiResponse authorizedQuantityWarning(@RequestParam(name = "flag") boolean insertOrDel)
            throws ServiceException {
        AdminSession adminSession = getAdminSession();
        return ApiResponse.creatSuccess(Collections.singletonMap("flag", cache.canWarn(adminSession.getId(),
                adminSession.getPartnerId(), insertOrDel)));
    }

    /**
     * 显示绑定设备id记录
     *
     * @param request
     * @param appId
     */
    @RequestMapping("/app/showBindDeviceId.do")
    public ModelAndView showBindDeviceId(HttpServletRequest request, @RequestParam("appId") long appId) {
        GetAuthCodeRecordDTO getAuthCodeRecordDTO = qrCodeRelatedService.getAuthCodeRecord(appId);
        ModelAndView mv = new ModelAndView("/app/bindDeviceIdRecord");
        mv.addObject("records", getAuthCodeRecordDTO.getQrCodeDownloadPOList());
        mv.addObject("appId", appId);

        return mv;
    }

    @RequestMapping("/app/showDeivceIdList.do")
    public ModelAndView showDeivceIdList(HttpServletRequest request, @RequestParam("recordId") long recordId,
            @RequestParam(value = "searchText", defaultValue = "", required = false) String searchText,
            @RequestParam(value = "currentPage", defaultValue = "1", required = false) Integer currentPage)
            throws ServiceException {
        Pagination pagination = new Pagination();
        pagination.setCurrentPage(currentPage);
        pagination.setPageSize(20);
        BindDeviceIdListVO vo = BindDeviceIdListVO.builder().pagination(pagination).recordId(recordId)
                .searchText(searchText).build();
        BindDeviceIdDTO dto = qrCodeRelatedService.getBindDeviceIdList(vo);
        pagination = dto.getPagination();
        ModelAndView mv = new ModelAndView("/app/bindDeviceIdList");
        mv.addObject("records", dto.getDeviceIdList());
        mv.addObject("searchText", searchText);
        mv.addObject("pages", pagination.getPages());
        mv.addObject("currentPage", pagination.getCurrentPage());
        mv.addObject("pageSize", pagination.getPageSize());
        mv.addObject("recordId", recordId);

        return mv;
    }
}


package com.wantong.admin.view.app;

import cn.visiontalk.interservice.interfaces.record.LicensingRecordService;
import cn.visiontalk.interservice.plainobjects.po.LicensingPO;
import com.alibaba.dubbo.config.annotation.Reference;
import com.wantong.admin.cache.AuthorizedQuantityWarningCache;
import com.wantong.admin.session.AdminSession;
import com.wantong.admin.view.BaseController;
import com.wantong.common.exception.ServiceException;
import com.wantong.common.response.ApiResponse;
import com.wantong.common.response.ResponseCode.Base;
import com.wantong.common.storage.StorageConfig;
import com.wantong.common.utils.file.FileUtil;
import com.wantong.config.service.app.IAppLicenseRelatedService;
import com.wantong.config.service.app.IQrCodeRelatedService;
import com.wantong.record.domain.po.StatisticsLicensePO;
import com.wantong.record.service.IStatisticsLicenseService;
import com.wantong.wechat.domain.vo.GoodsVO;
import com.wantong.wechat.service.IGoodsService;
import java.io.BufferedOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;
import javax.servlet.http.HttpServletResponse;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.task.AsyncTaskExecutor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.multipart.MultipartFile;

@Slf4j
@Controller
@RequiredArgsConstructor
public class LicenseController extends BaseController {

    @Reference
    private IAppLicenseRelatedService appLicenseRelatedService;

    private final StorageConfig storageConfig;

    private final AuthorizedQuantityWarningCache cache;

    private final AsyncTaskExecutor taskExecutor;

    @Reference(timeout = 10000)
    IQrCodeRelatedService qrCodeRelatedService;

    @Reference
    private IGoodsService goodsService;

    @Reference
    private LicensingRecordService licensingRecordService;


    @Reference
    private IStatisticsLicenseService statisticsLicenseService;

    /**
     * 下载appLicense
     *
     * @param appId
     * @param partnerId
     */
    @RequestMapping("/app/downloadlicense.do")
    public ResponseEntity<byte[]> downloadLicense(@RequestParam("appId") long appId,
            @RequestParam("partnerId") long partnerId) {

        String content = appLicenseRelatedService.generateLicenseContent(appId, partnerId);

        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Disposition", "attchement;filename=license.lcs");
        HttpStatus statusCode = HttpStatus.OK;
        ResponseEntity<byte[]> entity = new ResponseEntity<byte[]>(content.getBytes(), headers, statusCode);
        return entity;
    }

    /**
     * 导入设备id作为批量设置license授权方式
     *
     * @param name
     * @param appId
     * @param file
     * @param response
     */
    @RequestMapping("/app/leadingInDeviceID.do")
    @ResponseBody
    public ApiResponse leadingInDeviceID(@RequestParam("name") String name, @RequestParam("appId") long appId,
            @RequestParam("unusedAmount") long unusedAmount,
            @RequestParam("partnerId") long partnerId,
            @RequestParam("file") MultipartFile file, HttpServletResponse response) throws ServiceException {
        log.info("开始上传》》上传文件是：" + name);

        String uuid = UUID.randomUUID().toString();
        //文件保存磁盘路径
        //String tempFolder = "D:\\qrcode" + File.separator + "qrCode" + appId;
        String tempFolder = storageConfig.getUploadAuthCode() + File.separator + "qrCode" + appId;
        FileUtil.createFolderIfNotExist(tempFolder);
        String fileName = "qrcode" + appId + "_" + uuid + "." + "xls";
        String tempFilePath = tempFolder + File.separator + fileName;
        if (!file.isEmpty()) {
            try {
                byte[] bytes = file.getBytes();
                BufferedOutputStream stream = new BufferedOutputStream(new FileOutputStream(new File(tempFilePath)));
                stream.write(bytes);
                stream.close();
            } catch (Exception e) {
                log.error("save excel error:" + name);
                return ApiResponse.creatFail(Base.ERROR, "保存excel失败");
            } finally {

            }
        }
        int i = qrCodeRelatedService.saveDeviceIdToLicense(appId, partnerId, getAdminSession().getId(), unusedAmount,
                tempFilePath, fileName);

        AdminSession session = getAdminSession();
        taskExecutor.execute(() -> {
            try {
                StatisticsLicensePO po = new StatisticsLicensePO();
                po.setPartnerId(partnerId);
                po.setAdminId(session.getId());
                po.setAppId(appId);
                po.setNumber(((long) i));
                statisticsLicenseService.saveChangeNumber(po);
            } catch (Exception e) {
                log.info("记录授权数量操作失败,", e);
            }
        });

        return ApiResponse.creatSuccess();
    }

    /**
     * 更新license数量
     *
     * @param appId
     * @param amount
     * @param partnerId
     * @param authNum
     */
    @RequestMapping("/app/updatelicenseamount.do")
    @ResponseBody
    public ApiResponse updateLicenseAmount(
            @RequestParam("appId") long appId,
            @RequestParam("amount") int amount,
            @RequestParam("partnerId") long partnerId,
            @RequestParam("authNum") int authNum,
            @RequestParam("limitDays") int limitDays,
            @RequestParam("payment") BigDecimal payment,
            @RequestParam("authType") Integer authType,
            @RequestParam("paymentValue") Integer paymentValue,
            @RequestParam("desc") String desc
    ) throws ServiceException {

        appLicenseRelatedService.updateLicenseAmount(appId, amount, partnerId, authNum);
        AdminSession adminSession = getAdminSession();
        try {
            /* Sprint8 授权记录 */

            int licensingType;
            switch (authType){
                case 1:  licensingType = LicensingPO.QR_CODE_ADD; break;
                case 0: licensingType = LicensingPO.LICENSE_ADD; break;
                /* case 2: licensingType = LicensingPO.LICENSE_IMPORT; break; 不在这个方法实现 */
                default:throw new IllegalArgumentException();
            }
            LicensingPO licensingPO = LicensingPO.builder()
                    .partnerId(partnerId)
                    .recDate(LocalDate.now())
                    .amount(amount)
                    .adminId(adminSession.getId())
                    .appId(appId)
                    .licensingType(licensingType)
                    .id(null)
                    .createTime(null)
                    .build();
            licensingRecordService.recordLicensing(licensingPO);
        }catch (Exception e){
            log.error("LicensingRecord异常",e);
        }
        //1 QRCode授权 0 为license授权 2 为设备和license绑定
        if (authType == 1) {
            long resultNum = 0;
            try {
                resultNum = qrCodeRelatedService
                        .createNewQrCodeDownloadRecord(appId, amount, limitDays, payment, paymentValue);
            } catch (ServiceException e) {
                log.warn("createNewQrCodeDownloadRecord 抛出serviceException{}",e);
                appLicenseRelatedService.updateLicenseAmount(appId, -amount, partnerId, authNum);
                return ApiResponse.creatFail(Base.ERROR, "该应用无未下载授权码", "");
            }
            if (resultNum < 0) {
                appLicenseRelatedService.updateLicenseAmount(appId, -(int) resultNum, partnerId, authNum);
            }
            boolean compare = payment.compareTo(new BigDecimal(-1)) == 0;
            if (resultNum != -1 && !compare) {
                GoodsVO goodsVO = new GoodsVO();
                goodsVO.setName("授权码");
                goodsVO.setPrice(payment);
                //设置商品类型 1 为QRCode 2 为license  0为其他
                goodsVO.setType(1);
                goodsVO.setDesc(desc);
                goodsVO.setActualGoods(resultNum);
                goodsVO.setValue(paymentValue);
                //在商品信息的表结构中生成一条商品信息
                goodsService.createGoods(goodsVO);
            }
        } else if(authType == 0) {
            // 更新所有已经激活过的机器的tis_app_license_active表的数据
            long result = appLicenseRelatedService.updateLicenseHavingRenewal(appId,limitDays,payment,paymentValue);
            //判断支付金额是都为-1 -1说明米有支付延期功能
            boolean compare = payment.compareTo(new BigDecimal(-1)) == 0;
            if(limitDays != -1 && !compare){
                GoodsVO goodsVO = new GoodsVO();
                goodsVO.setName("license");
                goodsVO.setPrice(payment);
                goodsVO.setType(2);
                goodsVO.setDesc(desc);
                goodsVO.setActualGoods(result);
                goodsVO.setValue(paymentValue);
                goodsService.createGoods(goodsVO);
            }
        }

        taskExecutor.execute(() -> {
            try {
                cache.updateWarnAdmin(appId, partnerId);
                StatisticsLicensePO po = new StatisticsLicensePO();
                po.setPartnerId(partnerId);
                po.setAdminId(adminSession.getId());
                po.setAppId(appId);
                po.setNumber(((long) amount));
                statisticsLicenseService.saveChangeNumber(po);
            } catch (ServiceException e) {
                log.info("更新授权数量预警失败,", e);
            }
        });
        return ApiResponse.creatSuccess();
    }
}

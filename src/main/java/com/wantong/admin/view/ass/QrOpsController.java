package com.wantong.admin.view.ass;

import com.alibaba.dubbo.config.annotation.Reference;
import com.wantong.admin.view.BaseController;
import com.wantong.admin.domain.vo.ActiveMachineVO;
import com.wantong.admin.domain.vo.QrCodeOpRecordVO;
import com.wantong.common.exception.ServiceException;
import com.wantong.common.model.Pagination;
import com.wantong.common.redis.RedisDao;
import com.wantong.common.response.ApiResponse;
import com.wantong.common.response.ResponseCode.Parameter;
import com.wantong.common.utils.DateUtils;
import com.wantong.config.domain.dto.app.QrCodeOpRecordDTO;
import com.wantong.config.domain.po.app.MachineQrCodePO;
import com.wantong.config.domain.po.app.QrCodePO;
import com.wantong.config.domain.vo.app.PartnerVO;
import com.wantong.config.service.app.IAppLicenseRelatedService;
import com.wantong.config.service.app.IPartnerRelatedService;
import com.wantong.config.service.app.IQrCodeOpRecordService;
import com.wantong.config.service.app.IQrCodeRelatedService;
import com.wantong.content.service.IPackageService;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.servlet.ModelAndView;


/**
 * 激活码操作
 *
 * @author :
 * @version : 1.0
 * @date :  2019-09-24
 **/
@Slf4j
@Controller
@RequestMapping("/ass")
public class QrOpsController extends BaseController {

    @Autowired
    private RedisDao redisDao;

    @Reference
    private IPackageService packageService;

    @Reference
    private IQrCodeRelatedService qrCodeRelatedService;

    @Reference
    private IAppLicenseRelatedService appLicenseRelatedService;

    @Reference
    private IQrCodeOpRecordService recordService;

    @Reference
    private IPartnerRelatedService partnerRelatedService;


    /**
     * 加载识别图片日志页面
     */

    @RequestMapping("qrOps.do")
    public ModelAndView qrOpsFrame() {
        ModelAndView mv = new ModelAndView("ass/qrOps");

        return mv;
    }

    @RequestMapping("qrCancel.do")
    public ModelAndView qrCancel(@RequestParam(value = "qr", required = false, defaultValue = "") String qr)
            throws ServiceException {
        ModelAndView mv = new ModelAndView("ass/qrCancel");
        mv.addObject("qr", qr);
        QrCodePO code = qr.isEmpty() ? null : qrCodeRelatedService.getQrCodePOByQrCode(qr);
        if (code != null) {
            long pId = appLicenseRelatedService.getPartnerIdByAppId(code.getAppId());
            mv.addObject("qrcode", code);
            List<MachineQrCodePO> machinesPO = appLicenseRelatedService.getActiveMachinesByQrCode(qr);
            List<ActiveMachineVO> machines = new ArrayList<>();
            machinesPO.forEach(m -> {
                ActiveMachineVO activeMachine = new ActiveMachineVO();
                machines.add(activeMachine);
                BeanUtils.copyProperties(m, activeMachine);

                try {
                    activeMachine
                            .setOpenId(appLicenseRelatedService.getUserOpenId(m.getMachineId(), pId, code.getAppId()));
                } catch (ServiceException e) {
                    log.error("获取机器OpenId失败", e);
                    activeMachine.setOpenId("N/A");
                }

                activeMachine.setAppId(code.getAppId());
            });

            mv.addObject("machines", machines);
        }

        return mv;
    }

    @RequestMapping("qrDelete.do")
    @ResponseBody
    public Object qrDelete(@RequestParam(value = "qr", required = false, defaultValue = "") String qr)
            throws ServiceException {
        if (StringUtils.isEmpty(qr) || getAdminSession() == null) {
            return ApiResponse.creatFail(Parameter.ILLEGAL);
        }

        appLicenseRelatedService.deleteQrCode(getAdminSession().getId(), qr);

        return ApiResponse.creatSuccess();
    }

    @RequestMapping("qrDeleteActive.do")
    @ResponseBody
    public Object qrDelete(@RequestParam(value = "id", required = false, defaultValue = "0") long id)
            throws ServiceException {
        if (id <= 0) {
            return ApiResponse.creatFail(Parameter.ILLEGAL);
        }

        appLicenseRelatedService.deleteActiveRecord(id);

        return ApiResponse.creatSuccess();
    }

    @RequestMapping("qrCancelLog.do")
    public ModelAndView qrCancelLog(
            @RequestParam(value = "partnerId", required = false, defaultValue = "0") long partnerId,
            @RequestParam(value = "month", required = false) String month,
            @RequestParam(value = "page", required = false, defaultValue = "1") int page) {
        Date from = null;
        Date to = null;

        if (month != null) {
            Date m = DateUtils.parseDate( month,"yyyy-MM");
            from = DateUtils.firstDayOfMonth(m);
            to = DateUtils.lastDayOfMonth(m);
        }

        Long pId = null;
        if (partnerId > 0) {
            pId = partnerId;
        }
        Pagination pagination = new Pagination();
        pagination.setCurrentPage(page);
        pagination.setPageSize(12);
        QrCodeOpRecordDTO record = recordService.findRecord(pId, pagination, from, to);
        List<QrCodeOpRecordVO> records = new ArrayList<>();
        List<PartnerVO> allPartners = partnerRelatedService.listPartner();
        Map<Long, String> partnerMap = allPartners.stream().collect(Collectors.toMap(PartnerVO::getId, PartnerVO::getName));
        record.getRecords().stream().forEach(e-> {
            QrCodeOpRecordVO recordVO = new QrCodeOpRecordVO();
            BeanUtils.copyProperties(e, recordVO);
            recordVO.setPartner(partnerMap.getOrDefault(recordVO.getPartnerId(), "N/A"));
            records.add(recordVO);
        });

        ModelAndView mv = new ModelAndView("ass/qrCancelLog");
        mv.addObject("partnerId", partnerId);
        mv.addObject("month", month);
        mv.addObject("partners", allPartners);
        mv.addObject("records", records);
        mv.addObject("pagination", record.getPagination());

        return mv;
    }
}

package com.wantong.admin.cache;

import com.alibaba.dubbo.config.annotation.Reference;
import com.wantong.admin.config.AuthorizedQuantityConfig;
import com.wantong.admin.config.EmailConfig;
import com.wantong.common.cache.AbstractCacheHandler;
import com.wantong.common.email.MailBody;
import com.wantong.common.email.MailSendUtil;
import com.wantong.common.exception.ServiceException;
import com.wantong.common.lock.anno.Lock;
import com.wantong.common.lock.anno.LockKey;
import com.wantong.common.lock.bean.LockPolicy;
import com.wantong.config.domain.dto.system.AdminEmailDTO;
import com.wantong.config.domain.dto.system.AuthorWarnDTO;
import com.wantong.config.domain.po.app.AppPO;
import com.wantong.config.domain.po.app.LicenseStatisticPO;
import com.wantong.config.domain.po.system.EmailReceiptPO;
import com.wantong.config.domain.vo.app.AppAuthorizedLessVO;
import com.wantong.config.domain.vo.app.AppLicenseUnusedAmountVO;
import com.wantong.config.service.app.IAppLicenseStatisticService;
import com.wantong.config.service.app.IAppService;
import com.wantong.config.service.system.IEmailReceiptService;
import com.wantong.config.service.system.IUserRelatedService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Component;

import javax.annotation.PostConstruct;
import java.util.*;
import java.util.stream.Collectors;

/**
 * @author cgl
 * @date 2020/3/2
 */
@Component
@RequiredArgsConstructor(onConstructor_ = {@Lazy})
@Slf4j
public class AuthorizedQuantityWarningCache extends AbstractCacheHandler<AppAuthorizedLessVO, String> {

    private static final String KEY = "AUTHORIZED_QUANTITY_WARNING_KEY";

    @Reference
    private IAppLicenseStatisticService appLicenseStatisticService;

    private final ApplicationContext context;

    private final MailSendUtil mailSendUtil;

    private final EmailConfig emailConfig;

    private final PartnerWarnCache cache;

    private final AuthorizedQuantityConfig config;

    private final WanTongWarnFourDayCache warnFourDayCache;

    @Reference
    private IUserRelatedService userRelatedService;

    @Reference
    private IEmailReceiptService emailReceiptService;

    @Reference
    private IAppService appService;

    @PostConstruct
    public void init() {
        log.info("<<<<<<<<<<<授权数量预警缓存>>>>>>>>>>");
        super.init(KEY, String.class, HASH);
        setExpire(-1);
    }

    public boolean canWarn(Long adminId, Long parentId, boolean first) {
        AuthorWarnDTO adminEmail = emailReceiptService.getAdminEmail(adminId);
        if (adminEmail == null) {
            log.info("该管理员:{}无权限收到提醒", adminId);
            return false;
        }
        if (Arrays.asList(adminEmail.getReceiptType().split(",")).contains(String.valueOf(EmailReceiptPO.QR_CODE_SENDING))) {
            log.info("该管理员:{}有权限收到提醒", adminId);
            List<AppLicenseUnusedAmountVO> voList = appLicenseStatisticService.listUnusedAmountLess(parentId);
            log.info("canWarn 合作商:{}下目前所有需要预警的应用:{}", parentId, voList);
            List<String> allWarnAppId = voList.stream().map(AppLicenseUnusedAmountVO::getAppId)
                    .map(String::valueOf).collect(Collectors.toList());
            if (first) {
                if (voList.isEmpty()) {
                    super.deleteField(adminId);
                    return false;
                }
                String s = super.getByField(adminId);
                if (s == null) {
                    log.info("该管理员:{}未设置不提醒应用,将提醒该管理员", adminId);
                    return true;
                }
                List<String> noNoticeAppId = Arrays.asList(s.split(","));
                log.info("该管理员:{}设置的不提醒应用:{}", adminId, noNoticeAppId);
                ArrayList<String> temp = new ArrayList<>(allWarnAppId);
                temp.retainAll(noNoticeAppId);
                log.info("该管理员:{}设置不提醒的应用,与全部要提醒应用的交集为:{}", adminId, temp);
                return allWarnAppId.size() > temp.size();
            } else {
                super.updateField(adminId, String.join(",", allWarnAppId));
                return false;
            }
        } else {
            log.info("该管理员:{}无权限收到提醒----后置", adminId);
            return false;
        }
    }

    @Lock(policy = LockPolicy.BlockLock, lockTime = 3 * 60, keyPrex = "WARN_ADMIN_KEY")
    public void updateWarnAdmin(@LockKey Long appId, Long partnerId) throws ServiceException {
        LicenseStatisticPO po = appLicenseStatisticService.getAppLicenseStaticId(appId);
        Map<Long, List<AdminEmailDTO>> map = userRelatedService.listAdminIdsByPartnerIds(
                Collections.singletonList(partnerId), EmailReceiptPO.QR_CODE_SENDING);
        List<AdminEmailDTO> dtos = map.getOrDefault(partnerId, Collections.emptyList());
        log.info("拥有授权预警权限的管理员:{}", dtos);
        if (po == null) {
            log.info("找不到该appId:{}的授权信息,将删除缓存:{}", appId, dtos);
            dtos.forEach(d -> super.deleteField(d.getAdminId()));
            return;
        }
        log.info("目前该appId:{}的情况:{}", appId, po);
        boolean warn = po.getUnusedAmount() < 500 && (po.getUnusedAmount() + po.getUsedAmount()) >= 500;
        boolean canSend = warn && cache.getByField(appId) == null;
        String appIdStr = String.valueOf(appId);
        log.info("appId:{}的canSend:{}", appId, canSend);
        if (canSend) {
            AppPO app = appService.findByAppId(appId.intValue());
            Map<Long, List<String>> emails = dtos.stream().filter(d -> {
                String s = super.getByField(d.getAdminId());
                if (s == null) {
                    return true;
                }
                List<String> appIds = Arrays.asList(s.split(","));
                return !appIds.contains(appIdStr);
            }).collect(Collectors.toMap(k -> partnerId, v -> new ArrayList<>(Collections.singleton(v.getEmail())),
                    (u, v) -> {
                        u.addAll(v);
                        return u;
                    }));
            log.info("updateWarnAdmin 即将发送应用:{}邮件给管理员:{}", app, emails);
            Map<Long, String> appMap = Collections.singletonMap(appId, app.getName());
            sendMail(partnerId, appMap, emails);
            log.info("updateWarnAdmin 即将发送应用:{}邮件给销售人员:{}", app, config.getQuantityWarning());
            sendMail(0, appMap, Collections.singletonMap(0L, config.getQuantityWarning()));
            cache.updateField(appId, PartnerWarnCache.VIEW_EDITOR);
        } else {
            dtos.parallelStream().forEach(d -> {
                String s = super.getByField(d.getAdminId());
                if (s == null) {
                    return;
                }
                List<String> appIds = new ArrayList<>(Arrays.asList(s.split(",")));
                appIds.remove(appIdStr);
                super.updateField(d.getAdminId(), String.join(",", appIds));
            });
            if (!warn) {
                cache.deleteField(appId);
                warnFourDayCache.deleteField(appId);
            }
        }
    }

    public boolean unusedAmountWarn(Long adminId, Long parentId, boolean insertOrDel, boolean update, Long appId) throws ServiceException {
        List<AppLicenseUnusedAmountVO> voList = appLicenseStatisticService.listUnusedAmountLess(parentId);
        Map<Long, String> map = super.hGetAll(Long.class);
        List<String> collect = voList.stream().map(vo -> String.valueOf(vo.getAppId())).collect(Collectors.toList());
        if (voList.isEmpty()) {
            if (map.containsKey(adminId)) {
                delMembers(adminId);
            }
            cache.deleteField(parentId);
            return false;
        }
        if (insertOrDel) {
            String field = super.getByField(adminId);
            ArrayList<String> temp = new ArrayList<>(collect);
            if (field != null) {
                String[] split = field.split(",");
                List<String> list = Arrays.stream(split).filter(temp::contains).collect(Collectors.toList());
                super.updateField(adminId, String.join(",", list));
                if (split.length > list.size()) {
                    cache.deleteField(parentId);
                }
            }
        } else {
            super.updateField(adminId, String.join(",", collect));
        }
        if (update) {
            String field = super.getByField(adminId);
            ArrayList<String> temp = new ArrayList<>(collect);
            if (field != null) {
                String[] split = field.split(",");
                temp.retainAll(Arrays.asList(split));
                if (temp.size() > split.length) {
                    cache.deleteField(parentId);
                }
            }
            super.updateField(adminId, String.join(",", temp));
            if (cache.getByField(parentId) == null) {
                log.info("无缓存,发送界面调整的邮件");
                cache.updateField(parentId, 2L);
                Map<Long, List<String>> emails = userRelatedService.getPartnerAdminEmails(
                        Collections.singletonList(parentId), EmailReceiptPO.QR_CODE_SENDING);
                emails.forEach((k, v) -> v.addAll(config.getQuantityWarning()));
                voList = appLicenseStatisticService.listUnusedAmountLess(parentId);
                Map<Long, String> allApps = voList.stream()
                        .collect(Collectors.toMap(AppLicenseUnusedAmountVO::getAppId,
                                AppLicenseUnusedAmountVO::getAppName, (u, v) -> u));
                log.info("allApps:{},appId:{}", allApps, appId);
                if (allApps.containsKey(appId)) {
                    sendMail(parentId, Collections.singletonMap(appId, allApps.get(appId)), emails);
                }
            }
        }
        String s = super.getByField(adminId);
        if (s == null) {
            return !collect.isEmpty();
        }
        List<String> strings = Arrays.asList(s.split(","));
        return collect.stream().anyMatch(c -> !strings.contains(c));
    }

    public void delMembers(Long adminId) {
        super.deleteField(adminId);
    }

    public void sendMail(long partnerId, Map<Long, String> apps, Map<Long, List<String>> emails) {
        MailBody mailBody = context.getBean(MailBody.class);
        mailBody.setSubject("授权数量不足通知");
        StringBuilder stringBuilder = new StringBuilder(emailConfig.getEmailContentAuthWarn());
        apps.forEach((k, v) -> stringBuilder.append("\"").append(v).append("\"【ID号").append(k).append("】，"));
        stringBuilder.deleteCharAt(stringBuilder.length() - 1).append("授权数量不足500，为了避免影响您的正常业务发展，请尽快联系玩瞳商务</p>\n")
                .append("<div class=\"box-con\" style='width:100%; overflow:hidden; float:left;'>\n")
                .append("<div class=\"box-pic\" style='width:102%; float:left; margin-bottom:2%;'>");
        mailBody.setContent(stringBuilder.append(emailConfig.getEmailWarnChangeEnd()).toString());
        mailBody.setValidate(true);
        Set<String> strings = new HashSet<>(emails.get(partnerId));
        strings.stream().filter(p -> p != null && !"".equals(p)).forEach(p -> {
            mailBody.setToAddress(p);
            mailSendUtil.sendEmail(mailBody);
            log.info("----------------------->>客户:{}的授权数量预警邮件发送成功:{}", partnerId, p);
        });
    }
}

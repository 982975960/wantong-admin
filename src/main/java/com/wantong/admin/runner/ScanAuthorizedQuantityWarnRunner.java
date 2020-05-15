package com.wantong.admin.runner;

import com.alibaba.dubbo.config.annotation.Reference;
import com.wantong.admin.cache.AuthorizedQuantityWarningCache;
import com.wantong.admin.cache.PartnerWarnCache;
import com.wantong.admin.config.AuthorizedQuantityConfig;
import com.wantong.config.domain.po.system.EmailReceiptPO;
import com.wantong.config.domain.vo.app.AppAuthorizedLessVO;
import com.wantong.config.service.app.IAppLicenseStatisticService;
import com.wantong.config.service.system.IUserRelatedService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * @author cgl
 * @date 2020/3/13
 */
@Component
@Slf4j
@RequiredArgsConstructor
public class ScanAuthorizedQuantityWarnRunner implements ApplicationRunner {

    private final PartnerWarnCache partnerWarnCache;

    private final AuthorizedQuantityWarningCache authorizedQuantityWarningCache;

    private final AuthorizedQuantityConfig config;

    @Reference
    private IAppLicenseStatisticService appLicenseStatisticService;

    @Reference
    private IUserRelatedService userRelatedService;


    @Override
    public void run(ApplicationArguments args) throws Exception {
        List<AppAuthorizedLessVO> voList = appLicenseStatisticService.listAuthorizedLess();
        log.info("启动扫描到的预警voList:{}", voList);
        List<Long> collect = voList.stream().map(AppAuthorizedLessVO::getPartnerId).collect(Collectors.toList());
        log.info("启动扫描到的PartnerId 集合collect:{}", collect);
        Map<Long, List<String>> emails = userRelatedService.getPartnerAdminEmails(collect,
                EmailReceiptPO.QR_CODE_SENDING);
        log.info("启动扫描到有权限的emails:{}", emails);
        Map<Long, String> apps = new HashMap<>(8);
        voList.parallelStream().forEach(vo -> {
            Map<Long, String> partnerApps = vo.getApps().entrySet().stream()
                    .filter(entry -> partnerWarnCache.getByField(entry.getKey()) == null)
                    .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue, (u, v) -> u));
            if (!partnerApps.isEmpty()) {
                log.info("启动扫描到合作商:{}将收到以下应用:{}的授权不足邮件", vo.getPartnerId(), partnerApps);
                authorizedQuantityWarningCache.sendMail(vo.getPartnerId(), partnerApps, emails);
                apps.putAll(partnerApps);
                partnerApps.forEach((k, v) -> partnerWarnCache.updateField(k, PartnerWarnCache.INIT_SCAN));
            }
        });
        if (!apps.isEmpty()) {
            log.info("启动扫描到销售:{}将收到以下应用:{}的授权不足邮件", config.getQuantityWarning(), apps);
            authorizedQuantityWarningCache.sendMail(0, apps, Collections.singletonMap(0L, config.getQuantityWarning()));
        }
    }
}

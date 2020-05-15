package com.wantong.admin.schedule;

import com.alibaba.dubbo.config.annotation.Reference;
import com.wantong.admin.cache.AuthorizedQuantityWarningCache;
import com.wantong.admin.cache.WanTongWarnFourDayCache;
import com.wantong.admin.config.AuthorizedQuantityConfig;
import com.wantong.common.lock.anno.Lock;
import com.wantong.common.lock.bean.LockPolicy;
import com.wantong.config.domain.po.system.EmailReceiptPO;
import com.wantong.config.domain.vo.app.AppAuthorizedLessVO;
import com.wantong.config.service.app.IAppLicenseStatisticService;
import com.wantong.config.service.system.IUserRelatedService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

/**
 * @author cgl
 * @date 2020/3/3
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class AuthorizedQuantityWarningHandler {

    private final AuthorizedQuantityWarningCache cache;

    private final WanTongWarnFourDayCache warnFourDayCache;

    private final AuthorizedQuantityConfig config;

    @Reference
    private IAppLicenseStatisticService appLicenseStatisticService;

    @Reference
    private IUserRelatedService userRelatedService;

    @Scheduled(cron = "0 0 8 * * ?")
    @Lock(policy = LockPolicy.Lock, lockTime = 5 * 60)
    public void run() {
        log.info("开始发送今天要发送邮件的合作商");
        List<AppAuthorizedLessVO> voList = appLicenseStatisticService.listAuthorizedLess();
        log.info("voList:{}", voList);
        List<Long> collect = voList.stream().map(AppAuthorizedLessVO::getPartnerId).collect(Collectors.toList());
        log.info("collect:{}", collect);
        Map<Long, List<String>> emails = userRelatedService.getPartnerAdminEmails(collect,
                EmailReceiptPO.QR_CODE_SENDING);
        log.info("emails:{}", emails);
        Map<Long, String> apps = new ConcurrentHashMap<>(8);
        voList.parallelStream()
                .forEach(v -> {
                    Map<Long, String> partnerApps = new HashMap<>(8);
                    v.getApps().forEach((k, u) -> {
                        Integer day = warnFourDayCache.getByField(k);
                        if (day == null) {
                            day = 2;
                        } else {
                            day = day + 1;
                        }
                        if (day < 4) {
                            warnFourDayCache.updateField(k, day);
                            partnerApps.put(k, u);
                        }
                    });
                    if (!partnerApps.isEmpty()) {
                        log.info("合作商:{}将收到以下应用:{}的授权不足邮件", v.getPartnerId(), partnerApps);
                        cache.sendMail(v.getPartnerId(), partnerApps, emails);
                        apps.putAll(partnerApps);
                    }
                });
        if (!apps.isEmpty()) {
            log.info("销售:{}将收到以下应用:{}的授权不足邮件", config.getQuantityWarning(), apps);
            cache.sendMail(0, apps, Collections.singletonMap(0L, config.getQuantityWarning()));
        }
        try {
            Thread.sleep(120000);
        } catch (InterruptedException e) {
            log.info("睡一下,让一直持有锁,", e);
            Thread.currentThread().interrupt();
        }
        log.info("发送今天要发送邮件的合作商结束");
    }

}

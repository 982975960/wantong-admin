package com.wantong.admin.cache;

import com.wantong.admin.config.AuthorizedQuantityConfig;
import com.wantong.common.cache.AbstractCacheHandler;
import com.wantong.common.lock.anno.Lock;
import com.wantong.common.lock.anno.LockKey;
import com.wantong.common.lock.bean.LockPolicy;
import com.wantong.common.mq.config.AuthorizedQuantityMqConfig;
import com.wantong.config.domain.dto.app.AdminAppDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.rocketmq.spring.annotation.MessageModel;
import org.apache.rocketmq.spring.annotation.RocketMQMessageListener;
import org.apache.rocketmq.spring.core.RocketMQListener;
import org.springframework.stereotype.Component;

import javax.annotation.PostConstruct;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * @author cgl
 * @date 2020/3/11
 */
@Component
@Slf4j
@RequiredArgsConstructor
@RocketMQMessageListener(topic = "${authorizedquantitymq.topic:}", consumerGroup = "${authorizedquantitymq" +
        ".consumerGroup:}",
        messageModel = MessageModel.CLUSTERING)
public class PartnerWarnCache extends AbstractCacheHandler<Void, Long> implements RocketMQListener<AdminAppDTO> {

    private static final String KEY = "PARTNER_WARN_KEY";

    private final AuthorizedQuantityMqConfig quantityMqConfig;

    private final AuthorizedQuantityWarningCache cache;

    private final AuthorizedQuantityConfig config;

    public static final Long INTERFACE_ACTIVATION = 1L;

    public static final Long VIEW_EDITOR = 2L;

    public static final Long INIT_SCAN = 3L;

    @PostConstruct
    public void init() {
        log.info("<<<<<<<<<<<授权数量不足实时预警缓存>>>>>>>>>>");
        super.init(KEY, Long.class, HASH);
        setExpire(-1);
        log.info("<<<<<<<<<<<<<<<<<<消费者:[{}]启动成功>>>>>>>>>>>>>>>>>>>>>>", quantityMqConfig.getConsumerGroup());
    }

    @Override
    @Lock(policy = LockPolicy.BlockLock, lockTime = 3 * 60, keyPrex = "WARN_ADMIN_KEY")
    public void onMessage(@LockKey(keyField = "appId") AdminAppDTO message) {
        log.info("mq收到的消息:{}", message);
        Long field = super.getByField(message.getAppId());
        if (field == null) {
            log.info("无缓存,说明需要发送邮件");
            List<String> emails = new ArrayList<>(Collections.singletonList(message.getEmail()));
            cache.sendMail(message.getPartnerId(), Collections.singletonMap(message.getAppId(), message.getAppName()),
                    Collections.singletonMap(message.getPartnerId(), emails));
            cache.sendMail(0, Collections.singletonMap(message.getAppId(), message.getAppName()),
                    Collections.singletonMap(0L, config.getQuantityWarning()));
            super.updateField(message.getAppId(), INTERFACE_ACTIVATION);
            log.info("发送合作商:{}的邮件完成", message.getPartnerId());
        }
    }
}

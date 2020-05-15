package com.wantong.admin.cache;

import com.wantong.common.cache.AbstractCacheHandler;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import javax.annotation.PostConstruct;

/**
 * @author cgl
 * @date 2020/3/10
 */
@Component
@Slf4j
@RequiredArgsConstructor
public class WanTongWarnFourDayCache extends AbstractCacheHandler<Void, Integer> {

    private static final String KEY = "WANTONG_WARN_FOUR_DAY_KEY";

    @PostConstruct
    public void init() {
        log.info("<<<<<<<<<<<wantong warning预警缓存>>>>>>>>>>");
        super.init(KEY, Integer.class, HASH);
        setExpire(-1);
    }
}

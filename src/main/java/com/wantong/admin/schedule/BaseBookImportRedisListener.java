package com.wantong.admin.schedule;

import com.wantong.admin.business.BaseBookImportBiz;
import com.wantong.admin.constants.Constants;
import com.wantong.common.redis.RedisDao;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

/**
 *
 * 刘建宇 2019/7/16 18:39
 *
 * 单线程，取redis队列中的excel，导入
 *
 * "开机启动"
 */
@Component
@Slf4j
@RequiredArgsConstructor
public class BaseBookImportRedisListener implements ApplicationRunner {

    private final RedisDao redisDao;
    private final BaseBookImportBiz baseBookImportBiz;

    @Override
    public void run(ApplicationArguments args) throws Exception {
        //如果运行在Windows上（即开发的电脑），则不启动redis任务队列的监听，防止debug时任务进不到我本地
        if (System.getProperty("os.name").contains("Windows")){
            return;
        }
        new Thread(()->{
            while (true){
                // 当队列没有元素时，redis.bRPop()方法会阻塞，直到60s超时，或有新入列的元素。所以不会有大量空轮询。
                Long id = redisDao.bRPop(Constants.REDIS_QUEUE_KEY, Long.class);
                //超时后会返回nulL，跳过
                if (id == null){
                    log.info("redis队列超时，while(true){continue} id: "+ id);
                    continue;
                }
                //处理excel
                log.info("redis来了一个任务！！进行EXCEL批量导入！！");
                try {
                    baseBookImportBiz.doTask(id);
                } catch (Exception e) {
                    log.info("异步处理EXCEL批量导入 BUG",e);
                }
            }
        }).start();
    }
}

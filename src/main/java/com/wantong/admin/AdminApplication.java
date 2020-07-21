package com.wantong.admin;

import com.wantong.admin.freemarker.FreemarkerPlugin;
import com.wantong.common.lock.anno.EnableLock;
import com.wantong.common.utils.SpringUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.ComponentScan.Filter;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * AdminApplication
 *
 * @author : Stan
 * @version : 1.0
 * @date :  2018-10-30 16:28
 **/

@SpringBootApplication(exclude = DataSourceAutoConfiguration.class)
@ComponentScan(includeFilters = @Filter(FreemarkerPlugin.class),
        basePackages = {
                "com.wantong.common.redis",
                "com.wantong.admin",
                "com.wantong.common.qiniu",
                "com.wantong.common.session",
                "com.wantong.common.async",
                "com.wantong.common.email",
                "com.wantong.common.utils",
                "com.wantong.common.storage",
                "com.wantong.common.lock",
                "com.wantong.common.webcommon",
                "com.wantong.common.model",
                "com.wantong.common.order",
                "com.wantong.common.cms",
                "com.wantong.common.device",
                "com.wantong.common.mq.config",
                "com.wantong.common.api"
        },basePackageClasses = {SpringUtil.class})
@EnableLock
@EnableScheduling
@EnableFeignClients
public class AdminApplication {

    private static final Logger log = LoggerFactory.getLogger(AdminApplication.class);

    public static void main(String[] args) {
        SpringApplication.run(AdminApplication.class, args);
        log.info("<<<<<<AdminApplication is running......>>>>>>");
        started();
    }

    private static void  started(){
        log.info("\n" +
                "     _          _               _             ____    _                    _                _ \n" +
                "    / \\      __| |  _ __ ___   (_)  _ __     / ___|  | |_    __ _   _ __  | |_    ___    __| |\n" +
                "   / _ \\    / _` | | '_ ` _ \\  | | | '_ \\    \\___ \\  | __|  / _` | | '__| | __|  / _ \\  / _` |\n" +
                "  / ___ \\  | (_| | | | | | | | | | | | | |    ___) | | |_  | (_| | | |    | |_  |  __/ | (_| |\n" +
                " /_/   \\_\\  \\__,_| |_| |_| |_| |_| |_| |_|   |____/   \\__|  \\__,_| |_|     \\__|  \\___|  \\__,_|\n" +
                "                                                                                              "
        );
    }
}

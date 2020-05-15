package com.wantong.admin.view.cms;


import cn.visiontalk.interservice.plainobjects.kpi.ReadingResourceExaminationJob;
import com.alibaba.dubbo.config.annotation.Reference;
import com.wantong.admin.view.BaseController;
import com.wantong.common.exception.ServiceException;
import com.wantong.common.model.JsonWrapper;
import com.wantong.common.response.ApiResponse;
import com.wantong.content.service.IBookInfoService;
import com.wantong.content.service.IPageInfoService;
import lombok.extern.slf4j.Slf4j;
import org.apache.rocketmq.spring.core.RocketMQTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;


@RestController
@RequestMapping("/cms")
@Slf4j
public class BookExamineController extends BaseController {

    @Reference
    private IBookInfoService bookInfoService;

    @Reference
    private IPageInfoService pageInfoService;

    @Value("${mq-topic.kpi-event}")
    private String kpiTopic;

    @Autowired
    private RocketMQTemplate template;

    @RequestMapping("changePageExamine.do")
    public ApiResponse changePageExamine(int pageId, int examine,
            @RequestParam(value = "examineReason", required = false, defaultValue = "") String examineReason)
            throws ServiceException {
        long start = System.currentTimeMillis();
        pageInfoService.changeExamine(examine, pageId, examineReason);
        //kpi统计消息 start
        try {
            ReadingResourceExaminationJob job = new ReadingResourceExaminationJob(
                    getAdminSession().getId(),
                    getAdminSession().getPartnerId(),
                    LocalDateTime.now(),
                    (long) pageId
            );
            JsonWrapper jsonWrapper = JsonWrapper.of(job);
            template.convertAndSend(kpiTopic, jsonWrapper);
            log.debug("kpi统计消息" + jsonWrapper);
        }catch (Throwable throwable){
            log.error("changePageExamine.do KPI消息发送失败",throwable);
        }
        //kpi统计消息 end
        log.info("changePageExamine耗时,time={}", System.currentTimeMillis() - start);
        return ApiResponse.creatSuccess();
    }

    @RequestMapping(value = "publish.do")
    public Object publishBook(@RequestParam(value = "bookId", defaultValue = "0") String bookId) throws Exception {
        bookInfoService.publishBook(Integer.parseInt(bookId));

        return ApiResponse.creatSuccess();
    }

    @RequestMapping(value = "packUp.do")
    public Object packUpBook(@RequestParam(value = "bookId", defaultValue = "0") String bookId) throws Exception {
        bookInfoService.packupPictureBook(Integer.parseInt(bookId), true);

        return ApiResponse.creatSuccess();
    }
}

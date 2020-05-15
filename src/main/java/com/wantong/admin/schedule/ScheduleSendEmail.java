package com.wantong.admin.schedule;

import com.alibaba.dubbo.config.annotation.Reference;
import com.wantong.admin.config.EmailConfig;
import com.wantong.common.email.MailBody;
import com.wantong.common.email.MailSendUtil;
import com.wantong.common.exception.ServiceException;
import com.wantong.common.lock.anno.Lock;
import com.wantong.common.lock.bean.LockPolicy;
import com.wantong.config.domain.po.system.EmailReceiptPO;
import com.wantong.config.service.system.IUserRelatedService;
import com.wantong.content.domain.dto.ChangeBookStateDTO;
import com.wantong.content.domain.po.BookBaseChangeRecordPO;
import com.wantong.content.domain.po.BookChangeStatePO;
import com.wantong.content.domain.vo.BookChangeRecordDetailsVO;
import com.wantong.content.service.BookChangeStateService;
import com.wantong.content.service.IRepoService;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import javax.sql.rowset.serial.SerialException;
import javax.validation.constraints.Email;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.task.AsyncTaskExecutor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * ScheduleSendEmail 定时任务发送客户书本图片修改的内容通知
 *
 * @author : LY
 * @version : 1.0
 * @date :  2019-11-12 10:56
 **/
@Component
@Slf4j
@RequiredArgsConstructor
public class ScheduleSendEmail {

    private static final String KEY = "SEND_BOOK_INFO_TO_USER_EMAIL";

    private static final String EMAIL_CONTENT = "玩瞳书本图片信息有更新，请登录玩瞳后台查看，以便你及时更新书本资源！";

    private static final String EMAIL_SUBJECT = "图像修改推送";

    @Reference
    private IRepoService repoService;

    @Reference
    private IUserRelatedService userRelatedService;

    @Reference
    private BookChangeStateService bookChangeStateService;

    @Autowired
    private MailBody mailBody;

    @Autowired
    private MailSendUtil mailSendUtil;

    @Autowired
    private EmailConfig emailConfig;
    /**
     * 定时任务每天 早上8点发送邮件到用户邮箱
     */
    @Scheduled(cron = "0 0 8 * * ?" )
    @Lock(policy = LockPolicy.Lock,lockTime = 5*60,keyPrex = KEY)
    public void sendEmailTest(){
       List<Long> bookIds =  getRelevantData().stream().distinct().collect(Collectors.toList());

       log.info("--------------------->> 邮件发送完成,发送的邮件的书本Id:{}",bookIds);
        if(!bookIds.isEmpty()){
            //修改书本修改记录的邮件发送状态
            bookChangeStateService.sendFinishChangeSendState(bookIds.stream().distinct().collect(Collectors.toList()), BookChangeStatePO.SEND_FINISH);
        } else {
            log.info("--------------------->> 没有需要去修改发送记录的书本" , bookIds);
        }
    }

    private List<Long> getRelevantData(){
        final List<Long> bookIds = new ArrayList<>();
        try {
            if(repoService == null) {
            log.info("---------------------------->> repoService 服务为null");
            }
            List<ChangeBookStateDTO> list = repoService.getPartnerIdByBookIds();
            if(list.isEmpty()){
                log.info("----------------------------->> getRelevantData 定时发送邮件没有修改记录 无需发送邮件:{}",list.size());
                return bookIds;
            }
            list.stream().forEach(p->{
                log.info("----------------->> 获取的合作商的书本信息,partner:{},books:{}",p.getPartnerId(),p.getBookList().toString());
                bookIds.addAll(p.getBookList().stream().map(e->e.getBooks().getId()).collect(Collectors.toList()));
            });
            Map<Long,List<BookChangeRecordDetailsVO>> bookListMap = list.stream().collect(Collectors.toMap(ChangeBookStateDTO::getPartnerId,ChangeBookStateDTO::getBookList));
            if(!list.isEmpty()){
                //获得所有需要发送邮件的合作商Id
                List<Long> ids = list.stream().map(p->Long.valueOf(p.getPartnerId())).collect(Collectors.toList());
                //获得所有需要发邮件的用户的eamils
                Map<Long,List<String>> emails = userRelatedService.getPartnerAdminEmails(ids, EmailReceiptPO.IMAGE_CHANGE);
                log.info(emails.toString());
                if(!emails.isEmpty()){
                    for (Map.Entry<Long,List<String>> entry: emails.entrySet()){
                        List<BookChangeRecordDetailsVO> detailsVOS = bookListMap.get(entry.getKey());
//                        发送邮件
                        sendEmail( detailsVOS.stream().distinct().collect(Collectors.toList()), entry.getValue());
                        log.info("---------------->> bookIds:{},emails:{}",detailsVOS.stream().distinct().collect(Collectors.toList()).toString(),entry.getValue(),entry.getValue().toString());
                    }
                }
            }

        }catch (ServiceException ex){
            log.error("-------------------------------------->> 定时发送邮件发生异常",ex);
            return new ArrayList<>();
        }
        return bookIds;
    }
    private void sendEmail(List<BookChangeRecordDetailsVO> list,List<String> emails){
        log.info("--------------------- >>邮箱:{},书本列表:{}",emails.toString(),list.toString());

        mailBody.setSubject(EMAIL_SUBJECT);
        StringBuilder sb = new StringBuilder();
        sb.append(emailConfig.getEmailContentBookChangeStart());
        for (int i=0; i<list.size(); i++ ){
            BookChangeRecordDetailsVO vo = list.get(i);
            if(i >= 10){
                break;
            }
            sb.append(
                    "<dl style='float:left;max-width:356px; width:356px; margin-right:1%; margin-top:1.3%; box-sizing: border-box; height:111px;background: #f6f7fb;'><dt style='width:100%; height:109px; width:109px; overflow:hidden;float:left;'><img style='width:100%;height:109px;'  src="
                            + vo.getThumbnailCoverImage()
                            + " /></dt><dd style='float: left;width:54%;height:109px;padding-left:10px; line-height: 21px; position:relative;'><h3 style='width:100%; line-height:26px; margin-top:2.5%; float:left; font-size:14px; font-weight:normal; color:#737373; height:26px; overflow:hidden;text-overflow:ellipsis;white-space: nowrap;'>"
                            + vo.getBooks().getName() + "</h3>"
                            + "<span style='width:100%; line-height:18px; color:#b1b2b4; float:left; font-size:12px; height:18px; overflow:hidden;text-overflow:ellipsis;white-space: nowrap;'>ISBN:" + vo.getBooks().getIsbn() + "</span>"
                            + "<span style='width:100%; line-height:18px; color:#b1b2b4; float:left; font-size:12px; height:18px; overflow:hidden;text-overflow:ellipsis;white-space: nowrap;'>作者:" + vo.getBooks().getAuthor() + "</span>"
                            + "<span style='width:100%; line-height:18px; color:#b1b2b4; float:left; font-size:12px; height:18px; overflow:hidden;text-overflow:ellipsis;white-space: nowrap;'>出版社:" + vo.getBooks().getPublisher() + "</span>"
                            + "<span style='width:100%; line-height:18px; color:#b1b2b4; float:left; font-size:12px; height:18px; overflow:hidden;text-overflow:ellipsis;white-space: nowrap;'>所属系列 :" + vo.getBooks().getSeriesTitle() + "</span>"
                            + "</dd></dl>");
        }
        sb.append(emailConfig.getEmailContentBookChangeEnd());
        mailBody.setContent(sb.toString());
        mailBody.setValidate(true);
        emails.forEach(p->{
            if(p != null && !"".equals(p)) {
                mailBody.setToAddress(p);
                mailSendUtil.sendEmail(mailBody);
                log.info("----------------------->> 邮件发送成功:{}", p);
            }
        });
    }

}

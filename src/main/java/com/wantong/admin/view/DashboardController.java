package com.wantong.admin.view;

import com.alibaba.dubbo.config.annotation.Reference;
import com.wantong.admin.config.BrandingConfig;
import com.wantong.admin.config.ServerConfig;
import com.wantong.admin.domain.vo.ConsumeDataVO;
import com.wantong.admin.session.AdminSession;
import com.wantong.admin.session.SubDomain;
import com.wantong.common.exception.ServiceException;
import com.wantong.common.model.Pagination;
import com.wantong.config.domain.dto.system.MessageCenterDTO;
import com.wantong.config.domain.vo.LicenseUsedDataVO;
import com.wantong.config.domain.vo.system.AnnoVO;
import com.wantong.config.domain.vo.system.MessageVO;
import com.wantong.config.service.app.IAppLicenseStatisticService;
import com.wantong.config.service.app.IPartnerRelatedService;
import com.wantong.config.service.role.IRoleRelatedService;
import com.wantong.config.service.system.IAnnoService;
import com.wantong.content.domain.vo.HotBookVO;
import com.wantong.content.service.IBookInfoService;
import com.wantong.record.domain.dto.AbsUserWeekDataDTO;
import com.wantong.record.domain.dto.NetBookDTO;
import com.wantong.record.domain.vo.BookFeedbackVO;
import com.wantong.record.domain.vo.DayIncrNumberVO;
import com.wantong.record.domain.vo.NetBookVO;
import com.wantong.record.service.IStatisticsLicenseService;
import com.wantong.record.service.IStatisticsService;
import com.wantong.record.service.IUserFeedbackService;
import com.wantong.wechat.service.IOrderItemService;
import java.util.LinkedList;
import java.util.List;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.Executor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.servlet.ModelAndView;

/**
 * DashboardController 回跳首页
 *
 * @author : Stan
 * @version : 1.0
 * @date :  2018-10-12 15:19
 **/
@Controller
@Slf4j
public class DashboardController extends BaseController {

    private static final String showActiveUrl = "/app/showActive.do";

    /**
     *     feedback查询
     */
    private static final List<Integer> FEED_STATES = new LinkedList<>();
    private static final BookFeedbackVO BOOK_FEED_BACK_SEARCH_VO = new BookFeedbackVO();

    static {

        int[] bookState = new int[]{0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12};
        for (int i : bookState) {
            FEED_STATES.add(i);
        }

        BOOK_FEED_BACK_SEARCH_VO.setCurrentPage(1);
        BOOK_FEED_BACK_SEARCH_VO.setDayNum(0);
        BOOK_FEED_BACK_SEARCH_VO.setBookStates(FEED_STATES);
    }

    @Autowired
    private ServerConfig serverConfig;

    @Autowired
    private Executor executor;

    @Reference
    private IStatisticsService statisticsService;

    @Reference
    private IBookInfoService brsBookInfoService;

    @Reference
    private IAppLicenseStatisticService licenseStatisticService;

    @Reference
    private IPartnerRelatedService partnerRelatedService;


    @Reference
    private IAnnoService annoService;

    @Reference
    private IUserFeedbackService userFeedbackService;

    @Reference
    private IOrderItemService orderItemService;

    @Reference
    private IRoleRelatedService roleRelatedService;

    @Reference
    private IStatisticsLicenseService statisticsLicenseService;

    @RequestMapping(value = "/")
    public ModelAndView getIndex() throws Exception {
        return getRedirectView(serverConfig.getIndex());
    }

    @RequestMapping(value = "/login")
    public String getLogin() {
        return "system/login";
    }

    @ResponseBody
    @RequestMapping(value = "/test")
    public Object test(int bookId) throws Exception {
        return brsBookInfoService.getPictureBookInfo(bookId, -1);
    }

    @RequestMapping("/system/dashboard.do")
    public ModelAndView handleRequest() throws ServiceException, InterruptedException {
        ModelAndView mv = new ModelAndView();

        //如果是样式模板不需要首页数据则直接放回html模板
        SubDomain subDomainStyle =(SubDomain) request.getSession().getAttribute(BrandingConfig.BRANDING_SUBDOMAINSTYLE);
        if (subDomainStyle != null && BrandingConfig.BRANDING_XUEXI.equals(subDomainStyle.getStyle())) {
            mv.setViewName("frame/dashboard-xuexi");
            return mv;
        }

        AdminSession adminSession = getAdminSession();
        long partnerId = adminSession.getPartnerId();

        CountDownLatch countDownLatch = new CountDownLatch(2);
        List<NetBookVO> netBookVOS = new LinkedList<>();
        List<HotBookVO> bookList = new LinkedList<>();
        List<AnnoVO> annos = new LinkedList<>();
        MessageVO messageVO = new MessageVO();
        Pagination pagination = new Pagination();
        pagination.setCurrentPage(1);
        //6条公告
        pagination.setPageSize(6);
        messageVO.setPagination(pagination);

        executor.execute(() -> {
            try {
                //最新上线，只取8个
                bookList.addAll(brsBookInfoService.lastestBookList(27, 7));
                NetBookDTO netBookDTO = userFeedbackService.getTopFeedBackBooks(partnerId, BOOK_FEED_BACK_SEARCH_VO);
                netBookVOS.addAll(netBookDTO.getNetBookVOS());
            } catch (Exception e) {
                log.error("Exception occurred when get books", e);
            } finally {
                countDownLatch.countDown();
            }
        });

        ConsumeDataVO consumeData = new ConsumeDataVO();
//        ConsumeDataVO yesterdayConsumeData = new ConsumeDataVO();
        executor.execute(() -> {
            try {
                LicenseUsedDataVO licenseUsedData = licenseStatisticService
                        .getUseageData(partnerId == 1L ? 0L : partnerId);
//                long paidUser = orderItemService.countPayUser(partnerId == 1L ? 0L : partnerId);
//                long unpaidUser = licenseUsedData != null ? licenseUsedData.getPayUsed() - paidUser : 0L;
                BeanUtils.copyProperties(licenseUsedData, consumeData);
//                consumeData.setPaidUser(paidUser);
//                consumeData.setUnpaidUser(unpaidUser);

                DayIncrNumberVO vo = partnerId == 1 ? statisticsLicenseService.getAllIncrNumber() :
                        statisticsLicenseService.getIncrNumberByPartnerId(partnerId);
                consumeData.setIncrease(vo.getNumber());

                MessageCenterDTO messageCenterDTO = annoService.messageDates(messageVO);
                //公告
                annos.addAll(messageCenterDTO.getList());
            } catch (Exception e) {
                log.error("Exception occurred when get stats", e);
            } finally {
                countDownLatch.countDown();
            }
        });

        countDownLatch.await();
        //控制客户能否查看其应用已激活和未激活的情况：1.查看  0.不查看
        int showActiveNum = 0;
        if (adminSession.getAuthorizedUrls().contains(showActiveUrl)) {
            showActiveNum = 1;
        }

        //统计数据
        AbsUserWeekDataDTO absData = statisticsService.queryAbsWeekData(partnerId == 1L ? 0L : partnerId);


        mv.addObject("books", bookList);
        mv.addObject("fbData", netBookVOS.size() > 4 ? netBookVOS.subList(0, 4) : netBookVOS);
        mv.addObject("annos", annos);
        mv.addObject("absData", absData);
        mv.addObject("email", adminSession.getEmail());
        mv.addObject("showActiveNum", showActiveNum);
        mv.addObject("consumeData", consumeData);
        mv.setViewName("frame/dashboard");
        return mv;
    }


    @RequestMapping("/system/teachingtools.do")
    @ResponseBody
    public ModelAndView teachingTools() {
        ModelAndView mv = new ModelAndView();
        mv.setViewName("frame/teachingtools");
        return mv;
    }
}

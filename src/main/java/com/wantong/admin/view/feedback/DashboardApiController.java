package com.wantong.admin.view.feedback;

import cn.visiontalk.interservice.interfaces.config.PartnerInfoService;
import cn.visiontalk.interservice.plainobjects.DatePeriod;
import cn.visiontalk.interservice.plainobjects.dto.SimplePartnerDTO;
import com.alibaba.dubbo.config.annotation.Reference;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.wantong.admin.business.DashboardApiBiz;
import com.wantong.admin.session.AdminSession;
import com.wantong.admin.view.BaseController;
import com.wantong.admin.view.StaticPageController;
import com.wantong.common.exception.ServiceException;
import com.wantong.common.response.ApiResponse;
import com.wantong.common.response.ServiceError;
import com.wantong.content.domain.vo.PartnerVO;
import com.wantong.record.domain.dto.UserReadBookDashBoardDTO;
import com.wantong.record.domain.vo.UserBookReadDataVO;
import com.wantong.record.domain.vo.UserReadDataVO;
import com.wantong.record.domain.vo.UserReadSelectVO;
import com.wantong.record.service.IStatisticsReadBookRecordService;
import com.wantong.record.service.UserReadDashboardService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.lang.Nullable;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.NotNull;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 数据报表 restful api
 *
 * @author 刘建宇
 * @date 2019/9/2
 *
 * @see DashboardApiBiz 业务实现
 * @see StaticPageController#dashboard()  page页面
 */
@Slf4j
@RestController
@RequestMapping("/api/feedback/dashboard")
@RequiredArgsConstructor
public class DashboardApiController extends BaseController {

    /**
     * 逻辑实现
     */
    private final DashboardApiBiz dashboardApiBiz;

    @Reference
    private  UserReadDashboardService userReadDashboardService;

    @Reference
    private IStatisticsReadBookRecordService statisticsReadBookRecordService;

    @Reference
    private PartnerInfoService partnerInfoService;

    /**
     * 初始信息
     * @return
     */
    @GetMapping("setup")
    public Object setup(){
        return dashboardApiBiz.setup(getAdminSession());
    }


    /**
     * 报表数据接口
     * @param partnerId
     * @param currentPage
     * @param pageSize
     * @return
     */
    @GetMapping("detail")
    public Object detail(@RequestParam @NotNull Long partnerId,
                         @RequestParam @NotNull Integer currentPage,
                         @RequestParam @NotNull Integer pageSize,
                         @Nullable String minDate,
                         @Nullable String maxDate){
        DatePeriod period = null;
        try {
            period = DatePeriod.parse(minDate, maxDate);
        }catch (Exception e){
            log.info("数据报表日期参数有误, {}, {}" , minDate, maxDate);
            period = null;
        }
        return dashboardApiBiz.detail(partnerId, currentPage, pageSize, getAdminSession(), period);
    }

    /**
     * excel导出
     * @param partnerId
     * @param tableName
     * @return
     * @throws Exception
     */
    @GetMapping("export")
    public Object export(@RequestParam @NotNull Long partnerId,
                         @RequestParam @NotEmpty String tableName,
                         @RequestParam @NotEmpty String partnerName,
                         @Nullable String minDate,
                         @Nullable String maxDate) throws Exception{
        DatePeriod period = null;
        try {
            period = DatePeriod.parse(minDate, maxDate);
        }catch (Exception e){
            log.info("数据报表日期参数有误, {}, {}" , minDate, maxDate);
            period = null;
        }
        return dashboardApiBiz.export(partnerId, tableName, getAdminSession(), partnerName, period);
    }

    @RequestMapping("partners.do")
    public ApiResponse partnersRead() throws ServiceException {
        AdminSession adminSession = getAdminSession();
        if(adminSession == null){
            throw new ServiceException(ServiceError.creatFail("请先登录后台"));
        }
        long partnerId = adminSession.getPartnerId();
        List<PartnerVO> optionalPartnerList;
        if(partnerId == 1){
            List<SimplePartnerDTO> p1 = partnerInfoService.listReadSimplePartnerByPartnerType(null);
            optionalPartnerList = p1
                    .stream()
                    .map(e->new PartnerVO(e.getId(),e.getName()))
                    .collect(Collectors.toList());
            optionalPartnerList.add(0,new PartnerVO(0L, "全部客户"));
        } else {
            optionalPartnerList = Collections.singletonList(new PartnerVO(partnerId, adminSession.getPartnerName()));
        }

        return ApiResponse.creatSuccess(optionalPartnerList);
    }

    @RequestMapping("getAllData.do")
    public ApiResponse getAllData(@Valid @ModelAttribute UserReadSelectVO selectVO) throws ServiceException {
        return ApiResponse.creatSuccess(userReadDashboardService.getUserReadData(selectVO));
    }

    @RequestMapping("getReadData.do")
    public ApiResponse getReadData(@Valid @ModelAttribute UserReadDataVO userReadDataVO) throws ServiceException{
        return ApiResponse.creatSuccess(userReadDashboardService.getUserReadResultData(userReadDataVO));
    }

    @RequestMapping("getReadBookData")
    @ResponseBody
    public Object readBookData(@Valid @ModelAttribute UserBookReadDataVO userBookReadDataVO) throws ServiceException{
        return getData(userBookReadDataVO);
    }

    private Map<String,Object> getData(UserBookReadDataVO userBookReadDataVO){
        Map<String,Object> obj = new HashMap<>();
        UserReadBookDashBoardDTO userReadBookDashBoardDTO = null;
        try {
            userReadBookDashBoardDTO = statisticsReadBookRecordService.getUserReadBookDashboard(userBookReadDataVO);
        }catch (ServiceException e){
            obj.put("code",1);
            obj.put("msg",e.getMessage());
            obj.put("count",0);
            obj.put("data",null);
        }

        obj.put("code",0);
        obj.put("msg","ok");
        obj.put("count",userReadBookDashBoardDTO.getPagination().getTotalRecord());
        obj.put("data",userReadBookDashBoardDTO.getReadData());
        return obj;
    }

}

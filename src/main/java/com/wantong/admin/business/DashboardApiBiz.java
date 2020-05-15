package com.wantong.admin.business;

import cn.visiontalk.interservice.interfaces.config.PartnerInfoService;
import cn.visiontalk.interservice.interfaces.record.DashboardDataService;
import cn.visiontalk.interservice.plainobjects.DatePeriod;
import cn.visiontalk.interservice.plainobjects.dto.DashboardDTO;
import com.alibaba.dubbo.config.annotation.Reference;
import com.google.common.collect.ImmutableMap;
import com.google.common.collect.Lists;
import com.google.common.io.Files;
import com.wantong.admin.constants.TableHeads;
import com.wantong.admin.domain.dto.DownloadResponse;
import com.wantong.admin.domain.dto.StatisticsDTO;
import com.wantong.admin.constants.Constants;
import com.wantong.admin.session.AdminSession;
import com.wantong.admin.view.StaticPageController;
import com.wantong.admin.view.feedback.DashboardApiController;
import com.wantong.common.model.Pagination;
import com.wantong.common.response.ApiResponse;
import com.wantong.common.response.ResponseCode;
import com.wantong.common.storage.StorageConfig;
import com.wantong.common.utils.ExcelUtil;
import com.wantong.content.domain.vo.PartnerVO;
import com.wantong.record.domain.po.StatisticsPO;
import com.wantong.record.service.IStatisticsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.io.File;
import java.io.FileInputStream;
import java.text.DecimalFormat;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 数据报表前端业务实现
 * @author :  刘建宇
 * @date :  2019/9/2
 *
 * @see DashboardApiController restful api
 * @see StaticPageController#dashboard()  page页面
 */
@Component
@Slf4j
@RequiredArgsConstructor
public class DashboardApiBiz {

    @Reference
    private PartnerInfoService partnerInfoService;

    @Reference
    private IStatisticsService statisticsService;

    @Reference
    private DashboardDataService dashboardDataService;

    private final StorageConfig storageConfig;

    /**
     * 初始化数据, 返回可控 id & name
     * @param adminSession Session
     * @return ApiResponse
     */
    public Object setup(AdminSession adminSession){
        List<PartnerVO> optionalPartnerList;
        long partnerId = adminSession.getPartnerId();
        String partnerName = adminSession.getPartnerName();
        if (partnerId==1){
            //玩瞳
            optionalPartnerList = partnerInfoService.listAllSimplePartner()
                    .stream()
                    .map(e-> new PartnerVO(e.getId(), e.getName()))
                    .collect(Collectors.toList());
            optionalPartnerList.add(0,new PartnerVO(0L, "全部客户"));
        }else {
            //合作商
            optionalPartnerList = Collections.singletonList(new PartnerVO(partnerId, partnerName));
        }
        DatePeriod dateBound = statisticsService.statisticsDateBound(null);
        Map<String, Object> map = ImmutableMap.of(
                "optionalPartnerList", optionalPartnerList,
                "sessionPartner", new PartnerVO(partnerId, partnerName),
                "dateBound",dateBound
        );
        return ApiResponse.creatSuccess(map);
    }

    /**
     * 具体统计数据 api
     * @param partnerId 请求查看的目标客户id ,0代表全部
     * @param currentPage 分页
     * @param pageSize 分页
     * @param adminSession Session
     * @return
     */
    public Object detail(Long partnerId,
                         Integer currentPage,
                         Integer pageSize,
                         AdminSession adminSession, DatePeriod period){
        if (partnerId == 0 && adminSession.getPartnerId() != 1){
            //0为全部客户，玩瞳才能看
            return ApiResponse.creatFail(ResponseCode.Parameter.ILLEGAL);
        }

        cn.visiontalk.interservice.plainobjects.PageResult<DashboardDTO> list =
                dashboardDataService.list(
                        partnerId,
                        period,
                new cn.visiontalk.interservice.plainobjects.Pagination(
                        currentPage, pageSize, 0
                ));
        List<StatisticsDTO> collect = list.getResult().stream()
                .map(StatisticsPO::fromDTO)
                .map(StatisticsDTO::new)
                .collect(Collectors.toList());
        return ApiResponse.creatSuccess(
                new cn.visiontalk.interservice.plainobjects.PageResult<>(collect, list.getPagination())
        );
    }

    /**
     * 导出excel api
     * @param partnerId 请求查看的目标客户id ,0代表全部
     * @param tableName 表名
     * @param adminSession session
     * @return 下载文件
     * @throws Exception io
     */
    public Object export( Long partnerId,
                          String tableName,
                          AdminSession adminSession,
                          String partnerName,
                          DatePeriod period) throws Exception{
        if (partnerId == 0 && adminSession.getPartnerId() != 1){
            //0为全部客户，玩瞳才能看
            return ApiResponse.creatFail(ResponseCode.Parameter.ILLEGAL);
        }
        //获取数据 start
        Pagination pagination = new Pagination();
        pagination.setCurrentPage(1);
        pagination.setPageSize(Integer.MAX_VALUE);
        List<StatisticsPO> pagedStatisticsPo =
                dashboardDataService.list(
                        partnerId,
                        period,
                        null).getResult().stream()
                        .map(StatisticsPO::fromDTO)
                        .collect(Collectors.toList());
        //获取数据 end
        //获取excel byte[]
        byte[] bytes = getExcel(tableName, pagedStatisticsPo);
        //http head 设置
        partnerName = "全部客户".equals(partnerName)? "" : partnerName+"-";
        if (adminSession.getPartnerId() != 1){
            partnerName = "";
        }
        String fileName = partnerName+tableName+ Constants.DOT_XLSX;

        return DownloadResponse.of(bytes, fileName);
    }

    private static final DecimalFormat decimalFormat =
            new DecimalFormat("0.00%");
    /**
     * 获取excel byte[]
     * @param tableName 表名
     * @param data 数据转excel
     */
    private byte[] getExcel(String tableName, List<StatisticsPO> data) throws Exception {
        List<List<Object>> excelData = new ArrayList<>();
        for (StatisticsPO po : data) {
            List<Object> row = Lists.newArrayList(po.getRecordDate());
            switch (tableName){
                case "新增用户" :
                    row.add(po.getUserNewCount());
                    break;
                case "活跃用户" :
                    int userActiveCount = po.getUserActiveCount();
                    row.add(userActiveCount);
                    row.add(decimalFormat.format(
                            po.getUserNewCount() * 1.0
                                    /
                                    (userActiveCount==0 ? 1 : userActiveCount))
                    );
                    break;
                case "累计用户数" :
                    row.add(po.getUserTotalCount());
                    break;
                case "启动次数" :
                    row.add(po.getCountStartApp());
                    break;
                case "阅读总量" :
                    row.add(po.getReadTimesCount());
                    row.add(po.getReadBookCount());
                    row.add(toTimeString(po.getReadTime()));
                    break;
                case "阅读均量" :
                    int userNumber = po.getUserActiveCount();
                    userNumber = userNumber == 0 ? 1 : userNumber;
                    row.add(po.getReadTimesCount()/userNumber);
                    row.add(po.getReadBookCount()/userNumber);
                    row.add(toTimeString(po.getReadTime()/userNumber));
                    break;
                case "拥有书本总数" :
                    row.add(po.getCountBook());
                    break;
                case "活跃用户留存" :
                    row = new ArrayList<>(new StatisticsDTO(po).getRetentionRateActive());
                    break;
                case "新增用户留存" :
                    row = new ArrayList<>(new StatisticsDTO(po).getRetentionRateNew());
                    break;
                default: throw new UnsupportedOperationException();
            }
            excelData.add(row);
        }
        String filepath = storageConfig.getBookImportReport()+"/dashboard/"+UUID.randomUUID().toString()+Constants.DOT_XLSX;
        File file = new File(filepath);
        Files.createParentDirs(file);
        ExcelUtil.writeBySimple(filepath, excelData, TableHeads.MAP.get(tableName));
        byte[] bytes = new byte[(int)file.length()];
        FileInputStream stream = new FileInputStream(file);
        stream.read(bytes);
        stream.close();
        return bytes;
    }

    /**
     * 秒数转00:00:00格式
     */
    private String toTimeString(long seconds){
        String h = "" + (int)(seconds / (60 * 60));
        String m = "" + (int)((seconds % (60 * 60)) /60);
        String s = "" + (int)(seconds % 60);
        if (h.length() == 1){
            h = "0"+h;
        }
        if (m.length() == 1){
            m = "0"+m;
        }
        if (s.length() == 1){
            s = "0"+s;
        }
        return h+":"+m+":"+s ;
    }

}

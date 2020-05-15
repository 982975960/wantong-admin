package com.wantong.admin.domain.dto;

import com.google.common.collect.Lists;
import com.wantong.record.domain.po.RetentionRatePO;
import com.wantong.record.domain.po.StatisticsPO;
import lombok.Data;

import java.io.Serializable;
import java.text.DecimalFormat;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

/**
 * @author 刘建宇
 * @date 2019/9/11
 */
@Data
public class StatisticsDTO implements Serializable {
    /**
     * 活跃用户构成
     */
    private Double userActiveComponent;

    /**
     * 平均阅读本数
     */
    private Long avgReadBookCount;
    /**
     * 平均阅读次数
     */
    private Long avgReadTimesCount;
    /**
     * 平均阅读时长
     */
    private Long avgReadTime;

    private Long readBookCount;
    private Long readTimesCount;
    private Long readTime;
    private Integer userActiveCount;
    private Integer userNewCount;
    private Integer userTotalCount;
    private Long countStartApp;
    private Long countBook;
    private Long partnerId;
    private LocalDate recordDate;
    private List<String> retentionRateActive;
    private List<String> retentionRateNew;

    public StatisticsDTO(StatisticsPO po){
        int sub = po.getUserActiveCount()== 0 ? 1 : po.getUserActiveCount();
        this.userActiveComponent = po.getUserNewCount() * 1.00 / sub;
        avgReadBookCount = po.getReadBookCount() / sub;
        avgReadTimesCount = po.getReadTimesCount() / sub;
        avgReadTime = po.getReadTime() / sub;
        readBookCount = po.getReadBookCount();
        readTimesCount = po.getReadTimesCount();
        readTime = po.getReadTime();
        userActiveCount = po.getUserActiveCount();
        userNewCount = po.getUserNewCount();
        userTotalCount = po.getUserTotalCount();
        countStartApp = po.getCountStartApp();
        countBook = po.getCountBook();
        partnerId = po.getPartnerId();
        recordDate = po.getRecordDate();
        //计算留存率
        initRetentionRate(po.getRetentionRate());
    }

    private static final DecimalFormat DECIMAL_FORMAT = new DecimalFormat("0.00%");
    private static final List<Integer> GAPS = Arrays.asList(1,2,3,4,5,6,7,14,30);

    private void initRetentionRate(String json){
        //日期+用户数
        retentionRateActive = Lists.newArrayList(recordDate.toString(), userActiveCount.toString());
        retentionRateNew = Lists.newArrayList(recordDate.toString(), userNewCount.toString());
        List<RetentionRatePO.RetentionRate> retentionRates = RetentionRatePO.fromJson(json).getRetentionRates();
        if (retentionRates.stream().anyMatch(e -> e.getD() == 0)
                && retentionRates.stream().noneMatch(e -> e.getD() == 30)) {
            //d为0是错误数据, 转为30
            retentionRates.stream().filter(e -> e.getD() == 0).findAny()
                    .ifPresent(e -> retentionRates.add(new RetentionRatePO.RetentionRate(30,e.getA(),e.getN())));
            retentionRates.removeIf(e -> e.getD() == 0);
        }
        Map<Integer, String> activeMap = retentionRates.stream().collect(Collectors.toMap(
                RetentionRatePO.RetentionRate::getD,
                rate -> DECIMAL_FORMAT.format( userActiveCount <= 0 ? 0 : (rate.getA() * 1.0 / userActiveCount)),
                (o, n) -> n
                ));
        Map<Integer, String> newMap = retentionRates.stream().collect(Collectors.toMap(
                RetentionRatePO.RetentionRate::getD,
                rate -> DECIMAL_FORMAT.format(userNewCount <= 0 ? 0 : rate.getN() * 1.0/ userNewCount),
                (o, n) -> n
        ));
        //没有统计的设为 N / A
        GAPS.forEach(gap->{
            String d = activeMap.get(gap);
            retentionRateActive.add(d==null ? "N / A" : d);
            String d2 = newMap.get(gap);
            retentionRateNew.add(d2==null ? "N / A" : d2);
        });
    }
}

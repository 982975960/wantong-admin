package com.wantong.admin.constants;

import lombok.Getter;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 数据报表使用
 * @see
 *
 * @author : 刘建宇
 * @version : 1.0
 * @since : 2019/10/25
 */
@Getter
public enum TableHeads {

    /**
     * 每日新增用户
     */
    NEW_USER("新增用户", Arrays.asList("日期", "新增用户")),
    /**
     * 每日活跃用户
     */
    ACTIVE_USER("活跃用户",Arrays.asList("日期", "活跃用户数","活跃构成")),

    /**
     * 每日累计用户数
     */
    CUMULATIVE_NUMBER_OF_USERS("累计用户数",Arrays.asList("日期", "累计用户数")),

    /**
     * 每日启动次数
     */
    START_COUNT("启动次数",Arrays.asList("日期", "启动次数")),

    /**
     * 留存率数据
     */
    RETAINED_USER("留存用户",Arrays.asList("日期", "新增用户留存","活跃用户留存")),
    /**
     * 每日阅读总量
     */
    TOTAL_READING("阅读总量",Arrays.asList("日期", "总阅读次数", "总阅读本数", "总阅读时长")),

    /**
     * 每日阅读均量
     */
    READING_AVERAGE("阅读均量",Arrays.asList("日期", "平均阅读次数", "平均阅读本数", "平均阅读时长")),
    /**
     * 拥有书本总数
     */
    HAVE_THE_TOTAL_NUMBER_OF_BOOKS("拥有书本总数",Arrays.asList("日期", "拥有书本总数")),

    /**
     * 新增用户留存
     */
    ADD_USER_RETENTION("新增用户留存", Arrays.asList("日期","新增用户","1天后","2天后","3天后","4天后","5天后","6天后","7天后","14天后","30天后")),

    /**
     * 活跃用户留存
     */
    ACTIVE_USER_RETENTION("活跃用户留存", Arrays.asList("日期","活跃用户","1天后","2天后","3天后","4天后","5天后","6天后","7天后","14天后","30天后"));

    public static Map<String, List<String>> MAP = new HashMap<>(TableHeads.values().length);

    static {
        for (TableHeads value : TableHeads.values()) {
            MAP.put(value.getTableName(), value.getHead());
        }
    }

    TableHeads(String tableName, List<String> head) {
        this.tableName = tableName;
        this.head = head;
    }

    /**
     * 名字
     */
    private String tableName;

    /**
     * 表头
     */
    private List<String> head;
}

package com.wantong.admin.constants;

/**
 * @author : 刘建宇
 * @version : 1
 * @date : 2019/8/2 14:15
 */
public enum CheckResult {
    /**
     * 表头检查通过
     */
    HEAD_PASS,
    /**
     * 数据检查通过
     */
    DATA_PASS,
    /**
     * 其他原因非法
     */
    EXCEL_HEAD_INVALIDATE,
    /**
     * 表头列顺序错误
     */
    EXCEL_HEAD_WRONG_ORDER,
    /**
     * 缺失表头
     */
    EXCEL_HEAD_MISSING,
    /**
     * ISBN数据错误
     */
    ISBN_NOT_NUMBER,
    /**
     * 必填项未填
     */
    MISSING_REQUIRED_FILED
}

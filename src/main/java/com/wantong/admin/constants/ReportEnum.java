package com.wantong.admin.constants;

/**
 * 刘建宇 2019/7/5 11:32
 * 导入报告
 */
public enum ReportEnum {
    创建成功,

    缺少ISBN,
    缺少绘本名称,
    缺少作者名称,
    缺少出版社,

    ISBN必须为纯数字,
    ISBN必须为13位或10位,
    ISBN数字必须以978开头,

    ISBN与绘本名称有重复行,

    书本已经创建过了,

    书本编号非法
}

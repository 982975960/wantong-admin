package com.wantong.admin.domain;

import com.alibaba.excel.annotation.ExcelProperty;
import com.alibaba.excel.metadata.BaseRowModel;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * @author : 刘建宇
 * @version : 1
 * @date : 2019/8/2 12:28
 */
@EqualsAndHashCode(callSuper = true)
@Data
public class ExcelMapper extends BaseRowModel {

    @ExcelProperty(value = "ISBN",index = 0) private String isbn;
    @ExcelProperty(value = "书本名称",index = 1) private String name;
    @ExcelProperty(value = "作者名称",index = 2) private String author;
    @ExcelProperty(value = "出版社",index = 3) private String publisher;
    @ExcelProperty(value = "所属系列",index = 4) private String seriesTitle;

}

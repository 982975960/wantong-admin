package com.wantong.admin.domain;

import com.alibaba.excel.annotation.ExcelProperty;
import com.alibaba.excel.metadata.BaseRowModel;
import com.wantong.admin.constants.ReportEnum;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Objects;

/**
 * 刘建宇 2019/7/5 11:28
 * excel-object-mapping
 *
 * 传给service时转为PO
 */
@Getter @Setter @ToString
public class BookInfoModel extends BaseRowModel {
    /** 编号,对数据库无用的excel列 */
    @ExcelProperty(value = "编号",index = 0) private String bianhao;
    @ExcelProperty(value = "所属系列",index = 1) private String series_title;
    @ExcelProperty(value = "绘本名称",index = 2) private String name;
    @ExcelProperty(value = "ISBN",index = 3) private String isbn;
    @ExcelProperty(value = "作者名称",index = 4) private String author;
    @ExcelProperty(value = "出版社",index = 5) private String publisher;
    /** 出版方,对数据库无用的excel列 */
    @ExcelProperty(value = "出版方",index = 6) private String chubanfang;
    /** 推荐理由,对数据库无用的excel列 */
    @ExcelProperty(value = "推荐理由",index = 7) private String tuijianliyou;
    /** 所属体系,对数据库无用的excel列 */
    @ExcelProperty(value = "所属体系",index = 8) private String suoshutixi;
    @ExcelProperty(value = "版次",index = 9) private String edition;
   /* @ExcelProperty(value = "书本编号",index = 10) private String inner_id;*/
    @ExcelProperty(value = "书本简介",index = 10) private String description;
    @ExcelProperty(value = "结果报告",index = 11)private List<ReportEnum> reports =
            new ArrayListOverrideToString<>();

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }
        BookInfoModel that = (BookInfoModel) o;
        return Objects.equals(isbn, that.isbn) &&
                Objects.equals(name, that.name);
    }

    @Override
    public int hashCode() {
        return Objects.hash(isbn, name);
    }

    /**
     * 去掉toString的[]
     * @param <E>
     */
    public static class ArrayListOverrideToString<E> extends ArrayList{
        @Override
        public String toString() {
            Iterator<E> it = iterator();
            if (! it.hasNext()) {
                return "";
            }

            StringBuilder sb = new StringBuilder();
            for (;;) {
                E e = it.next();
                sb.append(e == this ? "(this Collection)" : e);
                if (! it.hasNext()) {
                    return sb.toString();
                }
                sb.append(',').append(' ');
            }
        }
    }


}

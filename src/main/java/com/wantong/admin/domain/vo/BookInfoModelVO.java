package com.wantong.admin.domain.vo;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class BookInfoModelVO {

    private String number;

    private long bookId;

    private String bookName;

    private String isbn;

    private String author;

    private String series_title;

    private String state;

    private String time;

    private String label;
}

package com.wantong.admin.domain.dto;

import com.wantong.content.domain.dto.BookDTO;
import lombok.Data;

/**
 * @author : 刘建宇
 * @version : 1
 * @date : 2019/8/27 16:17
 */
@Data
public class BookWithStateDTO extends BookDTO {
    public BookWithStateDTO(BookDTO bookDTO, boolean onCopy) {
        setBookEditable(bookDTO.isBookEditable());
        setBookBaseInfo(bookDTO.getBookBaseInfo());
        setBookInfo(bookDTO.getBookInfo());
        this.onCopy = onCopy;
    }
    private boolean onCopy;
}

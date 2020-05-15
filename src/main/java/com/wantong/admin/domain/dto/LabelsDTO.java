package com.wantong.admin.domain.dto;

import com.wantong.content.domain.dto.BookLableNameDTO;
import lombok.Data;

import java.io.Serializable;
import java.util.List;

@Data
public class LabelsDTO implements Serializable {
    private List<BookLableNameDTO> wtLabels;
    private List<BookLableNameDTO> partnerLabels;
}

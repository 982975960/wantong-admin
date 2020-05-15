package com.wantong.admin.domain.vo;

import lombok.Builder;
import lombok.Data;

import java.io.Serializable;
@Data
@Builder
public class K12ResDataVO implements Serializable {
    private String tempFilePath;
    private String decryptPath;
    private String tempFolder;
    private Long bookId;
    private Integer repoId;
    private Integer flag;
}

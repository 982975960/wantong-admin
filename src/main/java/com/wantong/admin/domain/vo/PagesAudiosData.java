package com.wantong.admin.domain.vo;

import java.util.List;
import lombok.Data;

/**
 * PagesAudiosData
 *
 * @author : win7
 * @version : 1.0
 * @date :  2019-07-11 15:58
 **/
@Data
public class PagesAudiosData {
    /**
     * 书页的ID
     * **/
    private long pageId;

    private List<AudioFilesData> audioFilesNameAndMatchText;

    private String prefix;
}

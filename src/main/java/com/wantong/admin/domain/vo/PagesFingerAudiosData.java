package com.wantong.admin.domain.vo;

import java.io.Serializable;
import java.util.List;
import lombok.Data;

/**
 * PagesFingerAudiosData
 *
 * @author : win7
 * @version : 1.0
 * @date :  2019-09-17 11:45
 **/
@Data
public class PagesFingerAudiosData implements Serializable {

    private long fingerId;
    /**
     * 现在一个手指点读区域只有一条语音 后期 可能会有多条
     */
    private List<AudioFilesData> audioFilesNameAndMatchText;
}

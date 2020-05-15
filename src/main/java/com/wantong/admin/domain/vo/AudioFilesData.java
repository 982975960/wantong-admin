package com.wantong.admin.domain.vo;

import lombok.Data;

/**
 * AudioFilesData
 *
 * @author : win7
 * @version : 1.0
 * @date :  2019-07-10 10:24
 **/
@Data
public class AudioFilesData {

    /**
     * matchText
     * **/
    private String matchText;

    /**
     * fileName 文件名称
     * **/
    private String tempFileName;
    /**
     * 上传时的文件名称
     * **/
    private String clientFileName;

    /**
     * 获得每天音频的时长
     * **/
    private float duration;
}

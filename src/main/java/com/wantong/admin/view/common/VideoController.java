package com.wantong.admin.view.common;

import com.wantong.common.response.ApiResponse;
import com.wantong.common.response.ResponseCode.Base;
import com.wantong.common.storage.StorageConfig;
import com.wantong.common.utils.VideoUtil;
import java.io.File;
import java.io.IOException;
import java.util.UUID;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

/**
 * VideoController
 *
 * @author : win7
 * @version : 1.0
 * @date :  2019-08-27 18:49
 **/
@Controller
@Slf4j
public class VideoController {

    @Autowired
    private StorageConfig storageConfig;

    @RequestMapping("grabVideoImage.do")
    @ResponseBody
    private ApiResponse grabVideoImage(@RequestParam("videoFileName") String videoFileName) throws IOException {

        if(videoFileName.isEmpty()){
            return ApiResponse.creatFail(Base.ERROR,"文件名为空");
        }
        String tempFolder = storageConfig.getUploadTemp();

        String tempFilePath = tempFolder+ File.separator + videoFileName;

        File tempFile = new File(tempFilePath);

        if(!tempFile.exists()){
            return ApiResponse.creatFail(Base.ERROR,"文件不存在");
        }
        String tempImageFileName = UUID.randomUUID().toString()+".jpg";

        String tempImagePath = tempFolder+File.separator+tempImageFileName;
        try {
            VideoUtil.fetchPic(tempFile,tempImagePath);
        }catch (Exception e){
            log.error("截取视频的方法发生错误");

            return ApiResponse.creatFail(Base.ERROR,"获取视频截图错误");
        }

        return ApiResponse.creatSuccess(tempImageFileName);
    }

}

package com.wantong.admin.view.card;

import static org.apache.commons.io.IOUtils.toByteArray;

import com.alibaba.dubbo.config.annotation.Reference;
import com.wantong.admin.view.BaseController;
import com.wantong.common.exception.ServiceException;
import com.wantong.common.response.ApiResponse;
import com.wantong.common.response.ResponseCode.Base;
import com.wantong.common.response.ServiceError;
import com.wantong.common.storage.StorageConfig;
import com.wantong.common.utils.file.FileHeadUtils;
import com.wantong.nativeservice.service.ICardImageService;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.servlet.ModelAndView;

@Slf4j
@Controller
@RequestMapping("/card")
public class CardRecognitionCheckController extends BaseController {

    @Autowired
    private StorageConfig storageConfig;

    @Reference
    private ICardImageService cardImageService;

    @RequestMapping("recognitionCheck.do")
    public ModelAndView recognitionCheck() {
        ModelAndView mv = new ModelAndView();
        mv.setViewName("/card/recognitionCheck");
        return mv;
    }


    @RequestMapping("startCheck.do")
    @ResponseBody
    public ApiResponse startCheck(@RequestParam("coverImage") String coverImage,
            @RequestParam("width") Integer width, @RequestParam("height") Integer height)
            throws ServiceException, IOException {
        log.info("start recognitionCheck.coverImage:{},width:{},height:{}", coverImage, width, height);
        if (coverImage == null || coverImage == "") {

            return ApiResponse.creatFail(Base.ERROR, "未上传图片", "");
        }
        //临时文件地址
        String filePath = storageConfig.getUploadTemp() + File.separator + coverImage;
        Integer result = null;
        try (InputStream in = new FileInputStream(filePath)) {
            byte[] data = toByteArray(in);
            //判断是否为jpg,不是则提示错误
            byte[] b = new byte[4];
            System.arraycopy(data, 0, b, 0, 4);
            String hexType = FileHeadUtils.bytesToHexString(b).toUpperCase();
            if (!hexType.contains("FFD8FF")) {
                log.info("source img path:{},type:{}", filePath, hexType);
                throw new ServiceException(ServiceError.creatFail(Base.API_DISABLE, "封面图片格式不对,请记录该书本数据."));
            }
            result = cardImageService.checkCardQuality(data, height, width);
        }
        if (result != null) {
            //0: 不适合识别; 1: 适合识别 1; 负数: 一些错误
            if (result == 0) {
                return ApiResponse.creatSuccess("不可识别", "");
            } else if (result == 1) {
                return ApiResponse.creatSuccess("可识别", "");
            } else if (result < 0) {
                return ApiResponse.creatSuccess("图像设计不满足识别要求", "");
            }
        }

        return ApiResponse.creatSuccess();
    }
}

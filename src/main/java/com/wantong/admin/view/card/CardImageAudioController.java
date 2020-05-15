package com.wantong.admin.view.card;

import com.alibaba.dubbo.config.annotation.Reference;
import com.wantong.admin.view.BaseController;
import com.wantong.common.exception.ServiceException;
import com.wantong.common.response.ApiResponse;
import com.wantong.content.service.ITTSService;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

/**
 * 卡片的音频合成
 * @author ly
 * @version 1.0
 */
@Controller
@RequestMapping("/card")
public class CardImageAudioController extends BaseController {

    @Reference
    private ITTSService ittsService;

    @RequestMapping("compoundAudio.do")
    @ResponseBody
    public ApiResponse compoundAudio(int voiceId, String text) throws ServiceException{

        String fileName = ittsService.compoundDbTTS(text,voiceId);
        return ApiResponse.creatSuccess(fileName);
    }
}

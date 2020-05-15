package com.wantong.admin.view.cms;

import com.alibaba.dubbo.config.annotation.Reference;
import com.wantong.admin.tts.TTSServiceImpl;
import com.wantong.common.exception.ServiceException;
import com.wantong.common.response.ApiResponse;
import com.wantong.common.response.ServiceError;
import com.wantong.content.domain.DbTtsConvertContent;
import com.wantong.content.domain.dto.DbTtsConvertDTO;
import com.wantong.content.domain.vo.BookAudioTtsRolesVO;
import com.wantong.content.service.IAudioTtsRolesService;
import com.wantong.content.service.ITTSService;
import java.util.HashMap;
import java.util.Map;
import javax.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
public class TTSController {

    @Autowired
    private TTSServiceImpl ttsService;

    @Reference
    private IAudioTtsRolesService audioTtsRolesManangerService;

    @Reference
    private ITTSService ittsService;

    @RequestMapping("/cms/ttsConvert.do")
    @ResponseBody
    public ApiResponse ttsConvert(String text, int tone, boolean useIntelligenceTTS, HttpServletResponse response)
            throws ServiceException {
        Map<String, Object> data = new HashMap<String, Object>();

        String fileName = ttsService.ttsConvert(text, tone, useIntelligenceTTS);

        data.put("tempFileName", fileName);

        return ApiResponse.creatSuccess(data);
    }

    @RequestMapping("cms/DBttsConvert.do")
    @ResponseBody
    public ApiResponse DBttsConvert(String text, int tone, HttpServletResponse response) throws ServiceException {
        Map<String, Object> data = new HashMap<>();
        String fileName = ttsService.ttsDataBaker(text, tone);
        data.put("tempFileName", fileName);

        return ApiResponse.creatSuccess(data);
    }

    /**
     * 试听标贝语音
     *
     * @param voiceId  角色id
     * @param text     内容
     * @param fileName 文件名
     * @param response
     */
    @RequestMapping("/cms/auditionConvert.do")
    @ResponseBody
    public ApiResponse auditionDbTtsConvert(int voiceId, String text, String fileName, HttpServletResponse response)
            throws ServiceException {
        Map<String, Object> data = new HashMap<>();
        if (voiceId == 0) {
            throw new ServiceException(ServiceError.creatFail("角色ID不能为空"));
        }
        if (text == null || "".equals(text)) {
            throw new ServiceException(ServiceError.creatFail("试听不能为空"));
        }
        DbTtsConvertContent convertContent = new DbTtsConvertContent();
        convertContent.setText(text);
        convertContent.setVoiceId(voiceId);
        convertContent.setFile(fileName);
        DbTtsConvertDTO dbTtsConvertDTO = ittsService.dbTtsConvert(convertContent);
        data.put("tempFileName", dbTtsConvertDTO.getFileName());

        return ApiResponse.creatSuccess(data);
    }

    /**
     * 整条语音合成
     *
     * @param convertContent 合成内容
     */
    @RequestMapping("/cms/convertMultiroleVoice.do")
    @ResponseBody
    public ApiResponse convertMultiroleVoice(@RequestBody DbTtsConvertContent convertContent) throws ServiceException {

        DbTtsConvertDTO dbTtsConvertDTO = ittsService.dbTtsConvert(convertContent);

        return ApiResponse.creatSuccess(dbTtsConvertDTO);
    }

    /**
     * 保存书本的TTS角色信息
     *
     * @param bookAudioTtsRolesVO
     */
    @RequestMapping("cms/saveBookAudioRoles.do")
    @ResponseBody
    public ApiResponse saveBookAudioRoles(@RequestBody BookAudioTtsRolesVO bookAudioTtsRolesVO)
            throws ServiceException {
        if (bookAudioTtsRolesVO == null) {
            throw new ServiceException(ServiceError.creatFail("BookAudioTtsRolesVO is Null"));
        }
        Map<String, Object> result = audioTtsRolesManangerService.saveCreateBookAudioTtsRole(bookAudioTtsRolesVO);

        return ApiResponse.creatSuccess(result);
    }

    /**
     * 检查批量修改音频文件的任务状态
     *
     * @param taskId
     */
    @RequestMapping("cms/modifyAudioTaskState.do")
    @ResponseBody
    public ApiResponse chenkModifyAudioTaskState(String taskId) {

        return ApiResponse.creatSuccess(audioTtsRolesManangerService.checkChanngeAudioTaskState(taskId));

    }
}

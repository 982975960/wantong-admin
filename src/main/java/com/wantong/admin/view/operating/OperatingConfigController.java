package com.wantong.admin.view.operating;

import com.alibaba.dubbo.config.annotation.Reference;
import com.wantong.admin.view.BaseController;
import com.wantong.common.exception.ServiceException;
import com.wantong.common.response.ApiResponse;
import com.wantong.common.response.ResponseCode.Base;
import com.wantong.common.response.ServiceError;
import com.wantong.config.domain.vo.app.AppOperatingConfigVO;
import com.wantong.config.service.operating.IComonAppOperatingService;
import java.util.Map;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

/**
 * OperatingConfigController
 *
 * @author : win7
 * @version : 1.0
 * @date :  2019-09-04 11:21
 **/
@Controller
@RequestMapping("/operating")
@Slf4j
public class OperatingConfigController extends BaseController {

    @Reference
    private IComonAppOperatingService comonAppOperatingService;

    @RequestMapping("appOperatingConfig.do")
    public String appOperatingConfig(Model model){

        return "operating/appOperatingConfig";
    }

    @RequestMapping("appOperatingConfigManager.do")
    public String appOperatingConfigManager(Model model){
        return "operating/operatingConfigManager";
    }

    @RequestMapping("getCommonAppOperatingConfig.do")
    @ResponseBody
    public ApiResponse getCommonAppOperatingConfig() throws ServiceException {

        AppOperatingConfigVO vo = comonAppOperatingService.getCommonAppOperatingConfig();
        if(vo== null){
            return ApiResponse.creatFail(Base.ERROR,"app没有配置");
        }

        return ApiResponse.creatSuccess(vo);
    }

    @RequestMapping("saveCommonAppOperatingConfig.do")
    @ResponseBody
    public ApiResponse saveCommonAppOperatingConfig(@RequestBody AppOperatingConfigVO vo)throws ServiceException{

        if(vo == null){
            throw new ServiceException(ServiceError.creatFail(Base.ERROR));
        }

        Map<String, Object> reslut = comonAppOperatingService.saveCommonAppOperatingConfig(vo);

        return ApiResponse.creatSuccess(reslut);
    }

    @RequestMapping("checkTaskState.do")
    @ResponseBody
    public ApiResponse checkTaskState(String taskUUID){

        return ApiResponse.creatSuccess(comonAppOperatingService.checkTaskState(taskUUID));
    }

    @RequestMapping("delOperatingConfig.do")
    @ResponseBody
    public ApiResponse delOperatingConfig(@RequestParam("type") int type) throws ServiceException{

        comonAppOperatingService.delCommonAppOperatingConfig(type);

        return ApiResponse.creatSuccess();
    }
}

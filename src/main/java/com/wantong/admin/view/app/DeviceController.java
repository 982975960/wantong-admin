package com.wantong.admin.view.app;

import com.alibaba.dubbo.config.annotation.Reference;
import com.alibaba.fastjson.JSONObject;
import com.wantong.common.device.DeviceConfig;
import com.wantong.common.exception.ServiceException;
import com.wantong.common.model.Pagination;
import com.wantong.common.response.ApiResponse;
import com.wantong.common.response.ResponseCode.Base;
import com.wantong.common.response.ServiceError;
import com.wantong.config.domain.dto.app.DeviceLoginExceptionAndPaginationDTO;
import com.wantong.config.domain.dto.app.ListDevicesDTO;
import com.wantong.config.domain.po.app.DevicePO;
import com.wantong.config.domain.po.app.DeviceParamPO;
import com.wantong.config.domain.vo.BaseQuery;
import com.wantong.config.domain.vo.api.CreateDeviceParamVO;
import com.wantong.config.domain.vo.app.DeviceLoginExceptionVO;
import com.wantong.config.service.app.IDeviceLoginExceptionRecordService;
import com.wantong.config.service.app.IDeviceRelatedService;
import com.wantong.content.domain.vo.WorkOrderBookSearchVO;
import java.net.URLEncoder;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import javax.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.ModelAndView;

/**
 * CreateNewDeviceController 创建新的安卓设备参数配置
 *
 * @author : jsj
 * @version : 1.0
 * @date :  2018-11-13 10:32
 **/
@Controller
@Slf4j
public class DeviceController {

    @Reference
    private IDeviceRelatedService deviceRelatedService;

    @Autowired
    private DeviceConfig deviceConfig;


    /**
     * 创建新的机型配置 vo 创建设备机型vo
     */
    @RequestMapping(value = "/app/createDevice.do", method = RequestMethod.POST)
    @ResponseBody
    public ApiResponse createDevice(@RequestBody CreateDeviceParamVO vo)
            throws ServiceException {
        if (vo.getId() == -1) {
            //创建新机型配置
            deviceRelatedService.createDevice(vo);

        } else {
            //更新机型配置
            deviceRelatedService.updateDevice(vo);
        }

        return ApiResponse.creatSuccess();
    }


    /**
     * 获取机型列表
     *
     * @param request
     */
    @RequestMapping("/app/phoneparm.do")
    @ResponseBody
    public ModelAndView handleRequest(HttpServletRequest request,
            @RequestParam(defaultValue = "1") Integer currentPage,
            @RequestParam(value = "searchText", defaultValue = "") String searchText,
            @RequestParam(value = "examine", defaultValue = "-1") int examine) {

        BaseQuery query = new BaseQuery();
        query.setCurrentPage(currentPage);
        ListDevicesDTO devicesDTO = deviceRelatedService.modelPhoneManager(query, searchText, examine);

        ModelAndView mv = new ModelAndView("/app/mobilePhoneParm");
        mv.addObject("page", devicesDTO.getDeviceListByPage());
        mv.addObject("devicelist", devicesDTO.getDeviceAllParamPOList());
        mv.addObject("examine", examine);
        mv.addObject("searchText", searchText);
        mv.addObject("defaultName", devicesDTO.getDefaultDevice().getModel());

        return mv;
    }


    /**
     * 查询设备名称是否存在
     *
     * @param request
     * @param deviceName
     */
    @RequestMapping(value = "/app/checkDeviceName.do")
    @ResponseBody
    public ApiResponse checkDeviceName(HttpServletRequest request, @RequestParam("model") String deviceName) {

        CreateDeviceParamVO result = deviceRelatedService.getDeviceParamByDeviceName(deviceName);
        if (result == null) {
            return ApiResponse.creatFail(Base.ERROR, "该配置不存在", "");
        }

        Map<String, Object> data = new HashMap<>();
        data.put("deviceId", Long.toString(result.getId()));
        data.put("name", result.getModelname());
        data.put("ref_machine", Long.toString(result.getRef_machineId()));
        data.put("cloudParm", result.getCloudparm());
        data.put("edgeParm", result.getEdgeparm());
        data.put("proParam", result.getProParam());
        data.put("edgeAljParam", result.getEdgeAljParam());
        data.put("fixAljParam", result.getFixAljParam());
        data.put("realImage", result.getRealImage());
        data.put("stencilImage", result.getStencilImage());
        data.put("note", result.getNote());
        data.put("modelOtherName", result.getModelOtherName());
        data.put("frontGap", result.getFrontGap());
        data.put("uploadGap", result.getUploadGap());
        data.put("coverGap", result.getCoverGap());
        data.put("fingerDelay", result.getFingerDelay());
        data.put("handleEdge", result.getHandleEdge());
        data.put("proposeHand", result.getProposeHand());
        data.put("isDefault", false);

        if (result.getId() == deviceConfig.getDefaultId()) {
            //是默认全局配置机型的话添加默认值
            data.put("isDefault", true);
            data.put("fontGapClose", deviceConfig.getFontGapClose());
            data.put("fontGapOpen", deviceConfig.getFontGapOpen());
            data.put("coverGapClose", deviceConfig.getCoverGapClose());
            data.put("coverGapOpen", deviceConfig.getCoverGapOpen());
            data.put("uploadGapClose", deviceConfig.getUploadGapClose());
            data.put("uploadGapOpen", deviceConfig.getUploadGapOpen());
            data.put("fingerDelayClose", deviceConfig.getFingerDelayClose());
            data.put("fingerDelayOpen", deviceConfig.getFingerDelayOpen());
        }

        return ApiResponse.creatSuccess(data);

    }

    @RequestMapping("/image/imageConfig.do")
    @ResponseBody
    public ModelAndView imageConfigManager(HttpServletRequest request) {

        List<DevicePO> devicePOList = deviceRelatedService.imageConfigManager();
        ModelAndView mv = new ModelAndView("/app/imageConfig");
        mv.addObject("list", devicePOList);
        return mv;
    }

    @RequestMapping(value = "/image/saveImageConfigParam.do", method = RequestMethod.POST)
    @ResponseBody
    public ApiResponse saveImageConfigParam(HttpServletRequest request, @RequestParam("deviceId") long deviceId,
            @RequestParam("name") String name, @RequestParam("param") String param, @RequestParam("note") String note)
            throws ServiceException {
        deviceRelatedService.updateImageConfigParam(deviceId, name, param, note);
        return ApiResponse.creatSuccess();
    }

    @RequestMapping(value = "/image/loadImageConfigParam.do")
    @ResponseBody
    public ApiResponse loadImageConfigParam(HttpServletRequest request, @RequestParam("deviceId") long deviceId,
            @RequestParam("name") String name, @RequestParam("note") String note) {
        DeviceParamPO deviceParamPO = deviceRelatedService.loadImageConfigParam(deviceId);
        Map<String, String> data = new HashMap<>();
        data.put("deviceId", Long.toString(deviceId));
        data.put("name", name);
        data.put("configParam", deviceParamPO == null ? "" : deviceParamPO.getParameters());
        data.put("note", note);

        return ApiResponse.creatSuccess(data);
    }

}


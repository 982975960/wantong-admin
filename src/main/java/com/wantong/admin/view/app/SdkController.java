package com.wantong.admin.view.app;

import com.alibaba.dubbo.config.annotation.Reference;
import com.wantong.admin.view.BaseController;
import com.wantong.common.exception.ServiceException;
import com.wantong.common.model.Pagination;
import com.wantong.common.response.ApiResponse;
import com.wantong.common.response.ResponseCode;
import com.wantong.common.storage.StorageConfig;
import com.wantong.common.utils.CommonUtil;
import com.wantong.common.utils.file.FileUtil;
import com.wantong.config.domain.dto.app.SdkVersionDTO;
import com.wantong.config.domain.po.app.SdkTypePO;
import com.wantong.config.domain.po.app.SdkVersionPO;
import com.wantong.config.service.app.ISdkVersionService;
import java.io.BufferedOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.util.Collections;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.ModelAndView;


@Slf4j
@Controller
@RequiredArgsConstructor
public class SdkController extends BaseController {

    @Reference
    private ISdkVersionService sdkVersionService;

    private final StorageConfig storageConfig;

    @RequestMapping("/app/sdkManage.do")
    public ModelAndView sdkManage(){
        //初始化创建sdk的SDK类型下拉框
        //List<SdkTypePO> sdkTypePOS = sdkVersionService.listSdkType();

        ModelAndView mv = new ModelAndView();
        //mv.setViewName("/app/sdkManage");
        mv.setViewName("/app/sdkNewManage");
        //mv.addObject("sdkTypes",sdkTypePOS == null ? Collections.emptyList() : sdkTypePOS);
        return mv;
    }

    @ResponseBody
    @RequestMapping("/app/getSdkVersionAll.do")
    public ApiResponse getSdkVersionAll(){
        List<SdkVersionPO> sdkVersionAll = sdkVersionService.getSdkVersionAll();
        return ApiResponse.creatSuccess(sdkVersionAll == null ? Collections.emptyList() : sdkVersionAll);
    }

   /* @RequestMapping("/app/listSdk.do")
    public ModelAndView listSdk(@RequestParam(value = "sdkType",required = false)String sdkType,
                                @RequestParam(value = "currentPage",defaultValue = "1")Integer currentPage,
                                @RequestParam(value = "platform",defaultValue = "100")Integer platform){
        Pagination pagination = new Pagination();
        pagination.setCurrentPage(currentPage);
        pagination.setPageSize(12);

        SdkVersionDTO sdkVersionDTO = sdkVersionService.listSdk(sdkType,platform,pagination);
        pagination = sdkVersionDTO.getPagination();
        List<SdkVersionPO> sdkVersionPOS = sdkVersionDTO.getSdkVersionPOS();

        //platform由int转为String写死了
        if (sdkVersionPOS !=null && sdkVersionPOS.size() > 0){
            for (SdkVersionPO sdkVersionPO : sdkVersionPOS) {
                if (sdkVersionPO.getPlatform() == 0){
                    sdkVersionPO.setPlatformStr("Android");
                }else if (sdkVersionPO.getPlatform() == 1){
                    sdkVersionPO.setPlatformStr("Linux");
                }else if (sdkVersionPO.getPlatform() == 2){
                    sdkVersionPO.setPlatformStr("IOS");
                }else if (sdkVersionPO.getPlatform() == 3){
                    sdkVersionPO.setPlatformStr("Rtos");
                }
            }
        }

        ModelAndView mv = new ModelAndView();
        mv.setViewName("/app/sdkList");
        mv.addObject("sdks",sdkVersionPOS == null ? Collections.emptyList() : sdkVersionPOS);
        mv.addObject("currentPage",pagination.getCurrentPage());
        mv.addObject("pages",pagination.getPages());
        mv.addObject("pageSize",pagination.getPageSize());
        return mv;
    }*/

    @RequestMapping("/app/listSdk.do")
    public ModelAndView listSdk(@RequestParam(value = "platform",defaultValue = "2")Integer platform){

        SdkVersionPO sdkVersionPO = sdkVersionService.getNewSdk(platform);

        ModelAndView mv = new ModelAndView();
        mv.setViewName("/app/sdkNewList");
        mv.addObject("platform",platform);
        if(null != sdkVersionPO) {
            mv.addObject("sdk", sdkVersionPO);
        }
        return mv;
    }

    @ResponseBody
    @RequestMapping("/app/getSdkType.do")
    public ApiResponse getSdlType(){
        List<SdkTypePO> sdkTypePOS = sdkVersionService.listSdkType();
        if (sdkTypePOS != null && sdkTypePOS.size() > 0){
            return ApiResponse.creatSuccess(sdkTypePOS);
        }else {
            return ApiResponse.creatSuccess(Collections.emptyList());
        }
    }

    @ResponseBody
    @RequestMapping("/app/saveSdkType.do")
    public ApiResponse saveSdkType(@RequestBody List<String> sdkTypes) throws ServiceException {
        sdkVersionService.saveSdkType(sdkTypes);
        return ApiResponse.creatSuccess();
    }

/*    @RequestMapping("/app/sdkUpload.do")
    @ResponseBody
    public ApiResponse sdkUpload(@RequestParam("platform") String platform,
                                 @RequestParam("sdkType") String type,
                                 @RequestParam("sdkVersion") String version,
                                 @RequestParam("description") String description,
                                 @RequestParam("instructions") String instructions,
                                 @RequestParam("file") MultipartFile file) {
        String name = file.getOriginalFilename();
        log.info("开始上传》》上传文件是：" + name);
        try {
            String uuid = UUID.randomUUID().toString();
            //判断是哪个系统
            String tempFolder = "";
            if (!CommonUtil.isWindows()) {
                tempFolder = storageConfig.getUploadTemp();
            } else {
                tempFolder = storageConfig.getUploadTmpWindows();
            }
            FileUtil.createFolderIfNotExist(tempFolder);
            int position = name.lastIndexOf('.');
            String fileExtension = name.substring(position + 1);
            String tempFilePath = tempFolder + File.separator + uuid + "." + fileExtension;
            if (!file.isEmpty()) {
                byte[] bytes = file.getBytes();
                BufferedOutputStream stream = new BufferedOutputStream(new FileOutputStream(new File(tempFilePath)));
                stream.write(bytes);
                stream.close();
            }else {
                return ApiResponse.creatFail(ResponseCode.Base.ERROR, "上传的文件出现错误", "");
            }

            SdkVersionPO sdkVersionPO = SdkVersionPO.builder().platform(Integer.parseInt(platform)).typeId(Integer.parseInt(type))
                    .version(version).description(description).instructions(instructions).fileName(uuid + "." + fileExtension).build();
            sdkVersionService.saveSdkVersion(sdkVersionPO);
            return ApiResponse.creatSuccess();
        } catch (Exception e) {
            log.info("sdkUpload出现错误：",e);
            return ApiResponse.creatFail(ResponseCode.Base.ERROR, e.getMessage(), "");
        }
    }*/

    @RequestMapping("/app/sdkUpload.do")
    @ResponseBody
    public ApiResponse sdkUpload(@RequestParam("platform") String platform,
                                 @RequestParam("sdkVersion") String version,
                                 @RequestParam("description") String description,
                                 @RequestParam("file") MultipartFile file) {
        String name = file.getOriginalFilename();
        log.info("开始上传》》上传文件是：" + name);
        try {
            String uuid = UUID.randomUUID().toString();
            //判断是哪个系统
            String tempFolder = "";
            if (!CommonUtil.isWindows()) {
                tempFolder = storageConfig.getUploadTemp();
            } else {
                tempFolder = storageConfig.getUploadTmpWindows();
            }
            FileUtil.createFolderIfNotExist(tempFolder);
            int position = name.lastIndexOf('.');
            String fileExtension = name.substring(position + 1);
            String tempFilePath = tempFolder + File.separator + uuid + "." + fileExtension;
            if (!file.isEmpty()) {
                byte[] bytes = file.getBytes();
                BufferedOutputStream stream = new BufferedOutputStream(new FileOutputStream(new File(tempFilePath)));
                stream.write(bytes);
                stream.close();
            }else {
                return ApiResponse.creatFail(ResponseCode.Base.ERROR, "上传的文件出现错误", "");
            }

            SdkVersionPO sdkVersionPO = SdkVersionPO.builder().platform(Integer.parseInt(platform))
                    .version(version).description(description).instructions("").fileName(uuid + "." + fileExtension).build();
            sdkVersionService.saveSdkVersion(sdkVersionPO);
            return ApiResponse.creatSuccess();
        } catch (Exception e) {
            log.info("sdkUpload出现错误：",e);
            return ApiResponse.creatFail(ResponseCode.Base.ERROR, e.getMessage(), "");
        }
    }

    @RequestMapping("/app/getHistoryVersion.do")
    public ModelAndView getHistoryVersion(@RequestParam(value = "typeId")Integer typeId,@RequestParam(value = "type")String type,
                                @RequestParam(value = "platform")Integer platform,@RequestParam(value = "platformStr")String platformStr){

        ModelAndView mv = new ModelAndView();
        mv.setViewName("/app/sdkHistory");
        mv.addObject("typeId",typeId);
        mv.addObject("platform",platform);
        mv.addObject("type",type);
        mv.addObject("platformStr",platformStr);
        return mv;
    }

    @RequestMapping("/app/listSdkHistory.do")
    public ModelAndView listSdkHistory(@RequestParam(value = "typeId")Integer typeId,
                                       @RequestParam(value = "platform")Integer platform,
                                       @RequestParam(value = "currentPage",defaultValue = "1")Integer currentPage){

        Pagination pagination = new Pagination();
        pagination.setCurrentPage(currentPage);
        pagination.setPageSize(12);

        SdkVersionDTO sdkVersionDTO = sdkVersionService.listSdkHistory(typeId, platform, pagination);
        List<SdkVersionPO> sdkVersionPOS = sdkVersionDTO.getSdkVersionPOS();
        pagination = sdkVersionDTO.getPagination();

        ModelAndView mv = new ModelAndView();
        mv.setViewName("/app/sdkHistoryList");
        mv.addObject("sdkVersions",sdkVersionPOS == null ? Collections.emptyList() : sdkVersionPOS);
        mv.addObject("currentPage",pagination.getCurrentPage());
        mv.addObject("pages",pagination.getPages());
        mv.addObject("pageSize",pagination.getPageSize());
        return mv;
    }

}

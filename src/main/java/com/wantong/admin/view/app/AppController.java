package com.wantong.admin.view.app;

import com.alibaba.dubbo.config.annotation.Reference;
import com.qiniu.common.QiniuException;
import com.wantong.admin.domain.vo.AppRequestData;
import com.wantong.admin.domain.vo.AppVO;
import com.wantong.admin.domain.vo.CreateAppRepoVO;
import com.wantong.admin.session.AdminSession;
import com.wantong.admin.view.BaseController;
import com.wantong.card.domain.po.AppModelPO;
import com.wantong.card.domain.po.ModelPO;
import com.wantong.card.service.IBrsAppModelService;
import com.wantong.card.service.IBrsModelService;
import com.wantong.common.cms.CmsConfig;
import com.wantong.common.exception.ServiceException;
import com.wantong.common.lock.anno.Lock;
import com.wantong.common.lock.anno.LockKey;
import com.wantong.common.redis.RedisDao;
import com.wantong.common.response.ApiResponse;
import com.wantong.common.response.ResponseCode.Base;
import com.wantong.common.response.ServiceError;
import com.wantong.common.storage.StorageConfig;
import com.wantong.common.utils.CommonUtil;
import com.wantong.common.utils.file.FileUtil;
import com.wantong.common.utils.json.JsonUtil;
import com.wantong.config.domain.dto.app.ToUpdateResourcePageDTO;
import com.wantong.config.domain.dto.app.UpdateAppInfoDTO;
import com.wantong.config.domain.dto.app.ViewPartnerDetailDTO;
import com.wantong.config.domain.po.app.AppPO;
import com.wantong.config.domain.po.app.AppProductSkillPO;
import com.wantong.config.domain.po.app.LicenseStatisticPO;
import com.wantong.config.domain.vo.PageHelperUtil;
import com.wantong.config.domain.vo.app.*;
import com.wantong.config.service.app.*;
import com.wantong.config.service.system.IMenuRelatedService;
import com.wantong.content.domain.po.AppRepoPO;
import com.wantong.content.domain.po.RepoPO;
import com.wantong.content.service.IAppRepoService;
import com.wantong.content.service.IBookInfoService;
import com.wantong.content.service.IModelService;
import com.wantong.content.service.IRepoService;
import java.beans.PropertyDescriptor;
import java.io.BufferedOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.util.*;
import java.util.stream.Collectors;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.io.FileUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.BeanWrapper;
import org.springframework.beans.BeanWrapperImpl;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Controller;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.ui.Model;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.ModelAndView;

//import com.wantong.content.domain.dto.NoSourceBookDTO;

//import static com.wantong.content.domain.vo.TaskStatusVO.ASYNC_DOWNLOAD_NOSOURCEBOOK_KEY;

/**
 * CheckAppNameExistsController  class
 *
 * @author linyao
 * @version 1.0
 * @date 2018.12.14
 */
@Controller
@Slf4j
@RequiredArgsConstructor
public class AppController extends BaseController {

    private Logger logger = LoggerFactory.getLogger(AppController.class);

    @Reference
    private IAppRelatedService appRelatedService;

    private static long MODULE_ID = 1;

    private static final String showActiveUrl = "/app/showActive.do";

    @Reference
    private IMenuRelatedService menuRelatedService;

    @Reference
    private IPartnerRelatedService partnerRelatedService;

    @Reference
    private IRepoService libraryManagerService;

    @Reference
    private IModelService modelService;

    @Reference
    private IAppService appService;

    @Reference
    private IAppRepoService appRepoService;

    @Reference
    private IBrsAppModelService cardAppModelService;

    @Reference
    IAppResourceRelatedService appResourceRelatedService;

    @Reference
    IBookInfoService bookInfoService;

    @Reference
    private IBrsModelService cardModelService;

    private final StorageConfig storageConfig;

    private final RedisDao redisDao;

    private final CmsConfig cmsConfig;

    private final ApplicationContext context;

    @Reference
    private IAppLicenseStatisticService appLicenseStatisticService;

    @Reference
    private IAppOperatingConfigService appOperatingConfigService;

//    @Value("${rtos.repoid}")
//    String rtosRepoId;

    @Value("${personal.repoid}")
    String personalRepoId;

    /**
     * 检查appName是否存在
     *
     * @param name
     * @param partnerId
     */
    @RequestMapping(value = "/app/checkAppNameExists.do", method = RequestMethod.POST)
    @ResponseBody
    public ApiResponse checkAppNameExists(@RequestParam("name") String name,
            @RequestParam("partnerId") long partnerId) {
        ApiResponse apiResponse;
        try {
            appRelatedService.checkAppNameExists(name, partnerId);
            apiResponse = ApiResponse.creatSuccess();
        } catch (ServiceException e) {
            apiResponse = ApiResponse.creatFail(Base.ERROR, e);
        }

        return apiResponse;
    }

    @RequestMapping("/app/appframe.do")
    public String appframe(Model model) {

        model.addAttribute("menu", menuRelatedService.getMenu(MODULE_ID));

        return "app/index";
    }

    /**
     * 创建新app
     */
    @RequestMapping("/app/createApp")
    @ResponseBody
    @Deprecated
    public ApiResponse createnewApp(@RequestBody AppRequestData appRequestData) throws ServiceException {

        long appId = appRelatedService.createNewApp(
                appRequestData.getName(), appRequestData.getAmount(),
                appRequestData.getBillingModel(), appRequestData.getPartnerId(),
                appRequestData.getAppTypeId(), appRequestData.getAuthorityType(),
                appRequestData.getVerifyType(), appRequestData.getPlatform(),
                appRequestData.getPointingRead(), appRequestData.getShareType());

        if (appId <= 0) {
            throw new ServiceException(ServiceError.creatFail(Base.API_ERR, "创建应用出现异常(appId非法)"));
        }

        for (AppRequestData.RepoPriorityMap pri : appRequestData.getRepoPri()) {
            appRepoService.insertOne((int) appId, pri.getRepoId(), pri.getPriority());
        }
        return ApiResponse.creatSuccess();
    }


    private void convertSkillsToAppPO(AppPO appPO, List<Integer> skills) {
        appPO.setPointingRead(skills.contains(AppProductSkillPO.SKILL_POINT) ? 0 : 1);
        appPO.setDubType(skills.contains(AppProductSkillPO.SKILL_DUB) ? 1 : 0);
        appPO.setPhoto(skills.contains(AppProductSkillPO.SKILL_PHOTO) ? 1 : 0);
        appPO.setEvaluation(skills.contains(AppProductSkillPO.SKILL_EVALUATION) ? 1 : 0);
        appPO.setOcr(skills.contains(AppProductSkillPO.SKILL_OCR) ? 1 : 0);
    }

    /**
     * 创建新的app
     *
     * @param appVo 1
     * @return 1
     */
    @RequestMapping("/app/createnew.do")
    @ResponseBody
    @Transactional(rollbackFor = Exception.class)
    public ApiResponse createApp(@Validated({AppVO.BaseGroup.class}) @RequestBody AppVO appVo) throws ServiceException {
        log.info("创建app的请求参数:[{}]", appVo);
        AppPO appPo = new AppPO();
        BeanUtils.copyProperties(appVo, appPo, getNullPropertyNames(appVo));
        List<ModelPO> modelPOS = cardModelService.listModelsByPartnerId(appVo.getPartnerId().longValue());
        if(appVo.getAppTypeId() == 12){
            if(modelPOS.isEmpty()){
                throw new ServiceException(ServiceError.creatFail(Base.ERROR, "用户未创建卡片库"));
            }
        }
        convertSkillsToAppPO(appPo, appVo.getSkills());
        Long appId = appRelatedService.createApp(appPo);
        if (appId == null || appId <= 0) {
            log.info("创建app失败");
            throw new ServiceException(ServiceError.creatFail(Base.ERROR, "创建应用出现异常(appId非法)"));
        }

        appRelatedService
                .updateAppRelateData(appId.intValue(), appPo.getAppTypeId(), appVo.getPlatforms(), appVo.getSkills(),
                        appVo.getFunctions());
        LicenseStatisticPO licenseStatisticPo = new LicenseStatisticPO();
        licenseStatisticPo.setPartnerId(appVo.getPartnerId());
        licenseStatisticPo.setAppId(appId);
        Long licenseStatisticId = appLicenseStatisticService.createLicenseStatistic(licenseStatisticPo);
        if (licenseStatisticId == null || licenseStatisticId <= 0) {
            log.info("创建licenseStatisticPo失败");
            throw new ServiceException(ServiceError.creatFail(Base.ERROR, "创建应用出现异常(licenseStatisticId非法)"));
        }

        if (appVo.getAppTypeId() == 0) {
            //仅绘本自动绑定
            if (appVo.getShareType() == 1) {
                //遗留优先级数据 之后改变shareType无法取消 先不能删除下面代码
                List<CreateAppRepoVO> collect =
                        appVo.getData().stream().filter(vo -> !cmsConfig.getRepoIds().contains(vo.getRepoId()))
                                .collect(Collectors.toList());
                appVo.getData().clear();
                appVo.getData().addAll(collect);
            }
            //取消后端自动绑定 改为前端默认勾选
        }

        //卡片
        if (appVo.getAppTypeId() == 12) {
            List<AppModelPO> list = new ArrayList<>();
            AppModelPO appModelPO = new AppModelPO();
            appModelPO.setAppId(appId.intValue());
            appModelPO.setModelId(modelPOS.get(0).getId().intValue());
            list.add(appModelPO);
            if(!cardAppModelService.saveBatchAppRepo(list)){
                log.info("创建app与卡片资源库关系失败");
                throw new ServiceException(ServiceError.creatFail(Base.ERROR, "创建app与卡片资源库关系失败"));
            }
        } else {
            if (!appRepoService.saveBatchAppRepo(appVo.getData().stream().map(createAppRepoVo -> {
                AppRepoPO appRepoPo = new AppRepoPO();
                BeanUtils.copyProperties(createAppRepoVo, appRepoPo);
                appRepoPo.setAppId(appId);
                return appRepoPo;
            }).collect(Collectors.toList()))) {
                log.info("创建app与资源库关系失败");
                throw new ServiceException(ServiceError.creatFail(Base.ERROR, "创建app与资源库关系失败"));
            }
        }


        log.info("创建应用成功");
        return ApiResponse.creatSuccess(appId);
    }


    /**
     * 获取app列表
     *
     * @param request
     * @param partnerId
     */
    @RequestMapping("/app/listpartners.do")
    public ModelAndView getAppListpartners(HttpServletRequest request,
            @RequestParam(value = "partnerId", defaultValue = "1") long partnerId,
            @RequestParam(defaultValue = "1") Integer currentPage,
            @RequestParam(value = "searchText", defaultValue = "") String searchText) {
        AdminSession adminSession = getAdminSession();
        long sessionPartnerId = adminSession.getPartnerId();
        partnerId = sessionPartnerId == 1 ? partnerId : sessionPartnerId;
        List<PartnerVO> allPartners = partnerRelatedService.listPartner();

        List<PartnerVO> partners = sessionPartnerId == 1 ? allPartners
                : allPartners.stream().filter(partnerVO -> partnerVO.getId() == sessionPartnerId).collect(
                        Collectors.toList());

        AppManagerQuery query = new AppManagerQuery();
        query.setPartnerId(partnerId);
        query.setCurrentPage(currentPage);
        query.setSearchText(searchText);
        ViewPartnerDetailDTO result = partnerRelatedService.viewPartnerDetail(query);
        PageHelperUtil<AppWithStatisticVO> page = result.getPage();
        List<AppTypeVO> appTypeVOS = appService.getAppTypes();
        //增加CMS库
        List<RepoPO> wantongRepoList = libraryManagerService.listReposByPartnerId(cmsConfig.getPartnerId());
        //玩瞳库显示在后面
        wantongRepoList.addAll(libraryManagerService.listReposByPartnerId(1));
        List<RepoPO> wantongListLimited = wantongRepoList;

        List<RepoPO> clientRepoListLimited = new ArrayList<>();
        if (partnerId == 1 || partnerId == cmsConfig.getPartnerId()) {
            //clientRepoListLimited = new ArrayList<>();
        } else {
            List<RepoPO> clientRepoList = libraryManagerService.listReposByPartnerId(partnerId);
            clientRepoListLimited = clientRepoList;
        }

        // 找到合作商想对外的私库，添加到玩瞳的列表里面
        if (!"".equals(personalRepoId) && personalRepoId != null) {
            String[] repoIdStr = personalRepoId.split(",");
            List<String> repoIdList = Arrays.asList(repoIdStr);
            List<RepoPO> repoListLimited = libraryManagerService.listReposByIds(repoIdList);
            for (int i = 0; i < repoListLimited.size(); i++) {
                // 如果入参partnerId  == 私库的partnerId 是自己的库，无需添加。
                if (repoListLimited.get(i).getPartnerId() != partnerId) {
                    wantongListLimited.add(repoListLimited.get(i));
                }
            }
        }

        //控制客户能否查看其应用已激活和未激活的情况：1.查看  0.不查看
        int showActiveNum = 0;
        if (adminSession.getAuthorizedUrls().contains(showActiveUrl)) {
            showActiveNum = 1;
        }

        //卡片私有库
        List<ModelPO> cardRepos = cardModelService.listModelsByPartnerId(partnerId);
        ModelAndView mv = new ModelAndView();
        mv.setViewName("app/partnerdetail");
        mv.addObject("currentPartnerId", partnerId);
        mv.addObject("page", page);
        mv.addObject("partners", partners);
        mv.addObject("appTypes", appTypeVOS);
        mv.addObject("clientRepoList", clientRepoListLimited);
        mv.addObject("wantongRepoList", wantongListLimited);
        mv.addObject("defaultCheckedRepos", cmsConfig.getRepoIds());
        mv.addObject("cardRepoList", cardRepos);
        mv.addObject("appNames", result.getAppNames());
        mv.addObject("searchText", searchText);
        mv.addObject("showActiveNum", showActiveNum);
        return mv;
    }

    /**
     * 上传apk文件，更新apk版本
     *
     * @param name
     * @param version
     * @param summary
     * @param appId
     * @param file
     * @param response
     */
    @RequestMapping("/app/uploadapk.do")
    @ResponseBody
    public ApiResponse uploadApk(@RequestParam("name") String name, @RequestParam("version") String version,
            @RequestParam("lowestVersion") String lowestVersion, @RequestParam("updateAppName") String updateAppName,
            @RequestParam("imageName") String imageName, @RequestParam("introduceType") Integer introduceType,
            @RequestParam("summary") String summary, @RequestParam("appId") long appId,
            @RequestParam("file") MultipartFile file, HttpServletResponse response) {
        logger.info("开始上传》》上传文件是：" + name);
        ApiResponse apiResponse = context.getBean(AppController.class)
                .updateApkLock(name, version, lowestVersion, summary, updateAppName, imageName, introduceType, appId,
                        file);
        if (apiResponse == null) {
            return ApiResponse.creatFail(Base.ERROR, "重复上传，请稍后刷新在试。", "");
        }

        return apiResponse;
    }

    @Lock
    public ApiResponse updateApkLock(String name, String version, String lowestVersion, String summary,
            String updateAppName, String imageName,
            Integer introduceType, @LockKey long appId,
            MultipartFile file) {
        try {
            String uuid = UUID.randomUUID().toString();
            //判断是哪个系统
            String tempFolder = null;
            if (!CommonUtil.isWindows()) {
                tempFolder = storageConfig.getUploadTemp();
            } else {
                tempFolder = storageConfig.getUploadTmpWindows();
            }
            FileUtil.createFolderIfNotExist(tempFolder);
            int position = name.lastIndexOf('.');
            String fileExtension = name.substring(position + 1);
            String tempFileName = uuid + "." + fileExtension;
            String tempFilePath = tempFolder + File.separator + uuid + "." + fileExtension;
            if (!file.isEmpty()) {
                byte[] bytes = file.getBytes();
                BufferedOutputStream stream = new BufferedOutputStream(new FileOutputStream(new File(tempFilePath)));
                stream.write(bytes);
                stream.close();
            }
            log.info("apk上传完成,name={}", file.getOriginalFilename());

            String prefix = "app_package_" + appId + "_" + version + "_";
            String key = null;
            key = FileUtil.upload(tempFilePath, prefix + name);
            log.info("上传apk生成的key,key={}", key);
            //redisDao.remove(cacheKey);

            //app图标从临时目录移至正式目录
            String appImagePath = storageConfig.getAppImagePath();
            String appImageTemp = tempFolder + File.separator + imageName;
            String appImage = appImagePath + File.separator + imageName;
            //存在，说明不是第一次上传，直接保存即可
            if (!new File(appImage).exists()) {
                FileUtil.createFolderIfNotExist(appImagePath);
                log.info("app图标,appImageTemp={},appImage={}", appImageTemp, appImage);
                FileUtils.copyInputStreamToFile(new FileInputStream(appImageTemp), new File(appImage));
                log.info("app图标从临时目录移至正式目录成功");
                FileUtils.forceDelete(new File(appImageTemp));
            }
            appRelatedService
                    .uploadAPK(appId, version, lowestVersion, summary, key, updateAppName, imageName, introduceType);
            return ApiResponse.creatSuccess();
        } catch (Exception e) {
            //redisDao.remove(cacheKey);
            return ApiResponse.creatFail(Base.ERROR, e.getMessage(), "");
        }
    }

    /**
     * 更新app资源
     *
     * @param resourceId
     * @param version
     * @param appVersionId
     * @param summary
     * @param file
     * @param response
     */
    @RequestMapping("/app/uploadresource.do")
    @ResponseBody
    public int uploadAppResource(@RequestParam("resourceId") long resourceId,
            @RequestParam("version") String version,
            @RequestParam("appVersionId") long appVersionId,
            @RequestParam("summary") String summary,
            @RequestParam("file") MultipartFile file,
            HttpServletResponse response) {
        String name = file.getOriginalFilename();
        /**
         *  防止重复提交
         */
        String cacheKey = "resourceVersion_upload_" + resourceId;
        long current = System.currentTimeMillis();
        long value = current + 3600 * 1000;
        boolean setnx = redisDao.setNx(cacheKey, value + "");
        if (setnx) {
            String oldValue = redisDao.get(cacheKey, String.class);
            if (current - Long.valueOf(oldValue) < 0) {
                return 4;
            }
            String getset = redisDao.getSet(cacheKey, value + "");
            if (!oldValue.equals(getset)) {
                return 4;
            }
        }
        try {
            String uuid = UUID.randomUUID().toString();
            //判断是哪个系统
            String tempFolder = null;
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
                try {
                    byte[] bytes = file.getBytes();
                    BufferedOutputStream stream = new BufferedOutputStream(
                            new FileOutputStream(new File(tempFilePath)));
                    stream.write(bytes);
                    stream.close();
                } catch (Exception e) {
                    return 2;
                }
            }

            String prefix = "app_resource_" + resourceId + "_" + version + "_";
            String key = null;
            try {
                key = FileUtil.upload(tempFilePath, prefix + name);
            } catch (QiniuException ex) {
                return 3;
            }
            try {
                appResourceRelatedService.uploadAppResource(resourceId, version, appVersionId, key, summary);
            } catch (Exception e) {
                e.printStackTrace();
                logger.error("error", e);
            }
            redisDao.remove(cacheKey);
            return 1;
        } catch (Exception e) {
            logger.error("error", e);
            redisDao.remove(cacheKey);
            return 5;
        }
    }

    /**
     * 获取资源版本
     *
     * @param resourceId
     * @param version
     */
    @RequestMapping("/app/validateResourceVersion.do")
    @ResponseBody
    public ApiResponse validateResourceVersion(@RequestParam("resourceId") long resourceId,
            @RequestParam("version") String version) {
        ApiResponse apiResponse = new ApiResponse();
        try {
            appResourceRelatedService.validateResourceVersion(resourceId, version);
            apiResponse = ApiResponse.creatSuccess();
        } catch (ServiceException se) {
            apiResponse = ApiResponse.creatFail(Base.ERROR, se.getErrorCode().getMsg());
        }
        return apiResponse;

    }

    /**
     * 创建新的app资源
     *
     * @param appId
     * @param name
     */
    @RequestMapping("/app/createNewResource")
    @ResponseBody
    public ApiResponse createNewResource(@RequestParam("appId") long appId, @RequestParam("name") String name) {

        int result = 0;
        try {
            result = appResourceRelatedService.createResource(appId, name);
        } catch (Exception e) {
            logger.error("ResoureOperationController error", e);
        }
        ApiResponse apiResponse = new ApiResponse();
        switch (result) {
            case 1:
                apiResponse = ApiResponse.creatSuccess();
                break;
            case 2:
                apiResponse = ApiResponse.creatFail(Base.ERROR, "该APP已存在该资源名称，添加失败");
                break;
            case 3:
                apiResponse = ApiResponse.creatFail(Base.ERROR, "资源名为空");
                break;
            default:
                break;
        }
        return apiResponse;
    }

    /**
     * 获取更新资源页信息
     *
     * @param appId
     * @param partnerId
     */
    @RequestMapping("/app/toUpdateResourcePage.do")
    public ModelAndView updateResourcePage(@RequestParam("appId") long appId,
            @RequestParam("partnerId") long partnerId) {

        ToUpdateResourcePageDTO result = appResourceRelatedService.toUpdateResourcePage(appId, partnerId);

        ModelAndView view = new ModelAndView();
        view.setViewName("/app/updateResource");
        view.addObject("partnerVO", result.getPartnerVO());
        view.addObject("appVO", result.getAppVO());
        view.addObject("listAppResource", result.getListAppResourceVO());
        view.addObject("listAppVersion", result.getListAppVersionVO());
        return view;
    }


    @RequestMapping("/app/getAppParam.do")
    @ResponseBody
    public ApiResponse getAppAllParam(HttpServletRequest request, @RequestParam("appId") long appId)
            throws ServiceException {
        AppParamVO appVO = appRelatedService.getAppParam(appId);
        if (appVO == null) {
            return ApiResponse.creatFail(Base.ERROR, "获取App信息失败。", "");
        }

        Map<String, Object> data = new HashMap<>();
        data.put("id", Long.toString(appId));
        data.put("name", appVO.getName());
        data.put("appTypeId", Long.toString(appVO.getAppTypeId()));
        data.put("authorityType", Long.toString(appVO.getAuthorityType()));
        data.put("verifyType", Integer.toString(appVO.getVerifyType()));
        data.put("skills", appRelatedService.getAppSkills((int) appId));
        data.put("platform", Integer.toString(appVO.getPlatform()));
        data.put("platforms", appRelatedService.getAppPlatforms((int) appId));
        data.put("functions", appRelatedService.getAppFunctions((int) appId));
        data.put("shareType", Integer.toString(appVO.getShareType()));
        data.put("appRepoList", appVO.getAppTypeId() == 12
                ? cardAppModelService.listByAppId(appId)
                :appRepoService.listByAppIdNoCache(appId));

        return ApiResponse.creatSuccess(data);
    }

    @RequestMapping("/app/updateApp")
    @ResponseBody
    @Deprecated
    public ApiResponse updateApp(@RequestBody AppRequestData appRequestData) throws ServiceException {

        appRelatedService.updateApp(
                appRequestData.getAppId(), appRequestData.getName(), appRequestData.getAmount(),
                appRequestData.getBillingModel(), appRequestData.getPartnerId(), appRequestData.getAppTypeId(),
                appRequestData.getAuthorityType(), appRequestData.getVerifyType(), appRequestData.getPlatform(),
                appRequestData.getPointingRead(), appRequestData.getShareType()
        );

        Map<Integer, Integer> pr = new HashMap<>();
        for (AppRequestData.RepoPriorityMap repoPri : appRequestData.getRepoPri()) {
            pr.put(repoPri.getRepoId(), repoPri.getPriority());
        }

        appRepoService.updateRepoPriority(appRequestData.getAppId(), pr);

        return ApiResponse.creatSuccess();
    }

    @PostMapping("/app/updateApp.do")
    @Transactional(rollbackFor = Exception.class)
    @ResponseBody
    public ApiResponse updateApp(@Validated({AppVO.UpdateGroup.class}) @RequestBody AppVO appVo)
            throws ServiceException {
        log.info("更新应用请求参数:[{}]", appVo);
        List<ModelPO> modelPOS = cardModelService.listModelsByPartnerId(appVo.getPartnerId().longValue());
        if(appVo.getAppTypeId() == 12){
            if(modelPOS.isEmpty()){
                throw new ServiceException(ServiceError.creatFail(Base.ERROR, "用户未创建卡片库"));
            }
        }
        AppPO db = appService.findByAppId(appVo.getAppId());
        if (db == null) {
            log.info("appId对应的app不存在");
            return ApiResponse.creatFail(Base.ERROR, "appId对应的app不存在");
        }
        if (!appVo.getName().equals(db.getName())) {
            appRelatedService.checkAppNameExists(appVo.getName(), getAdminSession().getPartnerId());
        }
        BeanUtils.copyProperties(appVo, db, getNullPropertyNames(appVo));
        convertSkillsToAppPO(db, appVo.getSkills());
        if (!appRelatedService.updateApp(db)) {
            log.info("更新app失败");
            throw new ServiceException(ServiceError.creatFail(Base.ERROR, "更新app失败"));
        }

        appRelatedService
                .updateAppRelateData((int) db.getId(), db.getAppTypeId(), appVo.getPlatforms(), appVo.getSkills(),
                        appVo.getFunctions());

        //绘本才更新
        if (appVo.getAppTypeId() == 0) {
            if (appVo.getShareType() == 1) {
                //遗留优先级数据 之后改变shareType无法取消 先不能删除下面代码
                List<CreateAppRepoVO> collect =
                        appVo.getData().stream().filter(vo -> !cmsConfig.getRepoIds().contains(vo.getRepoId()))
                                .collect(Collectors.toList());
                appVo.getData().clear();
                appVo.getData().addAll(collect);
            }
            //取消后端自动绑定
        }

        if (appVo.getAppTypeId() == 12) {
            List<AppModelPO> list = new ArrayList<>();
            AppModelPO appModelPO = new AppModelPO();
            appModelPO.setAppId(appVo.getAppId().intValue());
            appModelPO.setModelId(modelPOS.get(0).getId().intValue());
            list.add(appModelPO);

            if(!cardAppModelService.saveBatchAppRepo(list)){
                log.info("更新app与卡片资源库关系失败");
                throw new ServiceException(ServiceError.creatFail(Base.ERROR, "更新app与卡片资源库关系失败"));
            }
        } else {
            if (!appRepoService.updateOrSaveBatch(appVo.getData().stream().map(createAppRepoVo -> {
                AppRepoPO appRepoPo = new AppRepoPO();
                BeanUtils.copyProperties(createAppRepoVo, appRepoPo);
                appRepoPo.setAppId(appVo.getAppId().longValue());
                return appRepoPo;
            }).collect(Collectors.toList()), appVo.getAppId())) {
                log.info("更新appRepo失败");
                throw new ServiceException(ServiceError.creatFail(Base.ERROR, "更新appRepo失败"));
            }
        }
        log.info("更新应用成功");
        return ApiResponse.creatSuccess();
    }

    private static String[] getNullPropertyNames(Object source) {
        final BeanWrapper src = new BeanWrapperImpl(source);
        PropertyDescriptor[] pds = src.getPropertyDescriptors();

        Set<String> emptyNames = new HashSet<>();
        for (PropertyDescriptor pd : pds) {
            Object srcValue = src.getPropertyValue(pd.getName());
            if (srcValue == null) {
                emptyNames.add(pd.getName());
            }
        }
        String[] result = new String[emptyNames.size()];
        return emptyNames.toArray(result);
    }

    @RequestMapping("/app/operatingConfig.do")
    public String openConfigPanel(Model model) {

        return "app/operatingConfiguration";
    }

    @RequestMapping("/app/getOperatingConfigData.do")
    @ResponseBody
    public ApiResponse getOperatingConfigData(@RequestParam("appId") long appId) throws ServiceException {
        AppOperatingConfigVO vo = appOperatingConfigService.getAppOperatingConfig(appId);

        if (vo.getId() == 0) {
            return ApiResponse.creatFail(Base.ERROR, "app没有配置");
        }
        return ApiResponse.creatSuccess(vo);
    }

    @RequestMapping("/app/saveOperatingConfig.do")
    @ResponseBody
    public ApiResponse saveOperatingConfig(@RequestBody AppOperatingConfigVO appOperatingConfigVO)
            throws ServiceException {

        if (appOperatingConfigVO == null) {
            throw new ServiceException(ServiceError.creatFail(Base.ERROR));
        }
        appOperatingConfigService.saveAppOperatingConfig(appOperatingConfigVO);

        return ApiResponse.creatSuccess();
    }


    @RequestMapping("/app/updateiOSLink.do")
    @ResponseBody
    public ApiResponse updateiOSLink(@RequestParam("appId") Long appId, @RequestParam("link") String link) {
        appService.updateIosLink(appId, link);
        return ApiResponse.creatSuccess();
    }


    @RequestMapping("/app/loadiOSLink.do")
    @ResponseBody
    public ApiResponse loadiOSLink(@RequestParam("appId") Long appId) {
        AppPO appPO = appService.findByAppId(appId.intValue());

        return ApiResponse.creatSuccess(appPO.getIoslink());
    }

    /**
     * 下载无资源书本清单列表
     *
     * @param appId
     */
   /* @RequestMapping("/app/downloadNoSourceBook.do")
    public ResponseEntity<byte[]> downloadLicense(@RequestParam("appId") long appId) throws Exception {

        List<NoSourceBookDTO> noSourceBookList = bookInfoService.getNoSourceBookList(appId);
        log.info("无资源书本清单列表长度为：[{}]",noSourceBookList.size());
        String saveFilePath = "D:\\59.xlsx";//excelReportDirectory +File.separator + Constants.NO_SOURCE_BOOK+appId+ Constants.DOT_XLSX;
        OutputStream out = new FileOutputStream(saveFilePath);
        ExcelWriter writer = new ExcelWriter(out, ExcelTypeEnum.XLSX);
        Sheet sheet1 = new Sheet(1, 0);
        sheet1.setSheetName("sheet1");
        List<List<String>> data = new ArrayList<>();
        for (int i = 0; null != noSourceBookList && i < noSourceBookList.size(); i++) {
            List<String> item = new ArrayList<>();
            item.add(noSourceBookList.get(i).getIsbn());
            item.add(noSourceBookList.get(i).getIsbnPlus());
            item.add(noSourceBookList.get(i).getName());
            item.add(noSourceBookList.get(i).getAuthor());
            item.add(noSourceBookList.get(i).getPublisher());
            item.add(noSourceBookList.get(i).getClassification());
            data.add(item);
        }
        List<List<String>> head = new ArrayList<List<String>>();
        List<String> headCoulumn1 = new ArrayList<String>();
        List<String> headCoulumn2 = new ArrayList<String>();
        List<String> headCoulumn3 = new ArrayList<String>();
        List<String> headCoulumn4 = new ArrayList<String>();
        List<String> headCoulumn5 = new ArrayList<String>();
        List<String> headCoulumn6 = new ArrayList<String>();
        headCoulumn1.add("ISBN");
        headCoulumn2.add("附属ISBN码\n" +
                "（如图片和内容相同的两本书，但ISBN不一样，此时会将其中个作为附属ISBN）");
        headCoulumn3.add("书名");
        headCoulumn4.add("作者名");
        headCoulumn5.add("出版社");
        headCoulumn6.add("所属系列");
        head.add(headCoulumn1);
        head.add(headCoulumn2);
        head.add(headCoulumn3);
        head.add(headCoulumn4);
        head.add(headCoulumn5);
        head.add(headCoulumn6);

        Table table = new Table(1);
        table.setHead(head);
        writer.write0(data, sheet1, table);
        writer.finish();
        out.close();

        File file = new File(saveFilePath);
        byte[] bytes = new byte[(int) file.length()];
        new FileInputStream(file).read(bytes);

        String fileName = URLEncoder.encode("图片可识别资源未制作书本清单" + Constants.DOT_XLSX, "utf-8");
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
        headers.setContentDispositionFormData("attachment", fileName);
        headers.setContentLength(bytes.length);

        //删除服务器上的文件
       *//* File tmpPath = new File(saveFilePath);
        FileUtils.forceDelete(tmpPath);*//*
        log.info("下载无资源书本清单列表成功");
        return new ResponseEntity(bytes, headers, HttpStatus.OK);

    }
*/

    /**
     * 异步下载无资源书本清单列表
     * @author: cz
     * @param appId
     */
  /*  @RequestMapping("/app/downloadNoSourceBook.do")
    @ResponseBody
    public ApiResponse asyncDownloadNoSourceBook(long appId) throws ServiceException {
        String taskId = bookInfoService.asyncDownloadNoSourceBook(appId);
        Map<String, String> data = new HashMap<>(1);
        data.put("taskId", taskId);

        return ApiResponse.creatSuccess(data);
    }*/

    /**
     * 检查 无资源书本清单列表是否生成
     *
     * @author: cz
     */
  /*  @RequestMapping("/app/checkNoSourceBook.do")
    @ResponseBody
    public ApiResponse checkNoSourceBook(String taskId) throws ServiceException {
        TaskStatusVO task = redisDao.get(ASYNC_DOWNLOAD_NOSOURCEBOOK_KEY + ":" + taskId, TaskStatusVO.class);
        if (task.isFinish() && task.getError() != null) {
            throw new ServiceException(task.getError());
        }
        return ApiResponse.creatSuccess(task);
    }*/
    @RequestMapping("/app/getUpdateAppInfo.do")
    @ResponseBody
    public ApiResponse getUpdateAppInfo(@RequestParam("appId") Long appId) {
        UpdateAppInfoDTO appInfo = appRelatedService.getAppInfo(appId);

        return ApiResponse.creatSuccess(appInfo);
    }

    /**
     * 控制是否能查看关联信息
     * @param appId
     * @return
     */
    @RequestMapping("/app/appRepoCount.do")
    @ResponseBody
    public ApiResponse appRepoCount(@RequestParam("appId") Long appId) {
        AppParamVO paramVO = appRelatedService.getAppParam(appId);
        if (paramVO == null) {
            return ApiResponse.creatSuccess(0);
        }

        if (paramVO.getAppTypeId() == 12 || paramVO.getAppTypeId() == 11 || paramVO.getAppTypeId() == 10 || paramVO.getAppTypeId() == 0) {
            return ApiResponse.creatSuccess(1);
        }

        return ApiResponse.creatSuccess(0);
    }

    @RequestMapping("/app/lookRelationRepo.do")
    public ModelAndView lookRelationRepo(@RequestParam("appId") Long appId) throws ServiceException {
        AppParamVO appVO = appRelatedService.getAppParam(appId);

        List<Integer> skills = appRelatedService.getAppSkills(appId.intValue());
        ModelAndView mv = new ModelAndView();
        mv.setViewName("app/appRelationRepo");
        mv.addObject("repos", appVO.getAppTypeId()== 12
                ? cardAppModelService.appRelationRepos(appId)
                : appRepoService.appRelationRepos(appId));
        mv.addObject("productType", appVO.getAppTypeId());
        mv.addObject("skills", JsonUtil.toJSONString(skills));

        return mv;
    }
}


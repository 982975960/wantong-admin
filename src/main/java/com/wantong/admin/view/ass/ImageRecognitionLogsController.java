package com.wantong.admin.view.ass;

import static com.wantong.content.service.IPackageService.ASYNC_PACK_UP_KEY;

import cn.hutool.core.bean.BeanUtil;
import com.alibaba.dubbo.config.annotation.Reference;
import com.wantong.admin.domain.vo.AppFilterVO;
import com.wantong.common.exception.ServiceException;
import com.wantong.common.model.PageResult;
import com.wantong.common.model.Pagination;
import com.wantong.common.redis.RedisDao;
import com.wantong.common.response.ApiResponse;
import com.wantong.config.domain.po.app.AppPO;
import com.wantong.config.domain.po.app.ByMachineAppPO;
import com.wantong.config.domain.po.service.RecogLogsFilterPO;
import com.wantong.config.domain.vo.app.PartnerVO;
import com.wantong.config.service.app.IAppService;
import com.wantong.config.service.app.IPartnerRelatedService;
import com.wantong.config.service.ass.IRecogLogsFilterService;
import com.wantong.content.domain.vo.TaskStatusVO;
import com.wantong.content.service.IPackageService;
import com.wantong.mongo.domain.dto.RecognitionLogSearchDTO;
import com.wantong.mongo.domain.po.RecognitionLogPO;
import com.wantong.mongo.domain.po.RecognitionUserPO;

import com.wantong.mongo.service.IRecognitionLogService;

import java.util.*;

import java.util.stream.Collectors;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.servlet.ModelAndView;


/**
 * 图片识别日志
 *
 * @author : ruanjiewei
 * @version : 1.0
 * @date :  2019-09-24
 **/
@Slf4j
@Controller
@RequestMapping("/ass")
public class ImageRecognitionLogsController {

    @Reference
    private IRecognitionLogService logService;

    @Autowired
    private RedisDao redisDao;

    @Reference
    private IPackageService packageService;

    @Reference
    private IPartnerRelatedService partnerRelatedService;

    @Reference
    private IAppService appService;

    @Reference
    private IRecogLogsFilterService logsFilterService;


    /**
     * 加载二级菜单首页
     */
    @RequestMapping("recognitionLogs.do")
    public ModelAndView recognitionLogsFrame() {
        ModelAndView mv = new ModelAndView("ass/recognitionLogsFrame");

        return mv;
    }

    /**
     * 加载日志搜索页面
     */
    @RequestMapping("recognitionLogsSearch.do")
    public ModelAndView recognitionLogsSearch() {
        ModelAndView mv = new ModelAndView("ass/ImageLogsRecognition");
        //填充机型下拉列表
        mv.addObject("devices", getDevices());

        return mv;
    }


    @RequestMapping("changeFilterState.do")
    public @ResponseBody Object changeState(
            @RequestParam(value = "appId", required = false, defaultValue = "0") int appId,
            @RequestParam(value = "state", required = false, defaultValue = "0") int state
    ) {
        if (appId <= 0) {
            return ApiResponse.creatSuccess();
        }

        logsFilterService.changeAppIdState(appId, state);

        return ApiResponse.creatSuccess();
    }

    /**
     * 加载APP筛选页面
     */
    @RequestMapping("recognitionLogsFilter.do")
    public ModelAndView recognitionLogsFilter(
            @RequestParam(value = "partnerId", required = false, defaultValue = "0") long partnerId,
            @RequestParam(value = "appId", required = false, defaultValue = "0") long appId,
            @RequestParam(value = "page", required = false, defaultValue = "1") int page
    ) {
        Long pId = null;
        if (partnerId > 0) {
            pId = partnerId;
        }
        Long aId = null;
        if (appId > 0) {
            aId = appId;
        }

        List<PartnerVO> allPartners = partnerRelatedService.listPartner();
        List<AppPO> allApps = appService.listAppByPartnerId(pId);
        PageResult<ByMachineAppPO> pageResult = appService.listAppByPartnerIdAndAppId(pId, aId, page, 12);
        List<AppFilterVO> filters = new ArrayList<>();
        Long[] appIds = pageResult.getResult().stream().map(ByMachineAppPO::getAppId)
                .collect(Collectors.toSet()).toArray(new Long[0]);
        Map<Long, Integer> appIdStates = logsFilterService.listAppIdsFilters(null, appIds).stream()
                .collect(Collectors.toMap(e -> Long.valueOf(e.getParam()), RecogLogsFilterPO::getState));
        pageResult.getResult().forEach(e -> {
            AppFilterVO filterVO = new AppFilterVO();
            BeanUtil.copyProperties(e, filterVO);
            filterVO.setState(appIdStates.getOrDefault(e.getAppId(), 1));
            filters.add(filterVO);
        });

        ModelAndView mv = new ModelAndView("ass/ImageLogsFilter");
        mv.addObject("partnerId", partnerId);
        mv.addObject("appId", aId);
        mv.addObject("partners", allPartners);
        mv.addObject("apps", allApps);
        mv.addObject("list", filters);
        mv.addObject("pagination", pageResult.getPagination());

        return mv;
    }

    /**
     * 加载页面
     *
     * @param index 是否识别 0为未识别 1为识别
     * @return 返回到已识别页面或未识别页面
     */
    @RequestMapping("specificImagePage.do")
    public ModelAndView specificImagePage(@RequestParam("index") int index) {
        String viewName;
        if (index == 0) {
            //未识别
            viewName = "/ass/seeNoImageLogsList";
        } else {
            //已识别
            viewName = "/ass/showImageLogsList";
        }
        ModelAndView mv = new ModelAndView(viewName);
        mv.setViewName(viewName);
        return mv;
    }

    /**
     * 获得图片明细信息
     *
     * @param recognitionLogSearch 查询条件
     * @param currentPage          分页
     * @param index                是否识别 0为全部 1为识别
     * @return 返回到已识别页面或未识别页面
     */
    @RequestMapping("listLogsDetails.do")
    @ResponseBody
    public Map listLogsDetails(
            @RequestBody RecognitionLogSearchDTO recognitionLogSearch,
            @RequestParam("currentPage") int currentPage,
            @RequestParam("index") int index) {
        int page = 9;
        if (index == 0) {
            recognitionLogSearch.setRecognized(null);
            page = 18;
        } else {
            recognitionLogSearch.setRecognized(true);
        }
        List<RecognitionLogPO> recognitionLogList = null;
        Pagination pagination = new Pagination();
        pagination.setPageSize(page);
        pagination.setCurrentPage(currentPage);
        //获得查询日志结果
        PageResult<RecognitionLogPO> result = logService.queryForPage(recognitionLogSearch, pagination);
        if (result != null) {
            recognitionLogList = result.getResult();
            pagination = result.getPagination();
        }
        Map<String, Object> map = new HashMap<>();
        //封装recognitionLogList
        map.put("recognitionLogList", recognitionLogList != null ? recognitionLogList : Collections.emptyList());
        map.put("currentPage", pagination == null ? 0 : pagination.getCurrentPage());
        map.put("pages", pagination != null ? pagination.getPages() : 0);
        map.put("pageSize", pagination == null ? 0 : pagination.getPageSize());

        return map;
    }

    /**
     * 获得日志分组明细
     *
     * @param recognitionLogSearch 查询条件
     * @param currentPage          页码
     */
    @RequestMapping("showDetailImages.do")
    public ModelAndView showDetailImages(
            @RequestBody RecognitionLogSearchDTO recognitionLogSearch,
            @RequestParam("currentPage") int currentPage) {
        List<RecognitionUserPO> recognitionUsers = null;
        Pagination pagination = new Pagination();
        pagination.setPageSize(12);
        pagination.setCurrentPage(currentPage);

        PageResult<RecognitionUserPO> result =
                logService.queryForUserPage(recognitionLogSearch, pagination);
        if (result != null) {
            recognitionUsers = result.getResult();
            pagination = result.getPagination();
        }

        ModelAndView mv = new ModelAndView("/ass/totalImageLogs");
        mv.addObject("recognitionUsers", recognitionUsers != null ? recognitionUsers : Collections.emptyList());
        mv.addObject("currentPage", pagination != null ? pagination.getCurrentPage() : 0);
        mv.addObject("pages", pagination == null ? 0 : pagination.getPages());
        mv.addObject("pageSize", pagination == null ? 0 : pagination.getPageSize());

        return mv;
    }

    /**
     * 获得所有机型
     *
     * @return 机型列表
     */
    private List<String> getDevices() {
        List<String> list = new ArrayList<>();
        //查询服务，得到机型列表
        if (logService != null) {
            list = logService.queryAllDevices();
        }

        return list;
    }

    /**
     * 异步打包
     */
    @RequestMapping("packUpSample.do")
    @ResponseBody
    public ApiResponse asyncPackUpSample(@RequestParam("ids") String ids) throws ServiceException {
        String[] arr = null;
        List<String> files;
        if (ids != null && ids.contains(",")) {
            arr = ids.split(","); // 用,分割
            files = logService.getAllSamplePath(arr);
        } else {
            files = logService.getAllSamplePath(ids);
        }
        String taskId = packageService.asyncPackUpResource(files.toArray(new String[0]));
        Map<String, String> data = new HashMap<>(1);
        data.put("taskId", taskId);

        return ApiResponse.creatSuccess(data);
    }

    /**
     * 异步打包
     */
    @RequestMapping("packUpAll.do")
    @ResponseBody
    public ApiResponse asyncPackUpAll(@RequestBody RecognitionLogSearchDTO recognitionLogSearch)
            throws ServiceException {
        List<String> files = logService.queryAllSamplePath(recognitionLogSearch);
        String taskId = packageService.asyncPackUpResource(files.toArray(new String[0]));
        Map<String, String> data = new HashMap<>(1);
        data.put("taskId", taskId);

        return ApiResponse.creatSuccess(data);
    }

    /**
     * 获取任务状态
     */
    @RequestMapping("checkPackUpSample.do")
    @ResponseBody
    public ApiResponse checkPackUpResource(String taskId) throws ServiceException {
        TaskStatusVO task = redisDao.get(ASYNC_PACK_UP_KEY + ":" + taskId, TaskStatusVO.class);
        if (task.isFinish() && task.getError() != null) {
            throw new ServiceException(task.getError());
        }

        return ApiResponse.creatSuccess(task);
    }
}

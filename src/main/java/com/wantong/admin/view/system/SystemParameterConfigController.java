package com.wantong.admin.view.system;

import com.alibaba.dubbo.config.annotation.Reference;
import com.alibaba.fastjson.JSONObject;
import com.wantong.admin.config.ThirdPartyConfig;
import com.wantong.admin.session.AdminSession;
import com.wantong.admin.view.BaseController;
import com.wantong.common.exception.ServiceException;
import com.wantong.common.response.ApiResponse;
import com.wantong.common.response.ResponseCode;
import com.wantong.config.domain.po.system.ParentParamPO;
import com.wantong.config.domain.vo.BaseQuery;
import com.wantong.config.domain.vo.PageHelperUtil;
import com.wantong.config.domain.vo.system.ParentParamVO;
import com.wantong.config.service.system.ISystemParameterConfigService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.servlet.ModelAndView;

import javax.servlet.http.HttpServletRequest;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Controller
@RequestMapping("/system")
public class SystemParameterConfigController extends BaseController {

    @Reference
    private ISystemParameterConfigService systemParameterConfigService;

    @Autowired
    private ThirdPartyConfig thirdPartyConfig;

    @RequestMapping("systemParameterConfig.do")
    public ModelAndView getSystemParameterConfigView(HttpServletRequest request, @RequestParam(defaultValue = "1") Integer currentPage)throws Exception{
        ModelAndView mv = new ModelAndView();

        AdminSession admin = getAdminSession();

        BaseQuery query = new BaseQuery();
        query.setCurrentPage(currentPage);
        PageHelperUtil<ParentParamVO> page = null;
        if (admin.getPartnerId() == 1){
            page = systemParameterConfigService.getAllParentsParam(query);
        }else {
            Map<String,Object> map = new HashMap<String,Object>();
            map = systemParameterConfigService.getParentsParamByPartnerId(query,admin.getPartnerId());
            page = (PageHelperUtil<ParentParamVO>)map.get("page");
            /*String domainName = (String) map.get("domainName");
            if (!"".equals(domainName)){
                mv.addObject("domainName",domainName);
            }*/
        }


        mv.addObject("page",page);
        mv.addObject("partnerId",admin.getPartnerId());
        mv.setViewName("/system/systemParameterConfig");
        return mv;
    }

    @RequestMapping("saveParamConfig.do")
    @ResponseBody
    public ApiResponse saveParamConfig(HttpServletRequest request,String nickname,String account,String appId,String appSecret,String paramId,int type,int isDisplayBox){

        AdminSession admin = getAdminSession();

        int i = 0;
        if (paramId==null || "".equals(paramId)){
            boolean bool =  systemParameterConfigService.isExistWechatConfig(type,admin.getPartnerId());
            if (bool){
                return ApiResponse.creatFail(ResponseCode.Base.ERROR,"每种类型只能配置一次","");
            }
            i = systemParameterConfigService.saveParamConfig(admin.getPartnerId(),appId,appSecret,nickname,account,isDisplayBox);
        }else {
            i = systemParameterConfigService.updateParamConfig(Long.parseLong(paramId),appId,appSecret,nickname,account,isDisplayBox);
        }

        if (i <= 0){
            return ApiResponse.creatFail(ResponseCode.Base.ERROR,"保存系统参数失败","");
        }
        return ApiResponse.creatSuccess();
    }
    @RequestMapping("checkWechatParam.do")
    @ResponseBody
    public ApiResponse checkWechatParam(String account,String appId,String appSecret,String paramId){

        //验证appId和appSecret，url是向微信验证，固定
        RestTemplate restTemplate = new RestTemplate();
        String url = thirdPartyConfig.getWechatAppidSecret() + "&appid="+appId+"&secret="+appSecret;
        String str = restTemplate.getForObject(url, String.class);
        Map map = JSONObject.parseObject(str,Map.class);

        //验证微信号
        String accountUrl = thirdPartyConfig.getWechatQrcode() + account;
        HashMap<String,String> map2 = new HashMap<String,String>();
        ResponseEntity<List> responseEntity = restTemplate.getForEntity(accountUrl,null, map2);
        HttpHeaders headers = responseEntity.getHeaders();
        ContentDisposition disposition = headers.getContentDisposition();

        HashMap<String,String> errMap = getErrorMap(map,disposition);

        if (errMap.size()>0){
            return ApiResponse.creatFail(ResponseCode.Base.ERROR,"参数错误",errMap);
        }

        int i = systemParameterConfigService.changeStatus(Long.parseLong(paramId));

        if (i <= 0){
            return ApiResponse.creatFail(ResponseCode.Base.ERROR,"验证参数失败","");
        }

        return ApiResponse.creatSuccess();
    }

    private HashMap<String, String> getErrorMap(Map map, ContentDisposition disposition) {
        HashMap<String,String> errMap = new HashMap<String,String>();

        if (disposition==null || "".equals(disposition.toString())){
            errMap.put("accountError","accountError");
        }
        Integer errcode= (Integer)map.get("errcode");

        if (errcode == null){
            return errMap;
        }else if (errcode == 40013){
            errMap.put("appIDError","appIDError");
        }else if (errcode == 40125){
            errMap.put("appsecretError","appsecretError");
        }
        return errMap;
    }

    @RequestMapping("getWechatParam.do")
    @ResponseBody
    public ApiResponse getWechatParam(long paramId){

        ParentParamPO parentParamPO = null;
        try {
            parentParamPO = systemParameterConfigService.getWechatParamById(paramId);
        } catch (ServiceException e) {
            e.printStackTrace();
        }
        JSONObject json = JSONObject.parseObject(parentParamPO.getParam());

        return ApiResponse.creatSuccess(json);
    }
    @RequestMapping("changeDisplayBox.do")
    @ResponseBody
    public ApiResponse changeDisplayBox(Long id, Integer displayBox){

        systemParameterConfigService.changeDisplayBox(id,displayBox);

        return ApiResponse.creatSuccess();
    }

}

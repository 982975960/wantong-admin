package com.wantong.admin.view.role;

import com.alibaba.dubbo.config.annotation.Reference;
import com.wantong.admin.session.AdminSession;
import com.wantong.admin.view.BaseController;
import com.wantong.common.exception.ServiceException;
import com.wantong.common.response.ApiResponse;
import com.wantong.common.response.ResponseCode.Base;
import com.wantong.config.domain.dto.role.GrantRoleManagerDTO;
import com.wantong.config.domain.po.role.AdminRolePO;
import com.wantong.config.domain.po.role.RolePO;
import com.wantong.config.domain.vo.BaseQuery;
import com.wantong.config.domain.vo.PageHelperUtil;
import com.wantong.config.domain.vo.role.RoleManagerVO;
import com.wantong.config.service.role.IRoleRelatedService;
import javax.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.servlet.ModelAndView;

@Controller
public class RoleController extends BaseController {

    @Reference
    private IRoleRelatedService roleRelatedService;


    /**
     * 创建角色
     *
     * @param request
     * @param roleManagerVO
     */
    @RequestMapping(value = "/role/createrole.do")
    @ResponseBody
    public ApiResponse createRole(HttpServletRequest request, RoleManagerVO roleManagerVO) throws ServiceException {
        AdminSession admin = getAdminSession();

        RolePO rolePO = new RolePO();
        rolePO.setName(roleManagerVO.getName());
        rolePO.setPartnerId(roleManagerVO.getPartnerId());
        rolePO.setStatus(roleManagerVO.getStatus());
        long createRoleDTO = roleRelatedService.createRole(rolePO, admin.getId(), admin.getPartnerId());

        return ApiResponse.creatSuccess();
    }

    /**
     * 更改角色权限
     *
     * @param request
     * @param adminId
     */
    @RequestMapping(value = "/grantRole/excute.do")
    @ResponseBody
    public ApiResponse excuteRole(HttpServletRequest request, @RequestParam("adminId") long adminId)
            throws ServiceException {
        int status = 1;
        AdminRolePO adminRolePO = new AdminRolePO();
        String[] roleIds = request.getParameterValues("roleIds");
        StringBuffer sb = new StringBuffer("");
        if (roleIds != null) {
            for (int i = 0; i < roleIds.length; i++) {
                sb.append(roleIds[i]);
                if (i < roleIds.length - 1) {
                    sb.append(";");
                }
            }
        }
        AdminSession admin = getAdminSession();
        adminRolePO.setAdminId(adminId);
        adminRolePO.setRoleIds(sb.toString());
        adminRolePO.setCreateAdminId(admin.getId());
        adminRolePO.setStatus(status);

        try {
            roleRelatedService.grantRoleExcute(adminRolePO);
        } catch (Exception e) {
            return ApiResponse.creatFail(Base.ERROR, e);
        }
        return ApiResponse.creatSuccess();
    }

    /**
     * 分配角色时获取所有角色
     *
     * @param id
     */
    @RequestMapping(value = "/grantRole/manager.do")
    public ModelAndView managerRole(@RequestParam("id") long id) {
        AdminSession adminSession = getAdminSession();

        GrantRoleManagerDTO result = roleRelatedService.grantRoleManager(id, adminSession.getPartnerId());

        ModelAndView mv = new ModelAndView("/role/grantrole");
        mv.addObject("list", result.getRolePOs());
        mv.addObject("user", result.getAdminPO());

        return mv;
    }

    /**
     * 获取角色列表
     *
     * @param request
     */
    @RequestMapping(value = "/role/rolemanager.do")
    @ResponseBody
    public ModelAndView getRoleList(HttpServletRequest request, @RequestParam(defaultValue = "1") Integer currentPage) {
        AdminSession admin = getAdminSession();

        BaseQuery query = new BaseQuery();
        query.setCurrentPage(currentPage);
        PageHelperUtil<RoleManagerVO> page = roleRelatedService.roleManager(admin.getPartnerId(), query);
        if (page == null) {
            return null;
        }

        ModelAndView mv = new ModelAndView("/role/rolemanager");
        mv.addObject("page", page);
        mv.addObject("admin", admin);

        return mv;
    }

    /**
     * 更新角色权限
     *
     * @param roleManagerVO
     */
    @RequestMapping(value = "/role/updateRole.do")
    @ResponseBody
    public ApiResponse updateRole(RoleManagerVO roleManagerVO) {
        RolePO rolePO = new RolePO();
        rolePO.setId(roleManagerVO.getId());
        rolePO.setPartnerId(roleManagerVO.getPartnerId());
        rolePO.setName(roleManagerVO.getName());
        rolePO.setStatus(roleManagerVO.getStatus());
        roleRelatedService.updateRole(rolePO);

        return ApiResponse.creatSuccess();
    }
}

package com.wantong.admin.view.migration;

import com.wantong.admin.view.BaseController;
import com.wantong.admin.business.MigrationApiBiz;
import com.wantong.admin.view.StaticPageController;
import com.wantong.common.exception.ServiceException;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import javax.validation.constraints.NotNull;
import java.util.*;

/**
 * 资源迁移 restful api
 * @author : 刘建宇
 * @version : 1
 * @date : 2019/8/12 12:02
 *
 * @see StaticPageController#migration()  页面
 * @see MigrationApiBiz 逻辑实现
 */
@RestController
@RequestMapping("/api/cms/migration")
@RequiredArgsConstructor
public class MigrationApiController extends BaseController {

    /**
     * 逻辑实现
     */
    private final MigrationApiBiz business;


    /**
     * 搜索api
     */
    @GetMapping("search")
    public Object search(MigrationApiBiz.SearchParam searchParam) throws ServiceException {
        return business.search(searchParam);
    }

    /**
     * 初始化信息, 返回可控partnerId
     */
    @GetMapping("setup")
    public Object setup(){
        return business.setup(getAdminSession());
    }

    /**
     * 查重 api
     */
    @GetMapping("check")
    public Object check(@RequestParam("selectedBooks[]") Set<Long> selectedBooks,
                        @RequestParam("targetRepoId") Integer targetRepoId){
        return business.check(selectedBooks, targetRepoId);
    }

    /**
     * 复制资源 rest api
     */
    @PostMapping("migrate")
    public Object migrate(@RequestParam("selectedBooks[]") Set<Long> selectedBooks,
                          @RequestParam("targetRepoId") Integer targetRepoId,
                          @RequestParam("normal")Boolean normal,
                          @RequestParam("pointing")Boolean pointing,
            @RequestParam("sourceRepoId") Integer sourceRepoId
    ){
        return business.migrate(
                selectedBooks,
                targetRepoId,
                normal,
                pointing,
                getAdminSession().getPartnerId(),
                getAdminSession().getId(),
                sourceRepoId);
    }

    /**
     * 移动资源 rest api
     */
    @PostMapping("cut")
    public Object cut(@RequestParam("selectedBooks[]") @NotNull Set<Long> selectedBooks,
                      @RequestParam("sourceRepoId") Integer sourceRepoId,
                          @RequestParam("targetRepoId") @NotNull Integer targetRepoId
    ){
        return business.cut(
                selectedBooks,
                3,
                sourceRepoId,
                targetRepoId,
                getAdminSession().getPartnerId(),
                getAdminSession().getId());
    }

    /**
     * 迁移任务 列表 api
     */
    @GetMapping("orders")
    public Object orders(@RequestParam Integer currentPage,
                         @RequestParam Integer pageSize,
                         @RequestParam int state){
        return business.orders(getAdminSession().getPartnerId(), currentPage, pageSize, state);
    }

    /**
     * 迁移任务 详细书本 api
     */
    @GetMapping("items")
    public Object items(@RequestParam long orderId){
        return business.items(orderId);
    }

}

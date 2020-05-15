package com.wantong.admin.business;

import com.alibaba.dubbo.config.annotation.Reference;
import com.google.common.collect.ImmutableMap;
import com.wantong.admin.config.ThirdPartyConfig;
import com.wantong.admin.session.AdminSession;
import com.wantong.admin.view.StaticPageController;
import com.wantong.admin.view.migration.MigrationApiController;
import com.wantong.common.exception.ServiceException;
import com.wantong.common.lang.TimeCost;
import com.wantong.common.model.Pagination;
import com.wantong.common.response.ApiResponse;
import com.wantong.common.storage.StorageConfig;
import com.wantong.config.service.supplier.ISupplierRelatedService;
import com.wantong.content.domain.SearchContent;
import com.wantong.content.domain.dto.BookDTO;
import com.wantong.content.domain.dto.BookListDTO;
import com.wantong.content.domain.po.BookBaseInfoPO;
import com.wantong.content.domain.po.BookInfoPO;
import com.wantong.content.domain.vo.PartnerRepositoryVO;
import com.wantong.content.service.IBookInfoService;
import com.wantong.content.service.IMigratingService;
import com.wantong.content.service.IRepoService;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.stream.Collectors;

/**
 * 资源迁移 逻辑实现
 * @author : 刘建宇
 * @version : 1
 * @date : 2019/8/22 9:57
 *
 * @see MigrationApiController restful api
 * @see StaticPageController#migration()  页面
 */
@Component
@Slf4j
public class MigrationApiBiz {
    @Reference
    private IRepoService repoService;

    @Reference
    private IBookInfoService bookInfoService;

    @Reference
    private ISupplierRelatedService supplierRelatedService;

    @Reference(timeout = 10 * 1000, retries = -1)
    private IMigratingService migratingService;

    private String picPathPrefix;

    @Autowired
    public void setPicPathPrefix(ThirdPartyConfig config, StorageConfig storageConfig) {
        this.picPathPrefix = config.getFileEndpoint()+storageConfig.getBookImagePath()+"/";
    }

    /**
     * 书本搜索
     * @param searchParam 搜索参数
     * @return ApiResponse
     * @throws ServiceException ##
     */
    public Object search(SearchParam searchParam) throws ServiceException {
        //pojo转换 start
        SearchContent searchContent = new SearchContent();
        searchContent.setBookId(searchParam.getBookId());
        searchContent.setBookNumber(searchParam.getBookNumber());
        searchContent.setBookName(searchParam.getBookName());
        searchContent.setDubble(searchParam.getSeries());
        searchContent.setIsbn(searchParam.getIsbn());
        searchContent.setLabelName(searchParam.getLabelName());
        searchContent.setPress(searchParam.getPress());
        searchContent.setEdition(searchParam.getEdition());
        //pojo转换 end
        //状态int[] start
        List<Integer> list = new ArrayList<>(4);
        if(searchParam.getEditing() !=null && searchParam.getEditing()){
            //资源待编辑
            list.add(0);
        }
        if(searchParam.getExamining() !=null && searchParam.getExamining()){
            //待审核
            list.add(7);
        }
        if(searchParam.getExamined() !=null && searchParam.getExamined()){
            //已审核
            list.add(3);
        }
        int forbidden = 0;
        if (searchParam.getForbidden()!=null && searchParam.getForbidden()){
            forbidden = 1;
        }
        //状态int[] end
        int[] status = list.stream().mapToInt(Integer::intValue).toArray();
        //分页
        Pagination pagination = new Pagination();
        pagination.setCurrentPage(searchParam.getCurrentPage());
        pagination.setPageSize(searchParam.getPageSize());
        //搜索
        BookListDTO dto = bookInfoService.listBook(
                searchParam.getRepoId(),
                status,
                pagination,
                false,
                searchContent,
                forbidden);
        List<Long> idList = new ArrayList<>(dto.getListBook().size());
        for (BookDTO bookDTO : dto.getListBook()) {
            idList.add(bookDTO.getBookInfo().getId());
        }
        List<Long> onCopyIdList = migratingService.isBookOnMigrating(idList);
        //pojo转换
        List<Book> books = dto.getListBook().stream().map(bookDTO->{
            BookBaseInfoPO base=bookDTO.getBookBaseInfo().getBookBaseInfo();
            BookInfoPO resource = bookDTO.getBookInfo();
            String picture = picPathPrefix+base.getModelId()+"/"+base.getId()+"/"+base.getCoverImage();
            return new Book(resource.getId()
                    ,picture
                    ,base.getName()
                    ,base.getIsbn()
                    ,base.getAuthor()
                    ,base.getPublisher()
                    ,resource.getState()
                    ,base.getSeriesTitle()
                    ,onCopyIdList.contains(resource.getId())
                    , resource.getForbidden() == 1
                    ,base.getState() !=3
            );
        }).collect(Collectors.toList());
        Map<String, Object> data = ImmutableMap.of(
                "books",books,
                "currentPage",searchParam.getCurrentPage(),
                "pages",dto.getPagination().getPages()
        );
        return ApiResponse.creatSuccess(data);
    }

    /**
     * 初始化信息, 返回可控资源信息
     * @param session session
     * @return ApiResponse
     */
    public Object setup(AdminSession session){
        TimeCost.fromNow();
        long partnerId = session.getPartnerId();
        List<PartnerRepositoryVO> total = migratingService.listAllPartnerRepositoryVo();
        PartnerRepositoryVO self = total.stream()
                .filter(e->e.getPartnerVO().getPartnerId().equals(partnerId))
                .findAny()
                .get();
        total.removeIf(e->e.getRepositoryVOList().isEmpty());
        total = partnerId == 1 ? total : Collections.singletonList(self);
        Map map  = ImmutableMap.of("self", self, "total", total);
        log.info("migration setup 耗时{}毫秒", TimeCost.get());
        return ApiResponse.creatSuccess(map);
    }


    public Object check(Set<Long> selectedBooks, Integer targetRepoId){
        return ApiResponse.creatSuccess(migratingService.validate(selectedBooks, targetRepoId));
    }

    /**
     * 复制资源 主要逻辑在 content 和 async-worker, 消息异步
     * @param selectedBooks 请求id集合
     * @param targetRepoId 目标repo
     * @param normal 是否复制领读
     * @param pointing 是否复制点读
     * @param partnerId 操作者
     * @param adminId 操作者
     * @param sourceRepoId 源repo
     * @return ApiResponse
     */
    public Object migrate(Set<Long> selectedBooks,
                          Integer targetRepoId,
                          Boolean normal,
                          Boolean pointing,
                          Long partnerId,
                          Long adminId,
                          Integer sourceRepoId){
        Integer resourceTypeNumber = 0;
        if (normal){
            resourceTypeNumber += 1;
        }
        if (pointing){
            resourceTypeNumber += 2;
        }
        migratingService.migrate(selectedBooks, resourceTypeNumber, sourceRepoId , targetRepoId, partnerId, adminId);
        return ApiResponse.creatSuccess();
    }

    /**
     * 返回迁移任务单子的物品(书本详情)
     * @param orderId id
     * @return ApiResponse
     */
    public Object items(long orderId){
        List<BookBaseInfoPO> pos= migratingService.listMigrationItemByOrderId(orderId);
        for (BookBaseInfoPO po : pos) {
            po.setCoverImage(picPathPrefix+po.getModelId()+"/"+po.getId()+"/"+po.getCoverImage());
        }
        return ApiResponse.creatSuccess(pos);
    }

    /**
     * 返回迁移任务单子的物品
     * @param partnerId 请求者
     * @param currentPage 分页
     * @param pageSize 分页
     * @param state 任务单子状态
     * @return ApiResponse
     */
    public Object orders(long partnerId, Integer currentPage, Integer pageSize, int state){
        Pagination pagination = new Pagination();
        pagination.setPageSize(pageSize);
        pagination.setCurrentPage(currentPage);
        return ApiResponse.creatSuccess(migratingService.listMigrationOrderPageByPartnerId(partnerId, pagination, state));
    }

    /**
     *
     * 资源移动 主要逻辑在 content, 同步完成
     * @param selectedBooks 请求id集合
     * @param targetRepoId 目标repo
     * @param partnerId 操作者
     * @param adminId 操作者
     * @param sourceRepoId 源repo
     * @return ApiResponse
     */
    public Object cut(Set<Long> selectedBooks,Integer resourceTypeNumber, Integer sourceRepoId, Integer targetRepoId, Long partnerId, Long adminId) {
        migratingService.cut(selectedBooks, resourceTypeNumber, sourceRepoId , targetRepoId, partnerId, adminId);
        return ApiResponse.creatSuccess();
    }

    /**
     * @author : 刘建宇
     * @version : 1
     * @date : 2019/8/12 14:43
     */
    @Data
    @Builder
    @AllArgsConstructor
    public static class Book {
        Long bookId;
        String picture;
        String name;
        String isbn;
        String author;
        String publisher;
        Integer state;
        String series;

        Boolean onCopy;

        Boolean forbidden;

        Boolean picChanged;
    }

    /**
     * @author : 刘建宇
     * @version : 1
     * @date : 2019/8/12 16:35
     */
    @Data
    public static class SearchParam {

        /**
         * repoId
         */
        private Integer repoId;

        /**
         * 8项关键字
         */
        private String bookName;
        private String isbn;
        private String press;
        private String series;
        private String edition;
        private String bookNumber;
        private String bookId;
        private String labelName;

        /**
         * 状态选择
         */
        private Boolean whole;
        private Boolean forbidden;
        private Boolean examined;
        private Boolean examining;
        private Boolean editing;

        private Integer currentPage;
        private Integer pageSize;
    }
}

package com.wantong.admin.business;

import com.alibaba.dubbo.config.annotation.Reference;
import com.alibaba.excel.EasyExcelFactory;
import com.alibaba.excel.ExcelWriter;
import com.alibaba.excel.event.WriteHandler;
import com.alibaba.excel.metadata.Sheet;
import com.alibaba.excel.support.ExcelTypeEnum;
import com.alibaba.excel.util.StyleUtil;
import com.wantong.admin.constants.Constants;
import com.wantong.admin.domain.BookInfoModel;
import com.wantong.admin.constants.ReportEnum;
import com.wantong.admin.session.AdminSession;
import com.wantong.common.exception.ServiceException;
import com.wantong.common.redis.RedisDao;
import com.wantong.common.storage.StorageConfig;
import com.wantong.content.domain.dto.BookInfoImportRecordDTO;
import com.wantong.content.domain.po.BookBaseInfoPO;
import com.wantong.content.service.IBookBaseInfoService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.*;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

/**
 * 刘建宇 2019/7/5 12:12
 * excel批量的实现主类
 */
@Component
@Slf4j
@RequiredArgsConstructor
public class BaseBookImportBiz {

    private final RedisDao redisDao;
    private final WriteExcel writeExcel;
    private final StorageConfig storageConfig;

    @Reference
    private IBookBaseInfoService bookBaseInfoService;

    private CheckDataBeforeSQL checkDataBeforeSQL = new CheckDataBeforeSQL();

    public List<BookInfoImportRecordDTO> listReport(Long admin){
        return bookBaseInfoService.listAllImportRecordByAdminId(admin);
    }

    /**
     * 1把前端传来的excel存到硬盘；
     * 2生成“历史记录”，取得 记录id；
     * 3把id push到redis阻塞队列
     * @param multipartFile 前端传来的excel
     * @param adminSession session
     * @throws Exception
     */
    public void pushExcelImportTaskToRedis(MultipartFile multipartFile,
                                           AdminSession adminSession,
                                           Integer modelId) throws Exception {

        long admin = adminSession.getId();
        String filename = multipartFile.getOriginalFilename();
        BookInfoImportRecordDTO dto = BookInfoImportRecordDTO.builder()
                .filename(filename)
                .admin(admin)
                .state(0)
                .modelId(modelId)
                .build();
        log.info("======dto:" +dto);
        Long id = bookBaseInfoService.recordBookInfoImport(dto);
        log.info("======id:" +dto);
        //
        String saveFilePath = storageConfig.getBookImportReport() +File.separator
                + Constants.REQUEST_EXCEL_PREFIX+id+ Constants.DOT_XLSX;
        multipartFile.transferTo(new File(saveFilePath));
        log.info("push task storageConfig.getBookImportReport() : "+storageConfig.getBookImportReport());
        log.info("push task saveFilePath : "+saveFilePath);
        redisDao.lPush(Constants.REDIS_QUEUE_KEY,id);
    }

    /**
     * 由RedisListener调用
     * 1取得id，按命名取硬盘上的excel
     * 2处理excel
     * @param id
     * @throws Exception
     */
    public void doTask(Long id) throws Exception{
        String saveFilePath = storageConfig.getBookImportReport() +File.separator + Constants.REQUEST_EXCEL_PREFIX+id+ Constants.DOT_XLSX;
        log.info("do task "+saveFilePath);
        InputStream inputStream = new FileInputStream(saveFilePath);
        Integer modelId = bookBaseInfoService.selectBookInfoImportRecordBySample(
          BookInfoImportRecordDTO.builder().id(id).build()
        ).get(0).getModelId();
        List<BookInfoModel> data = excelImport(inputStream, modelId);
        inputStream.close();
        int failed = 0;
        for (BookInfoModel b : data) {
            if (b.getReports().size() != 1 || !b.getReports().get(0).equals(ReportEnum.创建成功)) {
                failed++;
            }
        }
        int state;
        if (failed==0){
            //全部创建成功
            state = 1;
        }else if (failed==data.size()){
            //全部创建失败
            state = 3;
        }else {
            //部分创建成功
            state = 2;
        }
        BookInfoImportRecordDTO bookInfoImportRecordDTO = BookInfoImportRecordDTO.builder()
                .id(id)
                .state(state)
                .build();
        bookBaseInfoService.updateImportRecordStatus(bookInfoImportRecordDTO);
        writeExcel.writeExcel(data, bookInfoImportRecordDTO.getId());

    }

    private Map<Integer, CellStyle> map = null;

    /**
     * 接受上传的excel，处理。
     */
    public List<BookInfoModel> excelImport(InputStream excel,Integer modelId) throws IOException, ServiceException {

        List<BookInfoModel> data = EasyExcelFactory.read(excel, new Sheet(1, 1, BookInfoModel.class))
                .stream().map(e -> (BookInfoModel)e).collect(Collectors.toList());
        List<BookInfoModel> report = checkDataBeforeSQL.make(data);
        for (BookInfoModel toDB : report) {
            if (toDB.getReports().size()!=0) {
                continue;
            }
            boolean existed = bookBaseInfoService.checkAlreadyExistedByNameAndISBNAndModelId(toDB.getName(), toDB.getIsbn(), modelId);
            if (existed){
                toDB.getReports().add(ReportEnum.书本已经创建过了);
            }else {
                BookBaseInfoPO po = toBookBaseInfoPO(toDB);
                po.setModelId(modelId);
                bookBaseInfoService.createBaseBook(po);
                toDB.getReports().add(ReportEnum.创建成功);
            }
        }
        return data;
    }

    /**
     * Model转PO
     * @param model
     * @return
     */
    private BookBaseInfoPO toBookBaseInfoPO(BookInfoModel model){
        BookBaseInfoPO po = new BookBaseInfoPO();
        po.setName(model.getName());
        po.setAuthor(model.getAuthor());
        po.setIsbn(model.getIsbn());
        po.setPublisher(model.getPublisher());
        po.setDescription(model.getDescription());
        po.setEdition(model.getEdition());
        //po.setInnerId(model.getInner_id());
        po.setSeriesTitle(model.getSeries_title());
        po.setState(0);
        po.setCoverImage("temp.jpg");
        po.setModelId(27);
        return po;
    }

    public byte[] reportImportResult(Long recordId) throws IOException {
        File file = new File(storageConfig.getBookImportReport()
                +File.separator+recordId+ Constants.DOT_XLSX);
        byte[] bytes = new byte[(int)file.length()];
        new FileInputStream(file).read(bytes);
        return bytes;
    }

    public int checkHead(MultipartFile multipartFile) throws IOException {
        if (!multipartFile.getOriginalFilename().endsWith(Constants.DOT_XLSX)) {
            return 1;
        }
        Workbook workbook = new XSSFWorkbook(multipartFile.getInputStream());
        org.apache.poi.ss.usermodel.Sheet sheet = workbook.getSheetAt(0);
        Row row = sheet.getRow(0);
        if (row.getCell(0).toString().trim().equals("编号")
                && row.getCell(1).toString().trim().equals("所属系列")
                && row.getCell(2).toString().trim().equals("绘本名称")
                && row.getCell(3).toString().trim().equals("ISBN")
                && row.getCell(4).toString().trim().equals("作者名称")
                && row.getCell(5).toString().trim().equals("出版社")
                && row.getCell(6).toString().trim().equals("出版方")
                && row.getCell(7).toString().trim().equals("推荐理由")
                && row.getCell(8).toString().trim().equals("所属体系")
                && row.getCell(9).toString().trim().equals("版次")
                && row.getCell(10).toString().trim().equals("书本简介")
        ){
            return 0;
        } else {
            StringBuffer sb = new StringBuffer();
            sb.append("excel表头与模板不一致： ");
            for (Cell cell : row) {
                sb.append("  ").append(cell.toString());
            }
            log.info(sb.toString());
            return 2;
        }
    }

    /**
     * 刘建宇 2019/7/3 14:54
     * 写excel到硬盘
     */
    @Component
    @RequiredArgsConstructor
    public static class WriteExcel {

        private final StorageConfig storageConfig;

        public void writeExcel(List<BookInfoModel> list, Long recordId){

            String file= storageConfig.getBookImportReport()
                    +File.separator+recordId+ Constants.DOT_XLSX;
            Sheet sheet = new Sheet(
                    1,
                    1,
                    BookInfoModel.class,
                    "批量导入结果报告",
                    null);
            //list为空，写excel会出错
            if (list.size()==0){
                BookInfoModel one = new BookInfoModel();
                one.setReports(null);
                list.add(one);
            }
            OutputStream outputStream = null;
            try {
                outputStream = new FileOutputStream(file);
            } catch (FileNotFoundException e) {
                e.printStackTrace();
            }
            ExcelWriter writer = EasyExcelFactory.getWriterWithTempAndHandler(
                    null,
                    outputStream,
                    ExcelTypeEnum.XLSX,
                    true,
                    new AfterWriteHandlerImpl()
            );
            writer.write(list,sheet);
            writer.finish();
        }

        /**
         * @author : 刘建宇
         * @version : 1.0
         * @date : 2019/7/22 14:08
         */
        public static class AfterWriteHandlerImpl implements WriteHandler {
            CellStyle cellStyle;

            @Override
            public void sheet(int sheetNo, org.apache.poi.ss.usermodel.Sheet sheet) {
                Workbook workbook = sheet.getWorkbook();
                cellStyle = StyleUtil.buildDefaultCellStyle(workbook);
                cellStyle.setBorderLeft(BorderStyle.NONE);
                cellStyle.setFillForegroundColor(IndexedColors.RED.index);
            }

            @Override
            public void row(int rowNum, Row row) {
            }

            @Override
            public void cell(int cellNum, Cell cell) {
                if (cell.getRowIndex()!=0 && cellNum == 11 && !ReportEnum.创建成功
                        .toString()
                        .equals(cell.getStringCellValue())) {
                    cell.setCellStyle(cellStyle);
                }
            }
        }
    }

    /**
     * 刘建宇 2019/7/5 14:20
     * 检查表中的数据，写错误报告，不涉及数据库
     */
    public static class CheckDataBeforeSQL {

        /**
         * 入口方法
         */
        public List<BookInfoModel> make(List<BookInfoModel> data){
            BookInfoModel temp = new BookInfoModel();
            filterBlankRow(data);
            for (BookInfoModel one : data) {
                checkMissing(one);
                checkDuplicate(one,data,temp);
            }
            return data;
        }

        /**
         * 去掉空白的行
         */
        private void filterBlankRow(List<BookInfoModel> total){
            for (int i = total.size()-1; i >= 0; i--) {
                BookInfoModel one = total.get(i);
                if (isBlank(one.getIsbn())
                        && isBlank(one.getName())
                        && isBlank(one.getAuthor())
                        && isBlank(one.getPublisher())
                        && isBlank(one.getDescription())
                        && isBlank(one.getEdition())
                       /* && isBlank(one.getInner_id())*/
                        && isBlank(one.getSeries_title())
                        && isBlank(one.getBianhao())
                        && isBlank(one.getChubanfang())
                        && isBlank(one.getSuoshutixi())
                        && isBlank(one.getTuijianliyou())
                ){
                    total.remove(i);
                }
            }
        }

        /**
         * 判断一个单元格是否为空
         */
        private boolean isBlank(String s){
            if (s==null){
                return true;
            }else if (s.trim().equals("")){
                return true;
            }else {
                return false;
            }

        }

        private void checkExisted(BookInfoModel one){
            if (false){
                one.getReports().add(ReportEnum.书本已经创建过了);
            }
        }

        /**
         * 检查重复行
         */
        private void checkDuplicate(BookInfoModel one, List<BookInfoModel> all, BookInfoModel temp){
            if (isBlank(one.getIsbn()) || isBlank(one.getName())){
                return;
            }
            temp.setIsbn(one.getIsbn());
            temp.setName(one.getName());
            one.setName(null);
            one.setIsbn(null);
            if (all.contains(temp)){
                one.getReports().add(ReportEnum.ISBN与绘本名称有重复行);
            }
            one.setIsbn(temp.getIsbn());
            one.setName(temp.getName());
        }

        /**
         * 检查必填项
         */
        private void checkMissing(BookInfoModel one){
            if (one.getIsbn()==null || one.getIsbn().equals("")){
                one.getReports().add(ReportEnum.缺少ISBN);
            }else {
                if (!Pattern.compile("^[-\\+]?[\\d]*$").matcher(one.getIsbn()).matches()) {
                    one.getReports().add(ReportEnum.ISBN必须为纯数字);
                }
                else {
                    if (one.getIsbn().length() != 13 && one.getIsbn().length() != 10) {
                        one.getReports().add(ReportEnum.ISBN必须为13位或10位);
                    }
                }
            }
            if (one.getAuthor()==null || one.getAuthor().equals("")){
                one.getReports().add(ReportEnum.缺少作者名称);
            }
            if (one.getName()==null || one.getName().equals("")){
                one.getReports().add(ReportEnum.缺少绘本名称);
            }
            if (one.getPublisher()==null || one.getPublisher().equals("")){
                one.getReports().add(ReportEnum.缺少出版社);
            }
            // 书本编号自增，不做检查
            /*if (!isBlank(one.getInner_id())){
                if (!Pattern.compile("^[-\\+]?[\\d]*$").matcher(one.getInner_id()).matches()) {
                    one.getReports().add(ReportEnum.书本编号非法);
                }
            }*/
        }
    }
}

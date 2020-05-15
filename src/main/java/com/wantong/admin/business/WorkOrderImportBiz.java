package com.wantong.admin.business;

import com.alibaba.dubbo.config.annotation.Reference;
import com.alibaba.excel.EasyExcelFactory;
import com.alibaba.excel.metadata.Sheet;
import com.wantong.admin.constants.CheckResult;
import com.wantong.admin.domain.ExcelMapper;
import com.wantong.common.exception.ServiceException;
import com.wantong.content.domain.vo.WorkOrderBookInfoVO;
import com.wantong.content.service.IWorkOrderBookInfoService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Component;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.*;
import java.util.regex.Pattern;

import static org.apache.commons.lang3.StringUtils.isBlank;

/**
 * 工单管理/批量创建书本信息
 * @author : 刘建宇
 * @version : 1
 * @date : 2019/8/2 14:37
 */
@Component
@RequiredArgsConstructor
public class WorkOrderImportBiz {

    private ExcelFormatCheck formatCheck = new ExcelFormatCheckImpl();

    private ExcelDataCheck dataCheck = new ExcelDataCheck();

    private final Sheet sheet = new Sheet(1, 1, ExcelMapper.class);

    @Reference
    private IWorkOrderBookInfoService workOrderBookInfoService;

    public Set<CheckResult> importBookOrder(byte[] excel, Integer state, Integer modelId, Long workOrderId,
                                            Integer repoId) throws ServiceException {
        Set<CheckResult> results = new HashSet<>();

        //检查文件格式、表头
        ExcelFormatCheck.CheckResult formatCheckResult = formatCheck.check(newInputStream(excel), Arrays.asList("*ISBN",
                "*书本名称", "*作者名称", "*出版社", "所属系列"));

        if (!formatCheckResult.equals(ExcelFormatCheck.CheckResult.VALIDATE_PASS)) {
            //表头检查没有通过
            if (formatCheckResult.equals(ExcelFormatCheck.CheckResult.HEAD_MISSING)) {
                results.add(CheckResult.EXCEL_HEAD_MISSING);
            } else if (formatCheckResult.equals(ExcelFormatCheck.CheckResult.HEAD_WRONG_ORDER)) {
                results.add(CheckResult.EXCEL_HEAD_WRONG_ORDER);
            } else {
                results.add(CheckResult.EXCEL_HEAD_INVALIDATE);
            }
        } else {
            //表头检查通过
            //EXCEL转为POJO
            List<ExcelMapper> data = read(newInputStream(excel));
            //检查数据
            List<CheckResult> dataCheckResults = dataCheck.checkData(data);
            if (dataCheckResults.size() == 1 && dataCheckResults.get(0).equals(CheckResult.DATA_PASS)) {
                //数据检查通过
                //导入数据 TODO
                insertData(data, state, modelId, workOrderId, repoId);
            } else {
                //数据检查没有通过
                results.addAll(dataCheckResults);
            }
        }
        return results;
    }



    /**
     * POJO转换 插入到数据库
     */
    private void insertData(List<ExcelMapper> data,
                           Integer state,
                           Integer modelId,
                           Long workOrderId,
                           Integer repoId)
            throws ServiceException {
        workOrderBookInfoService.importWorkOrderBook(toVO(data, state, modelId, workOrderId), repoId);
    }

    /**
     * 转为PO写入数据库
     */
    private List<WorkOrderBookInfoVO> toVO(
            List<ExcelMapper> rawData,
            Integer state,
            Integer modelId,
            Long workOrderId) {
        List<WorkOrderBookInfoVO> list = new LinkedList<>();
        for (ExcelMapper raw : rawData) {
            WorkOrderBookInfoVO vo = new WorkOrderBookInfoVO();
            vo.setAuthor(raw.getAuthor());
            vo.setIsbn(raw.getIsbn());
            vo.setName(raw.getName());
            vo.setPublisher(raw.getPublisher());
            vo.setSeriesTitle(raw.getSeriesTitle() == null ? "" : raw.getSeriesTitle());
            vo.setState(state);
            vo.setModelId(modelId);
            vo.setWorkOrderId(workOrderId);
            list.add(vo);
        }
        return list;
    }


    /**
     * /EXCEL转为POJO
     */
    private List<ExcelMapper> read(InputStream excelInputStream){
        List<Object> raw = EasyExcelFactory.read(excelInputStream,sheet);
        List<ExcelMapper> data = new ArrayList<>();
        for (Object datum : raw) {
            data.add((ExcelMapper)datum);
        }
        try {
            excelInputStream.close();
        } catch (IOException e) {
            e.printStackTrace();
            throw new RuntimeException(e);
        }
        return data;
    }

    private InputStream newInputStream(byte[] bytes){
        return new ByteArrayInputStream(bytes);
    }

    /**
     * @author : 刘建宇
     * @version : 1
     * @date : 2019/8/2 14:16
     */
    @Slf4j
    public static class ExcelDataCheck {

        private Pattern isNumberPattern = Pattern.compile("^[-\\+]?[\\d]*$");

        public List<CheckResult> checkData(List<ExcelMapper> data) {
            List<CheckResult> results = new ArrayList<>();

            Iterator<ExcelMapper> iterator = data.iterator();
            while (iterator.hasNext()){
                ExcelMapper one = iterator.next();
                if (isBlank(one.getAuthor()) &&
                        isBlank(one.getIsbn()) &&
                        isBlank(one.getName()) &&
                        isBlank(one.getPublisher())
                ){
                    iterator.remove();
                }
            }

            for (ExcelMapper one : data) {
                //检查必填项
                if(
                isBlank(one.getAuthor()) ||
                isBlank(one.getIsbn()) ||
                isBlank(one.getName()) ||
                isBlank(one.getPublisher())){
                    results.add(CheckResult.MISSING_REQUIRED_FILED);
                    break;
                }
            }


            boolean isbnPass = true;
            for (ExcelMapper one : data) {
                String isbn = one.getIsbn();
                //非空
                if(!isBlank(isbn)){
                    boolean isNumber = isNumberPattern.matcher(isbn).matches();
                    if (!isNumber){
                        //不是数字
                        log.info("ISBN不是数字: {}", isbn);
                        isbnPass = false;
                        break;
                    }else {
                        if (isbn.length()!=13 && isbn.length()!=10){
                            //长度不是13或10
                            log.info("ISBN长度不是13或10: {}", isbn);
                            isbnPass = false;
                            break;
                        }
                    }
                }

            }
            if(!isbnPass){
                results.add(CheckResult.ISBN_NOT_NUMBER);
            }
            if (results.size()==0){
                //检查通过
                results.add(CheckResult.DATA_PASS);
            }
            return results;
        }

    }

    /**
     * @author : 刘建宇
     * @version : 1
     * @date : 2019/8/2 11:27
     */
    public static interface ExcelFormatCheck {
        /**
         * 检查excel表头是否与要求一致
         * @param excelInputStream 待查excel
         * @param excelHead 表头要求
         */
        CheckResult check(InputStream excelInputStream, List<String> excelHead);

        /**
         * @author : 刘建宇
         * @version : 1
         * @date : 2019/8/2 11:40
         */
        enum CheckResult {
            /**
             * 检查通过
             */
            VALIDATE_PASS,
            /**
             * 文件格式错误
             */
            FILE_FORMAT_INVALIDATE,
            /**
             * 未知异常
             */
            UNKNOWN_EXCEPTION,
            /**
             * 表头缺失列
             */
            HEAD_MISSING,
            /**
             * 表头顺序错误
             */
            HEAD_WRONG_ORDER,
        }
    }

    /**
     * @author : 刘建宇
     * @version : 1
     * @date : 2019/8/2 11:44
     */
    @Slf4j
    public static class ExcelFormatCheckImpl implements ExcelFormatCheck {
        /**
         * 入口方法
         * @param excelInputStream 待查excel
         * @param excelHead 表头要求
         */
        @Override
        public CheckResult check(InputStream excelInputStream, List<String> excelHead) {
            return checkWithExceptionHandled(excelInputStream, excelHead);
        }

        /**
         * 处理异常
         */
        private CheckResult checkWithExceptionHandled(
                InputStream excelInputStream, List<String> excelHead) {
            CheckResult result;
            try {
                //目标
                result = checkHead(excelInputStream, excelHead);
            }catch (IOException e){
                return CheckResult.FILE_FORMAT_INVALIDATE;
            }catch (Exception e){
                log.error("! ! ! excel解析遇到未知异常："+e);
                e.printStackTrace();
                return CheckResult.UNKNOWN_EXCEPTION;
            }
            return result;
        }

        /**
         * 主逻辑
         */
        private CheckResult checkHead(
                InputStream excelInputStream, List<String> exceptedHead) throws Exception{

            Row headRow = new XSSFWorkbook(excelInputStream).getSheetAt(0).getRow(0);
            excelInputStream.close();
            List<String> head = new ArrayList<>();
            //head转换
            for (int i = 0; i < headRow.getLastCellNum(); i++) {
                String column = headRow.getCell(i).getStringCellValue().trim();
                head.add(column);
            }
            log.info("excel检查====size(): {} ,headRow.getLastCellNum(): {}",head.size(),headRow.getLastCellNum());
            log.info("excel检查====head: {}",head);
            if (head.size() < exceptedHead.size()) {
                return CheckResult.HEAD_MISSING;
            }
            boolean validatePass = true;
            for (int i = 0; i < exceptedHead.size(); i++) {
                //一一匹配
                if (!head.get(i).equals(exceptedHead.get(i))){
                    //否则退出
                    validatePass = false;
                    break;
                }
            }
            if (validatePass){
                return CheckResult.VALIDATE_PASS;
            }else {
                for (String s : exceptedHead) {
                    //缺失列
                    if (!head.contains(s)) {

                        return CheckResult.HEAD_MISSING;
                    }
                }
                //应产品经理要求，失败原因有且仅有HEAD_MISSING和HEAD_WRONG_ORDER
                return CheckResult.HEAD_WRONG_ORDER;
            }
        }


    }
}

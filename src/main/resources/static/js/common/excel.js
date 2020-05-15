/**
 * 引入方式:
 * <script src="/static/js/3rd-party/xlsx.mini.min.js"></script>
 * <script src="/static/js/common/excel.js"></script>
 *
 * 使用示例:
 * let array = [
 *     {id: 123, name: '你爸爸', author: '曹格'},
 *     {id: 110, name: '挖鼻屎', author: '绑住'},
 *     {id: 120, name: '戴工牌', author: '稣蜚'}
 * ];
 * Excel.download(array, 'filename');
 * Excel.convert(file, array => {window.console.log(array) })
 */
window.Excel = {

    /**
     * 转换 js对象数组 为 Excel文件, 并下载.
     * @param array js对象数组
     * @param filename 下载文件名
     */
    download(array, filename) {
        let sheet = XLSX.utils.json_to_sheet(array);
        let book = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(book, sheet);
        XLSX.writeFile(book, filename)
    },

    /**
     * 转换Excel文件为 js对象数组, 完成后回调.
     * @param file File对象.
     * @param callback 回调, 实参为 array.
     */
    convert(file, callback){
        let reader = new FileReader();
        reader.onload = (e) =>{
            let data = new Uint8Array(e.target.result);
            let workBook = XLSX.read(data,{type: 'array'});
            let sheetName = workBook.SheetNames[0];
            let sheet = workBook.Sheets[sheetName];
            let array = XLSX.utils.sheet_to_json(sheet);
            callback(array);
        };
        reader.readAsArrayBuffer(file);
    },

    /**
     * 选择Excel文件并转化为js数组
     * @param callback 回调, 实参为 array.
     */
    upload(callback){
        let inputElement = document.createElement('input');
        inputElement.type = 'file';
        inputElement.accept = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        inputElement.style.display = 'none';
        inputElement.onchange = function(event){
            let file = event.target['files'][0];
            Excel.convert(file, callback);
        };
        document.body.appendChild(inputElement);
        inputElement.click();
        document.body.removeChild(inputElement);
    }
};

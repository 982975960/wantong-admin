/**
 by ljy 2019/9/6,2019/11/15

 html代码:
    <vt-table :table-data="table"></vt-table>

 js(vue)代码:
     viewModel.table = {};
     viewModel.table.head = ["日期", "总阅读次数", "总阅读本数", "总阅读时长"];
     viewModel.table.body = [
         [1,2,3,5]
         ,[1,2,34,4]
         ,[1,2,2,2]
         ,[6,7,8,9]
         ,[7,5,3,2]
         ,[111,222,333,444]
         ,[123,321,435,765]
     ];
 */

Vue.component("vt-table",{
    props:['tableData'],
    template:`
        <div class="text-block-con row-t">
            <ul>
                <li>
                    <table width="100%">
                        <thead>
                        <tr class="text-block-head" >
                            <td v-for="thead in tableData.head" 
                                :width="(100 / tableData.head.length) + \'%\'" 
                                align="center" 
                                valign="middle"
                                nowrap="nowrap" 
                                bgcolor="#f6f7fb" style="border-bottom:none;">
                                {{thead}}
                            </td>
                        </thead>
                        <tbody>
                        <tr v-for="tbody in tableData.body">
                            <td v-for="td in tbody" align="center">
                                {{td}}
                            </td>
                        </tr>
                        </tbody>
                    </table>
                </li>
            </ul>
        </div>
        `
});


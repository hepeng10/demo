"use strict";

const xlsx = require('node-xlsx');
const fs = require('fs');

let res = xlsx.parse('lang.xls');
// 取出 excel 中的需要的数据
res = res[0].data;
let lang = {};

const ROW = 2;  // 从第几行开始取
const COL = 5;  // 从第几列开始取
for (let i = ROW, j = res.length; i < j; i++) {
    for (let m = COL, n = res[0].length; m < n; m++) {
        // 取出文本字段名，如 open，download
        const field = res[i][1];
        // 只有第一次遍历的时候，给 lang 对象添加字段名
        if (m == COL) {
            lang[field] = {};
        }
        // res[i][m] 取出翻译后的内容
        let translate = res[i][m];
        // 当翻译的文本为空时，则使用英文
        if (!translate) {
            translate = res[i][COL];
        }
        // res[1][m] 是语言编码，如 en，zh
        // 将翻译后的文本赋值给，如 lang -> open -> en
        lang[field][res[1][m]] = translate;
    }
}

console.log(lang)

fs.writeFile('./lang.js', JSON.stringify(lang), (err) => {
    if (err) {
        throw err;
    }
    console.log('翻译后的 JSON 文本已成功写入 lang.js');
});
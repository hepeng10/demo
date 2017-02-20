'use strict';

const express = require('express');

// 实例化 express 对象
const app = express();

// 设置端口号
app.set('port', process.env.PORT || 8888);

// 添加路由：它默认忽略了大小写或反斜杠，并且在进行匹配时也不考虑查询字符串
// Express 默认的状态码是200，不用显式指定
app.get('/', function(req, res) {
    res.type('text/plain');
    res.send('主页');
});
app.get('/about', function(req, res) {
    res.type('text/plain');
    res.send('关于页面');
});
// 可以使用通配符。当然，如果有 /column/xxx 页面要加载某个页面，需要写在它的上面
app.get('/column/*', function(req, res) {
    res.type('text/plain');
    res.send('栏目页面');
});

// app.use() 是 express 添加中间件的方法
// 定制 404 页面。必须写在路由之后，否则只会显示404页面
app.use(function(req, res, next) {
    res.type('text/plain');
    res.status(404);
    res.send('404 - Not Found');
});

// 定制 500 页面。use() 方法，express 会根据参数的个数区分 404 和 500。所以，这个放到路由上面不会导致只显示500页面的问题
app.use(function(err, req, res, next){
    console.error(err.stack);
    res.type('text/plain');
    res.status(500);
    res.send('500 - Server Error');
});

// app.get() 获取设置的端口号
app.listen(app.get('port'), function(){
    console.log(`Express started on http://localhost:${app.get('port')}; press Ctrl-C to terminate.`);
});

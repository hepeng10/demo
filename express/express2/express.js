'use strict';
// 使用 node express 命令执行此文件，就能开启服务器了。
const express = require('express');

// 实例化 express 对象
const app = express();

// 设置 handlebars 模板引擎
// handlebars 的模板默认放在 views 目录中
// views/layouts 目录用来放公共模板
const exphbs = require('express-handlebars');
// 调用 exphbs() 进行配置
// defaultLayout 设置默认布局模板，也就是 views/layouts 目录下的一个公共模板，所有其它页面都会加载到这个模板中的 {{{ body }}} 中
// extname 扩展名，默认为 handlebars，一般改为 hbs，这里为了方便改为 html
app.engine('.html', exphbs({ defaultLayout: 'main', extname: '.html' }));
app.set('view engine', '.html');

// 设置端口号
app.set('port', process.env.PORT || 80);

// 使用 static() 中间件添加静态资源目录
// static 中间件会自动为设置的目录创建一个路由，当要访问静态资源，如 /public/img/1.jpg 时，HTML 模板中不用通过相对路径来找到这个目录，直接使用 /img/1.jpg 即可（此路由对 URL 请求同样有效）
// 需要放在所有路由配置之前
app.use(express.static(`${__dirname}/public`));

// 添加路由：它默认忽略了大小写或反斜杠，并且在进行匹配时也不考虑查询字符串
// Express 默认的状态码是200，不用显式指定
app.get('/', function(req, res) {
    res.render('home'); // 使用 render() 方法渲染模板引擎。由于使用了 handlebars 模板引擎，这里会自动查找 views 目录下的 home 模板
});
app.get('/about', function(req, res) {
    res.render('about');
});
// 可以使用通配符。当然，如果有 /column/xxx 页面要加载某个页面，需要写在它的上面
app.get('/column/*', function(req, res) {
    res.type('text/plain');
    res.send('栏目页面');
});
app.get('/headers', function(req, res) {
    res.set('Content-Type', 'text/plain');
    var s = '';
    for (var name in req.headers) s += name + ': ' + req.headers[name] + '\n';
    res.send(s);
});

// app.use() 是 express 添加中间件的方法
// 定制 404 页面。必须写在路由之后，否则只会显示404页面
app.use(function(req, res, next) {
    res.status(404);
    res.render('404');
});

// 定制 500 页面。use() 方法，express 会根据参数的个数区分 404 和 500。所以，这个放到路由上面不会导致只显示500页面的问题
app.use(function(err, req, res, next) {
    console.error(err.stack);
    res.status(500);
    res.render('500');
});

// app.get() 获取设置的端口号
app.listen(app.get('port'), function() {
    console.log(`Express started on http://localhost:${app.get('port')}; press Ctrl-C to terminate.`);
});

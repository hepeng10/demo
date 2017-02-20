'use strict';

const http = require('http');
const fs = require('fs');

function serveStaticFile(res, path, contentType, responseCode) {
    if (!responseCode)
        responseCode = 200;
    // 读取 html 文件内容返回
    // node 中打开 html 页面不是像 Apache 那样直接访问 html 即可，而是通过读取 html 文件返回的形式。（也许 Apache 内部也是做了同样的处理？）
    // __dirname 会被解析为正在执行的脚本所在的目录的绝对路径，是个很好用的全局变量
    fs.readFile(__dirname + path, function(err, data) {
        if (err) {  // 没读取到文件，或文件权限不可读等，就会出错
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('500 - Internal Errror');
        } else {
            res.writeHead(responseCode, { 'Content-Type': contentType });
            res.end(data);
        }
    })
}
// node 的核心理念是事件驱动编程
// 这里 http 请求就是要处理的事件，createServer 里的方法就是要执行的事件内容。当有请求发送过来的时候，就会执行这里的内容
// 比如浏览器访问 http://localhost:8888/ 就会发送一个 http 请求，从而触发 http 请求事件
http.createServer(function(req, res) {
    // 规范化url，去掉查询字符串、可选的反斜杠，并把它变成小写
    const path = req.url.replace(/\/?(?:\?.*)?$/, '').toLowerCase();
    console.log(path);
    // URL 路由。通过不同的 URL 读取不同文件的内容返回
    switch (path) {
        case '':
            serveStaticFile(res, '/public/home.html', 'text/html');
            break;
        case '/about':
            serveStaticFile(res, '/public/about.html', 'text/html');
            break;
        case '/img/1.gif':
            serveStaticFile(res, '/public/img/1.gif', 'text/html');
            break;
        default:
            serveStaticFile(res, '/public/404.html', 'text/html', 404);
    }
}).listen(8888);

console.log('Server started on localhost:8888; press Ctrl-C to terminate....');

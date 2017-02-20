var http = require('http');

// node 的核心理念是事件驱动编程
// 这里 http 请求就是要处理的事件，createServer 里的方法就是要执行的事件内容。当有请求发送过来的时候，就会执行这里的内容
// 比如浏览器访问 http://localhost:8888/ 就会发送一个 http 请求，从而触发 http 请求事件
http.createServer(function(req, res) {
    console.log(req.url)
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Hello World');
}).listen(8888);

console.log('Server started on localhost:3000; press Ctrl-C to terminate....');

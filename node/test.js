// 测试代码
function a() {
    console.log(this,11111);
}
setTimeout(a,0);
setTimeout(function() {
    a();
},0);
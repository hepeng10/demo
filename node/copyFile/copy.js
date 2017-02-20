'use strict';
const fs = require( 'fs' ),
    stat = fs.stat;

const SRC = './src/';  // 源目录
const DST = './dst/';  // 目标目录

// 将源目录中的文件按顺序一一对应复制到目标目录中的每个子目录中
const copy = function( src ){
    // 读取目录中的所有文件/目录
    fs.readdir( src, function( err, paths ) {
        if( err ){
            throw err;
        }
        paths = paths.sort();
        // console.log(paths);

        let i = 1;

        paths.forEach(function( path ){
            // 由于文件操作是异步操作，所以使用一个代码块，里面新声明一个变量来保存当前变量。其实就类似新建个函数并立即执行
            {
                let filename = path,
                    _src = `${src}${filename}`,
                    _dst = '';
                let ii = i;
                fs.readdir(DST, function(err, paths) {
                    if (err) {
                        throw err;
                    }
                    paths = paths.sort();
                    // console.log(paths);
                    let j = 1;
                    paths.forEach(function(path) {
                        if (j === ii) {
                            _dst = `${DST}${path}/${filename}`;
                            console.log(`文件从 ${_src} 复制到了 ${_dst}`);
                            // 创建读取流
                            const readable = fs.createReadStream(_src);
                            // 创建写入流
                            const writable = fs.createWriteStream(_dst);
                            // 通过管道来传输流
                            readable.pipe(writable);
                        }
                        j++;
                    });
                });
            }

            i++;

            /*fs.exists( _dstDir, function( exists ){
                // 已存在
                if( exists ){
                    beginCopy(_src, _dst);
                }
                // 不存在
                else{
                    fs.mkdir( _dstDir, function(){
                        beginCopy(_src, _dst);
                    });
                }
            });*/

        });
    });
};

/*
function beginCopy(src, dst) {
    // stat 函数获取文件信息
    stat( src, function( err, st ){
        if ( err ){
            throw err;
        }
        // 判断是否为文件
        if ( st.isFile() ){
            // 创建读取流
            const readable = fs.createReadStream( src );
            // 创建写入流
            const writable = fs.createWriteStream( dst );   
            // 通过管道来传输流
            readable.pipe( writable );
        }
    });
}
*/

// 复制目录
copy(SRC);
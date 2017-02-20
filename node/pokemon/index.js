// 使用了 curl，邮件发送，短信发送
'use strict';

const request = require('request'); // curl
const App = require('alidayu-node'); // '阿里大于'短信服务
const nodemailer = require("nodemailer"); // 邮件服务

/* 短信服务 */
const app = new App('23418855', 'd4eda5e6ece52e83957718928d7d393f');
const sendSMS = function(pokemonDetails) {
    let { num, lat, lon, time } = pokemonDetails;
    // 短信变量长度有限制，所以需要截取
    lat = lat.toFixed(5);
    lon = lon.toFixed(5);
    app.smsSend({
        sms_type: 'normal',
        sms_free_sign_name: '宠物小精灵 GO', //短信签名，参考这里 http://www.alidayu.com/admin/service/sign
        // 这几个遍历必须是 string 类型而不能是 number 类型
        sms_param: JSON.stringify({ "num": `"${num}"`, "lat": `"${lat}"`, "lon": `"${lon}"`, "time": `"${time}"` }), //短信变量，对应短信模板里面的变量
        rec_num: '18608266661', //接收短信的手机号
        sms_template_code: 'SMS_12810539' //短信模板，参考这里 http://www.alidayu.com/admin/service/tpl
    }, function(res) {
        console.log(res)
    });
}


/* 邮件服务 */
const sendMail = function(pokemonDetails) {
    let transporter = nodemailer.createTransport('smtp://38792986@qq.com:nwzbjdmcirdwbjfa@smtp.qq.com');
    let mailOptions = {
        from: '"Tirion 👥" <38792986@qq.com>', // sender address
        to: 'hepeng10@qq.com', // list of receivers
        subject: `${pokemonDetails.num}号稀有神奇宝贝出现！`, // Subject line
        text: pokemonDetails.text, // plaintext body
        html: '' // html body
    };
    transporter.sendMail(mailOptions, function(error, info) {
        if (error) {
            return console.log(error);
        }
        console.log('Message sent: ' + info.response);
    });
}


// 日期格式化
Date.prototype.format = function(fmt) { //author: meizz   
    const o = {
        "M+": this.getMonth() + 1, //月份   
        "d+": this.getDate(), //日   
        "h+": this.getHours(), //小时   
        "m+": this.getMinutes(), //分   
        "s+": this.getSeconds(), //秒   
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度   
        "S": this.getMilliseconds() //毫秒   
    };
    if (/(y+)/.test(fmt))
        fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (let k in o)
        if (new RegExp("(" + k + ")").test(fmt))
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}


// 获取神奇宝贝信息
const getPokemonDetails = function(pokemon) {
    const now = Date.now();
    const expiration_time = pokemon.expiration_time * 1000;
    const num = pokemon.pokemonId;
    const time = (new Date(expiration_time - now)).format("mm:ss");
    const lat = pokemon.latitude;
    const lon = pokemon.longitude;
    const text = `${num}号神奇宝贝出现。剩余时间：${time}，纬度：${lat}，经度：${lon}`;
    return { num, time, lat, lon, text };
}

// 判断是否需要发送信息
const isSendMsg = function(searched, pokemon) {
    const { latitude, longitude } = pokemon;
    const expiration_time = pokemon.expiration_time * 1000;

    for (let i = 0, j = searched.length; i < j; i++) {
        // 先判断是否到期，剩余时间小于扫描间隔时间就可删除（注意，删掉后数组的长度会变，所以这两个 if 不能换位置）
        if (searched[i].expiration_time - Date.now() < config.intervalTime) {
            searched.splice(i, 1); // 引用传递，修改 searched 则修改 searchPokemon.searched
        }
        // 由于如果上面删除的是最后一个，这里取值就是 undefined 了，所以必须判断一下，不然 searched[i].lat 会报错导致程序退出
        if (searched[i]) {
            // 当经纬度相同的时候，说明这只神奇宝贝找到过并发了信息。则不再发送
            if (searched[i].latitude == latitude && searched[i].longitude == longitude) {
                console.log(`第${searchPokemon.i}次查找，找到${pokemon.pokemonId}号神奇宝贝，纬度：${latitude}，经度：${longitude}，此神奇宝贝已发送过信息，不再发送`);
                return false;
            }
        }
    }
    // 遍历完后，没找到经纬度相同的，说明是新的神奇宝贝。则添加到 searched 中并发送信息
    searched.push({ latitude, longitude, expiration_time });
    return true;
}

const config = {
    coordinate: ['34.00862/-118.49812', '-33.99083/150.89273', '37.79919/-122.45205', '43.74916/-79.32026', '51.50460/-0.14387', '34.02511/-118.51630'], // 要扫描的坐标，每次扫描从中取出一个
    // 使用 get，当调用 config.len 时，返回 coordinate 数组的长度
    get len() {
        return this.coordinate.length;
    },
    pokemonId: [3, 6, 131, 89, 110, 132, 143, 144, 145, 146, 149], // 需要发送信息的神奇宝贝编号。131-乘龙；
    intervalTime: 10 * 1000, // 扫描间隔时间
    index: 0 // 记录当前从 coordinate 中取出的位置
};

// 主函数
const searchPokemon = {
    i: 0, // 记录查找的次数
    // 当找到一只后，就记录它的经纬度和到期时间，避免重复发送消息
    searched: [
        // { longitude: 0, longitude: 0, expiration_time:0 } 
    ],
    init() {
        this.i++;
        // 已经取到最后一个了，则该重置位置了
        if (config.index === config.len) {
            config.index = 0;
        }
        const urlCoordinate = config.coordinate[config.index];
        // 发送 curl 请求
        request.get({
                // url:`https://pokevision.com/map/data/34.00862032615971/-118.49812209606169`,
                url: `https://pokevision.com/map/data/${urlCoordinate}`,
                encoding: 'utf8'
            },
            (error, response, body) => {
                if (response && response.statusCode == 200) {
                    // 当请求的地址出错，返回的不是 JSON 数据的时候，这里会导致报错。而且由于是异步调用中报的错，所以错误信息中也不会提示是这行解析错误。。。
                    let res = {};
                    try {
                        res = JSON.parse(response.body);
                    } catch (e) {
                        // console.log(response.body);
                        console.log('服务器返回数据出错，不是 JSON 数据。');
                        return;
                    }
                    if (res.status == 'success') {
                        let pokemon = res.pokemon;
                        config.index++;
                        // console.log(pokemon);
                        for (let i = 0, j = pokemon.length; i < j; i++) {
                            if (pokemon[i].is_alive == false) {
                                console.log('dead');
                            }
                            // 当前遍历的 pokemonId 是否在需要查找的数组中
                            if (config.pokemonId.indexOf(pokemon[i].pokemonId) > -1) {
                                const pokemonDetails = getPokemonDetails(pokemon[i]);
                                // 判断是否需要发送信息
                                const isSend = isSendMsg(this.searched, pokemon[i]);
                                if (!isSend) {
                                    return;
                                }

                                sendMail(pokemonDetails);
                                sendSMS(pokemonDetails);
                                console.log(pokemonDetails.text);
                                return;
                            }
                        }
                        console.log(`第${this.i}次查找，坐标${urlCoordinate}，未找到稀有神奇宝贝。。。。。。`);
                        return;
                    } else {
                        console.log(res.status);
                        return;
                    }
                } else {
                    if(response) {
                        console.log(response.statusCode);
                    }
                    return;
                }
            }
        );
    }
}

searchPokemon.init();

// 下面两个 setInterval 调用 searchPokemon.init 时， init 里的 this 指向不同。第一种 this 会指向 setInterval 创建的对象；第二种才是正常的！
// setInterval(searchPokemon.init, config.intervalTime);
setInterval(function() {
    searchPokemon.init();
}, config.intervalTime);

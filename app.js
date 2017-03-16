var request = require('request'),
    http = require('follow-redirects').http,
    request = request.defaults();
require('console.table');
var cookieString = 'sessionid=cocg3m90bf0ujqm2sip4z7a35oxndvjg';

var telegram = require('telegram-bot-api');

var api = new telegram({
        token: '307536142:AAFmnip-fvn6iRxVCWe8yIdmCpXzGxKPq5g',
        updates: {
            enabled: true
    }
});
const VK_ACCESS_TOKEN = "e3d5402fd1ef29f790969415a8a2a0ca9868615997f81463263fa174e148df1b2902388778bbd37b44794";
const Bot = require('./soc');
const VK = require('./soc/vk.js');

Bot.init({
    vk: {
        access_token: VK_ACCESS_TOKEN
    }
});

Bot.on('message', function(message) {
    console.log(message);
    var text = message.body.toLowerCase();
    
    if (text == "оценки") {
        console.log("ПОЛУЧАЮ ВСЕ ОЦЕНКИ");
        if (!Cache.get("all_marks")) {
            Bot.sendMessage({user_id: message.user_id, text: "Получаю оценки. Это может занять некторое время", access_token: VK_ACCESS_TOKEN}, function(response) {
                console.log(response);
                console.log("SENDED MESSAGE");
                requestToServer("/api/MarkService/GetSummaryMarks?date=2017-03-14", function(err, result) {
                    console.log(result);
                    var responseStr = "";

                    result.discipline_marks.forEach(function(e) {
                        var name = e.discipline;
                        var marks = e.marks;
                        var average_mark = e.average_mark;
                        var marksStr = "";
                        marks.forEach(function(e) {
                            marksStr = " "+e.mark+marksStr;
                        });
                        responseStr += name + ": " + marksStr+" "+average_mark+"\n";
                    })
                    Cache.set("all_marks", responseStr);
                    Bot.sendMessage({user_id: message.user_id, text: responseStr, access_token: VK_ACCESS_TOKEN}, function(response) {
                        console.log(response);
                        console.log("SENDED MESSAGE");
                    });
                });
            });
        } else {
            Bot.sendMessage({user_id: message.user_id, text: Cache.get("all_marks"), access_token: VK_ACCESS_TOKEN}, function(response) {
                        console.log(response);
                        console.log("SENDED MESSAGE");
            });
        }
    } else if (text == "триместр") {
        console.log("ПОЛУЧАЮ ОЦЕНКИ ЗА ТРИМЕСТР");
        if (!Cache.get("period_marks")) {
            Bot.sendMessage({user_id: message.user_id, text: "Получаю оценки. Это может занять некторое время", access_token: VK_ACCESS_TOKEN}, function(response) {
                console.log(response);
                console.log("SENDED MESSAGE");
                requestToServer("/api/MarkService/GetTotalMarks?dateFrom=2017-03-13&dateTo=2017-03-19&childPersonId=123456", function(err, result) {
                    //console.log(result)
                    var responseStr = "";
                    result.discipline_marks.forEach(function(e) {
                            var name = e.discipline;
                            var marks = e.period_marks;
                            var marksStr = "";
                            marks.forEach(function(e) {
                                        //console.log(e);
                            marksStr = " "+e.mark+marksStr;
                        })
                        console.log(name + ": " + marksStr);
                        responseStr += name + ": " + marksStr+"\n";
                    })
                    Cache.set("period_marks", responseStr);
                    Bot.sendMessage({user_id: message.user_id, text: responseStr, access_token: VK_ACCESS_TOKEN}, function(response) {
                        console.log(response);
                        console.log("SENDED MESSAGE");
                    });
                });
            });
        } else {
            Bot.sendMessage({user_id: message.user_id, text: Cache.get("period_marks"), access_token: VK_ACCESS_TOKEN}, function(response) {
                        console.log(response);
                        console.log("SENDED MESSAGE");
                    });
        }

    } else {
        console.log("НЕИЗВЕСТНАЯ КОМАНДА")
        Bot.sendMessage({user_id: message.user_id, text: "Неверная команда. Попробуйте снова", access_token: VK_ACCESS_TOKEN}, function(response) {
            console.log(response);
            console.log("SENDED MESSAGE");
        });
    }
})

const apiServer = "es.ciur.ru";

var User = {
    new: function(user) {
        User[user_id] = user;
    },
    update: function(field, value) {
        User[field] = value;
    }
};

var Cache = {
    get: function(cache_id) {
        return Cache[cache_id];
    },
    set: function (cache_id, value) {
        Cache[cache_id] = value;
        return true
    }
};

function requestToServer(path, callback) {
    var str = '';
    var options = {
        hostname: apiServer,
        path: path,
        method: 'GET',
        headers: {
            'User-Agent': 'Mozilla/5.0 (X11; Linux i686) AppleWebKit/537.11 (KHTML, like Gecko) Chrome/23.0.1271.64 Safari/537.11',
            'Cookie': cookieString,
            'Accept': '/',
            'Connection': 'keep-alive'
        }
    };

    http.request(options, function (resp) {
            resp.setEncoding('utf8');
            //console.log(resp.headers);
            if (resp.statusCode) {
                resp.on('data', function (part) {
                    str += part;
                });
                resp.on('end', function (part) {
                    //console.log(str);
                    var x = str;
                    var r = /\\u([\d\w]{4})/gi;
                    x = x.replace(r, function (match, grp) {
                        return String.fromCharCode(parseInt(grp, 16)); } );
                    x = unescape(x);
                    //console.log(x);
                    var result = JSON.parse(x);
                    callback(null, result);
                    
                });
                resp.on('error', function (e) {
                    console.log('Problem with request: ' + e.message);
                    
                });
            }
        }).end(str);
}
/*
api.on('message', function(message)
{
    // Received text message
    console.log(message);
    if (message.text.toLowerCase() == "триместр") {
        console.log('GETTIN MARKS');
        api.sendMessage({
            chat_id: message.chat.id,
            text: "Получю оценки. Запрос может занять несколько минут."
        });
        requestToServer("/api/MarkService/GetTotalMarks?dateFrom=2017-03-13&dateTo=2017-03-19&childPersonId=123456", function(err, result) {
            //console.log(result)
            var responseStr = "";
            result.discipline_marks.forEach(function(e) {
                    var name = e.discipline;
                    var marks = e.period_marks;
                    var marksStr = "";
                    marks.forEach(function(e) {
                                //console.log(e);
                    marksStr = " "+e.mark+marksStr;
                })
                console.log(name + ": " + marksStr);
                responseStr += name + ": " + marksStr+"\n";
            })
            api.sendMessage({
                chat_id: message.chat.id,
                text: responseStr
            })
        });
        
    }
    if (message.text.toLowerCase() == "оценки") {
        console.log("GETTIN MARKS");
        requestToServer("/api/MarkService/GetSummaryMarks?date=2017-03-14", function(err, result) {
            console.log(result);
            var responseStr = "";

            result.discipline_marks.forEach(function(e) {
                var name = e.discipline;
                var marks = e.marks;
                var average_mark = e.average_mark;
                var marksStr = "";
                marks.forEach(function(e) {
                    marksStr = " "+e.mark+marksStr;
                });
                responseStr += name + ": " + marksStr+" "+average_mark+"\n";
            })
            api.sendMessage({
                chat_id: message.chat.id,
                text: responseStr
            })
        });
    }
});
*/
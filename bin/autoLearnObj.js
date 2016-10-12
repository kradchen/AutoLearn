/**
 * Created by Administrator on 2016/2/25.
 */
var request = require('request');
var fs = require('fs');
var autoLearnObj ={};
autoLearnObj.getALObj =
    function getALObj (userName, passWord,authKey) {
        var alObj = {};
        alObj.userName = userName;
        alObj.passWord = passWord;
        alObj.authKey = authKey;
        alObj.request = request;
        alObj.j = global.cookiesJar;

        alObj.beginLearn = function () {
            console.log('beginLearn');
            alObj.request({
                    uri: 'http://yuhang.learning.gov.cn/study/login.php', har: {
                        url: 'http://yuhang.learning.gov.cn/study/login.php',
                        method: 'POST',
                        headers: [
                            {
                                name: 'content-type',
                                value: 'application/x-www-form-urlencoded'
                            }
                        ],
                        postData: {
                            mimeType: 'application/x-www-form-urlencoded',
                            params: [
                                {
                                    name: 'username',
                                    value: alObj.userName
                                },
                                {
                                    name: 'password',
                                    value: alObj.passWord
                                },
                                {
                                    name: "authKey",
                                    value: alObj.authKey
                                }
                            ]
                        }
                    }, jar: alObj.j
                },
                function (cerror, cresponse, cbody) {
                    console.log('beginLearn end');
                    if (!cerror) {
                        //console.log('1STATUS: ' + cresponse.statusCode);
                        //console.log('2HEADERS: ' + JSON.stringify(cresponse.headers));
                        alObj.UpdateCourseLogId();
                    }
                    else{
                        console.log('error: ' +error);
                    }
                });

        };
        alObj.UpdateCourseLogId = function UpdateCourseLogId() {
            //getlist
            alObj.request.get({url: 'http://yuhang.learning.gov.cn/study/index.php?act=studycourselist', jar: alObj.j},
                function (oerror, oresponse, obody) {
                    //console.log(obody);
                    if(obody.indexOf("act=detail&courseid=")!=0) {
                        //分析body，获取CourseId
                        var FirstCourseId = obody.substr(obody.indexOf("act=detail&courseid=") + 20, 10);
                        //set_course_session
                        console.log(alObj.userName+" try get set_course_session!");
                        var sessionParams = [{name: 'act', value: 'set_course_session'}, {
                            name: 'courseId',
                            value: FirstCourseId
                        }, {name: 'delay', value: '1200000'}];
                        alObj.AjaxCommunicate(sessionParams, function (ierror, iresponse, body) {
                            console.log("error:" + ierror);
                            //console.log("body:" + body);
                            var logParams = [{name: 'act', value: 'insert'}, {name: 'courseId', value: FirstCourseId}];
                            alObj.AjaxCommunicate(logParams, function (lerror, lresponse, lbody) {
                                console.log("error:" + lerror);
                                //console.log("body:" + lbody);
                                var logId = JSON.parse(lbody).logId;
                                console.log("logid:" + logId);
                                var updateParams = [{name: 'act', value: 'update'},
                                    {name: 'courseId', value: FirstCourseId},
                                    {name: 'logId', value: logId}];
                                alObj.delayUpdate(updateParams);
                            });
                        });
                    }
                });
        };
        alObj.AjaxCommunicate = function AjaxCommunicate(params,callback){
            alObj.request.post({uri:'http://yuhang.learning.gov.cn/study/ajax.php', har:{
                url: 'http://yuhang.learning.gov.cn/study/ajax.php',
                method: 'POST',
                headers: [
                    {
                        name: 'content-type',
                        value: 'application/x-www-form-urlencoded'
                    }
                ],
                postData: {
                    mimeType: 'application/x-www-form-urlencoded',
                    params: params
                }
            },jar:alObj.j},callback);
        };
        alObj.delayUpdate = function delayUpdate(params){
            console.log(alObj.userName+' try update Course!');
            alObj.AjaxCommunicate(params,
                function (error,response,body) {
                    var bodyObj = JSON.parse(body);
                    //完成
                    if (bodyObj.err == '1') {
                        console.log(alObj.userName+' Change Course!');
                        alObj.UpdateCourseLogId();
                    }
                    //未完成
                    if (bodyObj.err == '0') {
                        setTimeout(function() {
                            alObj.delayUpdate(params,alObj.j);
                        }, 180000);
                    }
                });
        };
        return alObj;
    };
autoLearnObj.refreshCookies=function() {
    global.fileUpdateFlag=0;
    console.log('Refresh Cookies begin!');
    global.cookiesJar=request.jar();
    request.get({
        uri: 'http://yuhang.learning.gov.cn/study/login.php',
        jar: global.cookiesJar
    }, function (error, response, body) {
        console.log('Refresh Cookies end!');
        if (!error && response.statusCode == 200) {
            console.log('STATUS: ' + response.statusCode);
            console.log('HEADERS: ' + JSON.stringify(response.headers));
            console.log('cookies: '+global.cookiesJar.getCookieString('http://yuhang.learning.gov.cn'));
        }
        else{
            console.log('error: ' +error);

        }

        downloadImg('http://www.learning.gov.cn/system/akey_img.php?'+Math.random(),'tempimg.png',function(){console.log('pipedone!');global.fileUpdateFlag=1;});
    });
};
var downloadImg = function(uri, filename, callback){

        request.get({uri:uri,jar: global.cookiesJar}).pipe(fs.createWriteStream('/src/public/images/'+filename)).on('close', callback);  //调用request的管道来下载到 images文件夹下

};
module.exports =  require('../bin/autoLearnObj');
module.exports = autoLearnObj;

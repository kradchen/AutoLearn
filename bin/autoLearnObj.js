/**
 * Created by Administrator on 2016/2/25.
 */
var autoLearnObj ={};
autoLearnObj.getALObj =
    function getALObj (userName, passWord) {
        var alObj = {};
        alObj.userName = userName;
        alObj.passWord = passWord;
        alObj.request = require('request');
        alObj.j = alObj.request.jar();
        alObj.beginLearn = function () {

            alObj.request.get({
                uri: 'http://yuhang.learning.gov.cn/study/login.php',
                jar: alObj.j
            }, function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    console.log('STATUS: ' + response.statusCode);
                    console.log('HEADERS: ' + JSON.stringify(response.headers));
                    //login
                    console.log(alObj.userName +" try login!");
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
                                            value:alObj.userName
                                        },
                                        {
                                            name: 'password',
                                            value: alObj.passWord
                                        }
                                    ]
                                }
                            }, jar:  alObj.j
                        },
                        function (cerror, cresponse, cbody) {
                            if (!cerror) {
                                console.log('1STATUS: ' + cresponse.statusCode);
                                console.log('2HEADERS: ' + JSON.stringify(cresponse.headers));
                                alObj.UpdateCourseLogId();
                            }
                        });
                }
            });
        };
        alObj.UpdateCourseLogId = function UpdateCourseLogId() {
            //getlist
            alObj.request.get({url: 'http://yuhang.learning.gov.cn/study/index.php?act=studycourselist', jar: alObj.j},
                function (oerror, oresponse, obody) {
                    console.log(obody);
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
                            console.log("body:" + body);
                            var logParams = [{name: 'act', value: 'insert'}, {name: 'courseId', value: FirstCourseId}];
                            alObj.AjaxCommunicate(logParams, function (lerror, lresponse, lbody) {
                                console.log("error:" + lerror);
                                console.log("body:" + lbody);
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
                        UpdateCourseLogId();
                    }
                    //未完成
                    if (bodyObj.err == '0') {
                        setTimeout(function() {
                            alObj.delayUpdate(params,alObj.j);
                        }, 1200000);
                    }
                });
        };
        return alObj;
    };

module.exports =  require('../bin/autoLearnObj');
module.exports = autoLearnObj;
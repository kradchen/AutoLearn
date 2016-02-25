var express = require('express');
var router = express.Router();
var request = require('request');
var j = request.jar();
//var autoLearnObj = require('../bin/autoLearnObj');
//var FirstCourseId;
//var logId;
/* GET home page. */
router.get('/', function(req, res, next) {
    var alobj1 = getALObj('330106198412035215','flychj123');
    alobj1.beginLearn();
    var alobj2 = getALObj('330106198509255249','11071203');
    alobj2.beginLearn();
  res.render('index', { title: 'Express' });
});
function getALObj(userName, passWord) {
    var alObj = {};
    alObj.userName = userName;
    alObj.passWord = passWord;
    alObj.request = require('request');
    alObj.j = alObj.request.jar();
    alObj.beginLearn = function () {

        request.get({
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
//function TryLogin() {
//    request.get({uri: 'http://yuhang.learning.gov.cn/study/login.php', jar: j}, function (error, response, body) {
//        if (!error && response.statusCode == 200) {
//            console.log('STATUS: ' + response.statusCode);
//            console.log('HEADERS: ' + JSON.stringify(response.headers));
//            //login
//            console.log("try login!");
//            request({
//                    uri: 'http://yuhang.learning.gov.cn/study/login.php', har: {
//                        url: 'http://yuhang.learning.gov.cn/study/login.php',
//                        method: 'POST',
//                        headers: [
//                            {
//                                name: 'content-type',
//                                value: 'application/x-www-form-urlencoded'
//                            }
//                        ],
//                        postData: {
//                            mimeType: 'application/x-www-form-urlencoded',
//                            params: [
//                                {
//                                    name: 'username',
//                                    value: '330106198412035215'
//                                },
//                                {
//                                    name: 'password',
//                                    value: 'flychj123'
//                                }
//                            ]
//                        }
//                    }, jar: j
//                },
//                function (cerror, cresponse, cbody) {
//                    if (!cerror) {
//                        console.log('1STATUS: ' + cresponse.statusCode);
//                        console.log('2HEADERS: ' + JSON.stringify(cresponse.headers));
//                        UpdateCourseLogId();
//                    }
//                });
//        }
//    });
//}
//function UpdateCourseLogId() {
//    //getlist
//    request.get({url: 'http://yuhang.learning.gov.cn/study/index.php?act=studycourselist', jar: j},
//        function (oerror, oresponse, obody) {
//            console.log(obody);
//            if(obody.indexOf("act=detail&courseid=")!=0) {
//                //分析body，获取CourseId
//                FirstCourseId = obody.substr(obody.indexOf("act=detail&courseid=") + 20, 10);
//                //set_course_session
//                console.log("try get set_course_session!");
//                var sessionParams = [{name: 'act', value: 'set_course_session'}, {
//                    name: 'courseId',
//                    value: FirstCourseId
//                }, {name: 'delay', value: '1200000'}];
//                AjaxCommunicate(sessionParams, function (ierror, iresponse, body) {
//                    console.log("error:" + ierror);
//                    console.log("body:" + body);
//                    var logParams = [{name: 'act', value: 'insert'}, {name: 'courseId', value: FirstCourseId}];
//                    AjaxCommunicate(logParams, function (lerror, lresponse, lbody) {
//                        console.log("error:" + lerror);
//                        console.log("body:" + lbody);
//                        logId = JSON.parse(lbody).logId;
//                        console.log("logid:" + logId);
//                        var updateParams = [{name: 'act', value: 'update'},
//                            {name: 'courseId', value: FirstCourseId},
//                            {name: 'logId', value: logId}];
//                        delayUpdate(updateParams);
//                    });
//                });
//            }
//        });
//}
//function AjaxCommunicate(params,callback){
//    request.post({uri:'http://yuhang.learning.gov.cn/study/ajax.php', har:{
//        url: 'http://yuhang.learning.gov.cn/study/ajax.php',
//        method: 'POST',
//        headers: [
//            {
//                name: 'content-type',
//                value: 'application/x-www-form-urlencoded'
//            }
//        ],
//        postData: {
//            mimeType: 'application/x-www-form-urlencoded',
//            params: params
//        }
//    },jar:j},callback);
//}
//function delayUpdate(params){
//    AjaxCommunicate(params,
//    function (error,response,body) {
//        var bodyObj = JSON.parse(body);
//        //完成
//        if (bodyObj.err == '1') {
//            UpdateCourseLogId();
//        }
//        //未完成
//        if (bodyObj.err == '0') {
//            setTimeout(function() {
//                delayUpdate(params,j);
//            }, 1200000);
//        }
//      });
//}
module.exports = router;

var express = require('express');
var router = express.Router();
var request = require('request');
var j = request.jar();
var FirstCourseId;
var logId;
/* GET home page. */
router.get('/', function(req, res, next) {
    TryLogin();
  res.render('index', { title: 'Express' });
});
function TryLogin() {
    request.get({uri: 'http://yuhang.learning.gov.cn/study/login.php', jar: j}, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            console.log('STATUS: ' + response.statusCode);
            console.log('HEADERS: ' + JSON.stringify(response.headers));
            //login
            console.log("try login!");
            request({
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
                                    value: '330106198412035215'
                                },
                                {
                                    name: 'password',
                                    value: 'flychj123'
                                }
                            ]
                        }
                    }, jar: j
                },
                function (cerror, cresponse, cbody) {
                    if (!cerror) {
                        console.log('1STATUS: ' + cresponse.statusCode);
                        console.log('2HEADERS: ' + JSON.stringify(cresponse.headers));
                        UpdateCourseLogId();
                    }
                });
        }
    });
}
function UpdateCourseLogId() {
    //getlist
    request.get({url: 'http://yuhang.learning.gov.cn/study/index.php?act=studycourselist', jar: j},
        function (oerror, oresponse, obody) {
            console.log(obody);
            if(obody.indexOf("act=detail&courseid=")!=0) {
                //分析body，获取CourseId
                FirstCourseId = obody.substr(obody.indexOf("act=detail&courseid=") + 20, 10);
                //set_course_session
                console.log("try get set_course_session!");
                var sessionParams = [{name: 'act', value: 'set_course_session'}, {
                    name: 'courseId',
                    value: FirstCourseId
                }, {name: 'delay', value: '1200000'}];
                AjaxCommunicate(sessionParams, function (ierror, iresponse, body) {
                    console.log("error:" + ierror);
                    console.log("body:" + body);
                    var logParams = [{name: 'act', value: 'insert'}, {name: 'courseId', value: FirstCourseId}];
                    AjaxCommunicate(logParams, function (lerror, lresponse, lbody) {
                        console.log("error:" + lerror);
                        console.log("body:" + lbody);
                        logId = JSON.parse(lbody).logId;
                        console.log("logid:" + logId);
                        var updateParams = [{name: 'act', value: 'update'},
                            {name: 'courseId', value: FirstCourseId},
                            {name: 'logId', value: logId}];
                        delayUpdate(updateParams);
                    });
                });
            }
        });
}
function AjaxCommunicate(params,callback){
    request.post({uri:'http://yuhang.learning.gov.cn/study/ajax.php', har:{
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
    },jar:j},callback);
}
function delayUpdate(params){
    AjaxCommunicate(params,
    function (error,response,body) {
        var bodyObj = JSON.parse(body);
        //完成
        if (bodyObj.err == '1') {
            UpdateCourseLogId();
        }
        //未完成
        if (bodyObj.err == '0') {
            setTimeout(function() {
                delayUpdate(params,j);
            }, 1200000);
        }
      });
}
module.exports = router;

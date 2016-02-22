var express = require('express');
var router = express.Router();
var request = require('request');
var j = request.jar();
/* GET home page. */
router.get('/', function(req, res, next) {
    request.get({url:'http://yuhang.learning.gov.cn/study/login.php',jar:j},function(error,response,body){
        if (!error && response.statusCode == 200) {
            console.log('STATUS: ' + response.statusCode);
            console.log('HEADERS: ' + JSON.stringify(response.headers));
            beginLearn();
        }
    });

  res.render('index', { title: 'Express' });
});
function beginLearn() {
    //login
    console.log("try login!");
    request("", {
            method: 'GET', har: {
                url: 'http://yuhang.learning.gov.cn/study/login.php',
                method: 'POST',
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
            }
        },
        function (cerror,cresponse,cbody) {
            console.log("erroe:"+cerror);
            if (!cerror ) {
                console.log('1STATUS: ' + cresponse.statusCode);
                console.log('2HEADERS: ' + JSON.stringify(cresponse.headers));
                console.log('3BODY: ' + cbody);
            }
            //getlist
            request.get({url:'http://yuhang.learning.gov.cn/study/index.php?act=studycourselist',jar:j},
                function (oerror,oresponse,obody) {
                    var bodyString =oresponse.body.innerHTML;
                    console.log("try2");
                    console.log(bodyString);
                    console.log(obody);
                    return ;
                    //分析body，获取CourseId
                    var FirstCourseId = obody.sub(bodyString.indexOf("act=detail&courseid=\"") + 21, 10);
                    //getLogId
                    console.log("try get logid!");
                    request.post('http://yuhang.learning.gov.cn/study/ajax.php', {
                        form: {
                            act: 'insert',
                            courseId: FirstCourseId
                        }
                    }, function (ierror, iresponse, body) {
                        var logId = body.logId;
                        console.log("logid:"+logId);
                        //updateTime
                        request.post('http://yuhang.learning.gov.cn/study/ajax.php', function (iierror, iiresponse, ibody) {
                                //完成
                                if (ibody.err == '1') {
console.log("error=1");
                                }
                                //未完成
                                if (ibody.err == '0') {
                                    console.log("error=0");
                                }
                            },
                            {
                                form: {
                                    act: 'update',
                                    courseId: FirstCourseId,
                                    logId: logId
                                }
                            });
                    });

                });
        });
    //function ()
}
function delayUpdate(sbody,courseIdAry) {
  var logId = sbody.logId;
  //updateTime

  request.post('http://yuhang.learning.gov.cn/study/ajax.php', {
        form: {
          act: 'update',
          courseId: courseIdAry[0],
          logId: logId
        }
      },
      function (ubody) {
        //完成
        if (ubody.err == '1') {

        }
        //未完成
        if (ubody.err == '0') {

        }
      });
}
module.exports = router;

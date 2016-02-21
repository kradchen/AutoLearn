var express = require('express');
var router = express.Router();
var request = require('request');
/* GET home page. */
router.get('/', function(req, res, next) {
    beginLearn();
  res.render('index', { title: 'Express' });
});
function beginLearn() {
    //login
    console.log("try login!");
    request.post('http://yuhang.learning.gov.cn/system/login.php', {form: {username: '330106198412035215', passwd: 'flychj123', loginType: '1'}},
        function (error,response,body) {
            console.log(body);
            console.log("try get list!");
            //getlist
            request.get('http://yuhang.learning.gov.cn/study/index.php?act=studycourselist',
                function (oerror,oresponse,obody) {
                    var bodyString =oresponse.body.innerHTML;
                    console.log(bodyString);
                    //分析body，获取CourseId
                    var FirstCourseId = bodyString.substring(bodyString.indexOf("act=detail&courseid=\"") + 21, 10);
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

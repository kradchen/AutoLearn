var express = require('express');
var router = express.Router();
var request = require('request');
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
function beginLearn() {
  //login
  request.post('http://yuhang.learning.gov.cn/system/login.php', {form: {username: '', passwd: '', loginType: '1'}},
      function () {
        //getlist
        request.get('http://yuhang.learning.gov.cn/study/index.php?act=studycourselist',
            function (error, response, body) {
              //分析body，获取CourseId
              var courseIdAry = new Array();
              //getLogId
              request.post('http://yuhang.learning.gov.cn/study/ajax.php', {
                    form: {
                      act: 'insert',
                      courseId: courseIdAry[0]
                    }
                  },delayUpdate(body,courseIdAry));

                  });
            });
  //function ()
};
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

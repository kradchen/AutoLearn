var express = require('express');
var router = express.Router();
var autoLearnObj = require('../bin/autoLearnObj');
var alObjectList = require('../bin/aLObjList');
var fs = require('fs');
//var FirstCourseId;
//var logId;
/* GET home page. */
router.get('/', function(req, res, next) {
    autoLearnObj.refreshCookies();
    res.render('index', {title: 'Home', loginUser: alObjectList});
});

router.post('/', function(req, res, next) {
    var alobj = autoLearnObj.getALObj(req.body.userID,req.body.pwd,req.body.authKey);

    alobj.beginLearn();
    alObjectList.push(req.body.userID);
    //res.render('index', { title: 'Home',loginUser:alObjectList });
});

module.exports = router;

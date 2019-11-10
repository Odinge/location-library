/*
 * @Author: your name
 * @Date: 2019-10-31 17:49:21
 * @LastEditTime: 2019-11-05 16:05:25
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \node\09-library\routes\index.js
 */
var express = require("express");
var router = express.Router();

/* GET home page. */
router.get("/", function(req, res, next) {
  res.redirect("/catalog");
});

module.exports = router;

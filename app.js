/*
 * @Author: your name
 * @Date: 2019-10-31 17:49:21
 * @LastEditTime: 2019-11-10 16:05:08
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \node\09-library\app.js
 */

var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan"); // 日志管理
var compression = require("compression"); // 压缩资源
var helmet = require("helmet"); //避免被常见漏洞侵袭

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var catalogRouter = require("./routes/catalog");

var app = express();

//避免被常见漏洞侵袭
app.use(helmet());

// Set up mongoose connection
// 导入 mongoose 模块
const mongoose = require("mongoose");
// 设置默认 mongoose 连接
const mongoDB = "mongodb://127.0.0.1:27017/library";
mongoose.connect(mongoDB, { useUnifiedTopology: true, useNewUrlParser: true });
// 让 mongoose 使用全局 Promise 库
mongoose.Promise = global.Promise;
// 取得默认连接
const db = mongoose.connection;
// 将连接与错误事件绑定（以获得连接错误的提示）
db.on(
  "open",
  console.log.bind(console, "MongoDB 已连接：http://localhost:3000")
);
db.on("error", console.error.bind(console, "MongoDB 连接错误："));

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// 压缩资源
app.use(compression()); //Compress all routes
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/catalog", catalogRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;

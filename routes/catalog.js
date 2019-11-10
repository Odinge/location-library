/*
 * @Author: your name
 * @Date: 2019-11-05 15:10:00
 * @LastEditTime: 2019-11-05 20:19:09
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \node\09-library\routes\catalog.js
 */

const express = require("express");
const router = express.Router();

const author_controller = require("../controllers/authorController");
const book_controller = require("../controllers/bookController");
const book_instance_controller = require("../controllers/bookinstanceController");
const genre_controller = require("../controllers/genreController");

// ================ 书籍路由 ================
router.get("/", book_controller.index);
// 获取书籍列表
router.get("/books", book_controller.book_list);
// 获取页面和创建书籍
router.get("/book/create", book_controller.book_create_get);
router.post("/book/create", book_controller.book_create_post);
// 获取书籍详细信息
router.get("/book/:id", book_controller.book_detail);
// 获取页面和修改书籍
router.get("/book/:id/update", book_controller.book_update_get);
router.post("/book/:id/update", book_controller.book_update_post);
// 获取页面的删除书籍
router.get("/book/:id/delete", book_controller.book_delete_get);
router.post("/book/:id/delete", book_controller.book_delete_post);

// ================ 作者路由 ================
// 获取作者列表
router.get("/authors", author_controller.author_list);
// 获取页面和创建作者
router.get("/author/create", author_controller.author_create_get);
router.post("/author/create", author_controller.author_create_post);
// 获取作者详细信息
router.get("/author/:id", author_controller.author_detail);
// 获取页面和修改作者
router.get("/author/:id/update", author_controller.author_update_get);
router.post("/author/:id/update", author_controller.author_update_post);
// 获取页面的删除作者
router.get("/author/:id/delete", author_controller.author_delete_get);
router.post("/author/:id/delete", author_controller.author_delete_post);

// ================ 书籍种类路由 ================
// 获取书籍种类列表
router.get("/genres", genre_controller.genre_list);
// 获取页面和创建书籍种类
router.get("/genre/create", genre_controller.genre_create_get);
router.post("/genre/create", genre_controller.genre_create_post);
// 获取书籍种类详细信息
router.get("/genre/:id", genre_controller.genre_detail);
// 获取页面和修改书籍种类
router.get("/genre/:id/update", genre_controller.genre_update_get);
router.post("/genre/:id/update", genre_controller.genre_update_post);
// 获取页面的删除书籍种类
router.get("/genre/:id/delete", genre_controller.genre_delete_get);
router.post("/genre/:id/delete", genre_controller.genre_delete_post);

// ================ 书籍副本路由 ================
// 获取书籍副本列表
router.get("/bookinstances", book_instance_controller.bookinstance_list);
// 获取页面和创建书籍副本
router.get(
  "/bookinstance/create",
  book_instance_controller.bookinstance_create_get
);
router.post(
  "/bookinstance/create",
  book_instance_controller.bookinstance_create_post
);
// 获取书籍副本详细信息
router.get("/bookinstance/:id", book_instance_controller.bookinstance_detail);
// 获取页面和修改书籍副本
router.get(
  "/bookinstance/:id/update",
  book_instance_controller.bookinstance_update_get
);
router.post(
  "/bookinstance/:id/update",
  book_instance_controller.bookinstance_update_post
);
// 获取页面的删除书籍副本
router.get(
  "/bookinstance/:id/delete",
  book_instance_controller.bookinstance_delete_get
);
router.post(
  "/bookinstance/:id/delete",
  book_instance_controller.bookinstance_delete_post
);

module.exports = router;

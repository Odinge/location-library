/*
 * @Author: your name
 * @Date: 2019-11-05 15:05:04
 * @LastEditTime: 2019-11-07 09:47:53
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \node\09-library\controllers\authorController.js
 */

const BookInstance = require("../models/bookinstance");
const Book = require("../models/book");
const async = require("async");

const { body, validationResult } = require("express-validator/check");
const { sanitizeBody } = require("express-validator/filter");

// 显示完整的书籍副本列表
exports.bookinstance_list = (req, res, next) => {
  BookInstance.find()
    .populate("book")
    .exec((err, list) => {
      if (err) return next(err);
      res.render("bookinstance_list", {
        title: "Book Instance List",
        bookinstance_list: list
      });
    });
};

// 为每位书籍副本显示详细信息的页面
exports.bookinstance_detail = (req, res, next) => {
  const { id } = req.params;
  BookInstance.findById(id)
    .populate("book")
    .exec((err, bookinstance) => {
      if (err) next(err);
      if (bookinstance == null) {
        // No results.
        var err = new Error("Book copy not found");
        err.status = 404;
        return next(err);
      }
      res.render("bookinstance_detail", {
        title: "Book Instance Detail",
        bookinstance
      });
    });
};

// 由 GET 显示创建书籍副本的表单
exports.bookinstance_create_get = (req, res) => {
  Book.find({}, "title").exec(function(err, books) {
    if (err) return next(err);

    // Successful, so render.
    res.render("bookinstance_form", {
      title: "Create BookInstance",
      book_list: books
    });
  });
};

// 由 POST 处理书籍副本创建操作
exports.bookinstance_create_post = [
  body("book", "Book must be specified")
    .isLength({ min: 1 })
    .trim(),
  body("imprint", "Imprint must be specified")
    .isLength({ min: 1 })
    .trim(),
  body("due_back", "Invalid date")
    .optional({ checkFalsy: true })
    .isISO8601(),

  // Sanitize fields.
  sanitizeBody("book")
    .trim()
    .escape(),
  sanitizeBody("imprint")
    .trim()
    .escape(),
  sanitizeBody("status")
    .trim()
    .escape(),
  sanitizeBody("due_back").toDate(),

  (req, res, next) => {
    const errors = validationResult(req);
    const bookinstance = new BookInstance(req.body);
    if (!errors.isEmpty()) {
      Book.find({}, "title").exec(function(err, books) {
        if (err) return next(err);
        // Successful, so render.
        res.render("bookinstance_form", {
          title: "Create BookInstance",
          book_list: books,
          errors: errors.array(),
          bookinstance
        });
      });
    } else {
      bookinstance.save(err => {
        if (err) return next(err);
        // Successful - redirect to new record.
        res.redirect(bookinstance.url);
      });
    }
  }
];

// 由 GET 显示删除书籍副本的表单
exports.bookinstance_delete_get = (req, res, next) => {
  BookInstance.findById(req.params.id)
    .populate("book")
    .exec((err, bookinstance) => {
      if (err) return next(err);
      res.render("bookinstance_detail", {
        title: "Delete Book Instance",
        bookinstance,
        del: true
      });
    });
};

// 由 POST 处理书籍副本删除操作
exports.bookinstance_delete_post = (req, res, next) => {
  BookInstance.findByIdAndDelete(req.body.bookinstanceid, err => {
    if (err) return next(err);
    res.redirect("/catalog/bookinstances");
  });
};

// 由 GET 显示更新书籍副本的表单
exports.bookinstance_update_get = (req, res, next) => {
  const { id } = req.params;
  async.parallel(
    {
      bookinstance(cb) {
        BookInstance.findById(id, cb);
      },
      book_list(cb) {
        Book.find({}, "title", cb);
      }
    },
    (err, result) => {
      if (err) return next(err);
      if (result.bookinstance == null) {
        err = new Error("Bookinstance not found");
        err.status = 404;
        return next(err);
      }
      res.render("bookinstance_form", {
        title: "Update Bookinstance",
        ...result
      });
    }
  );
};

// 由 POST 处理书籍副本更新操作
exports.bookinstance_update_post = [
  body("book", "Book must be specified")
    .isLength({ min: 1 })
    .trim(),
  body("imprint", "Imprint must be specified")
    .isLength({ min: 1 })
    .trim(),
  body("due_back", "Invalid date")
    .optional({ checkFalsy: true })
    .isISO8601(),

  // Sanitize fields.
  sanitizeBody("book")
    .trim()
    .escape(),
  sanitizeBody("imprint")
    .trim()
    .escape(),
  sanitizeBody("status")
    .trim()
    .escape(),
  sanitizeBody("due_back").toDate(),

  (req, res, next) => {
    const errors = validationResult(req);
    const { id } = req.params;
    const bookinstance = new BookInstance({ ...req.body, _id: id });
    if (!errors.isEmpty()) {
      Book.find({}, "title").exec(function(err, books) {
        if (err) return next(err);
        // Successful, so render.
        res.render("bookinstance_form", {
          title: "Create BookInstance",
          book_list: books,
          errors: errors.array(),
          bookinstance
        });
      });
    } else {
      BookInstance.findByIdAndUpdate(
        id,
        bookinstance,
        {},
        (err, theBookinstance) => {
          if (err) return next(err);
          // Successful - redirect to new record.
          res.redirect(theBookinstance.url);
        }
      );
    }
  }
];

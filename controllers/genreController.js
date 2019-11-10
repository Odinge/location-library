/*
 * @Author: your name
 * @Date: 2019-11-05 15:05:04
 * @LastEditTime: 2019-11-07 10:25:02
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \node\09-library\controllers\authorController.js
 */

const Genre = require("../models/genre");
const Book = require("../models/book");
const async = require("async");
const mongoose = require("mongoose");

const { body, validationResult } = require("express-validator/check");
const { sanitizeBody } = require("express-validator/filter");

// 显示完整的书籍种类列表
exports.genre_list = (req, res, next) => {
  Genre.find().exec((err, list) => {
    if (err) return next(err);
    res.render("genre_list", { title: "Genre List", genre_list: list });
  });
};

// 为每位书籍种类显示详细信息的页面
exports.genre_detail = (req, res, next) => {
  // 转换id
  const id = mongoose.Types.ObjectId(req.params.id);
  // 异步同行
  async.parallel(
    {
      genre: function(callback) {
        Genre.findById(id).exec(callback);
      },

      genre_books: function(callback) {
        Book.find({ genre: id }).exec(callback);
      }
    },
    function(err, results) {
      if (err) return next(err);

      if (results.genre == null) {
        // No results.
        var err = new Error("Genre not found");
        err.status = 404;
        return next(err);
      }
      // Successful, so render
      res.render("genre_detail", {
        title: "Genre Detail",
        genre: results.genre,
        genre_books: results.genre_books
      });
    }
  );
};

// 由 GET 显示创建书籍种类的表单
exports.genre_create_get = (req, res) => {
  res.render("genre_form", { title: "Create Genre" });
};

// 由 POST 处理书籍种类创建操作
exports.genre_create_post = [
  // Validate that the name field is not empty.
  body("name", "Genre name required")
    .isLength({ min: 1 })
    .trim(),

  // Sanitize (trim and escape) the name field.
  sanitizeBody("name")
    .trim()
    .escape(),

  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a genre object with escaped and trimmed data.
    var genre = new Genre({ name: req.body.name });

    if (!errors.isEmpty()) {
      // There are errors. Render the form again with sanitized values/error messages.
      res.render("genre_form", {
        title: "Create Genre",
        genre: genre,
        errors: errors.array()
      });
      return;
    } else {
      // Data from form is valid.
      // Check if Genre with same name already exists.
      Genre.findOne({ name: req.body.name }).exec(function(err, found_genre) {
        if (err) {
          return next(err);
        }

        if (found_genre) {
          // Genre exists, redirect to its detail page.
          res.redirect(found_genre.url);
        } else {
          genre.save(function(err) {
            if (err) {
              return next(err);
            }
            // Genre saved. Redirect to genre detail page.
            res.redirect(genre.url);
          });
        }
      });
    }
  }
];
// 由 GET 显示删除书籍种类的表单
exports.genre_delete_get = (req, res, next) => {
  const { id } = req.params;
  async.parallel(
    {
      genre(cb) {
        Genre.findById(id, cb);
      },
      genre_books(cb) {
        Book.find({ genre: id }, cb);
      }
    },
    (err, results) => {
      if (err) return next(err);
      if (results.genre == null) {
        return res.redirect("/catalog/genres");
      }
      res.render("genre_delete", {
        title: "Delete Genre",
        ...results
      });
    }
  );
};

// 由 POST 处理书籍种类删除操作
exports.genre_delete_post = (req, res, next) => {
  const { id } = req.params;
  async.parallel(
    {
      genre(cb) {
        Genre.findById(id, cb);
      },
      genre_books(cb) {
        Book.find({ genre: id }, cb);
      }
    },
    (err, results) => {
      if (err) return next(err);
      if (results.genre == null) {
        return res.redirect("/catalog/genres");
      }
      if (results.genre_books.length) {
        res.render("genre_delete", {
          title: "Delete Genre",
          ...results
        });
      } else {
        Genre.findByIdAndDelete(id, err => {
          if (err) return next(err);
          res.redirect("/catalog/genres");
        });
      }
    }
  );
};

// 由 GET 显示更新书籍种类的表单
exports.genre_update_get = (req, res) => {
  const { id } = req.params;
  Genre.findById(id).exec((err, genre) => {
    if (err) return next(err);
    res.render("genre_form", { title: "Update Genre", genre });
  });
};

// 由 POST 处理书籍种类更新操作
exports.genre_update_post = [
  // Validate that the name field is not empty.
  body("name", "Genre name required")
    .isLength({ min: 1 })
    .trim(),

  // Sanitize (trim and escape) the name field.
  sanitizeBody("name")
    .trim()
    .escape(),

  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);
    const { id } = req.params;
    const genre = new Genre({ name: req.body.name, _id: id });
    if (!errors.isEmpty()) {
      // There are errors. Render the form again with sanitized values/error messages.
      res.render("genre_form", {
        title: "Create Genre",
        genre,
        errors: errors.array()
      });
      return;
    } else {
      // Data from form is valid.
      // Check if Genre with same name already exists.
      Genre.findOne({ name: req.body.name }).exec(function(err, found_genre) {
        if (err) return next(err);

        if (found_genre) {
          // Genre exists, redirect to its detail page.
          res.redirect(found_genre.url);
        } else {
          Genre.findByIdAndUpdate(id, genre, {}, (err, theGenre) => {
            if (err) return next(err);
            // Genre saved. Redirect to genre detail page.
            res.redirect(theGenre.url);
          });
        }
      });
    }
  }
];

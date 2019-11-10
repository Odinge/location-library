/*
 * @Author: your name
 * @Date: 2019-11-05 15:05:04
 * @LastEditTime: 2019-11-07 10:23:30
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \node\09-library\controllers\authorController.js
 */

const Author = require("../models/author");
const Book = require("../models/book");
const async = require("async");
const { body, validationResult } = require("express-validator/check");
const { sanitizeBody } = require("express-validator/filter");

// 显示完整的作者列表
exports.author_list = (req, res) => {
  Author.find()
    .sort([["family_name", "ascending"]])
    .exec(function(err, list_authors) {
      if (err) return next(err);

      //Successful, so render
      res.render("author_list", {
        title: "Author List",
        author_list: list_authors
      });
    });
};

// 为每位作者显示详细信息的页面
exports.author_detail = (req, res, next) => {
  const { id } = req.params;
  async.parallel(
    {
      author(cb) {
        Author.findById(id).exec(cb);
      },
      author_books(cb) {
        Book.find({ author: id }).exec(cb);
      }
    },
    (err, result) => {
      if (err) return next(err);
      if (result.author == null) {
        err = new Error("Author not found");
        err.status = 404;
        return next(err);
      }
      res.render("author_detail", {
        title: "Author Detail",
        author: result.author,
        author_books: result.author_books
      });
    }
  );
};

// 由 GET 显示创建作者的表单
exports.author_create_get = (req, res) => {
  res.render("author_form", { title: "Create Author" });
};

// 由 POST 处理作者创建操作
exports.author_create_post = [
  // Validate fields.
  body("first_name")
    .isLength({ min: 1 })
    .trim()
    .withMessage("First name must be specified.")
    .isAlphanumeric()
    .withMessage("First name has non-alphanumeric characters."),
  body("family_name")
    .isLength({ min: 1 })
    .trim()
    .withMessage("Family name must be specified.")
    .isAlphanumeric()
    .withMessage("Family name has non-alphanumeric characters."),
  body("date_of_birth", "Invalid date of birth")
    .optional({ checkFalsy: true })
    .isISO8601(),
  body("date_of_death", "Invalid date of death")
    .optional({ checkFalsy: true })
    .isISO8601(),

  // Sanitize fields.
  sanitizeBody("first_name")
    .trim()
    .escape(),
  sanitizeBody("family_name")
    .trim()
    .escape(),
  sanitizeBody("date_of_birth").toDate(),
  sanitizeBody("date_of_death").toDate(),

  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/errors messages.
      res.render("author_form", {
        title: "Create Author",
        author: req.body,
        errors: errors.array()
      });
    } else {
      // Data from form is valid.

      // Create an Author object with escaped and trimmed data.
      var author = new Author({
        first_name: req.body.first_name,
        family_name: req.body.family_name,
        date_of_birth: req.body.date_of_birth,
        date_of_death: req.body.date_of_death
      });
      author.save(function(err) {
        if (err) return next(err);

        // Successful - redirect to new author record.
        res.redirect(author.url);
      });
    }
  }
];

// 由 GET 显示删除作者的表单
exports.author_delete_get = (req, res, next) => {
  const { id } = req.params;
  async.parallel(
    {
      author(cb) {
        Author.findById(id).exec(cb);
      },
      author_books(cb) {
        Book.find({ author: id }).exec(cb);
      }
    },
    (err, result) => {
      if (err) return next(err);
      if (result.author == null) {
        res.redirect("/catalog/authors");
      }
      res.render("author_delete", {
        title: "Delete Author",
        ...result
      });
    }
  );
};

// 由 POST 处理作者删除操作
exports.author_delete_post = (req, res, next) => {
  async.parallel(
    {
      author: function(callback) {
        Author.findById(req.body.authorid).exec(callback);
      },
      authors_books: function(callback) {
        Book.find({ author: req.body.authorid }).exec(callback);
      }
    },
    (err, results) => {
      if (err) return next(err);

      // Success
      if (results.authors_books.length > 0) {
        // Author has books. Render in same way as for GET route.
        res.render("author_delete", {
          title: "Delete Author",
          author: results.author,
          author_books: results.authors_books
        });
        return;
      } else {
        // Author has no books. Delete object and redirect to the list of authors.
        Author.findByIdAndRemove(req.body.authorid, err => {
          if (err) return next(err);

          // Success - go to author list
          res.redirect("/catalog/authors");
        });
      }
    }
  );
};

// 由 GET 显示更新作者的表单
exports.author_update_get = (req, res, next) => {
  const { id } = req.params;
  Author.findById(id).exec((err, author) => {
    if (err) return next(err);
    res.render("author_form", { title: "Update Author", author });
  });
};

// 由 POST 处理作者更新操作
exports.author_update_post = [
  // Validate fields.
  body("first_name")
    .isLength({ min: 1 })
    .trim()
    .withMessage("First name must be specified.")
    .isAlphanumeric()
    .withMessage("First name has non-alphanumeric characters."),
  body("family_name")
    .isLength({ min: 1 })
    .trim()
    .withMessage("Family name must be specified.")
    .isAlphanumeric()
    .withMessage("Family name has non-alphanumeric characters."),
  body("date_of_birth", "Invalid date of birth")
    .optional({ checkFalsy: true })
    .isISO8601(),
  body("date_of_death", "Invalid date of death")
    .optional({ checkFalsy: true })
    .isISO8601(),

  // Sanitize fields.
  sanitizeBody("first_name")
    .trim()
    .escape(),
  sanitizeBody("family_name")
    .trim()
    .escape(),
  sanitizeBody("date_of_birth").toDate(),
  sanitizeBody("date_of_death").toDate(),

  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/errors messages.
      res.render("author_form", {
        title: "Update Author",
        author: req.body,
        errors: errors.array()
      });
    } else {
      // Data from form is valid.
      const { id } = req.params;
      const author = new Author({
        first_name: req.body.first_name,
        family_name: req.body.family_name,
        date_of_birth: req.body.date_of_birth,
        date_of_death: req.body.date_of_death,
        _id: id
      });

      Author.findByIdAndUpdate(id, author, (err, theAuthor) => {
        if (err) return next(err);
        // Successful - redirect to new author record.
        res.redirect(theAuthor.url);
      });
    }
  }
];

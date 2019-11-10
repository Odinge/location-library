/*
 * @Author: your name
 * @Date: 2019-11-05 15:05:04
 * @LastEditTime: 2019-11-07 10:51:55
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \node\09-library\controllers\authorController.js
 */

const Author = require("../models/author");
const Book = require("../models/book");
const Genre = require("../models/genre");
const BookInstance = require("../models/bookinstance");

const async = require("async");

const { body, validationResult } = require("express-validator/check");
const { sanitizeBody } = require("express-validator/filter");

// 显示首页信息
exports.index = (req, res) => {
  async.parallel(
    {
      book_count: function(callback) {
        Book.count({}, callback); // Pass an empty object as match condition to find all documents of this collection
      },
      book_instance_count: function(callback) {
        BookInstance.count({}, callback);
      },
      book_instance_available_count: function(callback) {
        BookInstance.count({ status: "可供借阅" }, callback);
      },
      author_count: function(callback) {
        Author.count({}, callback);
      },
      genre_count: function(callback) {
        Genre.count({}, callback);
      }
    },
    function(err, results) {
      res.render("index", {
        title: "Local Library Home",
        error: err,
        data: results
      });
    }
  );
};

// 显示完整的书籍列表
exports.book_list = (req, res, next) => {
  Book.find({}, "title author")
    .populate("author")
    .exec((err, books) => {
      if (err) return next(err);
      res.render("book_list", { title: "Book List", book_list: books });
    });
};

// 为每位书籍显示详细信息的页面
exports.book_detail = (req, res, next) => {
  const { id } = req.params;
  async.parallel(
    {
      book(backcall) {
        Book.findById(id)
          .populate("author")
          .populate("genre")
          .exec(backcall);
      },
      book_instances(backcall) {
        BookInstance.find({ book: id }).exec(backcall);
      }
    },
    (err, result) => {
      if (err) return next(err);
      if (result.book == null) {
        // No results.
        var err = new Error("Book not found");
        err.status = 404;
        return next(err);
      }
      res.render("book_detail", {
        title: "Title",
        ...result
      });
    }
  );
};

// 由 GET 显示创建书籍的表单
exports.book_create_get = (req, res, next) => {
  async.parallel(
    {
      authors(cb) {
        Author.find(cb);
      },
      genres(cb) {
        Genre.find(cb);
      }
    },
    (err, result) => {
      if (err) return next(err);

      res.render("book_form", { title: "Create Book", ...result });
    }
  );
};

// 由 POST 处理书籍创建操作
// Handle book create on POST.
exports.book_create_post = [
  // Convert the genre to an array.
  (req, res, next) => {
    if (!(req.body.genre instanceof Array)) {
      if (typeof req.body.genre === "undefined") req.body.genre = [];
      else req.body.genre = new Array(req.body.genre);
    }
    next();
  },

  // Validate fields.
  body("title", "Title must not be empty.")
    .isLength({ min: 1 })
    .trim(),
  body("author", "Author must not be empty.")
    .isLength({ min: 1 })
    .trim(),
  body("summary", "Summary must not be empty.")
    .isLength({ min: 1 })
    .trim(),
  body("isbn", "ISBN must not be empty")
    .isLength({ min: 1 })
    .trim(),

  // Sanitize fields (using wildcard).
  sanitizeBody("*")
    .trim()
    .escape(),
  sanitizeBody("genre.*").escape(),
  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a Book object with escaped and trimmed data.
    var book = new Book({
      title: req.body.title,
      author: req.body.author,
      summary: req.body.summary,
      isbn: req.body.isbn,
      genre: req.body.genre
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.

      // Get all authors and genres for form.
      async.parallel(
        {
          authors: function(callback) {
            Author.find(callback);
          },
          genres: function(callback) {
            Genre.find(callback);
          }
        },
        function(err, results) {
          if (err) return next(err);

          // Mark our selected genres as checked.
          for (let i = 0; i < results.genres.length; i++) {
            if (book.genre.indexOf(results.genres[i]._id) > -1) {
              results.genres[i].checked = "true";
            }
          }
          res.render("book_form", {
            title: "Create Book",
            authors: results.authors,
            genres: results.genres,
            book: book,
            errors: errors.array()
          });
        }
      );
      return;
    } else {
      // Data from form is valid. Save book.
      book.save(function(err) {
        if (err) return next(err);

        //successful - redirect to new book record.
        res.redirect(book.url);
      });
    }
  }
];

// 由 GET 显示删除书籍的表单
exports.book_delete_get = (req, res, next) => {
  const { id } = req.params;
  async.parallel(
    {
      book(backcall) {
        Book.findById(id)
          .populate("author")
          .exec(backcall);
      },
      book_instances(backcall) {
        BookInstance.find({ book: id }).exec(backcall);
      }
    },
    (err, result) => {
      if (err) return next(err);
      if (result.book == null) return res.redirect("/catalog/books");

      res.render("book_delete", {
        title: "Delete Book",
        ...result
      });
    }
  );
};

// 由 POST 处理书籍删除操作
exports.book_delete_post = (req, res, next) => {
  const { id } = req.params;
  async.parallel(
    {
      book(backcall) {
        Book.findById(id)
          .populate("author")
          .exec(backcall);
      },
      book_instances(backcall) {
        BookInstance.find({ book: id }).exec(backcall);
      }
    },
    (err, result) => {
      if (err) return next(err);
      if (result.book == null) return res.redirect("/catalog/books");
      if (result.book_instances.length) {
        res.render("book_delete", {
          title: "Delete Book",
          ...result
        });
      } else {
        Book.findByIdAndDelete(id, err => {
          if (err) return next(err);
          res.redirect("/catalog/books");
        });
      }
    }
  );
};

// 由 GET 显示更新书籍的表单
exports.book_update_get = (req, res, next) => {
  // Get book, authors and genres for form.
  async.parallel(
    {
      book: function(callback) {
        Book.findById(req.params.id)
          .populate("author")
          .populate("genre")
          .exec(callback);
      },
      authors: function(callback) {
        Author.find(callback);
      },
      genres: function(callback) {
        Genre.find(callback);
      }
    },
    function(err, results) {
      if (err) {
        return next(err);
      }
      if (results.book == null) {
        // No results.
        var err = new Error("Book not found");
        err.status = 404;
        return next(err);
      }
      // Success.
      // Mark our selected genres as checked.
      for (
        var all_g_iter = 0;
        all_g_iter < results.genres.length;
        all_g_iter++
      ) {
        for (
          var book_g_iter = 0;
          book_g_iter < results.book.genre.length;
          book_g_iter++
        ) {
          if (
            results.genres[all_g_iter]._id.toString() ==
            results.book.genre[book_g_iter]._id.toString()
          ) {
            results.genres[all_g_iter].checked = "true";
          }
        }
      }
      res.render("book_form", {
        title: "Update Book",
        authors: results.authors,
        genres: results.genres,
        book: results.book
      });
    }
  );
};

// 由 POST 处理书籍更新操作
// Handle book update on POST.
exports.book_update_post = [
  // Convert the genre to an array
  (req, res, next) => {
    if (!(req.body.genre instanceof Array)) {
      if (typeof req.body.genre === "undefined") req.body.genre = [];
      else req.body.genre = new Array(req.body.genre);
    }
    next();
  },

  // Validate fields.
  body("title", "Title must not be empty.")
    .isLength({ min: 1 })
    .trim(),
  body("author", "Author must not be empty.")
    .isLength({ min: 1 })
    .trim(),
  body("summary", "Summary must not be empty.")
    .isLength({ min: 1 })
    .trim(),
  body("isbn", "ISBN must not be empty")
    .isLength({ min: 1 })
    .trim(),

  // Sanitize fields.
  sanitizeBody("*")
    .trim()
    .escape(),
  sanitizeBody("genre.*")
    .trim()
    .escape(),

  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a Book object with escaped/trimmed data and old id.
    var book = new Book({
      title: req.body.title,
      author: req.body.author,
      summary: req.body.summary,
      isbn: req.body.isbn,
      genre: typeof req.body.genre === "undefined" ? [] : req.body.genre,
      _id: req.params.id //This is required, or a new ID will be assigned!
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.

      // Get all authors and genres for form.
      async.parallel(
        {
          authors: function(callback) {
            Author.find(callback);
          },
          genres: function(callback) {
            Genre.find(callback);
          }
        },
        function(err, results) {
          if (err) return next(err);

          // Mark our selected genres as checked.
          for (let i = 0; i < results.genres.length; i++) {
            if (book.genre.indexOf(results.genres[i]._id) > -1) {
              results.genres[i].checked = "true";
            }
          }
          res.render("book_form", {
            title: "Update Book",
            authors: results.authors,
            genres: results.genres,
            book: book,
            errors: errors.array()
          });
        }
      );
      return;
    } else {
      // Data from form is valid. Update the record.
      Book.findByIdAndUpdate(req.params.id, book, {}, function(err, thebook) {
        if (err) return next(err);

        // Successful - redirect to book detail page.
        res.redirect(thebook.url);
      });
    }
  }
];

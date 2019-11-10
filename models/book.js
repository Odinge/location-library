/*
 * @Author: your name
 * @Date: 2019-11-05 10:59:56
 * @LastEditTime: 2019-11-05 18:54:34
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \node\09-library\models\book.js
 */

//  藏书模型（Book）
const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const BookSchema = new Schema({
  title: { type: String, required: true },
  author: { type: Schema.Types.ObjectId, ref: "Author", required: true },
  summary: { type: String, required: true },
  isbn: { type: String, required: true },
  genre: [{ type: Schema.Types.ObjectId, ref: "Genre" }]
});

// 虚拟属性'url'：藏书 URL
BookSchema.virtual("url").get(function() {
  return "/catalog/book/" + this._id;
});

// 导出 Book 模块
module.exports = mongoose.model("Book", BookSchema);

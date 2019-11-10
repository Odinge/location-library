/*
 * @Author: your name
 * @Date: 2019-11-05 11:00:08
 * @LastEditTime: 2019-11-05 18:30:54
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \node\09-library\models\genre.js
 */

const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const GenreSchema = new Schema({
  name: { type: String, required: true, min: 3, max: 100 }
});

// 虚拟属性'url'：图书种类模型 URL
GenreSchema.virtual("url").get(function() {
  return "/catalog/genre/" + this._id;
});
module.exports = mongoose.model("Genre", GenreSchema);

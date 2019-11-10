/*
 * @Author: your name
 * @Date: 2019-11-05 10:59:32
 * @LastEditTime: 2019-11-07 09:54:31
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \node\09-library\models\author.js
 */

// 作者模型
const mongoose = require("mongoose");
const moment = require("moment");
const Schema = mongoose.Schema;

const AuthorSchema = new Schema({
  first_name: { type: String, required: true, max: 100 },
  family_name: { type: String, required: true, max: 100 },
  date_of_birth: { type: Date },
  date_of_death: { type: Date }
});

// 创建虚拟属性'name':作者全名
AuthorSchema.virtual("name").get(function() {
  return this.first_name + "," + this.family_name;
});

// 创建虚拟属性'lifespan':作者寿命
AuthorSchema.virtual("lifespan").get(function() {
  if (this.date_of_birth) {
    return (
      this.date_of_death.getFullYear() - this.date_of_birth.getFullYear()
    ).toString();
  } else {
    return "-";
  }
});

// 创建虚拟属性'date_of_birth_format':格式化日期
AuthorSchema.virtual("date_of_birth_format").get(function() {
  return this.date_of_birth
    ? moment(this.date_of_birth).format("YYYY-MM-DD")
    : "";
});

// 创建虚拟属性'date_of_death_format':格式化日期
AuthorSchema.virtual("date_of_death_format").get(function() {
  return this.date_of_death
    ? moment(this.date_of_death).format("YYYY-MM-DD")
    : "";
});

// 创建虚拟属性'age':作者寿命
AuthorSchema.virtual("age").get(function() {
  return (
    new Date().getFullYear() - this.date_of_birth.getFullYear()
  ).toString();
});

// 虚拟属性'url'：作者 URL
AuthorSchema.virtual("url").get(function() {
  return "/catalog/author/" + this._id;
});

// 导出 Author 模型
module.exports = mongoose.model("Author", AuthorSchema);

var DataTypes = require("sequelize").DataTypes;
var _tbl_article_comment = require("./tbl_article_comment");

function initModels(sequelize) {
  var tbl_article_comment = _tbl_article_comment(sequelize, DataTypes);


  return {
    tbl_article_comment,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;

var express = require('express');
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();
var Promise = require("bluebird");
var router = express.Router();
var moment = require('moment');
var models = require('../models');
var Article = models.tbl_article;
var ArticleComment = models.tbl_article_comment;
var ArticleReplayComment = models.tbl_article_comment;
var Sequelize = require('sequelize');
const Op = Sequelize.Op;
var sequelize = models.sequelize;
var mysql = require('mysql');
var DBConnection = mysql.createConnection({
    host: process.env.MysqlHost,
    user: process.env.MysqlUser,
    password: process.env.MysqlPassword,
    database: process.env.MysqlDatabase,
    multipleStatements: process.env.MultipleStatements
});

//Create Database
function ManageDB() {
    DBConnection.query("CREATE DATABASE IF NOT EXISTS blog", function(err, result) {
        if (err) throw err;
        console.log("Database created");
        let tbl_article = "CREATE TABLE IF NOT EXISTS `tbl_article` ( " +
            "    `id` int(11) NOT NULL AUTO_INCREMENT, " +
            "    `nick_name` varchar(100) NOT NULL," +
            "    `title` varchar(250) NOT NULL," +
            "    `content` longtext NOT NULL," +
            "    `created_date` datetime NOT NULL DEFAULT current_timestamp()," +
            "    PRIMARY KEY (`id`)" +
            "  ) ENGINE=InnoDB AUTO_INCREMENT=0 DEFAULT CHARSET=utf8mb4;";

        DBConnection.query(tbl_article, function(err, result) {
            if (err) throw err;
            console.log("tbl_article created");
            let tbl_article_comment = "CREATE TABLE  IF NOT EXISTS `tbl_article_comment` (" +
                "  `id` int(11) NOT NULL AUTO_INCREMENT," +
                "   `article_id` int(11) DEFAULT NULL," +
                "  `article_comment_id` int(11) DEFAULT NULL," +
                "  `nick_name` varchar(100) DEFAULT NULL," +
                "   `content` varchar(500) DEFAULT NULL," +
                "  `created_date` datetime DEFAULT current_timestamp()," +
                "   PRIMARY KEY (`id`)" +
                " ) ENGINE=InnoDB AUTO_INCREMENT=0 DEFAULT CHARSET=utf8mb4;";
            DBConnection.query(tbl_article_comment, function(err, result) {
                console.log("tbl_article_comment created");
                if (err) throw err;

            })
        })
    });
}

ManageDB();


//List Of All Article with Page
router.get('/GetAllArticleWithDynamicPaging', function(req, res) {
    var objParam = req.query;
    var objSearch = objParam.search;
    var Orderby = ['created_date', 'DESC'];
    let offset = 0;
    let limit = parseInt(req.query.limit);
    if (req.query.page != undefined || req.query.page != null) {
        offset = parseInt(req.query.page - 1) * limit;
    }
    var WhereSearch = {};
    if (objSearch != '' && objSearch != undefined && objSearch != null) {
        WhereSearch[Op.or] = [];
        WhereSearch[Op.or].push(sequelize.literal("nick_name like '%" + objSearch + "%'"));
        WhereSearch[Op.or].push(sequelize.literal("title like '%" + objSearch + "%'"));
        WhereSearch[Op.or].push(sequelize.literal("content like '%" + objSearch + "%'"));
    }
    Article.findAndCountAll({
        where: WhereSearch,
        order: [
            Orderby
        ],
        offset: parseInt(offset),
        limit: parseInt(limit)
    }).then(function(results) {
        if (results) {
            console.log(results)
            var response1 = new Object();
            response1.records_total = results.count;
            response1.data = results.rows;
            res.json(response1);
        } else {
            var response1 = new Object();
            response1.records_total = 0;
            response1.data = [];
            res.json(response1);
        }
    }).catch(function(err) {
        console.error('[' + moment().format('DD/MM/YYYY hh:mm:ss a') + '] ' + err.stack || err.message);
        res.json({
            success: false,
            message: 'Record(s) not found.'
        });
    });
});

//Get Article By Article By Id
router.get('/GetArticleById', function(req, res) {
    Article.findByPk(req.query.id).then(function(resArticle) {
        if (resArticle) {
            res.json({
                success: true,
                data: resArticle,
                message: "Record's found!"
            })

        } else {
            res.json({
                success: false,
                data: null,
                message: "Record's not found!"
            })
        }

    }).catch(function(error) {
        console.error('[' + moment().format('DD/MM/YYYY hh:mm:ss a') + '] ' + error.stack || error.message);
        res.json({
            success: false,
            data: null,
            message: error.message
        })
    })
})

//Save Article
router.post('/SaveArticle', jsonParser, function(req, res) {
    objArticle = req.body;
    sequelize
        .transaction(function(t) {
            var id = req.body.id;
            return Article.findByPk(id).then(function(result) {
                if (result) {
                    return Article.findOne({
                        where: {
                            title: objArticle.title,
                            [Op.and]: [{
                                id: {
                                    [Op.ne]: objArticle.id,
                                }
                            }]
                        }
                    }).then(function(resArticleExist) {
                        if (resArticleExist) {
                            return {
                                success: false,
                                message: "Article already exist",
                                data: resArticleExist
                            };
                        } else {
                            return Article.update(objArticle, {
                                where: {
                                    id: objArticle.id,
                                },
                            }).then(function(createArt) {
                                if (createArt) {
                                    return {
                                        success: true,
                                        message: "Article update successfully.",
                                        data: objArticle
                                    };
                                } else {
                                    return {
                                        success: false,
                                        message: "Article save failed.try again later.",
                                        data: null
                                    };
                                }
                            }).catch(function(err) {
                                return {
                                    success: false,
                                    message: err.message,
                                    data: null
                                };
                            });
                        }
                    }).catch(function(err) {
                        return {
                            success: false,
                            message: err.message,
                            data: null
                        };
                    });

                } else {
                    return Article.findOne({
                        where: {
                            [Op.and]: [{
                                title: {
                                    [Op.eq]: objArticle.title,
                                },
                            }],
                        },
                    }).then(function(resArticleExist) {
                        if (resArticleExist) {
                            return {
                                success: false,
                                message: "Article already exist.",
                                data: null
                            };
                        } else {
                            return Article.findOrCreate({
                                where: {
                                    title: objArticle.title,
                                },
                                defaults: objArticle,
                            }).then(function(createArt) {
                                if (createArt[1]) {
                                    return {
                                        success: true,
                                        message: "Article save successfully.",
                                        data: createArt[0]
                                    };
                                } else {
                                    return {
                                        success: false,
                                        message: "Article already exist.",
                                        data: null
                                    };
                                }
                            }).catch(function(err) {
                                return {
                                    success: false,
                                    message: err.message,
                                    data: null
                                };
                            });
                        }
                    });
                }
            });
        })
        .then(function(result) {
            res.json(result);
        })
        .catch(function(err) {
            console.error(
                "[" + moment().format("DD/MM/YYYY hh:mm:ss a") + "] " + err.stack ||
                err.message
            );
            res.json({
                success: false,
                message: "Failed to save record. Please try again later.",
                data: null
            });
        });

});


//GetAllCommentByArticleId
router.get('/GetAllCommentByArticleId', function(req, res) {
    ArticleComment.hasMany(ArticleReplayComment, {
        foreignKey: {
            name: 'article_comment_id',
            allowNull: false
        },
        As: 'LstReplay'
    });
    ArticleComment.findAll({
        where: {
            article_id: req.query.article_id,
            article_comment_id: {
                [Op.eq]: null
            }
        },
        include: [{
            model: ArticleReplayComment,
            attributes: ['nick_name', 'content', 'created_date']
        }]
    }).then(function(resComment) {
        if (resComment.length) {
            res.json({
                success: true,
                data: resComment,
                message: "Record's found!"
            })
        } else {
            res.json({
                success: true,
                data: [],
                message: "Record's not found!"
            })
        }

    }).catch(function(error) {
        console.error('[' + moment().format('DD/MM/YYYY hh:mm:ss a') + '] ' + error.stack || error.message);
        res.json({
            success: true,
            data: [],
            message: "Record's not found!"
        })
    })
})

//CommentArticle
router.post('/CommentArticle', jsonParser, function(req, res) {
    objArticleComment = req.body;
    sequelize
        .transaction(function(t) {
            var article_id = req.body.article_id;
            return Article.findByPk(article_id).then(function(result) {
                if (result) {
                    objArticleComment.id = 0;
                    objArticleComment.article_comment_id = null;
                    return ArticleComment.create(objArticleComment).then(function(createArt) {
                        if (createArt) {
                            return {
                                success: true,
                                message: "Comment add successfully.",
                                data: createArt
                            };
                        } else {
                            return {
                                success: false,
                                message: "Comment add failed.try again later.",
                                data: null
                            };
                        }
                    }).catch(function(err) {
                        return {
                            success: false,
                            message: err.message,
                            data: null
                        };
                    });

                } else {
                    return {
                        success: false,
                        message: "Article not found.",
                        data: null
                    };
                }
            });
        })
        .then(function(result) {
            res.json(result);
        })
        .catch(function(err) {
            console.error(
                "[" + moment().format("DD/MM/YYYY hh:mm:ss a") + "] " + err.stack ||
                err.message
            );
            res.json({
                success: false,
                message: "Failed to save comment. Please try again later.",
                data: null
            });
        });

});


//Replay Comment
router.post('/ReplayToCommentArticle', jsonParser, function(req, res) {
    objArticleComment = req.body;
    sequelize
        .transaction(function(t) {
            var article_id = req.body.article_id;
            var article_comment_id = req.body.article_comment_id;
            return Article.findByPk(article_id).then(function(resArticle) {
                return ArticleComment.findByPk(article_comment_id).then(function(resArticleComment) {
                    if (resArticle && resArticleComment) {
                        objArticleComment.id = 0;
                        return ArticleComment.create(objArticleComment).then(function(createArt) {
                            if (createArt) {
                                return {
                                    success: true,
                                    message: "Replay add successfully.",
                                    data: createArt
                                };
                            } else {
                                return {
                                    success: false,
                                    message: "Replay add failed.try again later.",
                                    data: null
                                };
                            }
                        }).catch(function(err) {
                            return {
                                success: false,
                                message: err.message,
                                data: null
                            };
                        });

                    } else {
                        if (resArticle == null) {
                            return {
                                success: false,
                                message: "Article not found.",
                                data: null
                            };
                        } else {
                            return {
                                success: false,
                                message: "Article comment not found.",
                                data: null
                            };
                        }
                    }
                });
            });
        })
        .then(function(result) {
            res.json(result);
        })
        .catch(function(err) {
            console.error(
                "[" + moment().format("DD/MM/YYYY hh:mm:ss a") + "] " + err.stack ||
                err.message
            );
            res.json({
                success: false,
                message: "Failed to save Replay. Please try again later.",
                data: null
            });
        });

});

module.exports = router;
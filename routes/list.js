var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;

var url = 'mongodb://localhost:27017/isbncollector';
var PAGE_SIZE = 100;
/* GET home page. */
router.get('/', function(req, res, next) {
    var page = req.query.page;
    if (!page) {
        page = 1;
    }
    var nextPage = parseInt(page) + 1;
    var previousPage;
    if (page > 1) {
        previousPage = page - 1;
    }
    MongoClient.connect(url, function(err, db) {

        var collection = db.collection('books');
        var skipCount = (page - 1) * PAGE_SIZE;
        collection.find({}, {limit: PAGE_SIZE, skip: skipCount}).toArray(function(err, results) {
            if (err) {
                res.render('error', {message: 'Error connecting to mongo'});
            } else {
                res.render('list', {books: results, page: page, nextPage: nextPage, previousPage: previousPage});
            }
        });
    });
});

module.exports = router;

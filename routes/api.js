var MongoClient = require('mongodb').MongoClient;
var config = require('../config');
var express = require('express');
var router = express.Router();
var db;

router.get('/', function(req, res) {

    res.render('api', {path: req.baseUrl, keyword: ''});
});

router.get('/v1/books/:isbn', function(req, res) {

    var query = {};
    var isbn = req.params.isbn;
    if (isbn && isbn.length > 10) {
        query['isbn13'] = isbn;
    } else if (isbn) {
        query['isbn10'] = isbn;
    }
    if (!isbn) {
        res.status(400);
        res.json({ error: 'no isbn param'});
        return;
    }
    if (db) {
        getBookFromMongo(db, query, res);
    } else {
        MongoClient.connect(config.MONGO_URL, function (err, connection) {
            db = connection;
            getBookFromMongo(db, query, res);
        });
    }
});


var getBookFromMongo = function(db, query, res) {
    var collection = db.collection('books');
    if (query['$text']) {
        var options = {score: {$meta: "textScore"}};
        collection.find(query, options).sort({score: {$meta: 'textScore'}}).toArray(function(err, docs) {
            if (err === null && docs && docs.length > 0) {
                res.setHeader('Content-Type', 'application/json');
                res.json(docs);
            } else {
                res.setHeader('Content-Type', 'application/json');
                res.status(404);
                res.json({error: 'no job found for given title'});
            }
        });
    } else {

        collection.find(query).toArray(function (err, docs) {
            if (err === null && docs && docs.length > 0) {
                res.setHeader('Content-Type', 'application/json');
                res.json(docs);
            } else {
                res.setHeader('Content-Type', 'application/json');
                res.status(404);
                res.json({error: 'no job found for given isbn'});
            }
        });
    }
};


router.get('/v1/search', function(req, res) {

    var title = req.query.title;
    if (!title) {
        res.status(400);
        res.json({ error: 'no title param'});
        return;
    }
    var query = {$text: {$search: title}};

    if (db) {
        getBookFromMongo(db, query, res);
    } else {
        MongoClient.connect(config.MONGO_URL, function (err, connection) {
            db = connection;
            getBookFromMongo(db, query, res);
        });
    }
});

module.exports = router;
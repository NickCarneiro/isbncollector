var MongoClient = require('mongodb').MongoClient;
var config = require('../config');
var express = require('express');
var router = express.Router();
var db;
router.get('/v1', function(req, res) {

    var query = {};
    var isbn = req.query.isbn;
    if (isbn && isbn.length > 10) {
        query['isbn13'] = isbn;
    } else if (isbn) {
        query['isbn10'] = isbn;
    }
    if (req.query.title) {
        query['title'] = req.query.title;
    }
    if (!req.query.title && !req.query.isbn) {
        res.status(400);
        res.end(JSON.stringify({ error: 'no isbn or title params'}));
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
    collection.find(query).toArray(function(err, docs) {
        if (err === null && docs && docs.length > 0) {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(docs));
        } else {
            res.setHeader('Content-Type', 'application/json');
            res.status(404);
            res.end(JSON.stringify({error: 'no job found for given params'}));
        }
    });
};

module.exports = router;
var express = require('express');
var router = express.Router();

var MongoClient = require('mongodb').MongoClient;
var amazon = require('../scrapers/amazon');
var config = require('../config');

// Connection URL
var url = 'mongodb://localhost:27017/isbncollector';

var db;
router.get('/', function(req, res) {
    var isbn = req.query['isbn'];
    if (!isbn) {
        res.status(400);
        return res.render('bookError', {errorMessage: 'No isbn given'});
    }
    var query = {};
    isbn = isbn.replace('-', '');
    if (isbn.match(/^[\dX]+$/)) {
        if (isbn.length > 10) {
            query['isbn13'] = isbn;
        } else {
            query['isbn10'] = isbn;
        }
    } else {
        query = {$text: {$search: isbn}};
    }

    if (db) {
        handleRequest(query, db, res, req);
    } else {
        connectAndHandleRequest(query, res, req);
    }

});


var connectAndHandleRequest = function(query, res, req) {
    MongoClient.connect(config.MONGO_URL, function (err, connection) {
        db = connection;
        handleRequest(query, db, res, req);
    });
};


var handleRequest = function(query, db, res, req) {
    var collection = db.collection('books');
    if (query['$text']) {
        var options = {score: {$meta: "textScore"}};
        collection.find(query, options).sort({score: {$meta: 'textScore'}}).toArray(handleSearchResults.bind(this, db, query, res, req));
    } else {
        collection.find(query).toArray(handleResults.bind(this, db, query, res, req));
    }

};


var handleSearchResults = function(db, query, res, req, err, docs) {
    var keyword = query['$text']['$search'];

    res.render('browse', {books: docs, keyword: keyword, path: req.baseUrl});
};


var handleResults = function(db, query, res, req, err, docs) {
    var keyword = query.isbn13 || query.isbn10;
    if (err === null && docs && docs.length > 0) {
        console.log('found book in the mongo');
            res.render('book', {properties: docs[0], keyword: keyword, path: req.baseUrl});
    } else {
        res.status(404);
        var errorMessage = 'No book found';
        res.render('bookError', {errorMessage: errorMessage});
    }

};


module.exports = router;

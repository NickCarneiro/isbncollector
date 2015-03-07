var express = require('express');
var router = express.Router();

var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');

// Connection URL
var url = 'mongodb://localhost:27017/isbncollector';

router.get('/', function(req, res) {
    var isbn = req.query['isbn'];
    if (!isbn) {
        res.status(400);
        return res.render('bookError', {errorMessage: 'No isbn given'});
    }
    MongoClient.connect(url, function(err, db) {
        assert.equal(null, err);
        var query = {};
        if (isbn.length > 10) {
            query['isbn13'] = isbn;
        } else {
            query['isbn10'] = isbn;
        }
        var collection = db.collection('books');
        collection.find(query).toArray(function(err, docs) {
            console.log(docs);
            console.log(err);
            if (err === null && docs && docs.length > 0) {
                res.render('book', {properties: docs[0]});
            } else {
                res.status(404);
                var errorMessage = err || 'No book found';
                res.render('bookError', {errorMessage: errorMessage});
            }
            db.close();
        });

    });
});

module.exports = router;

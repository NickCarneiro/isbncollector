var express = require('express');
var router = express.Router();

var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var amazon = require('../scrapers/amazon');

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
            if (err === null && docs && docs.length > 0) {
                console.log('found book in the mongo')
                res.render('book', {properties: docs[0]});
                db.close();
            } else {
                // if the book isn't in the mongo, fetch it from another source.
                amazon.searchForBook(isbn, function(bookProperties, requestFailed) {
                    if (bookProperties && !requestFailed) {
                        // save this new book to the mongo
                        console.log('found book externally.');
                        collection.insert(bookProperties, {w: 1}, function(err, records) {
                            if (!err) {
                                console.log('saving to mongo.')
                            } else {
                                console.log(err);
                            }
                            db.close();
                        });
                        res.render('book', {properties: bookProperties});
                    } else {
                        res.status(404);
                        var errorMessage = bookProperties || 'No book found';
                        res.render('bookError', {errorMessage: errorMessage});
                        db.close();
                    }
                });
            }

        });

    });
});

module.exports = router;

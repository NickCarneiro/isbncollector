var MongoClient = require('mongodb').MongoClient;
var config = require('../config');
var db;

var saveBookToMongo = function(bookProperties, monitor) {
    if (db) {
        insertBook(bookProperties, db, monitor);
    } else {
        MongoClient.connect(config.MONGO_URL, function (err, connection) {
            db = connection;
            insertBook(bookProperties, db, monitor);
        });
    }
};


var insertBook = function(bookProperties, db, monitor) {
    var collection = db.collection('books');
    collection.insert(bookProperties, {w: 1}, function(err, records) {
        if (err) {
            if (monitor) {
                monitor.log(err);
            } else {
                console.log(err);
            }
        }
    });
};



module.exports = {
    saveBookToMongo: saveBookToMongo
};
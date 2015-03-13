var MongoClient = require('mongodb').MongoClient;
var MONGO_URL = 'mongodb://localhost:27017/isbncollector';
var db;
var saveBookToMongo = function(bookProperties) {
    if (db) {
        insertBook(bookProperties, db);
    } else {
        MongoClient.connect(MONGO_URL, function (err, connection) {
            db = connection;
            insertBook(bookProperties, db);
        });
    }
};


var insertBook = function(bookProperties, db) {
    var collection = db.collection('books');
    collection.insert(bookProperties, {w: 1}, function(err, records) {
        if (err) {
            console.log(err);
        }
    });
};


module.exports = {
    saveBookToMongo: saveBookToMongo
};
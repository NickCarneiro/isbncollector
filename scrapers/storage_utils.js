var MongoClient = require('mongodb').MongoClient;
var MONGO_URL = 'mongodb://localhost:27017/isbncollector';

var saveBookToMongo = function(bookProperties) {
    MongoClient.connect(MONGO_URL, function(err, db) {
        var collection = db.collection('books');
        collection.insert(bookProperties, {w: 1}, function(err, records) {
            if (err) {
                console.log(err);
            }
            db.close();
        });
    });
};


module.exports = {
    saveBookToMongo: saveBookToMongo
};
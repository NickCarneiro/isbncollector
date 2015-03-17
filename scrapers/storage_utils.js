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


var updateHealthcheck = function(monitor) {
    if (db) {
        updateHealthcheck_(monitor, db);
    } else {
        MongoClient.connect(config.MONGO_URL, function (err, connection) {
            db = connection;
            updateHealthcheck_(monitor, db);
        });
    }
};


var updateHealthcheck_ = function(monitor, db) {
    var collection = db.collection('healthcheck');
    collection.update({scraperName: monitor.scraperName}, monitor, {upsert: true}, function(err, docs) {
        if (err) {
            console.log(err);
        }
    });
};


var getHealthcheck = function(callback) {
    if (db) {
        getHealthcheck_(db, callback);
    } else {
        MongoClient.connect(config.MONGO_URL, function (err, connection) {
            db = connection;
            getHealthcheck_(db, callback);
        });
    }
};


var getHealthcheck_ = function(db, callback) {
    var collection = db.collection('healthcheck');
    collection.find({}).toArray(function(err, docs) {
        callback(docs);
    });
};


module.exports = {
    saveBookToMongo: saveBookToMongo,
    updateHealthcheck: updateHealthcheck,
    getHealthcheck: getHealthcheck
};
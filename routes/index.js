var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;

var url = 'mongodb://localhost:27017/isbncollector';
/* GET home page. */
router.get('/', function(req, res, next) {
  MongoClient.connect(url, function(err, db) {
    var collection = db.collection('books');
    collection.find({}).count(function(err, count) {
      if (err) {
        res.render('error', {message: 'Error connecting to mongo'});
      } else {
        res.render('index', {totalBookCount: count});
      }
      db.close();
    });
  });
});

module.exports = router;

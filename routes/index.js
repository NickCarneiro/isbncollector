var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
var numeral = require('numeral');

var url = 'mongodb://localhost:27017/isbncollector';
/* GET home page. */
router.get('/', function(req, res, next) {
  MongoClient.connect(url, function(err, db) {
    if (err) {
      return res.render('error', {message: 'Error connecting to mongo', error: err});
    }
    var collection = db.collection('books');
    collection.find({}).count(function(err, count) {
      var formattedCount = numeral(count).format('0,0');
      if (err) {
        res.render('error', {message: 'Error querying mongo', error: err});
      } else {
        res.render('index', {totalBookCount: formattedCount, path: req.baseUrl, keyword: ''});
      }
      db.close();
    });
  });
});

module.exports = router;

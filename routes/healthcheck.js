var express = require('express');
var router = express.Router();
var storageUtils = require('../scrapers/storage_utils');

router.get('/', function(req, res) {
    storageUtils.getHealthcheck(function(docs) {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(docs));
    });

});

module.exports = router;

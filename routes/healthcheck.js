var express = require('express');
var router = express.Router();
var storageUtils = require('../scrapers/storage_utils');

router.get('/', function(req, res) {
    storageUtils.getHealthcheck(function(docs) {
        res.setHeader('Content-Type', 'application/json');
        docs.forEach(function(doc) {
            var now = Date.now();
            if (now - doc.lastEvent > 1000*60) {
                doc.healthy = false;
                doc.message = 'No activity for 60 seconds.';
            }
        });
        res.end(JSON.stringify(docs, null, 4));
    });

});

module.exports = router;

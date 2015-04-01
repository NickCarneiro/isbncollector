var express = require('express');
var router = express.Router();
var storageUtils = require('../scrapers/storage_utils');
var moment = require('moment');

router.get('/', function(req, res) {
    storageUtils.getHealthcheck(function(docs) {
        res.setHeader('Content-Type', 'application/json');
        docs.forEach(function(doc) {
            var now = Date.now();
            if (now - doc.lastEvent > 1000*60) {
                doc.healthy = false;
                doc.message = 'No activity for 60 seconds.';
            }
            if (doc.lastError) {
                doc.lastErrorFormatted = moment(doc.lastError).fromNow();
            }
            doc.lastEventFomatted = moment(doc.lastEvent).fromNow();
        });
        res.json(docs);
    });

});

module.exports = router;

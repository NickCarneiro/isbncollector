var express = require('express');
var router = express.Router();
var monitor = require('../monitor');

router.get('/', function(req, res) {
    var health = monitor.scraperHealthStatuses;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(health));
});

module.exports = router;

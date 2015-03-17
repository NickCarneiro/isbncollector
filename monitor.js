var fs = require('fs');

var storageUtils = require('./scrapers/storage_utils');
var monitor = function(scraperName) {
    this.scraperName = scraperName;
    this.healthy = true;
    this.lastError = null;
    this.lastEvent = null;
};


monitor.prototype.log = function(message, error) {
    if (error) {
        this.lastError = Date.now();
        this.healthy = false;
    } else {
        this.lastEvent = Date.now();
        this.healthy = true;
        var prependedMessage = this.scraperName + ': ' + message;
        console.log(message);
        fs.appendFile('logs/scrapers.log', prependedMessage + '\n');
    }
    storageUtils.updateHealthcheck(this);
};


monitor.prototype.success = function(message) {
    this.healthy = true;
    this.log(message, false);
};

monitor.prototype.error = function(message) {
    this.log(message, true);
};


module.exports = {
    monitor: monitor
};
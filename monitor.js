var fs = require('fs');

var scraperHealthStatuses = {};


var monitor = function(scraperName) {
    this.scraperName = scraperName;
};


monitor.prototype.log = function(message, error) {
    if (error) {
        if (!scraperHealthStatuses[this.scraperName]) {
            scraperHealthStatuses[this.scraperName] = {
                lastError: Date.now(),
                healthy: false
            }
        } else {
            scraperHealthStatuses[this.scraperName].lastError = Date.now();
            scraperHealthStatuses[this.scraperName].healthy = false;
        }
    } else {
        message = this.scraperName + ': ' + message;
        console.log(message);
        fs.appendFile('logs/scrapers.log', message + '\n');
    }
};


monitor.prototype.success = function(message) {
    if (!scraperHealthStatuses[this.scraperName]) {
        scraperHealthStatuses[this.scraperName] = {
            healthy: true
        };
    } else {
        scraperHealthStatuses[this.scraperName].healthy = true;
    }
    this.log(message, false);
};

monitor.prototype.error = function(message) {
    this.log(message, true);
};


module.exports = {
    monitor: monitor,
    scraperHealthStatuses: scraperHealthStatuses
};
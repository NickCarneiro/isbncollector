var request = require('request');
var Monitor = require('../monitor');
var monitor = new Monitor.monitor('boston');
var boston = require('./boston');
var storageUtils = require('./storage_utils');

var Agent = require('socks5-http-client/lib/Agent');
var SLEEP_TIME_MILLIS = 1500;
var BASE_URL = 'http://bpl.bibliocommons.com/item/show/';

var scrapeBoston = function(bookId) {
    monitor.log('requesting book ' + bookId);
    var requestOptions = {
        url: BASE_URL + bookId,
        agentClass: Agent,
        agentOptions: {
            socksHost: 'localhost',
            socksPort: 9050
        }
    };
    request(requestOptions, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            if (!isHomepage(body)) {
                var bookProperties = boston.extractBookProperties(body);
                if (bookProperties.isbn10 || bookProperties.isbn13) {
                    storageUtils.saveBookToMongo(bookProperties, monitor);
                    console.log(bookProperties);
                    monitor.success('saving ' + bookProperties.title);
                } else {
                    monitor.log('no isbn found.');
                }
            } else {
                monitor.log('Got redirected to homepage.')
            }

        } else if (!error && response.statusCode == 302) {
            monitor.log('No book found for this id.');
        } else {
            monitor.error(error);
        }
        setTimeout(function() {
            var nextBookId = parseInt(bookId);
            nextBookId++;
            scrapeBoston(nextBookId);
        }, SLEEP_TIME_MILLIS)
    });
};


var isHomepage = function(html) {
    return html.indexOf('<title data-analytics="dashboard">Recent Activity | Boston Public Library | BiblioCommons</title>') !== -1;
};


scrapeBoston(process.argv[2]);
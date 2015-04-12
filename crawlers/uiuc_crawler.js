var request = require('request');
var Monitor = require('../utils/monitor');
var monitor = new Monitor.monitor('uiuc');
var uiuc = require('./../parsers/uiuc');
var storageUtils = require('./../utils/storage_utils');

var Agent = require('socks5-http-client/lib/Agent');
var SLEEP_TIME_MILLIS = 1500;
var BASE_URL = 'http://vufind.carli.illinois.edu/vf-uiu/Record/uiu_$BOOK_ID/Description';

var scrapeUiuc = function(bookId) {
    monitor.log('requesting book ' + bookId);
    var requestOptions = {
        url: BASE_URL.replace('$BOOK_ID', bookId),
        agentClass: Agent,
        agentOptions: {
            socksHost: 'localhost',
            socksPort: 9050
        },
        timeout: 30000 //30 second timeout
    };
    request(requestOptions, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            if (!isBookNotFound(body)) {
                var bookProperties = uiuc.extractBookProperties(body);
                if (bookProperties.isbn10 || bookProperties.isbn13) {
                    storageUtils.saveBookToMongo(bookProperties, monitor);
                    console.log(bookProperties);
                    monitor.success('saving ' + bookProperties.title);
                } else {
                    monitor.log('no isbn found.');
                }
            } else {
                monitor.log('No book found.');
            }

        } else if (!error && response.statusCode == 302) {
            monitor.log('No book found for this id.');
        }
        if (error) {
            monitor.error(error);
            console.log('retrying');
            //wait an extra half second on retries
            setTimeout(function() {
                scrapeUiuc(bookId);
            }, SLEEP_TIME_MILLIS + 500);
        } else {
            setTimeout(function() {
                var nextBookId = parseInt(bookId);
                nextBookId++;
                scrapeUiuc(nextBookId);
            }, SLEEP_TIME_MILLIS);
        }
    });
};


var isBookNotFound = function(html) {
    return html.indexOf('<h2>Data not available for display.</h2>>') !== -1;
};


scrapeUiuc(process.argv[2]);
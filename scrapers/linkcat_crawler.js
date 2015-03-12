var request = require('request');
var linkcat = require('./linkcat');
var storageUtils = require('./storage_utils');

var SLEEP_TIME_MILLIS = 3000;

var RESULTS_PER_PAGE = 20;
var LINKCAT_SEARCH_URL = 'http://www.linkcat.info/cgi-bin/koha/opac-search.pl?idx=;limit=format%3A%22Book%22;q=&offset=$OFFSET';


var Agent = require('socks5-http-client/lib/Agent');


var scrapeLinkcat = function(offset) {
    if (offset === undefined) {
        offset = 0;
    }
    var resultPageUrl = LINKCAT_SEARCH_URL.replace('$OFFSET', offset);

    var requestOptions = {
        url: resultPageUrl,
        agentClass: Agent,
        agentOptions: {
            socksHost: 'localhost',
            socksPort: 9050
        }
    };
    console.log('requesting page with offset ' + offset);
    request(requestOptions, function (error, response, body) {
        var booksCrawledForThisPage = 0;
        if (!error && response.statusCode == 200) {
            // got the search results, extract the first link
            var searchResultUrls = linkcat.extractSearchResultUrls(body);
            var totalBooksOnPage = searchResultUrls.length;

            if (!searchResultUrls || searchResultUrls.length == 0) {
                console.log('No results found.');
            } else {
                var delay_millis = SLEEP_TIME_MILLIS;
                searchResultUrls.forEach(function(searchResultUrl) {
                    //pause for 2 seconds between book requests
                    setTimeout(function() {
                        getBook(searchResultUrl, function(bookProperties, error) {
                            console.log('saving ' + bookProperties.title);
                            if (bookProperties.isbn10 || bookProperties.isbn13) {
                                storageUtils.saveBookToMongo(bookProperties);
                            } else {
                                console.log('no isbn found.');
                            }
                            booksCrawledForThisPage++;
                            if (booksCrawledForThisPage === totalBooksOnPage) {
                                // go to the next page
                                offset += RESULTS_PER_PAGE;
                                scrapeLinkcat(offset);
                            }
                        });
                    }, delay_millis);
                    delay_millis += SLEEP_TIME_MILLIS;
                });
            }
        } else {
            console.log(error);
        }
    });
};


var getBook = function(bookPageUrl, callback) {
    var options = {
        url: bookPageUrl,
        headers: {
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/40.0.2214.115 Safari/537.36'
        },
        agentClass: Agent,
        agentOptions: {
            socksHost: 'localhost',
            socksPort: 9050
        }
    };
    request(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var bookProperties = linkcat.extractBookProperties(body);
            if (bookProperties) {
                callback(bookProperties);
            } else {
                callback('Could not parse book properties.', true);
            }
        } else {
            var requestFailed = true;
            callback(error, requestFailed);
        }
    });
};


scrapeLinkcat(process.argv[2]);


var request = require('request');
var boston = require('./boston');
var cheerio = require('cheerio');
var fs = require('fs');

var Agent = require('socks5-http-client/lib/Agent');
var SLEEP_TIME_MILLIS = 500;
var BASE_URL = 'http://bpl.bibliocommons.com/search?commit=Search&page=$PAGE_NUMBER&q=$SEARCH_KEYWORD&search_category=keyword&t=keyword&utf8=✓&view=small&display_quantity=100';


var scrapeBookIds = function(pageNumber, searchKeyword) {
    //todo : intelligently figure out last page
    if (parseInt(pageNumber) === 9992) {
        console.log('reached final page');
        process.exit();
    }
    var requestOptions = {
        url: BASE_URL.replace('$PAGE_NUMBER', pageNumber).replace('$SEARCH_KEYWORD', searchKeyword),
        agentClass: Agent,
        agentOptions: {
            socksHost: 'localhost',
            socksPort: 9050
        }
    };
    console.log('requesting page ' + pageNumber + ' for keyword ' + searchKeyword);
    request(requestOptions, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var $ = cheerio.load(body);
            var resultLinks = $('.title a');
            var bookUrls = [];
            $(resultLinks).each(function(index, linkElement) {
                //  /item/show/1228188075_1984
                var relativeUrl = $(linkElement).attr('href');
                bookUrls.push(relativeUrl);
            });
            // write these urls to a file
            console.log('writing to file');
            fs.appendFileSync('boston_book_urls.txt', bookUrls.join('\n'), { encoding: 'utf8'});


        } else if (!error && response.statusCode == 302) {
            console.log('Got a redirect');
        } else {
            console.log(error);
        }
        setTimeout(function() {
            var nextBookId = parseInt(pageNumber);
            nextBookId++;
            scrapeBookIds(nextBookId, searchKeyword);
        }, SLEEP_TIME_MILLIS);
    });
};


scrapeBookIds(process.argv[2], process.argv[3]);
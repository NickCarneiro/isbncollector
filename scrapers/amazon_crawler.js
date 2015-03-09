var cheerio = require('cheerio');
var request = require('request');
var amazon = require('./amazon');

var MongoClient = require('mongodb').MongoClient;

var SLEEP_TIME_MILLIS = 3000;
var BASE_URL = 'http://amazon.com';
var MONGO_URL = 'mongodb://localhost:27017/isbncollector';

var extractCategories = function(html) {
    //http://www.amazon.com/s/ref=lp_173507_ex_n_1?rh=n%3A283155&bbn=283155&ie=UTF8&qid=1425853230
    var $ = cheerio.load(html);
    $('#ref_1000 a').map(function() {
        var categoryName = $(this).text().trim();
        var categoryUrl = $(this).attr('href');
        var category = {};
        category[categoryName] = categoryUrl;
        return category;
    });
};

var categories = ["/s/ref=lp_283155_nr_n_0?fst=as%3Aoff&rh=n%3A283155%2Cn%3A%211000%2Cn%3A1&bbn=1000&ie=UTF8&qid=1425853265&rnid=1000",
 "/s/ref=lp_283155_nr_n_1?fst=as%3Aoff&rh=n%3A283155%2Cn%3A%211000%2Cn%3A2&bbn=1000&ie=UTF8&qid=1425853265&rnid=1000",
 "/s/ref=lp_283155_nr_n_2?fst=as%3Aoff&rh=n%3A283155%2Cn%3A%211000%2Cn%3A3&bbn=1000&ie=UTF8&qid=1425853265&rnid=1000",
 "/s/ref=lp_283155_nr_n_3?fst=as%3Aoff&rh=n%3A283155%2Cn%3A%211000%2Cn%3A3248857011&bbn=1000&ie=UTF8&qid=1425853265&rnid=1000",
 "/s/ref=lp_283155_nr_n_4?fst=as%3Aoff&rh=n%3A283155%2Cn%3A%211000%2Cn%3A4&bbn=1000&ie=UTF8&qid=1425853265&rnid=1000",
 "/s/ref=lp_283155_nr_n_5?fst=as%3Aoff&rh=n%3A283155%2Cn%3A%211000%2Cn%3A12290&bbn=1000&ie=UTF8&qid=1425853265&rnid=1000",
 "/s/ref=lp_283155_nr_n_6?fst=as%3Aoff&rh=n%3A283155%2Cn%3A%211000%2Cn%3A4366&bbn=1000&ie=UTF8&qid=1425853265&rnid=1000",
 "/s/ref=lp_283155_nr_n_7?fst=as%3Aoff&rh=n%3A283155%2Cn%3A%211000%2Cn%3A5&bbn=1000&ie=UTF8&qid=1425853265&rnid=1000",
 "/s/ref=lp_283155_nr_n_8?fst=as%3Aoff&rh=n%3A283155%2Cn%3A%211000%2Cn%3A6&bbn=1000&ie=UTF8&qid=1425853265&rnid=1000",
 "/s/ref=lp_283155_nr_n_9?fst=as%3Aoff&rh=n%3A283155%2Cn%3A%211000%2Cn%3A48&bbn=1000&ie=UTF8&qid=1425853265&rnid=1000",
 "/s/ref=lp_283155_nr_n_10?fst=as%3Aoff&rh=n%3A283155%2Cn%3A%211000%2Cn%3A8975347011&bbn=1000&ie=UTF8&qid=1425853265&rnid=1000",
 "/s/ref=lp_283155_nr_n_11?fst=as%3Aoff&rh=n%3A283155%2Cn%3A%211000%2Cn%3A173507&bbn=1000&ie=UTF8&qid=1425853265&rnid=1000",
 "/s/ref=lp_283155_nr_n_12?fst=as%3Aoff&rh=n%3A283155%2Cn%3A%211000%2Cn%3A301889&bbn=1000&ie=UTF8&qid=1425853265&rnid=1000",
 "/s/ref=lp_283155_nr_n_13?fst=as%3Aoff&rh=n%3A283155%2Cn%3A%211000%2Cn%3A10&bbn=1000&ie=UTF8&qid=1425853265&rnid=1000",
 "/s/ref=lp_283155_nr_n_14?fst=as%3Aoff&rh=n%3A283155%2Cn%3A%211000%2Cn%3A9&bbn=1000&ie=UTF8&qid=1425853265&rnid=1000",
 "/s/ref=lp_283155_nr_n_15?fst=as%3Aoff&rh=n%3A283155%2Cn%3A%211000%2Cn%3A86&bbn=1000&ie=UTF8&qid=1425853265&rnid=1000",
 "/s/ref=lp_283155_nr_n_16?fst=as%3Aoff&rh=n%3A283155%2Cn%3A%211000%2Cn%3A10777&bbn=1000&ie=UTF8&qid=1425853265&rnid=1000",
 "/s/ref=lp_283155_nr_n_17?fst=as%3Aoff&rh=n%3A283155%2Cn%3A%211000%2Cn%3A17&bbn=1000&ie=UTF8&qid=1425853265&rnid=1000",
 "/s/ref=lp_283155_nr_n_18?fst=as%3Aoff&rh=n%3A283155%2Cn%3A%211000%2Cn%3A173514&bbn=1000&ie=UTF8&qid=1425853265&rnid=1000",
 "/s/ref=lp_283155_nr_n_19?fst=as%3Aoff&rh=n%3A283155%2Cn%3A%211000%2Cn%3A18&bbn=1000&ie=UTF8&qid=1425853265&rnid=1000",
 "/s/ref=lp_283155_nr_n_20?fst=as%3Aoff&rh=n%3A283155%2Cn%3A%211000%2Cn%3A20&bbn=1000&ie=UTF8&qid=1425853265&rnid=1000",
 "/s/ref=lp_283155_nr_n_21?fst=as%3Aoff&rh=n%3A283155%2Cn%3A%211000%2Cn%3A3377866011&bbn=1000&ie=UTF8&qid=1425853265&rnid=1000",
 "/s/ref=lp_283155_nr_n_22?fst=as%3Aoff&rh=n%3A283155%2Cn%3A%211000%2Cn%3A21&bbn=1000&ie=UTF8&qid=1425853265&rnid=1000",
 "/s/ref=lp_283155_nr_n_23?fst=as%3Aoff&rh=n%3A283155%2Cn%3A%211000%2Cn%3A22&bbn=1000&ie=UTF8&qid=1425853265&rnid=1000",
 "/s/ref=lp_283155_nr_n_24?fst=as%3Aoff&rh=n%3A283155%2Cn%3A%211000%2Cn%3A23&bbn=1000&ie=UTF8&qid=1425853265&rnid=1000",
 "/s/ref=lp_283155_nr_n_25?fst=as%3Aoff&rh=n%3A283155%2Cn%3A%211000%2Cn%3A75&bbn=1000&ie=UTF8&qid=1425853265&rnid=1000",
 "/s/ref=lp_283155_nr_n_26?fst=as%3Aoff&rh=n%3A283155%2Cn%3A%211000%2Cn%3A25&bbn=1000&ie=UTF8&qid=1425853265&rnid=1000",
 "/s/ref=lp_283155_nr_n_27?fst=as%3Aoff&rh=n%3A283155%2Cn%3A%211000%2Cn%3A4736&bbn=1000&ie=UTF8&qid=1425853265&rnid=1000",
 "/s/ref=lp_283155_nr_n_28?fst=as%3Aoff&rh=n%3A283155%2Cn%3A%211000%2Cn%3A26&bbn=1000&ie=UTF8&qid=1425853265&rnid=1000",
 "/s/ref=lp_283155_nr_n_29?fst=as%3Aoff&rh=n%3A283155%2Cn%3A%211000%2Cn%3A28&bbn=1000&ie=UTF8&qid=1425853265&rnid=1000",
 "/s/ref=lp_283155_nr_n_30?fst=as%3Aoff&rh=n%3A283155%2Cn%3A%211000%2Cn%3A27&bbn=1000&ie=UTF8&qid=1425853265&rnid=1000"
];

var currentPage = 0;
var scrapeCategory = function(resultPageUrl) {

    if (!resultPageUrl) {
        resultPageUrl = BASE_URL + categories[0];
    }
    request(resultPageUrl, function (error, response, body) {
        console.log('requesting page: ' + currentPage);
        var booksCrawledForThisPage = 0;
        if (!error && response.statusCode == 200) {
            // got the search results, extract the first link
            var searchResultUrls = amazon.extractCategorySearchResults(body);
            if (searchResultUrls.length === 0) {
                searchResultUrls = amazon.extractSearchResultUrls(body);
            }
            var totalBooksOnPage = searchResultUrls.length;
            var nextPagePath = amazon.extractCategorySearchNextPageUrl(body);
            if (!nextPagePath) {
                console.log('No next page for this category');
                process.exit(1);
            }

            var nextPageUrl = BASE_URL + nextPagePath;
            if (!searchResultUrls || searchResultUrls.length == 0) {
                console.log('No results found.');
            } else {
                var delay_millis = SLEEP_TIME_MILLIS;
                searchResultUrls.forEach(function(searchResultUrl) {
                    //pause for 2 seconds between book requests
                    setTimeout(function() {
                        amazon.getBook(searchResultUrl, function(bookProperties, error) {

                            console.log('saving ' + bookProperties.title);
                            saveBookToMongo(bookProperties);
                            booksCrawledForThisPage++;
                            if (booksCrawledForThisPage === totalBooksOnPage) {
                                // go to the next page
                                currentPage++;
                                scrapeCategory(nextPageUrl);
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


var saveBookToMongo = function(bookProperties) {
    MongoClient.connect(MONGO_URL, function(err, db) {
        var collection = db.collection('books');
        collection.insert(bookProperties, {w: 1}, function(err, records) {
            if (!err) {
                console.log('saved to mongo.')
            } else {
                console.log(err);
            }
            db.close();
        });
    });
};

scrapeCategory();


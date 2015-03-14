var request = require('request');
var storageUtils = require('./storage_utils');
var denver = require('./denver');
var Agent = require('socks5-http-client/lib/Agent');
var SLEEP_TIME_MILLIS = 1500;


var getBook = function(bookId) {
    if (!bookId) {
        bookId = 1;
    }
    var headers = {
        'Accept-Encoding': 'gzip, deflate, sdch',
        'Accept-Language': 'en-US,en;q=0.8',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/40.0.2214.115 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Referer': 'http://catalog.denverlibrary.org/search/searchresults.aspx?ctx=1.1033.0.0.6&type=Keyword&term=*&by=KW&sort=RELEVANCE&limit=TOM=bks%20AND%20call%3C%3Eebook&query=&page=0&searchid=2',
        'Connection': 'keep-alive',
        'Cache-Control': 'max-age=0',
        'Cookie': 'ASP.NET_SessionId=kozd2hrwem2wu1xpp1yzlfl5; OrgID=1; __utma=125080728.1239865699.1426358656.1426358656.1426358656.1; __utmc=125080728; __utmz=125080728.1426358656.1.1.utmcsr=(direct)|utmccn=(direct)|utmcmd=(none); __atuvc=1%7C10'
    };

    var options = {
        url: 'http://catalog.denverlibrary.org/search/title.aspx?ctx=1.1033.0.0.6&pos=' + bookId,
        headers: headers,
        agentClass: Agent,
        agentOptions: {
            socksHost: 'localhost',
            socksPort: 9050
        }
    };

    function callback(error, response, body) {
        if (!error && response.statusCode == 200) {
            var properties = denver.extractBookProperties(body);
            console.log(properties);
            if ((properties.isbn10 || properties.isbn13) && properties.title) {
                //save to mongo
                //storageUtils.saveBookToMongo(properties);
            }
        }
        setTimeout(getBook(bookId + 1), SLEEP_TIME_MILLIS);
    }

    request(options, callback);
};

getBook();
var request = require('request');
var storageUtils = require('./storage_utils');
var denver = require('./denver');
var Agent = require('socks5-http-client/lib/Agent');
var SLEEP_TIME_MILLIS = 1500;

var Monitor = require('../monitor');
var monitor = new Monitor.monitor('denver');

var failures = 0;

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
        'Cookie': 'ASP.NET_SessionId=pdbm10ifgsyrpmyimyhclepv; OrgID=1; __utmt=1; __atuvc=13%7C11; __atuvs=550661d3d15b412200c; __utma=125080728.196341000.1426439855.1426472348.1426481545.3; __utmb=125080728.48.9.1426482762213; __utmc=125080728; __utmz=125080728.1426439855.1.1.utmcsr=(direct)|utmccn=(direct)|utmcmd=(none)'
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
            monitor.log(bookId + ' --- ' + properties.title || 'No title');
            if ((properties.isbn10 || properties.isbn13) && properties.title) {
                //save to mongo
                storageUtils.saveBookToMongo(properties, monitor);
                monitor.success(properties.isbn10 ? properties.isbn10 : properties.isbn13);
                failures = 0;
            } else {
                monitor.log('no title or isbn');
                failures += 1;
                if (failures > 50) {
                    monitor.error('failures exceeded threshold.');
                    process.exit(1);
                }
            }
        }
        setTimeout(getBook(parseInt(bookId) + 1), SLEEP_TIME_MILLIS);
    }

    request(options, callback);
};

getBook(process.argv[2]);
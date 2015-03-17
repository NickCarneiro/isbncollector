var test = require('tape');
var fs = require('fs');
var amazonScraper = require('../scrapers/amazon');
var linkcatScraper = require('../scrapers/linkcat');
var denver = require('../scrapers/denver');
var cheerio = require('cheerio');
var stringUtils = require('../scrapers/string_utils');


test('amazon book page html extraction - tsukuru', function (t) {
    var amazonHtml = fs.readFileSync(__dirname + '/fixtures/tsukuru_amazon.html');
    var bookProperties = amazonScraper.extractBookProperties(amazonHtml);
    var expectedProperties = {
        title: 'Colorless Tsukuru Tazaki and His Years of Pilgrimage: A novel',
        isbn10: '0385352107',
        isbn13: '9780385352109',
        pages: 400,
        authors: ['Haruki Murakami'],
        translators: ['Philip Gabriel'],
        description: fs.readFileSync(__dirname + '/fixtures/tsukuru_description.txt', 'utf-8'),
        binding: 'Hardcover',
        publisher: 'Knopf',
        publicationDate: new Date('Tue Aug 12 2014 00:00:00 GMT-0700 (PDT)')
    };
    t.deepEquals(bookProperties, expectedProperties);
    t.end();
});


test('amazon book page html extraction - cryptonomicon', function (t) {
    var amazonHtml = fs.readFileSync(__dirname + '/fixtures/cryptonomicon_amazon.html');
    var bookProperties = amazonScraper.extractBookProperties(amazonHtml);
    var expectedProperties = {
        title: 'Cryptonomicon',
        isbn10: '0060512806',
        isbn13: '9780060512804',
        pages: 1168,
        authors: ['Neal Stephenson'],
        description: fs.readFileSync(__dirname + '/fixtures/cryptonomicon_description.txt', 'utf-8'),
        binding: 'Paperback',
        publisher: 'Avon',
        publicationDate: new Date('Tue Nov 05 2002 00:00:00 GMT-0800 (PST)')
    };
    t.deepEquals(bookProperties, expectedProperties);
    t.end();
});


test('amazon book page html extraction - cryptonomicon alternate', function (t) {
    var amazonHtml = fs.readFileSync(__dirname + '/fixtures/cryptonomicon_amazon_alternate.html');
    var bookProperties = amazonScraper.extractBookProperties(amazonHtml);
    var expectedProperties = {
        title: 'Cryptonomicon',
        isbn10: '0060512806',
        isbn13: '9780060512804',
        pages: 1168,
        authors: ['Neal Stephenson'],
        description: fs.readFileSync(__dirname + '/fixtures/cryptonomicon_description_alternate.txt', 'utf-8'),
        binding: 'Paperback',
        publisher: 'Avon',
        publicationDate: new Date('Tue Nov 05 2002 00:00:00 GMT-0800 (PST)')
    };
    t.deepEquals(bookProperties, expectedProperties);
    t.end();
});

test('amazon book page html extraction, multiple authors - zero to one', function (t) {
    var amazonHtml = fs.readFileSync(__dirname + '/fixtures/zero_to_one_amazon.html');
    var bookProperties = amazonScraper.extractBookProperties(amazonHtml);
    var expectedProperties = {
        title: 'Zero to One: Notes on Startups, or How to Build the Future',
        isbn10: '0804139296',
        isbn13: '9780804139298',
        pages: 224,
        authors: ['Peter Thiel', 'Blake Masters'],
        description: fs.readFileSync(__dirname + '/fixtures/zero_to_one_description.txt', 'utf-8'),
        binding: 'Hardcover',
        publisher: 'Crown Business',
        publicationDate: new Date('Tue Sep 16 2014 00:00:00 GMT-0700 (PDT)')
    };
    t.deepEquals(bookProperties, expectedProperties);
    t.end();
});

test('amazon book page html extraction, no author, one editor - rsmeans', function (t) {
    var amazonHtml = fs.readFileSync(__dirname + '/fixtures/rsmeans_amazon.html');
    var bookProperties = amazonScraper.extractBookProperties(amazonHtml);
    t.deepEquals(bookProperties.editors, ['Bob Mewis']);
    t.end();
});

test('amazon book page html extraction, 4 authors - pencil drawing', function (t) {
    var amazonHtml = fs.readFileSync(__dirname + '/fixtures/pencil_drawing_amazon.html');
    var bookProperties = amazonScraper.extractBookProperties(amazonHtml);
    t.deepEquals(bookProperties.authors, ['Michael Butkus', 'Eugene Metcalf',
        'William Powell', 'Mia Tavonatti']);
    t.end();
});


test('amazon book page html extraction, 3 editors - architecture', function (t) {
    var amazonHtml = fs.readFileSync(__dirname + '/fixtures/architecture_amazon.html');
    var bookProperties = amazonScraper.extractBookProperties(amazonHtml);
    t.deepEquals(bookProperties.editors, ['Sofia Borges', 'Sven Ehmann', 'Robert Klanten']);
    t.end();
});


test('denver book page html extraction - cryptonomicon', function (t) {
    var denverHtml = fs.readFileSync(__dirname + '/fixtures/cryptonomicon_denver.html');
    var expectedProperties = {
        title: 'Cryptonomicon',
        isbn13: '9780060512804',
        relatedIsbns: [ '0060512806', '0380973464', '9780380973460' ],
        pages: 1152,
        authors: ['Neal Stephenson'],
        binding: 'Paperback',
        publisher: 'New York : Avon Books, 2002, c1999.',
        description: 'An American computer hacker operating in Southeast Asia attempts to break a World War II cypher to find the location of a missing shipment of gold. The gold was stolen by the Japanese during the war. By the author of The Diamond Age.',
        publicationDate: 2002
    };
    $ = cheerio.load(denverHtml);
    var bookProperties = denver.extractBookProperties(denverHtml, $);
    t.deepEquals(bookProperties, expectedProperties);
    t.end();
});


test('amazon search page result url extraction', function (t) {
    var amazonHtml = fs.readFileSync(__dirname + '/fixtures/walden_search_results.html');
    var bookProperties = amazonScraper.extractSearchResultUrls(amazonHtml);
    var expectedUrls = [
        'http://www.amazon.com/Walden-Henry-David-Thoreau/dp/1619493918/ref=sr_1_1?s=books&ie=UTF8&qid=1425767978&sr=1-1&keywords=walden',
        'http://www.amazon.com/Walden-Black-White-Classics-Thoreau/dp/1505297729/ref=sr_1_3?s=books&ie=UTF8&qid=1425767978&sr=1-3&keywords=walden',
        'http://www.amazon.com/Walden-Woods-Dover-Thrift-Editions/dp/0486284956/ref=sr_1_4?s=books&ie=UTF8&qid=1425767978&sr=1-4&keywords=walden',
        'http://www.amazon.com/Walden-Woods-Dover-Thrift-Editions-ebook/dp/B008TVLYAW/ref=sr_1_5?s=books&ie=UTF8&qid=1425767978&sr=1-5&keywords=walden',
        'http://www.amazon.com/Walden-Henry-David-Thoreau/dp/149968634X/ref=sr_1_6?s=books&ie=UTF8&qid=1425767978&sr=1-6&keywords=walden',
        'http://www.amazon.com/Walden-Collectors-Library-Henry-Thoreau/dp/1904633455/ref=sr_1_7?s=books&ie=UTF8&qid=1425767978&sr=1-7&keywords=walden',
        'http://www.amazon.com/Walden-Yale-Nota-Henry-Thoreau/dp/0300110081/ref=sr_1_8?s=books&ie=UTF8&qid=1425767978&sr=1-8&keywords=walden',
        'http://www.amazon.com/Walden-Henry-David-Thoreau/dp/1494466694/ref=sr_1_9?s=books&ie=UTF8&qid=1425767978&sr=1-9&keywords=walden',
        'http://www.amazon.com/Walden-Anniversary-Illustrated-American-Classic-ebook/dp/B000VI71ZI/ref=sr_1_10?s=books&ie=UTF8&qid=1425767978&sr=1-10&keywords=walden',
        'http://www.amazon.com/Walden-Disobedience-Writings-Critical-Editions/dp/0393930904/ref=sr_1_11?s=books&ie=UTF8&qid=1425767978&sr=1-11&keywords=walden',
        'http://www.amazon.com/Walden-River-Press-Hardcover-Thoreau/dp/1435107497/ref=sr_1_12?s=books&ie=UTF8&qid=1425767978&sr=1-12&keywords=walden'
    ];
    t.deepEquals(bookProperties, expectedUrls);
    t.end();
});


test('linkcat search page result url extraction', function (t) {
    var linkcatHtml = fs.readFileSync(__dirname + '/fixtures/linkcat_results.html');
    var bookProperties = linkcatScraper.extractSearchResultUrls(linkcatHtml);
    var expectedUrls = [
        "http://www.linkcat.info/cgi-bin/koha/opac-detail.pl?biblionumber=823192",
        "http://www.linkcat.info/cgi-bin/koha/opac-detail.pl?biblionumber=823194",
        "http://www.linkcat.info/cgi-bin/koha/opac-detail.pl?biblionumber=823196",
        "http://www.linkcat.info/cgi-bin/koha/opac-detail.pl?biblionumber=823199",
        "http://www.linkcat.info/cgi-bin/koha/opac-detail.pl?biblionumber=823201",
        "http://www.linkcat.info/cgi-bin/koha/opac-detail.pl?biblionumber=823208",
        "http://www.linkcat.info/cgi-bin/koha/opac-detail.pl?biblionumber=823209",
        "http://www.linkcat.info/cgi-bin/koha/opac-detail.pl?biblionumber=62727",
        "http://www.linkcat.info/cgi-bin/koha/opac-detail.pl?biblionumber=62743",
        "http://www.linkcat.info/cgi-bin/koha/opac-detail.pl?biblionumber=62763",
        "http://www.linkcat.info/cgi-bin/koha/opac-detail.pl?biblionumber=62771",
        "http://www.linkcat.info/cgi-bin/koha/opac-detail.pl?biblionumber=62775",
        "http://www.linkcat.info/cgi-bin/koha/opac-detail.pl?biblionumber=62784",
        "http://www.linkcat.info/cgi-bin/koha/opac-detail.pl?biblionumber=62792",
        "http://www.linkcat.info/cgi-bin/koha/opac-detail.pl?biblionumber=62804",
        "http://www.linkcat.info/cgi-bin/koha/opac-detail.pl?biblionumber=62807",
        "http://www.linkcat.info/cgi-bin/koha/opac-detail.pl?biblionumber=62810",
        "http://www.linkcat.info/cgi-bin/koha/opac-detail.pl?biblionumber=62820",
        "http://www.linkcat.info/cgi-bin/koha/opac-detail.pl?biblionumber=581942",
        "http://www.linkcat.info/cgi-bin/koha/opac-detail.pl?biblionumber=581948"
    ];
    t.deepEquals(bookProperties, expectedUrls);
    t.end();
});



test('linkcat - book page properties extraction - cryptonomicon', function (t) {
    var linkcatHtml = fs.readFileSync(__dirname + '/fixtures/cryptonomicon_linkcat.html');
    var bookProperties = linkcatScraper.extractBookProperties(linkcatHtml);
    var expectedProperties = {
        title: 'Cryptonomicon',
        isbn10: '0380973464',
        relatedIsbns: ['9781439501795', '0380788624', '0060512806'],
        pages: 918,
        authors: ['Neal Stephenson'],
        binding: 'Hardcover',
        publisher: 'Avon Press',
        publicationDate: 1999
    };
    t.deepEquals(bookProperties, expectedProperties);
    t.end();
});


test('linkcat - book page extraction - zero to one', function (t) {
    var linkcatHtml = fs.readFileSync(__dirname + '/fixtures/zero_to_one_linkcat.html');
    var bookProperties = linkcatScraper.extractBookProperties(linkcatHtml);
    var expectedProperties = {
        title: 'Zero to one : notes on startups, or how to build the future',
        isbn13: '9780804139298',
        relatedIsbns: ['0804139296'],
        pages: 210,
        authors: ['Peter A Thiel', 'Blake G Masters'],
        binding: 'Hardcover',
        publisher: 'Crown Business',
        publicationDate: 2014
    };
    t.deepEquals(bookProperties, expectedProperties);
    t.end();
});

test('reverse names', function (t) {
    var names = ['ABERT, J. W. (JAMES WILLIAM), 1820-1897.',
        'KENNEDY, LAWTON R.',
        'GALVIN, JOHN R., 1929-',
        'HOWELL, JOHN, 1874-1956.',
        'ROWLING, J. K.',
        'STENDHAL, 1783-1842 CN.',
        'WHARFIELD, H. B.'
    ];
    var reversedNames = names.map(function(name) {
        return stringUtils.reverseNames(name);
    });
    var expectedNames = [
        'J. W. ABERT',
        'LAWTON R. KENNEDY',
        'JOHN R. GALVIN',
        'JOHN HOWELL',
        'J. K. ROWLING',
        'STENDHAL',
        'H. B. WHARFIELD'
    ];
    t.deepEquals(reversedNames, expectedNames);
    t.end();
});


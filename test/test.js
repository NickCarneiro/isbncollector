var test = require('tape');
var fs = require('fs');
var amazonScraper = require('../scrapers/amazon');


test('amazon book page html extraction - tsukuru', function (t) {
    var amazonHtml = fs.readFileSync(__dirname + '/fixtures/tsukuru_amazon.html');
    var bookProperties = amazonScraper.extractBookProperties(amazonHtml);
    var expectedProperties = {
        title: 'Colorless Tsukuru Tazaki and His Years of Pilgrimage: A novel',
        isbn10: '0385352107',
        isbn13: '9780385352109',
        pages: 400,
        author: 'Haruki Murakami',
        description: fs.readFileSync(__dirname + '/fixtures/tsukuru_description.txt', 'utf-8'),
        binding: 'Hardcover',
        publisher: 'Knopf',
        publicationDate: 'August 12, 2014'
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
        author: 'Neal Stephenson',
        description: fs.readFileSync(__dirname + '/fixtures/cryptonomicon_description.txt', 'utf-8'),
        binding: 'Paperback',
        publisher: 'Avon',
        publicationDate: 'November 5, 2002'
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
        author: 'Neal Stephenson',
        description: fs.readFileSync(__dirname + '/fixtures/cryptonomicon_description_alternate.txt', 'utf-8'),
        binding: 'Paperback',
        publisher: 'Avon',
        publicationDate: 'November 5, 2002'
    };
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
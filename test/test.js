var test = require('tape');
var fs = require('fs');
var amazonScraper = require('../scrapers/amazon');


test('test amazon html extraction - tsukuru', function (t) {
    var amazonHtml = fs.readFileSync(__dirname + '/tsukuru_amazon.html');
    var bookProperties = amazonScraper.extractProperties(amazonHtml);
    var expectedProperties = {
        title: 'Colorless Tsukuru Tazaki and His Years of Pilgrimage: A novel',
        isbn10: '0385352107',
        isbn13: '9780385352109',
        pages: 400,
        author: 'Haruki Murakami',
        description: fs.readFileSync(__dirname + '/tsukuru_description.txt', 'utf-8'),
        binding: 'Hardcover',
        publisher: 'Knopf',
        publicationDate: 'August 12, 2014'
    };
    t.deepEquals(bookProperties, expectedProperties);
    t.end();
});


test('test amazon html extraction - cryptonomicon', function (t) {
    var amazonHtml = fs.readFileSync(__dirname + '/cryptonomicon_amazon.html');
    var bookProperties = amazonScraper.extractProperties(amazonHtml);
    var expectedProperties = {
        title: 'Cryptonomicon',
        isbn10: '0060512806',
        isbn13: '9780060512804',
        pages: 1168,
        author: 'Neal Stephenson',
        description: fs.readFileSync(__dirname + '/cryptonomicon_description.txt', 'utf-8'),
        binding: 'Paperback',
        publisher: 'Avon',
        publicationDate: 'November 5, 2002'
    };
    t.deepEquals(bookProperties, expectedProperties);
    t.end();
});
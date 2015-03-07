var test = require('tape');
var fs = require('fs');
var amazonScraper = require('../scrapers/amazon');


test('test amazon html extraction', function (t) {
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
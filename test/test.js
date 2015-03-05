var test = require('tape');
var fs = require('fs');
var amazonScraper = require('../scrapers/amazon');
test('test amazon html extraction', function (t) {
    var amazonHtml = fs.readFileSync(__dirname + '/tsukuru.html');
    var bookProperties = amazonScraper.extractProperties(amazonHtml);
    var expectedProperties = {
        isbn10: '0385352107',
        isbn13: '978-0385352109',
        pages: 400,
        author: 'Haruki Murakami',
        description: fs.readFileSync(__dirname + '/tsukuru_properties.txt', 'utf-8')
    };
    t.equals(bookProperties, expectedProperties);
    t.end();
});
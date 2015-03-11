var cheerio = require('cheerio');
var RESULTS_PER_PAGE = 20;
var BASE_URL = 'http://www.linkcat.info/cgi-bin/koha/opac-search.pl?idx=;limit=format%3A%22Book%22;q=&offset=$OFFSET';


var extractSearchResultUrls = function(searchPageHtml) {
    var $ = cheerio.load(searchPageHtml);
    // cheerio chokes on the 'not' pseudo selector here.
    // $('.searchresults a[href*="opac-detail.pl?biblionumber"]:not(".p1")');
    var resultLinks = $('.searchresults a[href*="opac-detail.pl?biblionumber"]');
    var resultUrls = [];
    $(resultLinks).each(function(i, resultLink) {
        if ($(resultLink).hasClass('p1')) {
            return;
        }
        var href = $(resultLink).attr('href');
        resultUrls.push('http://linkcat.info' + href);
    });
    return resultUrls;
};



var extractBookProperties = function(bookPageHtml) {
    var $ = cheerio.load(bookPageHtml);
    var properties = {};
    properties.title = $('.displaytitle').text().replace(/ \/ $/, ''); //weird trailing slash on the end of book titles
    var authorNames = $('h5 a'); // 'Stephenson, Neal'
    var reversedAuthorNames = [];
    $(authorNames).each(function(i, authorNameLink) {
        var authorNameText = $(authorNameLink).text();
        var reversedNames = reverseNames(authorNameText);
        reversedAuthorNames.push(reversedNames);
    }); // 'Neal Stephenson'
    properties.authors = reversedAuthorNames;
    var publisherText = $('.displaypub').text();
    if (!publisherText) {
        publisherText = $('.results_summary:contains("Publication:")').text();
    }
    var publisherMatches = publisherText.match(/.+ : (.+), /);
    if (publisherMatches && publisherMatches.length >= 2) {
        publisherName = publisherMatches[1];
    }
    properties.publisher = publisherName;
    var publicationYear = publisherText.match(/c(\d{4})/)[1];
    properties.publicationDate = parseInt(publicationYear);
    var isbnText = $('.displayISBN').text();
    var isbn = isbnText.match(/^([^\(^\s^:]+) \(/)[1];
    if (isbn.length > 10) {
        properties.isbn13 = isbn;
    } else {
        properties.isbn10 = isbn;
    }
    var relatedIsbns = isbnText.match(/; [\d\w]+/g);
    relatedIsbns = relatedIsbns.map(function(isbnText) {
        return isbnText.replace('; ', '');
    });
    properties.relatedIsbns = relatedIsbns;
    var bindingText = isbnText.match(/\((.+)\)/)[1];
    if (bindingText.toLowerCase() === 'hardcover') {
        properties.binding = 'Hardcover';
    } else if (bindingText.toLowerCase() === 'paperback') {
        properties.binding = 'Paperback';
    }
};

var reverseNames = function(name) {
    var commaIndex = name.indexOf(', ');
    if (commaIndex === -1) {
        return name;
    }
    return name.substring(commaIndex + 2) + ' ' + name.substring(0, commaIndex);
};

module.exports = {
    extractSearchResultUrls: extractSearchResultUrls,
    extractBookProperties: extractBookProperties
};
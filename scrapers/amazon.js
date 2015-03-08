var cheerio = require('cheerio');
var request = require('request');
/**
 *
 * @param {string} html extract
 */
var extractBookProperties = function(html) {
    var $ = cheerio.load(html);
    var title = $('#productTitle').text();
    if (!title) {
        title = $('#btAsinTitle').clone()    //clone the element
            .children() //select all the children
            .remove()   //remove all the children
            .end()  //again go back to selected element
            .text()
            .trim();
    }
    var author = $('.contributorNameID').text();
    if (!author) {
        author = $('span:contains("(Author)") > a').text();
    }
    var description = $($('noscript')[1]).html().trim();

    if (!description || description.indexOf('<style') !== -1) {
        description = $('#postBodyPS').html().trim();
    }

    var pagesText = $('.content li:contains("pages")').text();
    var pagesCountGroups = pagesText.match(/([\d]+)/);
    var pages = parseInt(pagesCountGroups[0]);
    var isbnText = $('.content li:contains("ISBN-10:")').text();
    var isbn10 = isbnText.replace('ISBN-10:', '').replace('-', '').trim();
    //todo: validate isbn
    var isbn13Text = $('.content li:contains("ISBN-13")').text();
    var isbn13 = isbn13Text.replace('ISBN-13:', '').replace('-', '').trim();
    var binding;
    var isHardCover = $('.content li > b:contains("Hardcover")').length;
    var isPaperback = $('.content li > b:contains("Paperback")').length;
    if (isHardCover) {
        binding = 'Hardcover';
    } else if (isPaperback) {
        binding = 'Paperback';
    }
    // "Publisher: RosettaBooks (July 1, 2010)"
    // Dell (November 3, 1991)
    // Knopf; First Edition edition (August 12, 2014)
    var publisherLine = $('li:contains("Publisher:")').text();
    var publisherName = publisherLine.match(/Publisher: (.+?)(;|\()/)[1];
    if (publisherName) {
        publisherName = publisherName.trim();
    }
    var publicationDate = publisherLine.match(/\(([^)]+)\)/)[1];
    var properties = {
        title: title,
        author: author,
        description: description,
        pages: pages,
        isbn10: isbn10,
        isbn13 : isbn13,
        publisher: publisherName,
        publicationDate: publicationDate
    };

    if (binding) {
        properties.binding = binding;
    }
    return properties;
};


var extractSearchResultUrls = function(searchPageHtml) {
    var $ = cheerio.load(searchPageHtml);
    var resultLinks = $('div.a-col-right > .a-link-normal,.s-access-detail-page,.a-text-normal > h2.a-size-medium a');
    var resultUrls = [];
    $(resultLinks).each(function(i, resultLink) {
        var href = $(resultLink).attr('href');
        resultUrls.push(href);
    });
    return resultUrls;
};


var searchForBook = function(isbn, callback) {
    var baseSearchUrl = 'http://www.amazon.com/s/ref=nb_sb_noss?url=search-alias%3Dstripbooks&field-keywords=$isbn';
    var searchUrl = baseSearchUrl.replace('$isbn', isbn);
    request(searchUrl, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            // got the search results, extract the first link
            var searchResultUrls = extractSearchResultUrls(body);
            if (!searchResultUrls || searchResultUrls.length == 0) {
                callback('No results found.', true);
            } else {
                getBook(searchResultUrls[0], callback);
            }
        } else {
            var requestFailed = true;
            callback(error, requestFailed);
        }
    })
};


var getBook = function(bookPageUrl, callback) {
    request(bookPageUrl, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var bookProperties = extractBookProperties(body);
            callback(bookProperties);
        } else {
            var requestFailed = true;
            callback(error, requestFailed);
        }
    });
};


module.exports = {
    extractBookProperties: extractBookProperties,
    searchForBook: searchForBook,
    extractSearchResultUrls: extractSearchResultUrls
};
var cheerio = require('cheerio');
var request = require('request');
var moment = require('moment');

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
    if (!title) {
        console.log('Could not get a title');
        return null;
    }

    var byline = $('#byline').text();
    byline = byline.replace(/\s+/gi, ' ');
    byline = byline.replace(/{"isAjax.+Author Central/, '');
    byline = byline.replace(' by ', '');
    byline = byline.trim();
    var contributors = byline.split(',');
    var authors = [];
    var translators = [];
    contributors.forEach(function(contributor) {
        if (contributor.indexOf('(Author)') !== -1) {
            var author = contributor.replace('(Author)', '').trim();
            if (author) {
                authors.push(author);
            }
        } else if (contributor.indexOf('(Translator)') !== -1) {
            var translator = contributor.replace('(Translator)', '').trim();
            if (translator) {
                translators.push(translator);
            }
        }
    });
    if (authors.length === 0) {
        var author = $('.contributorNameID').text();
        if (author) {
            authors.push(author);
        }
    }
    if (authors.length === 0) {
        var author = $('span:contains("(Author)") > a').text();
        if (author) {
            authors.push(author);
        }
    }

    var description;
    $('noscript').each(function(i, noScriptElement) {
        var noScriptElementHtml = $(noScriptElement).html().trim();
        if (noScriptElementHtml.indexOf('<style') === -1 &&
            noScriptElementHtml.indexOf('<img') === -1
        ) {
            description = noScriptElementHtml;
            return false;
        }
    });

    if (!description) {
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
    var publicationDateText = publisherLine.match(/\(([^)]+)\)/)[1];
    var publicationDateIsoString = moment(publicationDateText, 'MMM D, YYYY').toISOString();
    var publicationDate = new Date(publicationDateIsoString);

    // some titles contain the series title
    // 'A People's History Of The Vietnam War (New Press People's History)'
    var seriesText = $('.content li:contains("Series")').text();
    var seriesName;
    if (seriesText) {
        seriesName = seriesText.replace('Series:', '').trim();
        var seriesNameParens = '(' + seriesName +')';
        title = title.replace(seriesNameParens, '').trim();
    }
    var properties = {
        title: title,
        authors: authors,
        description: description,
        pages: pages,
        isbn10: isbn10,
        isbn13 : isbn13,
        publisher: publisherName,
        publicationDate: publicationDate
    };

    if (translators.length > 0) {
        properties.translators = translators;
    }
    if (binding) {
        properties.binding = binding;
    }
    if (seriesName) {
        properties.seriesName = seriesName;
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
    var options = {
        url: bookPageUrl,
        headers: {
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/40.0.2214.115 Safari/537.36'
        }
    };
    request(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var bookProperties = extractBookProperties(body);
            if (bookProperties) {
                callback(bookProperties);
            } else {
                callback('Could not parse book properties.', true);
            }
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
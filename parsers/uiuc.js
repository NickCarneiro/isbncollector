var cheerio = require('cheerio');
var stringUtils = require('./../utils/string_utils');



/**
 *
 * @param {string} mainAuthor - a string containing newline separated author names
 * @param {Array} otherAuthors - a string containing newline separated author names
 */
var extractAuthorNames = function(mainAuthor, otherAuthors) {
    var authorList = [];
    var authors = [];
    if (mainAuthor) {
        authors.push(mainAuthor);
    }
    if (otherAuthors.length > 0) {
        authors = authors.concat(otherAuthors);
    }
    authors.forEach(function(authorString) {
        if (!authorString) {
            return;
        }
        var authorNames = authorString.trim().split(/\n/);
        authorNames.forEach(function(name) {
            var trimmedName = name.trim();
            if (trimmedName === '') {
                return;
            }
            // remove trailing period unless the author's first name is initials like J. K. Rowling
            if (trimmedName.match(/[a-z]\.$/)) {
                trimmedName = trimmedName.replace(/\.$/, '');
            }
            var reversedName = stringUtils.reverseNames(trimmedName);
            if (authorList.indexOf(reversedName) === -1) {
                authorList.push(reversedName);
            }
        });

    });
    return authorList;
};

/**
 * gets a comma separated list of isbns like
 * 9780804139298,0804139296
 * @param isbnText
 */
var extractIsbns = function(isbnText) {
    return isbnText.match(/[\d][\w\d]+/gi);
};


var extractBookProperties = function(bookPageHtml) {
    var $ = cheerio.load(bookPageHtml);
    var properties = {};
    properties.title = $('div.record > h1').text().trim();
    //remove trailing slash
    properties.title = properties.title.replace(/\/$/, '').trim();
    var author = $('tr:contains("Author:") a').first().text();
    var otherNamesContainer = $('th[width=150]:contains("Other Names:")').next();
    var otherAuthorLinks = $(otherNamesContainer).children('a');
    var otherAuthors = [];
    otherAuthorLinks.each(function(i, authorLink) {
        var authorName = $(authorLink).text().trim().replace(/,$/, '');
        otherAuthors.push(authorName);
    });
    // sometimes there's no author row, just "Names" for something like a meeting transcript
    // http://vufind.carli.illinois.edu/vf-uiu/Record/uiu_4000/Description
    var nameLinks = $('tr:contains("Names:") a');
    nameLinks.each(function(i, nameLink) {
        var authorName = $(nameLink).text().trim().replace(/,$/, '');
        otherAuthors.push(authorName);
    });
    var authors = extractAuthorNames(author, otherAuthors);
    if (authors.length > 0) {
        properties.authors = authors;
    }
    var publisherText = $('tr:contains("Published:") td').text().trim();
    if (publisherText) {
        // This combined publisher/date field is too difficult to parse
        properties.publisher = publisherText;


        var publicationYearMatches = publisherText.match(/(\d{4})/);
        if (publicationYearMatches) {
            var publicationYear = publicationYearMatches[0];
            properties.publicationDate = parseInt(publicationYear);
        }
    }

    var isbnText = $('tr:contains("ISBN:") td').text().trim();
    var isbns = extractIsbns(isbnText);
    if (isbns) {
        isbns.forEach(function(isbn) {
            if (!properties.isbn13 && isbn.length > 10 ) {
                properties.isbn13 = isbn;
            } else if (!properties.isbn10 && isbn.length > 0) {
                properties.isbn10 = isbn;
            } else {
                // Save this isbn in related_isbns if we haven't already saved in in isbn10 or 13
                if (isbn != properties.isbn10 &&
                    isbn != properties.isbn13) {
                    if (!properties.relatedIsbns) {
                        properties.relatedIsbns = [isbn];
                    } else if (properties.relatedIsbns.indexOf(isbn) === -1) {
                        properties.relatedIsbns.push(isbn);
                    }
                }
            }
        });
    }

    var pagesText = $('tr:contains("Physical Description:") td').text().trim();
    if (pagesText) {
        //matches both '242 pages and 242 p.'
        var pagesMatches = pagesText.match(/(\d+) p/);
        if (pagesMatches) {
            var pageCount = parseInt(pagesMatches[1]);
            properties.pages = pageCount;
        }
    }

    // UIUC includes descriptions for some books directly in the html,
    // others send a request to syndetics. We're going to ignore the latter.
    var summaryElement = $('th[width=150]:contains("Summary:")').next();
    if (summaryElement) {
        var description = $(summaryElement).text().trim();
        if (description) {
            properties.description = description;
        }
    }

    return properties;
};


module.exports = {
    extractBookProperties: extractBookProperties
};
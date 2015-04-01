var cheerio = require('cheerio');
var stringUtils = require('./string_utils');



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
        if (authorString) {
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
                if (authorList.indexOf(trimmedName) === -1) {
                    authorList.push(reversedName);
                }
            });
        }
    });
    return authorList;
};

/**
 * gets a comma separated list of isbns like
 * 9780804139298,0804139296
 * @param isbnText
 */
var extractIsbns = function(isbnText) {
    if (!isbnText) {
        return null;
    }
    return isbnText.split(',');
};


var extractBookProperties = function(bookPageHtml) {
    var $ = cheerio.load(bookPageHtml);
    var properties = {};
    var title = $('#item_bib_title').text().trim();
    var subtitle = $('.subTitle').text().trim();
    if (subtitle) {
        properties.title = title + ' ' + subtitle;
    } else {
        properties.title = title;
    }
    var author = $('a[testid=author_search]').text().trim();
    var otherAuthorLinks = $('.value.author a');
    var otherAuthors = [];
    otherAuthorLinks.each(function(i, authorLink) {
        otherAuthors.push($(authorLink).text().trim());
    });
    var authors = extractAuthorNames(author, otherAuthors);
    if (authors.length > 0) {
        properties.authors = authors;
    }
    var publisherText = $('div[testid=publishers_main]').children('.value').text().trim();
    if (publisherText) {
        // This combined publisher/date field is too difficult to parse
        properties.publisher = publisherText;


        var publicationYearMatches = publisherText.match(/(\d{4})/);
        if (publicationYearMatches) {
            var publicationYear = publicationYearMatches[0];
            properties.publicationDate = parseInt(publicationYear);
        }
    }

    var isbnText = $('div[data-isbns]').attr('data-isbns');
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

    var pagesText = $('.label:contains("Characteristics")').next().text().trim();
    if (pagesText) {
        var pagesMatches = pagesText.match(/(\d+) p/);
        if (pagesMatches) {
            var pageCount = parseInt(pagesMatches[1]);
            properties.pages = pageCount;
        }
    }
    var description = $('.bib_description').text().trim();
    if (description) {
        properties.description = description;
    }
    return properties;
};


module.exports = {
    extractBookProperties: extractBookProperties
};
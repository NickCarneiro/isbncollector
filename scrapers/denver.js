var cheerio = require('cheerio');
var stringUtils = require('./string_utils');

// each book page contains a table with property names in the left col
// and values in the right. turn it into a map we can inspect for the values
// we care about.
var tableToMap = function(tableRows, $) {
    var rawBookProperties = {};
    $(tableRows).each(function(i, row) {
        var propertyName = $(row).children('.nsm-full-label').text().replace(':', '').trim();
        var propertyValue = $(row).children('.nsm-full-content').text().trim();
        rawBookProperties[propertyName] = propertyValue;
    });
    return rawBookProperties;
};


/**
 *
 * @param {string} authors - a string containing newline separated author names
 * @param {string} otherAuthors - a string containing newline separated author names
 */
var extractAuthorNames = function(authors, otherAuthors) {
    var authorList = [];
    var mainAndSecondaryAuthors = [authors, otherAuthors];
    mainAndSecondaryAuthors.forEach(function(authorString) {
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
 * gets a newline separated list of isbns like
 * 9780804139298 (hardback)
 * 0804139296 (hardback)
 * 9780804139304 (ebook)
 * and returns the first one
 * @param isbnText
 */
var extractIsbns = function(isbnText) {
    if (!isbnText) {
        return null;
    }
    var isbnList = isbnText.split(/\n/);
    var isbns = [];
    isbnList.forEach(function(isbnLine) {
        if (isbnLine.trim() === '') {
            return;
        }
        var isbnMatches = isbnLine.replace('-', '').match(/\d\w+/);
        if (isbnMatches[0]) {
            isbns.push(isbnMatches[0]);
        }
    });
    return isbns;
};


var extractBookProperties = function(bookPageHtml) {
    var $ = cheerio.load(bookPageHtml);
    var properties = {};
    var tableRows = $('.nsm-full-record tr');
    var rawBookProperties = tableToMap(tableRows, $);
    //'Cryptonomicon / Neal Stephenson.'  > 'Cryptonomicon'
    if (rawBookProperties['Title']) {
        properties.title = rawBookProperties['Title'].replace(/ \/ .+\.$/, '');
    }
    var authors = extractAuthorNames(rawBookProperties['Author'],
        rawBookProperties['Other Author']);

    properties.authors = authors;
    var publisherText = rawBookProperties['Publisher, Date'];
    if (publisherText) {
        // This combined publisher/date field is too difficult to parse
        properties.publisher = publisherText;


        var publicationYearMatches = publisherText.match(/(\d{4})/);
        if (publicationYearMatches) {
            var publicationYear = publicationYearMatches[0];
            properties.publicationDate = parseInt(publicationYear);
        }
    }

    var isbnText = rawBookProperties['ISBN'];
    var isbns = extractIsbns(isbnText);
    if (isbns) {


        var firstIsbn = isbns[0];
        if (firstIsbn) {
            if (firstIsbn.length > 10) {
                properties.isbn13 = firstIsbn;
            } else if (firstIsbn.length > 0) {
                properties.isbn10 = firstIsbn;
            }
        }
        if (isbns.length > 1) {
            properties.relatedIsbns = isbns.splice(1);
        }
    }
    if (isbnText) {

        var bindingGroups = isbnText.match(/\(([^\()]+)\)/);
        if (bindingGroups) {
            var bindingText = bindingGroups[1];
            if (bindingText.toLowerCase() === 'hardcover' || bindingText.toLowerCase() === 'hardback') {
                properties.binding = 'Hardcover';
            } else if (bindingText.toLowerCase() === 'paperback' || bindingText.toLowerCase() === 'pbk.') {
                properties.binding = 'Paperback';
            }
        }
    }

    var pagesText = rawBookProperties['Description'];
    if (pagesText) {
        var pagesMatches = pagesText.match(/(\d+) p/);
        if (pagesMatches) {
            var pageCount = parseInt(pagesMatches[1]);
            properties.pages = pageCount;
        }
    }
    if (rawBookProperties['Summary']) {
        properties.description = rawBookProperties['Summary'].trim();
    }
    return properties;
};


module.exports = {
    extractBookProperties: extractBookProperties
};
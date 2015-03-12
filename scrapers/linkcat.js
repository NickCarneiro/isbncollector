var cheerio = require('cheerio');

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
        resultUrls.push('http://www.linkcat.info' + href);
    });
    return resultUrls;
};



var extractBookProperties = function(bookPageHtml) {
    var $ = cheerio.load(bookPageHtml);
    var properties = {};
    properties.title = $('.displaytitle').text().replace(/ \/ $/, ''); //weird trailing slash on the end of book titles
    console.log(properties.title);
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
    if (publisherText) {
        var publisherMatches = publisherText.match(/.+ : (.+), /);
        if (!publisherMatches) {
            publisherMatches = publisherText.match(/(.+) \[/);
        }
        if (!publisherMatches) {
            publisherMatches = publisherText.match(/\] (.+),/);
        }
        if (!publisherMatches) {
            // "New York, Knopf, 1964    ."
            publisherMatches = publisherText.match(/(.+), \d{4}/);
        }
        if (publisherMatches) {
            var publisherName = publisherMatches[1];
            properties.publisher = publisherName;
        }
    }

    var publicationYearMatches = publisherText.match(/(\d{4})/);
    if (publicationYearMatches) {
        var publicationYear = publicationYearMatches[0];
    }
    properties.publicationDate = parseInt(publicationYear);
    var isbnText = $('.displayISBN').text();
    var isbn = '';
    var isbnGroups = isbnText.match(/^([^\(^\s^:]+) \(/);
        if (isbnGroups) {
            isbn = isbnGroups[1];
        } else {
            isbnGroups = isbnText.match(/([^;^:^\s^\.])+/);
            if (isbnGroups) {
                isbn = isbnGroups[0];
            }
        }
    if (isbn.length > 10) {
        properties.isbn13 = isbn;
    } else if (isbn.length > 0) {
        properties.isbn10 = isbn;
    }

    var relatedIsbnsStrings = isbnText.match(/; [\d\w]+/g);
    var relatedIsbns = [];
    if (relatedIsbnsStrings) {
        relatedIsbns = relatedIsbns.map(function(isbnText) {
            return isbnText.replace('; ', '');
        });
    }
    if (relatedIsbns.length > 0) {
        properties.relatedIsbns = relatedIsbns;
    }
    var bindingGroups = isbnText.match(/\(([^\()]+)\)/);
    if (bindingGroups) {
        var bindingText = bindingGroups[1];
        if (bindingText.toLowerCase() === 'hardcover' || bindingText.toLowerCase() === 'hardback') {
            properties.binding = 'Hardcover';
        } else if (bindingText.toLowerCase() === 'paperback' || bindingText.toLowerCase() === 'pbk.') {
            properties.binding = 'Paperback';
        }
    }

    var pagesText = $('.results_summary:contains("Description:")').text();
    var pagesMatches = pagesText.match(/(\d+) p/);
    if (pagesMatches) {
        var pageCount = parseInt(pagesMatches[1]);
        properties.pages = pageCount;
    }
    return properties;
};

var reverseNames = function(name) {
    var commaIndex = name.indexOf(', ');
    if (commaIndex === -1) {
        return name;
    }
    return name.substring(commaIndex + 2).trim() + ' ' + name.substring(0, commaIndex).trim();
};



module.exports = {
    extractSearchResultUrls: extractSearchResultUrls,
    extractBookProperties: extractBookProperties
};
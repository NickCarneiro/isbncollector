var cheerio = require('cheerio');

/**
 *
 * @param {string} html extract
 */
var extractProperties = function(html) {
    var $ = cheerio.load(html);
    var title = $('#productTitle').text();
    var author = $('.contributorNameID').text();
    var description = $($('noscript')[1]).html().trim();
    console.log(description);
    var pagesText = $('.content li:contains("pages")').text();
    var pagesCountGroups = pagesText.match(/([\d]+)/);
    var pages = parseInt(pagesCountGroups[0]);
    var isbnText = $('.content li:contains("ISBN-10:")').text();
    var isbn10 = isbnText.replace('ISBN-10:', '').replace('-', '').trim();
    //todo: validate isbn
    var isbn13Text = $('.content li:contains("ISBN-13")').text();
    var isbn13 = isbn13Text.replace('ISBN-13:', '').replace('-', '').trim();
    var binding;
    if ($('.content li > b:contains("Hardcover")')) {
        binding = 'Hardcover';
    } else if ($('.content li > b:contains("Paperback")')) {
        binding = 'Paperback';
    }
    // "Publisher: RosettaBooks (July 1, 2010)"
    // Dell (November 3, 1991)
    // Knopf; First Edition edition (August 12, 2014)
    var publisherLine = $('li:contains("Publisher:")').text();
    var publisherName = publisherLine.match(/Publisher: (.+) \(/)[1];
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

module.exports = {
    extractProperties: extractProperties
};
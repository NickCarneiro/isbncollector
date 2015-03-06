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
    var isbn10 = isbnText.replace('ISBN-10:', '').trim();
    //todo: validate isbn
    var isbn13Text = $('.content li:contains("ISBN-13")').text();
    var isbn13 = isbn13Text.replace('ISBN-13:', '').trim();

    return {
        title: title,
        author: author,
        description: description,
        pages: pages,
        isbn10: isbn10,
        isbn13 : isbn13
    };
};

module.exports = {
    extractProperties: extractProperties
};
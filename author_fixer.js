var MongoClient = require('mongodb').MongoClient;
var config = require('./config');
var amazon = require('./scrapers/amazon.js');
var SLEEP_TIME_MILLIS = 1500;
var storageUtils = require('./scrapers/storage_utils');

var bookList = [];
var bookIndex = 0;

MongoClient.connect(config.MONGO_URL, function (err, connection) {
    var collection = connection.collection('books');
    collection.find({publicationDate: {$type: 9}}).toArray(function(err, books) {
        bookList = books;
        console.log(books.length);
        fixBook(bookIndex);
    });
});

var fixBook = function(bookIndex) {
    var book = bookList[bookIndex];
    var query = {};
    var isbn;
    if (book.isbn10) {
        query['isbn10'] = book.isbn10;
        isbn = book.isbn10;
    } else {
        query['isbn13'] = book.isbn13;
        isbn = book.isbn13;
    }

    amazon.searchForBook(isbn, function(bookProperties, requestFailed) {
        var update = {};
        for (var property in bookProperties) {
            if (property === 'authors' || property === 'editors' || property === 'translators') {
                update[property] = bookProperties[property]
            }
        }
        console.log(query);
        console.log('replacing');
        console.log('---');
        console.log(book.authors);
        console.log(book.editors);
        console.log(book.translators);
        console.log('---');
        console.log(update);
        storageUtils.updateAuthorNames(query, {$set: update});
        setTimeout(function() {
            bookIndex++;
            fixBook(bookIndex);
        }, 1500);
    });
};

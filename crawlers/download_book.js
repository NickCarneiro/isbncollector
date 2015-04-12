//This file is responsible for downloading individual books, parsing them, and returning to mongo

var request = require('request');
var Agent = require('socks5-http-client/lib/Agent');


/**
 *
 * @param url - where to download book form
 * @param {Parser} parser - instance of a parser that we call extractBookProperties on
 * @param callback - pass it the parsed book or false
 */
var download = function(url, parser, callback) {
    var requestOptions = {
        url: url,
        agentClass: Agent,
        agentOptions: {
            socksHost: 'localhost',
            socksPort: 9050
        }
    };
    request(requestOptions, function (error, response, body) {
        if (!error) {
            var parsedBook = parser.extractBookProperties(body);
            if (parsedBook) {
                callback(parsedBook);
            } else {
                callback(false);
            }
        } else {
            callback(false);
        }
    });
};
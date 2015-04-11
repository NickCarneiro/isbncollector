# isbncollector
A free database of book metadata

## Live demo
http://isbn.trillworks.com

## Motivation
Commercial library catalog systems phone home with patron data. Any workable free software solution will require a large isbn database.

## How
As titles are requested, a large mongo will be built over time.

## Install
Run your own version of this.

required system packages:
* mongo
* tor

Create mongo indexes on isbn10, isbn13 and text:

    db.books.createIndex({title: "text"})
    db.books.createIndex({isbn10:1}, {unique: true, sparse: true})
    db.books.createIndex({isbn13:1}, {unique: true, sparse: true})

## Code Overview

Each source has a parser and a crawler. Crawlers talk http to remote hosts and pass the html to the parsers. Parsers
return structured data to the crawler which insert the book into the mongo.

Moving forward, crawlers will dump urls into a queue and not talk to parsers. The queue will be consumed by scrapers 
that call parsers.

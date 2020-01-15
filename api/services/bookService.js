"use strict"
import converter from "xml-js";

const genresExceptions = ["to-read", "currently-reading", "owned", "default", "favorites", "books-i-own",
    "ebook", "kindle", "library", "audiobook", "owned-books", "audiobooks", "my-books",
    "ebooks", "to-buy", "english", "calibre", "books", "british", "audio", "my-library",
    "favourites", "re-read", "general", "e-books"]
class BookService {
    constructor() {
        this.booksFromXML = this.booksFromXML.bind(this);
        this.bookForBookPage = this.bookForBookPage.bind(this);
        this.findValue = this.findValue.bind(this);
        this.formatBooks = this.formatBooks.bind(this);
        this.formatBookForBookPage = this.formatBookForBookPage.bind(this);
        this.getBookTitle = this.getBookTitle.bind(this);
        this.getAllBookAuthors = this.getAllBookAuthors.bind(this);
        this.mapAuthor = this.mapAuthor.bind(this);
    }

    booksFromXML(xml) {
        let converted = converter.xml2js(xml, { compact: true });
        let books = this.findValue(converted, "work");
        if (books) {
            let formatted = this.formatBooks(books)
            return formatted;
        }
    }

    bookForBookPage(xml) {
        let converted = converter.xml2js(xml, { compact: true });
        let book = this.findValue(converted, "book");
        // return book;
        if (book) {
            let formatted = this.formatBookForBookPage(book);
            return formatted;
        }
    }

    findValue(object, search) {
        let result;
        Object.keys(object).some(key => {
            if (key === search) {
                result = object[key];
                return true;
            }
            if (object[key] && typeof object[key] === "object") {
                result = this.findValue(object[key], search);
                return result !== undefined;
            }
        });
        return result;
    }

    formatBooks(books) {
        let formattedBooks = [];
        books.forEach(book => {
            let stringTitle = book.best_book.title._text;
            let seriesSeparator = stringTitle.indexOf("(");
            let title = stringTitle.substr(0, seriesSeparator > 0 ? seriesSeparator : stringTitle.length).trim();
            let seriesTitle = seriesSeparator < 0 ? "" : stringTitle.substr(seriesSeparator, stringTitle.indexOf(")") - seriesSeparator + 1);
            const newBook = {
                year: book.original_publication_year._text,
                goodreadsRating: book.average_rating._text,
                id: book.best_book.id._text,
                title: title,
                seriesTitle: seriesTitle,
                authorName: book.best_book.author.name._text,
                imageUrl: book.best_book.image_url._text,
                smallImageUrl: book.best_book.small_image_url._text,
            }
            formattedBooks.push(newBook);
        })
        return formattedBooks;
    }

    formatBookForBookPage(book) {
        let formatted = {
            id: book.id._text,
            title: book.title._text || this.getBookTitle(book.title._cdata),
            imageUrl: book.image_url._text,
            smallImageUrl: book.small_image_url._text,
            description: book.description._cdata.replace(/(&nbsp;|<([^>]+)>)/ig, ''), // remove <br> tags
            publishedYear: book.work.original_publication_year._text,
            goodreadsRating: book.average_rating._text,
            pages: book.num_pages._cdata,
        };
        const authors = book.authors.author;
        let trueAuthors = Array.isArray(authors) ? this.getAllBookAuthors(authors) : [this.mapAuthor(authors)];
        let series = book.series_works.series_work;
        if (Array.isArray(series)) {
            series = series[0];
        }

        let trueSeries = !series ? null : {
            id: series.series.id._text,
            fullName: `(${series.series.title._cdata.trim()} #${series.user_position._text})`
        }
        formatted.series = trueSeries;
        formatted.authors = trueAuthors;
        formatted.genres = this.formatGenresForBook(book.popular_shelves.shelf);
        return formatted;
    }

    //transform goodreads 'shelves' to genres
    formatGenresForBook(shelves) {
        const genres = shelves
            .filter(shelf => !genresExceptions.includes(shelf._attributes.name))
            .map(genre => genre._attributes.name.replace(/^\w/, char => char.toUpperCase()));//first letter toUpperCase \fantasy => Fantasy
        return genres.length > 3 ? genres.slice(0, 3) : genres;
    }

    getBookTitle(string) {
        let stringTitle = string;
        let seriesSeparator = stringTitle.indexOf("(");
        let title = stringTitle.substr(0, seriesSeparator > 0 ? seriesSeparator : stringTitle.length).trim();
        // let seriesTitle = seriesSeparator < 0 ? "" : stringTitle.substr(seriesSeparator, stringTitle.indexOf(")") - seriesSeparator + 1);
        return title;
    }

    getAllBookAuthors(authors) {
        return authors.filter(author => !author.role._text).map(author => this.mapAuthor(author));
    }

    mapAuthor(author) {
        return {
            id: author.id._text,
            name: author.name._text,
            imageUrl: author.image_url._cdata,
            smallImageUrl: author.small_image_url._cdata,
            goodreadsRating: author.average_rating._text
        }
    }
}

export default BookService;

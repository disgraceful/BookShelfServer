"use strict"
import converter from "xml-js";

class BookService {
    constructor() {
        this.booksFromXML = this.booksFromXML.bind(this);
        this.findValue = this.findValue.bind(this);
        this.formatBooks = this.formatBooks.bind(this);
    }

    booksFromXML(xml) {
        let converted = converter.xml2js(xml, { compact: true });
        let books = this.findValue(converted, "work");
        let formatted = this.formatBooks(books)
        return formatted;
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
                id: book.best_book.id_text,
                title: title,
                seriesTitle: seriesTitle,
                authorName: book.best_book.author.name._text,
                imageUrl: book.best_book.image_url._text,
                smallImageUrl: book.best_book.small_image_url._text,
            }
            formattedBooks.push(newBook);
        })
        // console.log(books);
        return formattedBooks;
    }


}

export default BookService;
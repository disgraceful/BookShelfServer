"use strict"
import converter from "xml-js";

class BookService {
    constructor() {
        this.booksFromXML = this.booksFromXML.bind(this);
        this.findValue = this.findValue.bind(this);
    }

    booksFromXML(xml) {
        let converted = converter.xml2js(xml, { compact: true });
        let books = this.findValue(converted, "work");
        console.log(books);
        return books;
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


}

export default BookService;
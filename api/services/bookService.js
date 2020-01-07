"use strict"
import converter from "xml-js";

export default class BookService {
    booksFromXML(xml) {
        let converted = converter.xml2js(xml, { compact: false });
        let books = this.searchResults(converted, "results");
        console.log("books", books);
        return books;
    }

    searchResults(object, value) {
        for (let key in object) {
            let objectValue = object[key];
            if (typeof objectValue === "object") {
                this.searchResults(objectValue, value);
            }
            if (objectValue.name !== undefined && objectValue.name === value) {
                return objectValue.elements;
            }
        }
    }
}


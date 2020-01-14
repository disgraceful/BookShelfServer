"use strict"
import https from "https";
import BookService from "../services/bookService";

const dev_key = "KotLDFmhGeCoB5K6H0NqA"
const root = "https://www.goodreads.com/"
const bookService = new BookService();

class BookController {
    constructor(service) {
        this.bookService = service;
        this.searchByTitleOrAuthor = this.searchByTitleOrAuthor.bind(this);
        this.getBookById = this.getBookById.bind(this);
        this.getXmlFromGoodreads = this.getXmlFromGoodreads.bind(this);
    }

    searchByTitleOrAuthor(request, response) {
        console.log("Search request accepted!")
        let searchQuery = request.query.search;
        console.log(searchQuery);
        const url = `${root}search/index.xml?key=${dev_key}&q=${searchQuery}`;
        const callback = (xml) => response.json(this.bookService.booksFromXML(xml));
        const errorCallback = (error) => console.error("Error happened" + error.message)
        this.getXmlFromGoodreads(url, callback, errorCallback);
    }

    getBookById(request, response) {
        console.log("Get Book By Id request accepted");
        let id = request.query.id;
        const url = `${root}book/show/${id}.xml?key=${dev_key}`;
        const callback = (xml) => response.json(this.bookService.bookForBookPage(xml));
        const errorCallback = (error) => console.error("Error happened" + error.message);
        this.getXmlFromGoodreads(url, callback, errorCallback);
    }

    getXmlFromGoodreads(url, callback, errorCallback) {
        let xml = "";
        https.get(url, result => {
            result.on("data", xmlChunk => xml += xmlChunk)
            result.on("end", () => callback(xml));
        }).on("error", (error) => errorCallback(error));
    }
}

export default new BookController(bookService)

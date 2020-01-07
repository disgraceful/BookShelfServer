"use strict"
import https from "https";
import BookService from "../services/bookService";
const dev_key = "VRSeRsFDPJ7fOjxPaf81Yg"
const root = "https://www.goodreads.com/search/index.xml"
const bookService = new BookService();

class BookController {
    constructor(service) {
        this.bookService = service;
        this.searchByTitleOrAuthor = this.searchByTitleOrAuthor.bind(this);
    }

    searchByTitleOrAuthor(request, response) {
        let searchQuery = request.body.query;
        console.log("Search request accepted!")
        let xmlData = "";
        https.get(`${root}?key=${dev_key}&q=${searchQuery}`, (result) => {
            result.on("data", (chunk) => {
                xmlData += chunk;
            })
            result.on('end', () => {
                const converted = this.bookService.booksFromXML(xmlData);
                response.json(converted);
            });
        }).on("error", (error) => {
            console.error("Error happened " + error.message);
        })
    }

}

export default new BookController(bookService)

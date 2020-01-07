"use strict"
const https = require("https");
import BookService from "../services/bookService";
const dev_key = "VRSeRsFDPJ7fOjxPaf81Yg"
const root = "https://www.goodreads.com/search/index.xml"


exports.searchByTitleOrAuthor = (request, response) => {
    console.log("Search request accepted!")
    let xmlData = "";
    https.get(`${root}?key=${dev_key}&q=Ender%27s+Game`, (result) => {
        result.on("data", (chunk) => {
            xmlData += chunk;
        })
        result.on('end', () => {
            let bookService = new BookService();
            console.log(bookService);
            const converted = bookService.booksFromXML(xmlData);
            console.log(converted);
            response.json(converted);
        });

    }).on("error", (error) => {
        console.error("Error happened " + error.message);
    })


}
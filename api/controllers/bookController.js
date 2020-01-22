"use strict"
import GoodreadsBookService from "../services/goodreadsBookService";
import { ErrorWithHttpCode } from "../error/ErrorWithHttpCode";

const dev_key = "KotLDFmhGeCoB5K6H0NqA"
const root = "https://www.goodreads.com/"
const goodreadsBookService = new GoodreadsBookService();

class BookController {
    constructor(goodreadsBookService) {
        this.goodreadsBookService = goodreadsBookService;
        this.searchByTitleOrAuthor = this.searchByTitleOrAuthor.bind(this);
        this.getBookById = this.getBookById.bind(this);
    }

    async searchByTitleOrAuthor(request, response) {
        console.log("Search request accepted!")
        let searchQuery = request.query.search;
        console.log(searchQuery);
        try {
            if (!searchQuery) throw new ErrorWithHttpCode(400, "Search query is empty");
            const url = `${root}search/index.xml?key=${dev_key}&q=${searchQuery}`;
            const result = await this.goodreadsBookService.searchBooks(url);
            response.json(result);
        } catch (error) {
            response.status(error.httpCode).json(error);
        }
    }

    async getBookById(request, response) {
        console.log("Get Book By Id request accepted");
        let id = request.query.id;
        try {
            if (!id) throw new ErrorWithHttpCode(400, "Id is empty");
            const url = `${root}book/show/${id}.xml?key=${dev_key}`;
            const result = await this.goodreadsBookService.getBookByGoodreadsId(url);
            response.json(result);
        } catch (error) {
            response.status(error.httpCode).json(error);
        }
    }

}

export default new BookController(goodreadsBookService)

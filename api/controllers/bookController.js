"use strict"
import GoodreadsBookService from "../services/goodreadsBookService";
import { ErrorWithHttpCode } from "../error/ErrorWithHttpCode";
import UserService from "../services/userService";

const dev_key = "KotLDFmhGeCoB5K6H0NqA"
const root = "https://www.goodreads.com/"
const userService = new UserService();
const goodreadsBookService = new GoodreadsBookService(userService);

class BookController {
    constructor(goodreadsBookService, userService) {
        this.goodreadsBookService = goodreadsBookService;
        this.userService = userService;
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
        let bookId = request.params.bookId;
        let userId = request.params.userId;
        console.log(bookId, userId);
        try {
            if (!bookId) throw new ErrorWithHttpCode(400, "Id is empty");
            const url = `${root}book/show/${bookId}.xml?key=${dev_key}`;
            const goodreadsBook = await this.goodreadsBookService.getBookByGoodreadsId(url);
            const result = await this.goodreadsBookService.fetchUserBookData(userId, goodreadsBook);
            response.json(result);
        } catch (error) {
            response.status(error.httpCode).json(error);
        }
    }
}

export default new BookController(goodreadsBookService, userService)

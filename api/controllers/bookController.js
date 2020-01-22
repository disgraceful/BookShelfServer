"use strict"
import GoodreadsBookService from "../services/goodreadsBookService";
import FirebaseBookService from "../services/firebaseBookService"
import { ErrorWithHttpCode } from "../error/ErrorWithHttpCode";

const dev_key = "KotLDFmhGeCoB5K6H0NqA"
const root = "https://www.goodreads.com/"
const goodreadsBookService = new GoodreadsBookService();
const firebaseBookService = new FirebaseBookService();

class BookController {
    constructor(goodreadsBookService, firebaseBookService) {
        this.goodreadsBookService = goodreadsBookService;
        this.firebaseBookService = firebaseBookService;
        this.searchByTitleOrAuthor = this.searchByTitleOrAuthor.bind(this);
        this.getBookById = this.getBookById.bind(this);
        this.favoriteBook = this.favoriteBook.bind(this);
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

    favoriteBook(request, response) {
        console.log("Get Book By Id request accepted");
        let bookId = request.body.id;
        console.log("id", bookId);
        this.firebaseBookService.findBookById(bookId);

    }
}

export default new BookController(goodreadsBookService, firebaseBookService)

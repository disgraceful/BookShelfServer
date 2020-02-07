import "dotenv/config"
import GoodreadsBookService from "../services/goodreadsBookService";
import { ErrorWithHttpCode } from "../error/ErrorWithHttpCode";
import UserService from "../services/userService";
import TokenService from "../services/tokenService";

const dev_key = process.env.GOODREADS_KEY
const root = "https://www.goodreads.com/"
const userService = new UserService();
const tokenService = new TokenService();
const goodreadsBookService = new GoodreadsBookService(userService);

class BookController {
    constructor(goodreadsBookService, tokenService) {
        this.goodreadsBookService = goodreadsBookService;
        this.tokenService = tokenService;
        this.searchByTitleOrAuthor = this.searchByTitleOrAuthor.bind(this);
        this.getBookById = this.getBookById.bind(this);
    }

    async searchByTitleOrAuthor(request, response) {
        console.log("Search request accepted!")
        const searchQuery = request.query.query;
        const token = request.headers['x-access-token'];
        console.log(searchQuery, token);
        try {
            if (!searchQuery) throw new ErrorWithHttpCode(400, "Search query is empty");
            const validated = this.tokenService.validateToken(token);
            if (!validated) throw new ErrorWithHttpCode(400, "Error validating token");
            const url = `${root}search/index.xml?key=${dev_key}&q=${searchQuery}`;
            const result = await this.goodreadsBookService.searchBooks(url);
            response.json(result);
        } catch (error) {
            response.status(error.httpCode).json({ httpCode: error.httpCode, message: error.message });
        }
    }

    async getBookById(request, response) {
        console.log("Get Book By Id request accepted");
        const bookId = request.params.bookId;
        const token = request.headers['x-access-token'];
        console.log(bookId, token);
        try {
            if (!bookId) throw new ErrorWithHttpCode(400, "Id is empty");
            const validated = this.tokenService.validateToken(token);
            if (!validated) throw new ErrorWithHttpCode(400, "Error validating token");
            const url = `${root}book/show/${bookId}.xml?key=${dev_key}`;
            const goodreadsBook = await this.goodreadsBookService.getBookByGoodreadsId(url);
            const result = await this.goodreadsBookService.fetchUserBookData(validated.id, goodreadsBook);
            response.json(result);
        } catch (error) {
            response.status(error.httpCode).json({ httpCode: error.httpCode, message: error.message });
        }
    }
}

export default new BookController(goodreadsBookService, tokenService)

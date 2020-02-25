import GoodreadsBookService from "../services/goodreadsBookService";
import { ErrorWithHttpCode } from "../error/ErrorWithHttpCode";
import UserService from "../services/userService";
import TokenService from "../services/tokenService";
import FormatBookService from "../services/formatBookService"

const userService = new UserService();
const tokenService = new TokenService();
const formatBookService = new FormatBookService();
const goodreadsBookService = new GoodreadsBookService(userService, formatBookService);

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
            const result = await this.goodreadsBookService.searchBooks(searchQuery);
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
            const result = await this.goodreadsBookService.getBookWithUserDataById(bookId, validated.id);
            response.json(result);
        } catch (error) {
            response.status(error.httpCode).json({ httpCode: error.httpCode, message: error.message });
        }
    }
}

export default new BookController(goodreadsBookService, tokenService)

import GoodreadsBookService from "../services/goodreadsBookService";
import { ErrorWithHttpCode } from "../error/ErrorWithHttpCode";
import TokenService from "../services/tokenService";
import FormatBookService from "../services/formatBookService";
import UserService from "../services/userService";

const tokenService = new TokenService();
const formatBookService = new FormatBookService();
const userService = new UserService();
const goodreadsBookService = new GoodreadsBookService(userService, formatBookService);

class AuthorController {
    constructor(goodreadsService, tokenService) {
        this.goodreadsService = goodreadsService;
        this.tokenService = tokenService;
        this.getAuthorInfo = this.getAuthorInfo.bind(this);
        this.getAuthorSeries = this.getAuthorSeries.bind(this);
    }

    async getAuthorInfo(request, response) {
        console.log("Get Author request accepted!")
        const authorId = request.params.id;
        const token = request.headers['x-access-token'];
        console.log(authorId, token);
        try {
            if (!authorId) throw new ErrorWithHttpCode(400, "Request param is not valid");
            const validated = this.tokenService.validateToken(token);
            if (!validated) throw new ErrorWithHttpCode(400, "Error validating token");
            const result = await this.goodreadsService.getAuthorByGoodreadsId(authorId);
            response.json(result);
        } catch (error) {
            response.status(error.httpCode).json({ httpCode: error.httpCode, message: error.message });
        }
    }

    async getAuthorSeries(request, response) {
        console.log("Get Author's Series request accepted");
        const authorId = request.params.id;
        const token = request.headers['x-access-token'];
        console.log(authorId, token);
        try {
            if (!authorId) throw new ErrorWithHttpCode(400, "Request param is not valid");
            const validated = this.tokenService.validateToken(token);
            if (!validated) throw new ErrorWithHttpCode(400, "Error validating token");
            const result = await this.goodreadsService.getAuthorSeries(authorId);
            response.json(result);
        } catch (error) {
            response.status(error.httpCode).json({ httpCode: error.httpCode, message: error.message });
        }
    }
}

export default new AuthorController(goodreadsBookService, tokenService)

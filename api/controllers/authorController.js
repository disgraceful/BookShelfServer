import GoodreadsAuhtorService from "../services/goodreads/goodreadsAuthorService";
import { ErrorWithHttpCode } from "../error/ErrorWithHttpCode";
import TokenService from "../services/tokenService";
import FormatAuthorService from "../services/formatting/formatAuthorService";
import FormatSeriesService from "../services/formatting/formatSeriesService";

const tokenService = new TokenService();
const formatAuthorService = new FormatAuthorService();
const formatSeriesService = new FormatSeriesService();
const goodreadsAuthorService = new GoodreadsAuhtorService(formatAuthorService, formatSeriesService);

class AuthorController {
    constructor(goodreadsAuthorService, tokenService) {
        this.goodreadsAuthorService = goodreadsAuthorService;
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
            const result = await this.goodreadsAuthorService.getAuthorByGoodreadsId(authorId);
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
            const result = await this.goodreadsAuthorService.getAuthorSeries(authorId);
            response.json(result);
        } catch (error) {
            response.status(error.httpCode).json({ httpCode: error.httpCode, message: error.message });
        }
    }
}

export default new AuthorController(goodreadsAuthorService, tokenService)

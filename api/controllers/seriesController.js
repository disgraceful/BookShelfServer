import GoodreadsBookService from "../services/goodreadsBookService";
import { ErrorWithHttpCode } from "../error/ErrorWithHttpCode";
import UserService from "../services/userService";
import TokenService from "../services/tokenService";
import FormatBookService from "../services/formatBookService"

const userService = new UserService();
const tokenService = new TokenService();
const formatBookService = new FormatBookService();
const goodreadsBookService = new GoodreadsBookService(userService, formatBookService);

class SeriesController {
    constructor(goodreadsBookService, tokenService) {
        this.goodreadsBookService = goodreadsBookService;
        this.tokenService = tokenService;
        this.getSeriesById = this.getSeriesById.bind(this);
    }

    async getSeriesById(request, response) {
        console.log("Get Series By Id request accepted!")
        const seriesId = request.params.id;
        const token = request.headers['x-access-token'];
        console.log(seriesId, token);
        try {
            if (!seriesId) throw new ErrorWithHttpCode(400, "Series id is empty");
            const validated = this.tokenService.validateToken(token);
            if (!validated) throw new ErrorWithHttpCode(400, "Error validating token");
            const result = await this.goodreadsBookService.getSeriesByGoodreadsId(seriesId);
            response.json(result);
        } catch (error) {
            response.status(error.httpCode).json({ httpCode: error.httpCode, message: error.message });
        }
    }
}

export default new SeriesController(goodreadsBookService, tokenService)

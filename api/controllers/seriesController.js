import { ErrorWithHttpCode } from "../error/ErrorWithHttpCode";
import TokenService from "../services/tokenService";
import GoodreadsSeriesService from "../services/goodreads/goodreadsSeriesService";
import FormatSeriesService from "../services/formatting/formatSeriesService";

const tokenService = new TokenService();
const formatSeriesService = new FormatSeriesService();
const goodreadsSeriesService = new GoodreadsSeriesService(formatSeriesService);

class SeriesController {
    constructor(goodreadsSeriesService, tokenService) {
        this.goodreadsSeriesService = goodreadsSeriesService;
        this.tokenService = tokenService;
        this.getSeriesById = this.getSeriesById.bind(this);
    }

    async getSeriesById(request, response) {
        console.log("Get Series By Id request accepted!");
        const seriesId = request.params.id;
        const token = request.headers['x-access-token'];
        console.log(seriesId, token);
        try {
            if (!seriesId) throw new ErrorWithHttpCode(400, "Series id is empty");
            const validated = this.tokenService.validateToken(token);
            if (!validated) throw new ErrorWithHttpCode(400, "Error validating token");
            const result = await this.goodreadsSeriesService.getSeriesByGoodreadsId(seriesId);
            response.json(result);
        } catch (error) {
            response.status(error.httpCode).json({ httpCode: error.httpCode, message: error.message });
        }
    }
}

export default new SeriesController(goodreadsSeriesService, tokenService)

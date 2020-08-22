import { ErrorWithHttpCode } from "../error/ErrorWithHttpCode";
import GoodreadsSeriesService from "../services/goodreads/goodreadsSeriesService";
import FormatSeriesService from "../services/formatting/formatSeriesService";
import { tokenInterceptor } from "../http/interceptors";

const formatSeriesService = new FormatSeriesService();
const goodreadsSeriesService = new GoodreadsSeriesService(formatSeriesService);

class SeriesController {
  constructor(goodreadsSeriesService) {
    this.goodreadsSeriesService = goodreadsSeriesService;
    this.getSeriesById = this.getSeriesById.bind(this);
  }

  async getSeriesById(request, response) {
    try {
      console.log("Get Series By Id request accepted!");
      const seriesId = request.params.id;
      if (!seriesId || isNaN(seriesId)) throw new ErrorWithHttpCode(400, "Series id is empty");
      tokenInterceptor(request);
      const result = await this.goodreadsSeriesService.getSeriesByGoodreadsId(seriesId);
      response.json(result);
    } catch (error) {
      response
        .status(error.httpCode)
        .json({ httpCode: error.httpCode, message: error.userMessage });
    }
  }
}

export default new SeriesController(goodreadsSeriesService);

import GoodreadsAuhtorService from "../services/goodreads/goodreadsAuthorService";
import { ErrorWithHttpCode } from "../error/ErrorWithHttpCode";
import FormatAuthorService from "../services/formatting/formatAuthorService";
import FormatSeriesService from "../services/formatting/formatSeriesService";
import { tokenInterceptor } from "../http/interceptors";

const formatAuthorService = new FormatAuthorService();
const formatSeriesService = new FormatSeriesService();
const goodreadsAuthorService = new GoodreadsAuhtorService(formatAuthorService, formatSeriesService);

class AuthorController {
  constructor(goodreadsAuthorService) {
    this.goodreadsAuthorService = goodreadsAuthorService;
    this.getAuthorInfo = this.getAuthorInfo.bind(this);
    this.getAuthorBooks = this.getAuthorBooks.bind(this);
    this.getAuthorSeries = this.getAuthorSeries.bind(this);
  }

  async getAuthorInfo(request, response) {
    try {
      console.log("Get Author request accepted!");
      const authorId = request.params.id;
      if (!authorId || isNaN(authorId))
        throw new ErrorWithHttpCode(400, "Request param is not valid");
      tokenInterceptor(request);
      const result = await this.goodreadsAuthorService.getAuthorByGoodreadsId(authorId);
      response.json(result);
    } catch (error) {
      response
        .status(error.httpCode)
        .json({ httpCode: error.httpCode, message: error.userMessage });
    }
  }

  async getAuthorBooks(request, response) {
    try {
      console.log("Get Author's Books request accepted");
      const authorId = request.params.id;
      if (!authorId) throw new ErrorWithHttpCode(400, "Request param is not valid");
      tokenInterceptor(request);
      const result = await this.goodreadsAuthorService.getAuthorBooks(authorId);
      response.json(result);
    } catch (error) {
      response
        .status(error.httpCode)
        .json({ httpCode: error.httpCode, message: error.userMessage });
    }
  }

  async getAuthorSeries(request, response) {
    try {
      console.log("Get Author's Series request accepted");
      const authorId = request.params.id;
      if (!authorId) throw new ErrorWithHttpCode(400, "Request param is not valid");
      tokenInterceptor(request);
      const result = await this.goodreadsAuthorService.getAuthorSeries(authorId);
      response.json(result);
    } catch (error) {
      response
        .status(error.httpCode)
        .json({ httpCode: error.httpCode, message: error.userMessage });
    }
  }
}

export default new AuthorController(goodreadsAuthorService);

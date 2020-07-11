import FeedService from "../services/feedService";
import TokenService from "../services/tokenService";

const feedService = new FeedService();
const tokenService = new TokenService();

class FeedController {
  constructor(feedService, tokenService) {
    this.feedService = feedService;
    this.tokenService = tokenService;
    this.getFeed = this.getFeed.bind(this);
  }

  async getFeed(request, response) {
    console.log("Get Feed request accepted");
    const token = request.headers["x-access-token"];
    try {
      const validated = this.tokenService.validateToken(token);
      if (!validated)
        throw new ErrorWithHttpCode(400, "Error validating token");
      const result = await this.feedService.getFeedByDate(validated.id);
      response.json(result);
    } catch (error) {
      response
        .status(error.httpCode || 500)
        .json({ httpCode: error.httpCode, message: error.message });
    }
  }
}

export default new FeedController(feedService, tokenService);

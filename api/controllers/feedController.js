import FeedService from "../services/feedService";
import { tokenInterceptor } from "../http/interceptors";

const feedService = new FeedService();

class FeedController {
  constructor(feedService) {
    this.feedService = feedService;
    this.getFeed = this.getFeed.bind(this);
  }

  async getFeed(request, response) {
    console.log("Get Feed request accepted");
    const date = request.query.date;
    try {
      const validated = tokenInterceptor(request);
      let result;
      if (!date) {
        result = await this.feedService.getAllUserFeed(validated.id);
      } else {
        result = await this.feedService.getUserFeedByDate(validated.id, date);
      }
      response.json(result);
    } catch (error) {
      response
        .status(error.httpCode || 500)
        .json({ httpCode: error.httpCode, message: error.message });
    }
  }
}

export default new FeedController(feedService);

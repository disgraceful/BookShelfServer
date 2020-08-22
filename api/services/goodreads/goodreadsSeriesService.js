import GoodreadsBaseService from "./goodreadsBaseService";

class GoodreadsSeriesService extends GoodreadsBaseService {
  constructor(formatSeriesService) {
    super();
    this.formatSeriesService = formatSeriesService;
  }

  async getSeriesByGoodreadsId(id) {
    try {
      const url = `${this.root}series/${id}?key=${this.devKey}`;
      const converted = await this.getValueFromGoodreads(url);
      const series = this.findValue(converted, "series");
      const author = this.findValue(series, "author");

      if (!series) {
        throw new ErrorWithHttpCode(404, "Data was not found");
      }
      const result = this.formatSeriesService.formatSeriesForSeriesPage(series);
      result.author = this.formatSeriesService.formatSeriesAuthor(author);
      return result;
    } catch (error) {
      if (error.userMessage) throw error;
      throw new ErrorWithHttpCode(error.httpCode || 500, error.message);
    }
  }
}
export default GoodreadsSeriesService;

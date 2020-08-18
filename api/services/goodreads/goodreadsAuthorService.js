import GoodreadsBaseService from "./goodreadsBaseService";

class GoodreadsAuthorService extends GoodreadsBaseService {
  constructor(formatAuthorService, formatSeriesService) {
    super();
    this.formatAuthorService = formatAuthorService;
    this.formatSeriesService = formatSeriesService;
  }

  async getAuthorByGoodreadsId(id) {
    try {
      const url = `${this.root}author/show/${id}?key=${this.devKey}`;
      const converted = await this.getValueFromGoodreads(url);
      let author = this.findValue(converted, "author");
      const books = this.findValue(converted, "books");
      if (!author || !books) {
        throw new ErrorWithHttpCode(404, "Data was not found");
      }
      author = this.formatAuthorService.formatAuthorForAuthorPage(author, books);
      return author;
    } catch (error) {
      console.log(error);
      if (error.userMessage) throw error;
      throw new ErrorWithHttpCode(error.httpCode || 500, error.message);
    }
  }

  async getAuthorSeries(id) {
    try {
      const url = `${this.root}series/list/${id}.xml?key=${this.devKey}`;
      const converted = await this.getValueFromGoodreads(url);
      const value = this.findValue(converted, "series_work");
      if (!value) {
        throw new ErrorWithHttpCode(404, "Data was not found");
      }
      const series = this.formatSeriesService.formatSeriesForAuthorPage(value);
      return series;
    } catch (error) {
      console.log(error);
      if (error.userMessage) throw error;
      throw new ErrorWithHttpCode(error.httpCode || 500, error.message);
    }
  }
}

export default GoodreadsAuthorService;

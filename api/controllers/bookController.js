import GoodreadsBookService from "../services/goodreads/goodreadsBookService";
import UserService from "../services/userService";
import FormatBookService from "../services/formatting/formatBookService";
import { ErrorWithHttpCode } from "../error/ErrorWithHttpCode";
import { tokenInterceptor } from "../http/interceptors";

const formatBookService = new FormatBookService();
const userService = new UserService();
const goodreadsBookService = new GoodreadsBookService(userService, formatBookService);

class BookController {
  constructor(goodreadsBookService) {
    this.goodreadsBookService = goodreadsBookService;
    this.searchByTitleOrAuthor = this.searchByTitleOrAuthor.bind(this);
    this.getBookById = this.getBookById.bind(this);
  }

  async searchByTitleOrAuthor(request, response) {
    try {
      console.log("Search request accepted!");
      const searchQuery = request.query.query;
      if (!searchQuery) throw new ErrorWithHttpCode(400, "Search query is empty");
      tokenInterceptor(request);
      const result = await this.goodreadsBookService.searchBooks(searchQuery);
      response.json(result);
    } catch (error) {
      response
        .status(error.httpCode)
        .json({ httpCode: error.httpCode, message: error.userMessage });
    }
  }

  async getBookById(request, response) {
    try {
      console.log("Get Book By Id request accepted");
      const bookId = request.params.bookId;
      if (!bookId) throw new ErrorWithHttpCode(400, "Book identifier is invalid");
      const validated = tokenInterceptor(request);
      const result = await this.goodreadsBookService.getBookWithUserData(bookId, validated.id);
      response.json(result);
    } catch (error) {
      response
        .status(error.httpCode)
        .json({ httpCode: error.httpCode, message: error.userMessage });
    }
  }
}

export default new BookController(goodreadsBookService);

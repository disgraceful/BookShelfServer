import GoodreadsBaseService from "./goodreadsBaseService";
import { ErrorWithHttpCode } from "../../error/ErrorWithHttpCode";

class GoodreadsBookService extends GoodreadsBaseService {
  constructor(userService, formatBookService) {
    super();
    this.userService = userService;
    this.formatBookService = formatBookService;
  }

  async searchBooks(searchQuery) {
    try {
      const searchUrl = `${this.root}search/index.xml?key=${this.devKey}&q=${searchQuery}`;
      const converted = await this.getValueFromGoodreads(searchUrl);
      let books = this.findValue(converted, "work");

      if (!books) {
        throw new ErrorWithHttpCode(404, "No books can be found");
      }

      let formatted = books.slice(0, 4).map((item) => {
        const book = this.findValue(item, "best_book");
        return this.formatBookService.formatBookForSearch(book);
      });

      return formatted;
    } catch (error) {
      if (error.userMessage) throw error;
      else throw new ErrorWithHttpCode(500, "Something went wrong while searching for book");
    }
  }

  async getBookWithUserData(bookId, userId) {
    try {
      const url = `${this.root}book/show/${bookId}.xml?key=${this.devKey}`;
      const converted = await this.getValueFromGoodreads(url);
      const book = this.findValue(converted, "book");
      if (!book) {
        throw new ErrorWithHttpCode(404, "Book not found");
      }

      const formatted = this.formatBookService.formatBookForBookPage(book);
      formatted.imageUrl = await this.getHQImage(formatted.imageUrl, formatted.isbn);
      return await this.fetchUserBookData(userId, formatted);
    } catch (error) {
      console.log(error);
      if (error.userMessage) throw error;
      throw new ErrorWithHttpCode(error.httpCode || 500, error.message);
    }
  }

  async fetchUserBookData(userId, book) {
    try {
      const user = await this.userService.getUserById(userId); //Hmm. How can i make it better?
      if (user.books) {
        const userBookRecord = user.books.find((item) => item.id === book.id);
        return userBookRecord ? userBookRecord : book;
      }
      return book;
    } catch (error) {
      if (error.userMessage) throw error;
      throw new ErrorWithHttpCode(error.httpCode || 500, error.message);
    }
  }
}

export default GoodreadsBookService;

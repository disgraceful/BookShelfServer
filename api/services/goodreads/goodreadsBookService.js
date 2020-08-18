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
        throw new ErrorWithHttpCode(404, "Nothing found with query");
      }

      let formatted = await Promise.all(
        books.slice(0, 4).map(async (item) => {
          const id = item.best_book.id._text;
          const isbn = await this.getBookISBN(id);
          const book = this.findValue(item, "best_book");
          if (!book) {
            throw new ErrorWithHttpCode(404, "Data not found");
          }
          const res = this.formatBookService.formatBookForSearch(book);
          res.imageUrl = await this.formatImageUrl(res.imageUrl, isbn);
          return res;
        })
      );
      return formatted;
    } catch (error) {
      if (error.userMessage) throw error;
      else throw new ErrorWithHttpCode(500, "Something went wrong while searching for book");
    }
  }

  async getBookISBN(id) {
    try {
      const book = await this.getBookByGoodreadsId(id);
      return this.formatBookService.getBookISBN(book);
    } catch (error) {
      console.log(error);
      if (error.userMessage) throw error;
      throw new ErrorWithHttpCode(error.httpCode || 500, error.message);
    }
  }

  async getBookWithUserData(bookId, userId) {
    try {
      const book = await this.getBookByGoodreadsId(bookId);
      const formatted = this.formatBookService.formatBookForBookPage(book);

      formatted.imageUrl = await this.formatImageUrl(formatted.imageUrl, formatted.isbn);
      formatted.smallImageUrl = formatted.imageUrl;
      return await this.fetchUserBookData(userId, formatted);
    } catch (error) {
      console.log(error);
      if (error.userMessage) throw error;
      throw new ErrorWithHttpCode(error.httpCode || 500, error.message);
    }
  }

  async getBookByGoodreadsId(id) {
    try {
      const url = `${this.root}book/show/${id}.xml?key=${this.devKey}`;
      const converted = await this.getValueFromGoodreads(url);
      const book = this.findValue(converted, "book");
      if (!book) {
        throw new ErrorWithHttpCode(404, "Book not found");
      }
      return book;
    } catch (error) {
      if (error.userMessage) throw error;
      throw new ErrorWithHttpCode(error.httpCode || 500, error.message);
    }
  }

  async fetchUserBookData(userId, book) {
    try {
      const user = await this.userService.getUserById(userId);
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

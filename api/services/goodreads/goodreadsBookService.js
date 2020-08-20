import GoodreadsBaseService from "./goodreadsBaseService";
import { ErrorWithHttpCode } from "../../error/ErrorWithHttpCode";
import firebase from "firebase";

class GoodreadsBookService extends GoodreadsBaseService {
  constructor(formatBookService) {
    super();
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
      const snapshot = await firebase
        .firestore()
        .collection("users")
        .doc(userId)
        .collection("books")
        .where("id", "==", book.id)
        .get();

      if (snapshot.empty) return book;
      else {
        return snapshot.docs[0].data();
      }
    } catch (error) {
      if (error.userMessage) throw error;
      throw new ErrorWithHttpCode(error.httpCode || 500, error.message);
    }
  }
}

export default GoodreadsBookService;

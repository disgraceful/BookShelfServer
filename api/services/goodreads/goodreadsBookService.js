import GoodreadsBaseService from "./goodreadsBaseService";
import { ErrorWithHttpCode } from "../../error/ErrorWithHttpCode";
import firebase from "firebase";
import e from "express";

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
      const userBook = await this.fetchUserBookData(userId, bookId);
      if (userBook) {
        return userBook;
      } else {
        const url = `${this.root}book/show/${bookId}.xml?key=${this.devKey}`;
        const converted = await this.getValueFromGoodreads(url);
        const book = this.findValue(converted, "book");
        if (!book) {
          throw new ErrorWithHttpCode(404, "Book not found");
        }

        const formatted = this.formatBookService.formatBookForBookPage(book);
        formatted.imageUrl = await this.getHQImage(formatted.imageUrl, formatted.isbn);
        return formatted;
      }
    } catch (error) {
      if (error.userMessage) throw error;
      throw new ErrorWithHttpCode(500, "Something went wrong while retrieving book");
    }
  }

  async fetchUserBookData(userId, bookId) {
    const snapshot = await firebase
      .firestore()
      .collection("users")
      .doc(userId)
      .collection("books")
      .where("id", "==", bookId)
      .get();

    if (snapshot.empty) return false;
    else {
      return snapshot.docs[0].data();
    }
  }
}

export default GoodreadsBookService;

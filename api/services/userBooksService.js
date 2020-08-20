import firebase from "firebase";
import { ErrorWithHttpCode } from "../error/ErrorWithHttpCode";
import { UserData } from "../model/UserData";

class UserBooksService {
  constructor(feedService) {
    this.feedService = feedService;
  }

  getUserBooksAsFBCollection(userId) {
    return firebase.firestore().collection("users").doc(userId).collection("books");
  }

  async getUserBooksAsArray(userId) {
    try {
      const snapshot = await this.getUserBooksAsFBCollection(userId).get();
      if (snapshot.empty) return [];
      else {
        return snapshot.docs.map((doc) => doc.data());
      }
    } catch (error) {
      if (error.userMessage) throw error;
      throw new ErrorWithHttpCode(500, "Could not retrieve user books");
    }
  }

  async getUserCollection(userId, collection) {
    try {
      const userBooksCollection = this.getUserBooksAsFBCollection(userId);
      const snapshot = await userBooksCollection.where("userData.status", "==", collection).get();
      if (snapshot.empty) return [];
      else {
        return snapshot.docs.map((doc) => doc.data());
      }
    } catch (error) {
      throw new ErrorWithHttpCode(500, "Ooops! Something went wrong on the server!");
    }
  }

  async addToUserCollection(userId, collection, book) {
    try {
      // Determine if book IS in collection.
      const userBooksCollection = this.getUserBooksAsFBCollection(userId);
      const snapshot = await userBooksCollection.where("id", "==", book.id).get();

      book.userData.status = collection;
      if (snapshot.empty) {
        //If NOT - Add book to the collection
        await userBooksCollection.doc().set(book);
      } else {
        // Otherwise - only update
        const doc = snapshot.docs[0];
        const existingBookId = doc.id;
        await userBooksCollection.doc(existingBookId).update({
          "userData.status": collection,
        });
      }
      return book;
    } catch (error) {
      if (error.userMessage) throw error;
      throw new ErrorWithHttpCode(500, "Something went wrong while updating user books!");
    }
  }

  async deleteBookFromCollection(id, bookId) {
    try {
      let books = await this.getUserBooks(id);
      const bookRef = books.find((item) => item.id === bookId);
      if (bookRef) {
        books = books.filter((item) => item.id !== bookRef.id);
        this.feedService.saveFeed(bookRef, "not", id);
        await firebase
          .database()
          .ref("users")
          .child(id)
          .update({ books: books }, (error) => {
            if (error) throw new ErrorWithHttpCode(400, error.message);
          });
        bookRef.userData = new UserData();
        return bookRef;
      } else {
        return false;
      }
    } catch (error) {
      console.log(error);
      throw new ErrorWithHttpCode(
        error.httpCode || 500,
        error.message || "Ooops! Something went wrong on the server!"
      );
    }
  }

  async setFavorite(id, book) {
    try {
      const books = await this.getUserBooks(id);
      const bookRef = books.find((item) => item.id === book.id);
      console.log(bookRef);
      if (bookRef) {
        bookRef.userData.isFavorited = !book.userData.isFavorited;
      } else {
        book.userData.isFavorited = !book.userData.isFavorited;
        books.push(book);
      }
      await firebase
        .database()
        .ref("users")
        .child(id)
        .update({ books: books }, (error) => {
          if (error) throw new ErrorWithHttpCode(400, error.message);
        });
      return books.find((item) => item.id === book.id);
    } catch (error) {
      console.log(error);
      throw new ErrorWithHttpCode(
        error.httpCode || 500,
        error.message || "Ooops! Something went wrong on the server!"
      );
    }
  }

  async getFavorites(id) {
    try {
      const books = await this.getUserBooks(id);
      return books.filter((item) => item.isFavorited);
    } catch (error) {
      throw new ErrorWithHttpCode(
        error.httpCode || 500,
        error.message || "Ooops! Something went wrong on the server!"
      );
    }
  }

  async updateBook(id, book) {
    try {
      const books = await this.getUserBooks(id);
      const bookRef = books.find((item) => item.id === book.id);
      if (bookRef) {
        const index = books.indexOf(bookRef);
        const pageDiff = book.userData.pagesRead - bookRef.userData.pagesRead;
        if (pageDiff > 0) {
          this.feedService.saveFeed(bookRef, "update", id, { pages: pageDiff });
        }
        if (Math.abs(book.userData.rating - bookRef.userData.rating) > 0) {
          this.feedService.saveFeed(bookRef, "rating", id, {
            rating: book.userData.rating,
          });
        }
        await firebase.database().ref(`users/${id}/books/${index}`).set(book);
        const snapshot = await firebase.database().ref(`users/${id}/books/${index}`).once("value");
        return snapshot.val();
      }

      return book;
    } catch (error) {
      console.log(error);
      throw new ErrorWithHttpCode(
        error.httpCode || 500,
        error.message || "Ooops! Something went wrong on the server!"
      );
    }
  }

  finishBook(book) {
    book.status = "finished";
    book.pagesRead = book.pages;
  }

  async getUserGenres(id) {
    try {
      const books = await this.getUserBooks(id);
      let genreMap = {};
      books.forEach((book) => {
        book.genres.slice(0, 2).forEach((genre) => {
          if (!genreMap.hasOwnProperty(genre)) {
            genreMap[genre] = 1;
          } else {
            genreMap[genre] += 1;
          }
        });
      });
      return genreMap;
    } catch (error) {
      console.log(error);
      throw new ErrorWithHttpCode(
        error.httpCode || 500,
        error.message || "Ooops! Something went wrong on the server!"
      );
    }
  }
}

export default UserBooksService;

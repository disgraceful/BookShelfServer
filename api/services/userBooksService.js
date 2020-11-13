import firebase from "firebase";
import { ErrorWithHttpCode } from "../error/ErrorWithHttpCode";
import { UserData } from "../model/UserData";

const avaliableBookStatus = ["finished", "stopped", "2read", "reading", "not reading"];

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
      console.log(error);
      if (error.userMessage) throw error;
      throw new ErrorWithHttpCode(500, "Could not retrieve user books");
    }
  }

  async getUserCollection(userId, collection) {
    try {
      if (!avaliableBookStatus.includes(collection.toLowerCase())) {
        throw new ErrorWithHttpCode(400, "Book status is invalid");
      }
      const userBooksCollection = this.getUserBooksAsFBCollection(userId);
      const snapshot = await userBooksCollection.where("userData.status", "==", collection).get();
      if (snapshot.empty) return [];
      else {
        return snapshot.docs.map((doc) => doc.data());
      }
    } catch (error) {
      console.log(error);

      if (error.userMessage) throw error;
      throw new ErrorWithHttpCode(500, "Ooops! Something went wrong while retrieving user books");
    }
  }

  async addToUserCollection(userId, collection, book) {
    try {
      if (!avaliableBookStatus.includes(collection.toLowerCase())) {
        throw new ErrorWithHttpCode(400, "Book status is invalid");
      }
      console.log(book);
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
          userData: book.userData,
        });
      }
      await this.feedService.saveFeed(book, collection, userId);
      return book;
    } catch (error) {
      if (error.userMessage) throw error;
      throw new ErrorWithHttpCode(500, "Something went wrong while updating user books!");
    }
  }

  async deleteBookFromCollection(userId, bookId) {
    try {
      const snapshot = await this.getUserBooksAsFBCollection(userId)
        .where("id", "==", bookId)
        .get();

      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        const id = doc.id;
        this.getUserBooksAsFBCollection(userId).doc(id).delete();
        const deleted = doc.data();
        deleted.userData = new UserData();

        await this.feedService.saveFeed(deleted, "not", userId);
        return deleted;
      }
      return false;
    } catch (error) {
      if (error.userMessage) throw error;
      throw new ErrorWithHttpCode(500, "Something went wrong while deleting book!");
    }
  }

  async setFavorite(userId, book) {
    try {
      const userBooksCollection = this.getUserBooksAsFBCollection(userId);
      const snapshot = await userBooksCollection.where("id", "==", book.id).get();

      book.userData.isFavorited = !book.userData.isFavorited;
      if (snapshot.empty) {
        await userBooksCollection.doc().set(book);
      } else {
        const doc = snapshot.docs[0];
        const id = doc.id;
        await userBooksCollection
          .doc(id)
          .update({ "userData.isFavorited": book.userData.isFavorited });
      }
      return book;
    } catch (error) {
      if (error.userMessage) throw error;
      throw new ErrorWithHttpCode(500, "Something went wrong while updating book!");
    }
  }

  async getFavorites(userId) {
    try {
      const snapshot = await this.getUserBooksAsFBCollection(userId)
        .where("userData.isFavorited", "==", true)
        .get();

      if (snapshot.empty) {
        return [];
      }
      return snapshot.docs.map((doc) => doc.data());
    } catch (error) {
      if (error.userMessage) throw error;
      throw new ErrorWithHttpCode(500, "Something went wrong while retrieving user books!");
    }
  }

  //TODO: Add User Feed
  async updateBook(userId, book) {
    try {
      const userBooksCollection = this.getUserBooksAsFBCollection(userId);
      const snapshot = await userBooksCollection.where("id", "==", book.id).get();

      if (snapshot.empty) {
        throw new ErrorWithHttpCode(404, "Book not found");
      } else {
        const doc = snapshot.docs[0];
        const id = doc.id;
        const oldBook = doc.data();
        const pageDiff = book.userData.pagesRead - oldBook.userData.pagesRead;
        if (pageDiff != 0) {
          await this.feedService.saveFeed(book, "update", userId, { pages: pageDiff });
        }
        if (Math.abs(book.userData.rating - oldBook.userData.rating) > 0) {
          await this.feedService.saveFeed(book, "rating", userId, {
            rating: book.userData.rating,
          });
        }

        await userBooksCollection.doc(id).update({ userData: book.userData });
      }

      return book;
    } catch (error) {
      if (error.userMessage) throw error;
      throw new ErrorWithHttpCode(500, "Ooops! Something went wrong while updating book");
    }
  }

  async getUserGenres(userId) {
    try {
      const books = await this.getUserBooksAsArray(userId);
      let genreMap = {};
      books.forEach((book) => {
        if (!book.genres) return;
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
      if (error.userMessage) throw error;
      throw new ErrorWithHttpCode(500, "Ooops! Something went wrong while retrieving user genres");
    }
  }
}

export default UserBooksService;

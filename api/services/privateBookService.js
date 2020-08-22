import firebase from "firebase";
import "firebase/storage";
import { UserData } from "../model/UserData";
import { ErrorWithHttpCode } from "../error/ErrorWithHttpCode";

const defaultImgUrl =
  "https://s.gr-assets.com/assets/nophoto/book/111x148-bcc042a9c91a29c1d680899eff700a03.png";

class PrivateBookService {
  getUserBooksAsFBCollection(userId) {
    return firebase.firestore().collection("users").doc(userId).collection("books");
  }

  async getPrivateBookById(userId, bookFid) {
    if (!bookFid) throw ErrorWithHttpCode(400, "Book identifier required");

    const ref = this.getUserBooksAsFBCollection(userId);
    const snapshot = await ref.child(bookFid).once("value");
    const result = snapshot.val();
    if (!result) throw new ErrorWithHttpCode(404, "No book found with that identifier");

    return result;
  }

  async getPrivateBooks(userId) {
    const ref = this.getUserBooksAsFBCollection(userId);
    const snapshot = await ref.once("value");
    const books = snapshot.val();

    if (!books) return [];

    return (
      Object.entries(books)
        .filter((entry) => entry[1].private)
        //get firebase Ids
        .map((entry) => {
          const bookWithId = { ...entry[1] };
          bookWithId.fid = entry[0];
          console.log(bookWithId);
          return bookWithId;
        })
    );
  }

  async saveUserBook(userId, book, cover) {
    try {
      if (!book.title || !book.author || Number.isNaN(+book.pages)) {
        throw new ErrorWithHttpCode(400, "Book information is invalid");
      }

      const privateBook = {
        title: book.title,
        authors: book.author,
        pages: +book.pages,
        imageUrl: "",
        description: book.description,
        userData: { ...new UserData() }, // Firebase can't process custom objects like this!
        private: true,
      };

      const addedBookDoc = this.getUserBooksAsFBCollection(userId).doc();

      if (!cover) {
        privateBook.imageUrl = defaultImgUrl;
        await addedBookDoc.set(privateBook);
        const snapshot = await addedBookDoc.get();

        if (snapshot.exists) {
          return { id: snapshot.id, ...snapshot.data() };
        } else {
          throw new ErrorWithHttpCode(500, "Someting wrong happened while saving private book");
        }
      } else {
        //Save book in Firestore, get Id
        //=> use it to save cover in Firebase Storage
        //=> get URL, update book.

        const url = await this.saveBookCover(userId, addedBookDoc.id, cover);
        const updatedBook = await this.updateImageUrl(userId, addedBookDoc.id, url, privateBook);
        updatedBook.id = addedBookDoc.id;
        return updatedBook;
      }
    } catch (error) {
      console.log(error);
      if (error.userMessage) throw error;
      throw new ErrorWithHttpCode(500, "Something went wrong while saving private book");
    }
  }

  async saveBookCover(userId, bookKey, cover) {
    const rootRef = firebase.storage().ref();
    const fileExt = cover.originalname.slice(cover.originalname.indexOf("."));

    const currentCoverRef = rootRef.child(userId).child(bookKey).child(`cover${fileExt}`);

    const arrayBuffer = Uint8Array.from(cover.buffer).buffer;
    const metadata = {
      contentType: cover.mimetype,
    };
    await currentCoverRef.put(arrayBuffer, metadata);

    return currentCoverRef.getDownloadURL();
  }

  async updateImageUrl(userId, bookKey, url, book) {
    const updatedBook = book;
    updatedBook.imageUrl = url;
    const bookDoc = this.getUserBooksAsFBCollection(userId).doc(bookKey);

    await bookDoc.set(updatedBook);
    const snapshot = await bookDoc.get();

    if (snapshot.exists) {
      return snapshot.data();
    } else {
      throw new ErrorWithHttpCode(500, "Something went wrong while saving private book");
    }
  }
}

export default PrivateBookService;

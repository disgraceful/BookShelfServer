import firebase from "firebase";
import "firebase/storage";
import { UserData } from "../model/UserData";
import { ErrorWithHttpCode } from "../error/ErrorWithHttpCode";

const defaultImgUrl =
  "https://s.gr-assets.com/assets/nophoto/book/111x148-bcc042a9c91a29c1d680899eff700a03.png";

class PrivateBookService {
  getBookDbRef(userId) {
    return firebase.database().ref("users").child(userId).child("books");
  }

  async getPrivateBooks(userId) {
    const ref = this.getBookDbRef(userId);
    const snapshot = await ref.once("value");
    const books = snapshot.val();

    if (!books) return [];
    return Object.values(books).filter((book) => book.private);
  }

  async saveUserBook(userId, book, cover) {
    if (!book.title || !book.author || Number.isNaN(+book.pages)) {
      throw new ErrorWithHttpCode(400, "Book information is invalid");
    }

    const privateBook = {
      title: book.title,
      authors: book.author,
      pages: book.pages,
      imageUrl: "",
      description: book.description,
      userData: new UserData(),
      private: true,
    };

    const booksRef = this.getBookDbRef(userId);
    let newBookRef;

    if (!cover) {
      privateBook.imageUrl = defaultImgUrl;
      newBookRef = await booksRef.push(privateBook);
      const snapshot = await booksRef.child(newBookRef.key).once("value");

      return snapshot.val();
    } else {
      newBookRef = await booksRef.push(privateBook);
      const url = await this.saveBookCover(userId, newBookRef.key, cover);
      const updatedBook = await this.updateImageUrl(
        userId,
        newBookRef.key,
        url,
        privateBook
      );
      console.log(updatedBook);
      return updatedBook;
    }
  }

  async saveBookCover(userId, bookKey, cover) {
    const rootRef = firebase.storage().ref();
    const fileExt = cover.originalname.slice(cover.originalname.indexOf("."));

    const currentCoverRef = rootRef
      .child(userId)
      .child(bookKey)
      .child(`cover${fileExt}`);

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
    const bookRef = this.getBookDbRef(userId).child(bookKey);

    await bookRef.set(updatedBook);
    const snapshot = await bookRef.once("value");
    return snapshot.val();
  }
}

export default PrivateBookService;

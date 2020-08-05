import firebase from "firebase";
import "firebase/storage";
import { UserData } from "../model/UserData";

class PrivateBookService {
  constructor(userService) {
    this.userService = userService;
  }

  async saveUserBook(userId, book, cover) {
    const privateBook = {
      title: book.title,
      authors: book.author,
      pages: book.pages,
      imageUrl: "",
      description: book.description,
      userData: new UserData(),
    };

    const bookRef = firebase
      .database()
      .ref("users")
      .child(userId)
      .child("books");

    const bookKey = (await bookRef.push(privateBook)).key;

    await this.saveBookCover(userId, bookKey, cover);
    console.log(bookKey);
  }

  async saveBookCover(userId, bookKey, cover) {
    const rootRef = firebase.storage().ref();
    const fileExt = cover.originalname.slice(cover.originalname.indexOf("."));

    const currentCoverRef = rootRef
      .child(userId)
      .child(bookKey)
      .child(`cover${fileExt}`);

    const arrayBuffer = Uint8Array.from(cover.buffer).buffer;
    const uploadTask = currentCoverRef.put(arrayBuffer);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        console.log(snapshot);
      },
      (error) => {},

      () => {
        uploadTask.snapshot.ref.getDownloadURL().then((url) => {
          console.log("url", url);
        });
      }
    );
  }
}

export default PrivateBookService;

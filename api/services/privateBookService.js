import firebase from "firebase";
import "firebase/storage";
import { UserData } from "../model/UserData";
import { response } from "express";

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
    const url = await this.saveBookCover(userId, bookKey, cover);
    console.log(bookKey);
    console.log("url", url);
    const updatedBook = await this.updateImageUrl(
      userId,
      bookKey,
      url,
      privateBook
    );
    console.log(updatedBook);
    // return updatedBook;
  }

  async saveBookCover(userId, bookKey, cover) {
    const rootRef = firebase.storage().ref();
    const fileExt = cover.originalname.slice(cover.originalname.indexOf("."));

    const currentCoverRef = rootRef
      .child(userId)
      .child(bookKey)
      .child(`cover${fileExt}`);

    const arrayBuffer = Uint8Array.from(cover.buffer).buffer;
    const metadata = {}; // Add metadata to the file!
    const uploadTask = currentCoverRef.put(arrayBuffer);

    //Get download url as soon as cover uploaded to firebase
    return new Promise((resolve, reject) => {
      uploadTask.on(
        "state_changed",
        () => {},
        (error) => {
          //TODO: proper Eror handling??
          reject(error);
        },
        () => {
          uploadTask.snapshot.ref.getDownloadURL().then((url) => {
            resolve(url); //TODO: is this url TEMPORARY??
          });
        }
      );
    });
  }

  async updateImageUrl(userId, bookKey, url, book) {
    let updatedBook = book;
    updatedBook.imageUrl = url;
    const bookRef = firebase
      .database()
      .ref("users")
      .child(userId)
      .child("books")
      .child(bookKey);
    await bookRef.set(updatedBook);

    return new Promise((resolve) => {
      bookRef.once("value", (snapshot) => resolve(snapshot.val()));
    });
  }
}

export default PrivateBookService;

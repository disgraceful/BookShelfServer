import firebase from "firebase";
import { UserData } from "../model/UserData";

class PrivateBookService {
  constructor(userService) {
    this.userService = userService;
  }

  async saveUserBook(userId, book) {
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

    const newChildRef = bookRef.push();

    await newChildRef.set(privateBook, (error) => {
      console.log(error);
      // TODO: Proper error handling!
    });

    console.log("key", newChildRef.key);
  }
}

export default PrivateBookService;

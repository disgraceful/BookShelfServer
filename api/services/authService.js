import "dotenv/config";
import firebase from "firebase";
import { ErrorWithHttpCode } from "../error/ErrorWithHttpCode";

class AuthService {
  constructor(tokenService) {
    this.tokenService = tokenService;
    this.getUser = this.getUser.bind(this);
    this.createUser = this.createUser.bind(this);
  }

  async getUser(email, password) {
    try {
      await firebase.auth().signInWithEmailAndPassword(email, password);

      const snapshot = await firebase
        .firestore()
        .collection("users")
        .where("email", "==", email)
        .get();

      if (snapshot.empty) {
        throw new ErrorWithHttpCode(404, `User with email ${email} does not exist!`);
      }

      const doc = snapshot.docs[0];
      const existingUser = doc.data();
      existingUser.id = doc.id;

      const token = this.tokenService.createToken({ id: doc.id, email }, 2592000); //30 days
      return { ...existingUser, token: token };
    } catch (error) {
      this.firebaseErrorHandling(error, "Someting went wrong while signing you in! Try again!");
    }
  }

  async createUser(email, password) {
    try {
      await firebase.auth().createUserWithEmailAndPassword(email, password);

      //Do I need to define books and feed?

      const newUser = {
        email,
        books: {},
        feed: {},
      };

      const docRef = firebase.firestore().collection("users").doc();
      await docRef.set(newUser);

      const userId = docRef.id;
      newUser.id = userId;
      const token = this.tokenService.createToken({ id: userId, email }, 2592000);

      return { ...newUser, token };
    } catch (error) {
      this.firebaseErrorHandling(
        error,
        "Ooops! Something went wrong while creating your account! Try again."
      );
    }
  }

  firebaseErrorHandling(error, defaultMessage = "Someting went wrong. Try again.") {
    let errorMessage;
    let httpCode = 500;
    if (!error.code) throw new ErrorWithHttpCode(httpCode, defaultMessage);

    if (error.code === "auth/email-already-in-use") {
      errorMessage = `The email is already in use`;
    } else if (error.code === "auth/invalid-email") {
      errorMessage = "Invalid email";
      httpCode = 400;
    } else if (error.code === "auth/weak-password") {
      errorMessage = "Password must be at least 6 symbols long";
      httpCode = 400;
    } else if (error.code === "auth/user-disabled") {
      errorMessage = "Account with given email has been disabled.";
    } else if (error.code === "auth/user-not-found") {
      errorMessage = `User with that email does not exist!`;
      httpCode = 404;
    } else if (error.code === "auth/wrong-password") {
      errorMessage = "Incorrect password!";
      console.log(errorMessage);
    } else {
      errorMessage = defaultMessage;
    }

    throw new ErrorWithHttpCode(httpCode, errorMessage);
  }
}

export default AuthService;

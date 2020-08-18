import "dotenv/config";
import firebase from "firebase";
import { ErrorWithHttpCode } from "../error/ErrorWithHttpCode";
import errorHanding from "./errorHanding";

class AuthService {
  constructor(tokenService) {
    this.tokenService = tokenService;
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
      errorHanding.authErrorHandler(error, "Someting went wrong while signing you in! Try again!");
    }
  }

  async createUser(email, password) {
    try {
      await firebase.auth().createUserWithEmailAndPassword(email, password);

      //Do I need to define books and feed?
      const newUser = {
        email,
        books: [],
        feed: [],
      };

      const docRef = firebase.firestore().collection("users").doc();
      await docRef.set(newUser);

      const userId = docRef.id;
      newUser.id = userId;
      const token = this.tokenService.createToken({ id: userId, email }, 2592000);

      return { ...newUser, token };
    } catch (error) {
      errorHanding.authErrorHandler(
        error,
        "Ooops! Something went wrong while creating your account! Try again."
      );
    }
  }
}

export default AuthService;

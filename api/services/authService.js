import "dotenv/config";
import firebase from "firebase";
import { ErrorWithHttpCode } from "../error/ErrorWithHttpCode";
import errorHanding from "./errorHanding";

class AuthService {
  constructor(tokenService) {
    this.tokenService = tokenService;
  }

  async getUserByEmail(email) {
    const snapshot = await firebase
      .firestore()
      .collection("users")
      .where("email", "==", email)
      .get();

    if (snapshot.empty) {
      return null;
    }

    const doc = snapshot.docs[0];
    const existingUser = doc.data();
    existingUser.id = doc.id;

    const token = this.tokenService.createToken({ id: doc.id, email }, 2592000); //30 days
    return { ...existingUser, token };
  }

  async getUser(email, password) {
    try {
      await firebase.auth().signInWithEmailAndPassword(email, password);

      const user = await this.getUserByEmail(email);

      if (!user) {
        throw new ErrorWithHttpCode(404, `User with email ${email} does not exist!`);
      }

      return { ...user };
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

  async signInGoogle(token) {
    try {
      const credential = firebase.auth.GoogleAuthProvider.credential(token);
      await firebase.auth().signInWithCredential(credential);
      const user = firebase.auth().currentUser;

      console.log(user.email);
      if (user.email) {
        const existingUser = await this.getUserByEmail(user.email);
        if (existingUser) {
          return { ...existingUser };
        }
        const newUser = await this.saveUser(user.email);
        return { ...newUser };
      } else {
        throw new ErrorWithHttpCode(500, `Failed to authenticate User`);
      }
    } catch (error) {
      // change error msg
      console.log(error);
      errorHanding.authErrorHandler(
        error,
        "Ooops! Something went wrong while creating your account! Try again."
      );
    }
  }

  async saveUser(email) {
    const newUser = {
      email,
      books: [],
      feed: [],
    };

    const doc = firebase.firestore().collection("users").doc();
    await doc.set(newUser);

    const userId = doc.id;
    newUser.id = userId;
    const token = this.tokenService.createToken({ id: userId, email }, 2592000);
    return { ...newUser, token };
  }
}

export default AuthService;

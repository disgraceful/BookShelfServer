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
      const userCredentials = await firebase.auth().signInWithEmailAndPassword(email, password);

      //if user exists continue...

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

      const token = this.tokenService.createToken({ id: doc.id, email }, 1000000); //change expire date!
      return { user: existingUser, token: token };
    } catch (error) {
      throw new ErrorWithHttpCode(error.httpCode || 500, error.message);
    }
  }

  async createUser(email, password) {
    try {
      let newUser;
      const created = await firebase.auth().createUserWithEmailAndPassword(email, password);
      //TODO: error handling.

      //Do I need to define books and feed?
      newUser = {
        email: created.user.email,
        books: {},
        feed: {},
      };

      const docRef = firebase.firestore().collection("users").doc();
      await docRef.set(newUser);

      const userId = docRef.id;
      newUser.id = userId;
      const token = this.tokenService.createToken({ id: userId, email }, 2592000);

      return { user: newUser, token: token };
    } catch (error) {
      throw new ErrorWithHttpCode(error.httpCode || 500, error.message);
    }
  }
}

export default AuthService;

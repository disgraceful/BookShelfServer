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
    let existingUser = {};
    try {
      const user = await firebase
        .auth()
        .signInWithEmailAndPassword(email, password);
      existingUser.email = user.user.email;
      const snapshot = await firebase
        .database()
        .ref("users")
        .orderByChild("email")
        .equalTo(existingUser.email)
        .once("value");
      if (!snapshot.val()) {
        throw new ErrorWithHttpCode(
          404,
          `User data associated with user email ${email}`
        );
      }
      let key;
      snapshot.forEach((e) => (key = e.key));
      const dbUser = snapshot.val()[key];
      existingUser.id = key;
      existingUser.books = dbUser.books || [];
      const token = this.tokenService.createToken({ id: key }, 1000000);
      console.log(existingUser.id);
      return { user: existingUser, token: token };
    } catch (error) {
      throw new ErrorWithHttpCode(error.httpCode || 500, error.message);
    }
  }

  async createUser(email, password) {
    let newUser;
    try {
      const user = await firebase
        .auth()
        .createUserWithEmailAndPassword(email, password);
      newUser = {
        email: user.user.email,
        books: [],
      };
      const data = await firebase.database().ref("users").push(newUser);
      newUser.id = data.key;
      const token = this.tokenService.createToken({ id: data.key }, 2592000);
      return { user: newUser, token: token };
    } catch (error) {
      throw new ErrorWithHttpCode(error.httpCode || 500, error.message);
    }
  }
}

export default AuthService;

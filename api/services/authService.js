import "dotenv/config";
import firebase from "firebase";
import { ErrorWithHttpCode } from "../error/ErrorWithHttpCode";
import errorHanding from "./errorHanding";
import oauth from "oauth";

class AuthService {
  constructor(tokenService) {
    this.tokenService = tokenService;
    this.consumer = new oauth.OAuth(
      "https://twitter.com/oauth/request_token",
      "https://twitter.com/oauth/access_token",
      process.env.TWITTER_KEY,
      process.env.TWITTER_SECRET,
      "1.0A",
      "http://localhost:8000/login",
      "HMAC-SHA1"
    );
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

  async signInGoogle(token) {
    try {
      const credential = firebase.auth.GoogleAuthProvider.credential(token);
      const fbUser = await firebase.auth().signInWithCredential(credential);
      const user = fbUser.user;
      console.log(user.email);
      if (user.email) {
        const existingUser = await this.getUserByEmail(user.email);
        if (existingUser) {
          return { ...existingUser };
        }
        const newUser = await this.saveUser(user.email);
        return { ...newUser };
      } else {
        throw new ErrorWithHttpCode(500, `Failed to authenticate Google user`);
      }
    } catch (error) {
      console.log(error);
      //Since Google is more 'trusted' than others providers, it will override every other sign-in provider

      errorHanding.authErrorHandler(
        error,
        "Ooops! Something went wrong while linking your Google account! Try again."
      );
    }
  }

  getAuthorizeUrl() {
    return new Promise((resolve, reject) => {
      this.consumer.getOAuthRequestToken((error, token, tokenSecret) => {
        if (error) {
          reject(new ErrorWithHttpCode(500, "Failed to get request token"));
        }

        resolve({ url: `https://api.twitter.com/oauth/authorize?oauth_token=${token}` });
      });
    });
  }

  getAccessToken(reqToken, verifier) {
    return new Promise((resolve, reject) => {
      this.consumer.getOAuthAccessToken(
        reqToken,
        process.env.TWITTER_SECRET,
        verifier,
        (error, accessToken, accessTokenSecret) => {
          if (error) {
            reject(new ErrorWithHttpCode(500, "Failed to get access token"));
          }
          resolve({ token: accessToken, secret: accessTokenSecret });
        }
      );
    });
  }

  async signInTwitter(token, secret) {
    try {
      const credential = firebase.auth.TwitterAuthProvider.credential(token, secret);

      const fbUser = await firebase.auth().signInWithCredential(credential);
      const user = fbUser.user;

      if (user.email) {
        const existingUser = await this.getUserByEmail(user.email);
        if (existingUser) {
          return { ...existingUser };
        }
        const newUser = await this.saveUser(user.email);
        return { ...newUser };
      } else {
        throw new ErrorWithHttpCode(500, `Failed to authenticate Twitter user`);
      }
    } catch (error) {
      console.log(error);
      let message;
      if (error.code.includes("different-credential"))
        message = "Email is already associated with another account";

      errorHanding.authErrorHandler(
        error,
        message || "Ooops! Something went wrong while linking your Twitter account! Try again."
      );
    }
  }
}

export default AuthService;

import "dotenv/config";
import firebase from "firebase";
import { ErrorWithHttpCode } from "../error/ErrorWithHttpCode";
import errorHanding from "./errorHanding";
import oauth from "oauth";

class AuthService {
  constructor(tokenService) {
    console.log(process.env.TWITTER_CALLBACK);
    this.tokenService = tokenService;
    this.consumer = new oauth.OAuth(
      "https://twitter.com/oauth/request_token",
      "https://twitter.com/oauth/access_token",
      process.env.TWITTER_KEY,
      process.env.TWITTER_SECRET,
      "1.0A",
      process.env.TWITTER_CALLBACK,
      "HMAC-SHA1"
    );
  }

  async getUserProfile(id) {
    const snapshot = await firebase.firestore().collection("users").doc(id).get();
    if (!snapshot.exists) {
      return null;
    }

    const existingUser = snapshot.data();
    existingUser.id = id;

    return existingUser;
  }

  createToken(userId, email) {
    return this.tokenService.createToken({ id: userId, email }, 2592000); //30 days
  }

  async getUser(email, password) {
    try {
      await firebase.auth().signInWithEmailAndPassword(email, password);
      let id = firebase.auth().currentUser.uid;

      const token = this.createToken(id, email);

      const user = await this.getUserProfile(id);

      if (!user) {
        throw new ErrorWithHttpCode(404, `User with email ${email} does not exist!`);
      }

      return { ...user, token };
    } catch (error) {
      console.log(error);

      errorHanding.authErrorHandler(error, "Someting went wrong while signing you in! Try again!");
    }
  }

  async createUser(email, password) {
    try {
      await firebase.auth().createUserWithEmailAndPassword(email, password);
      let uid = firebase.auth().currentUser.uid;
      let saved = await this.saveUser(email, uid);
      return { ...saved };
    } catch (error) {
      console.log(error);
      errorHanding.authErrorHandler(
        error,
        "Ooops! Something went wrong while creating your account! Try again."
      );
    }
  }

  async saveUser(email, uid) {
    const newUser = {
      email,
    };

    const doc = firebase.firestore().collection("users").doc(uid);
    await doc.set(newUser);

    newUser.id = uid;
    const token = this.createToken(uid, email);
    return { ...newUser, token };
  }

  async signInGoogle(token) {
    try {
      const credential = firebase.auth.GoogleAuthProvider.credential(token);
      const fbUser = await firebase.auth().signInWithCredential(credential);
      const user = fbUser.user;

      if (user.email) {
        const existingUser = await this.getUserProfile(user.uid);
        const token = this.createToken(user.uid, user.email);
        if (existingUser) {
          return { ...existingUser, token };
        }
        const newUser = await this.saveUser(user.email, user.uid);
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
        resolve({ url: `https://api.twitter.com/oauth/authenticate?oauth_token=${token}` });
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
        const existingUser = await this.getUserProfile(user.uid);
        const token = this.createToken(user.uid, user.email);
        if (existingUser) {
          return { ...existingUser, token };
        }
        const newUser = await this.saveUser(user.email, user.uid);
        return { ...newUser };
      } else {
        throw new ErrorWithHttpCode(500, `Failed to authenticate Twitter user`);
      }
    } catch (error) {
      errorHanding.authErrorHandler(
        error,
        message || "Ooops! Something went wrong while linking your Twitter account! Try again."
      );
    }
  }
}

export default AuthService;

import authService from "../api/services/authService";
import firebase from "firebase";

const userEmail = "test@test.com";
const userPassword = "123456";

describe("Authentication", () => {
  it("create user", () => {
    const data = firebase
      .auth()
      .createUserWithEmailAndPassword(userEmail, userPassword);
  });
});

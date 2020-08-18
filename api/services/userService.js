import firebase from "firebase";
import { ErrorWithHttpCode } from "../error/ErrorWithHttpCode";

class UserService {
  async getUserById(userId) {
    try {
      const userRef = firebase.firestore().collection("users").doc(userId);
      const userDoc = await userRef.get();

      if (!userDoc.exists) {
        throw new ErrorWithHttpCode(404, "User not found");
      } else {
        const user = userDoc.data();
        return { ...user, id: userId };
      }
    } catch (error) {
      if (error.userMessage) throw error;
      else throw new ErrorWithHttpCode(500, "Could not retrieve user");
    }
  }
}

export default UserService;

import firebase from "firebase";

describe("Firebase tests", function () {
  it("does it works?", function () {
    const db = firebase.firestore();
    db.collection("users")
      .doc("test")
      .set({ books: ["1", "2", "3"], private: true });
  });
});

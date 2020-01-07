"use strict"
import firebase from "firebase";

class AuthController {
    constructor() {
        this.signInUser = this.signInUser.bind(this);
        this.signUpUser = this.signUpUser.bind(this);
    }
    signInUser(request, response) {
        console.log("SignIn request accepted")
        let userCredentials = request.body;
        console.log(userCredentials);
        firebase.auth().signInWithEmailAndPassword(userCredentials.email, userCredentials.password)
            .then(user => {
                const newUser = {
                    id: user.user.uid,
                    email: user.user.email,
                    books: []
                }
                response.json(newUser);
            })
            .catch(error => {
                response.status(500).json(error);
            })
    }

    signUpUser(request, response) {
        console.log("SignUp request accepted");
        let userCredentials = request.body;
        console.log(userCredentials);
        firebase.auth().createUserWithEmailAndPassword(userCredentials.email, userCredentials.password)
            .then(user => {
                const newUser = {
                    id: user.user.uid,
                    email: user.user.email,
                    books: []
                }
                response.json(newUser);
            })
            .catch(error => {
                response.status(500).json(error);
            })
    }
}
export default new AuthController();

// exports.signInUser = (request, response) => {
//     console.log("SignIn request accepted")
//     let userCredentials = request.body;
//     console.log(userCredentials);
//     firebase.auth().signInWithEmailAndPassword(userCredentials.email, userCredentials.password)
//         .then(user => {
//             const newUser = {
//                 id: user.user.uid,
//                 email: user.user.email,
//                 books: []
//             }
//             response.json(newUser);
//         })
//         .catch(error => {
//             response.status(500).json(error);
//         })
// };
// exports.signUpUser = (request, response) => {
//     console.log("SignUp request accepted");
//     let userCredentials = request.body;
//     console.log(userCredentials);
//     firebase.auth().createUserWithEmailAndPassword(userCredentials.email, userCredentials.password)
//         .then(user => {
//             const newUser = {
//                 id: user.user.uid,
//                 email: user.user.email,
//                 books: []
//             }
//             response.json(newUser);
//         })
//         .catch(error => {
//             response.status(500).json(error);
//         })
// }
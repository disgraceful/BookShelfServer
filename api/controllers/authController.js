"use strict"
const firebase = require('firebase');

exports.signInUser = (request, response) => {
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
            console.log(error);
        })
};
exports.signUpUser = (request, response) => {
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
            console.log(error);
        })
}
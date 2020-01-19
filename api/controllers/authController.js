"use strict"
import firebase from "firebase";
import AuthService from "../services/authService";

const authService = new AuthService();

class AuthController {
    constructor(authService) {
        this.authService = authService;
        this.signInUser = this.signInUser.bind(this);
        this.signUpUser = this.signUpUser.bind(this);
    }
    signInUser(request, response) {
        console.log("SignIn request accepted")
        let userCredentials = request.body;
        console.log("user: ", userCredentials);
        let user = this.authService.getUser(userCredentials.email, userCredentials.password);
        console.log("sending to cient: ", user);
        if (user.message) {
            response.status(500).json(user);
        } else {
            response.json(user);
        }
    }

    signUpUser(request, response) {
        console.log("SignUp request accepted");
        let userCredentials = request.body;
        console.log(userCredentials);
        let user = this.authService.createUser(userCredentials.email, userCredentials.password);
        if (user.message) {
            response.status(500).json(user);
        } else {
            response.json(user);
        }
    }
}
export default new AuthController(authService);


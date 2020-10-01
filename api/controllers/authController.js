import AuthService from "../services/authService";
import TokenService from "../services/tokenService";
import { ErrorWithHttpCode } from "../error/ErrorWithHttpCode";

const tokenService = new TokenService();
const authService = new AuthService(tokenService);

class AuthController {
  constructor(authService) {
    this.authService = authService;
    this.signInUser = this.signInUser.bind(this);
    this.signUpUser = this.signUpUser.bind(this);
    this.signInWithGoogle = this.signInWithGoogle.bind(this);
    this.signUpWithGoogle = this.signUpWithGoogle.bind(this);
  }

  async signInUser(request, response) {
    try {
      console.log("SignIn request accepted");
      const userCredentials = request.body;

      if (!userCredentials || !userCredentials.email || !userCredentials.password) {
        throw new ErrorWithHttpCode(400, "User credentials are invalid");
      }

      const user = await this.authService.getUser(userCredentials.email, userCredentials.password);
      response.json(user);
    } catch (error) {
      response
        .status(error.httpCode)
        .json({ httpCode: error.httpCode, message: error.userMessage });
    }
  }

  async signUpUser(request, response) {
    try {
      console.log("SignUp request accepted");
      const userCredentials = request.body;

      if (!userCredentials || !userCredentials.email || !userCredentials.password) {
        throw new ErrorWithHttpCode(400, "User credentials are invalid");
      }

      const user = await this.authService.createUser(
        userCredentials.email,
        userCredentials.password
      );
      response.json(user);
    } catch (error) {
      response
        .status(error.httpCode)
        .json({ httpCode: error.httpCode, message: error.userMessage });
    }
  }

  async signInWithGoogle(request, response) {
    console.log("Sign In With Google request accepted");
    try {
      const idToken = request.body.token;
      const result = await this.authService.signInGoogle(idToken);
      response.json(result);
    } catch (error) {
      response
        .status(error.httpCode)
        .json({ httpCode: error.httpCode, message: error.userMessage });
    }
  }

  async signUpWithGoogle(request, response) {
    console.log("Sign Up With Google request accepted");
    try {
    } catch (error) {
      response
        .status(error.httpCode)
        .json({ httpCode: error.httpCode, message: error.userMessage });
    }
  }
}

export default new AuthController(authService);

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
}

export default new AuthController(authService);

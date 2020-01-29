import AuthService from "../services/authService";
import TokenService from "../services/tokenService";

const tokenService = new TokenService();
const authService = new AuthService(tokenService);

class AuthController {
    constructor(authService) {
        this.authService = authService;
        this.signInUser = this.signInUser.bind(this);
        this.signUpUser = this.signUpUser.bind(this);
    }

    async signInUser(request, response) {
        console.log("SignIn request accepted")
        const userCredentials = request.body;
        try {
            const user = await this.authService.getUser(userCredentials.email, userCredentials.password);
            response.json(user)
        }
        catch (error) {
            response.status(error.httpCode).json({ httpCode: error.httpCode, message: error.message });
        }
    }

    async signUpUser(request, response) {
        console.log("SignUp request accepted");
        const userCredentials = request.body;
        try {
            const user = await this.authService.createUser(userCredentials.email, userCredentials.password);
            response.json(user);
        } catch (error) {
            response.status(error.httpCode).json({ httpCode: error.httpCode, message: error.message });
        }
    }
}

export default new AuthController(authService);

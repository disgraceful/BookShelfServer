import AuthService from "../services/authService";

const authService = new AuthService();

class AuthController {
    constructor(authService) {
        this.authService = authService;
        this.signInUser = this.signInUser.bind(this);
        this.signUpUser = this.signUpUser.bind(this);
    }

    async signInUser(request, response) {
        console.log("SignIn request accepted")
        const userCredentials = request.body;
        console.log("user: ", userCredentials);
        try {
            const user = await this.authService.getUser(userCredentials.email, userCredentials.password);
            response.json(user)
        }
        catch (error) {
            response.status(error.code).json(error);
        }
    }

    async signUpUser(request, response) {
        console.log("SignUp request accepted");
        const userCredentials = request.body;
        console.log(userCredentials);
        try {
            const user = await this.authService.createUser(userCredentials.email, userCredentials.password);
            response.json(user);
        } catch (error) {
            response.status(error.code).json(error);
        }
    }
}

export default new AuthController(authService);

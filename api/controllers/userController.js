"use strict"
import UserService from "../services/userService";

const userService = new UserService();

class UserController {
    constructor(userService) {
        this.userService = userService;
        this.getUser = this.getUser.bind(this);
    }
    async getUser(request, response) {
        console.log("Get User request accepted");
        const userId = request.query.id;
        console.log("User id: ", userId);
        try {
            const user = await this.userService.getUserById(userId);
            response.json(user)
        }
        catch (error) {
            response.status(error.httpCode).json(error);
        }

    }
}
export default new UserController(userService);


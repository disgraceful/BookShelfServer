"use strict"
import UserService from "../services/userService";
import UserBooksService from "../services/userBooksService";

const userService = new UserService();
const userBooksService = new UserBooksService(userService);

class UserController {
    constructor(userService, userBooksService) {
        this.userService = userService;
        this.userBooksService = userBooksService;
        this.getUser = this.getUser.bind(this);
        this.getReading = this.getReading.bind(this);
        this.addToReading = this.addToReading.bind(this);
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

    async getReading(request, response) {
        console.log("Get Books from Reading request accepted");
        const userId = request.query.id;
        console.log("User id: ", userId);
        try {
            const result = await this.userBooksService.getUserReading(userId);
            response.json(result);
        } catch (error) {
            response.status(error.httpCode).json(error);
        }
    }

    async addToReading(request, response) {
        console.log("Add Book to Reading request accepted");
        const userId = request.body.userId;
        const book = request.body.book;
        console.log(userId, book);
        try {
            const result = await this.userBooksService.addToUserReading(userId, book);
            console.log("result ", result);
            response.json(result);
        } catch (error) {

        }
    }


}
export default new UserController(userService, userBooksService);


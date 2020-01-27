"use strict"
import UserService from "../services/userService";
import UserBooksService from "../services/userBooksService";

const READING = "reading";
const TOREAD = "toread";
const STOPPED = "stopped";
const FINISHED = "finished";
const FAVORITES = "favorites";

const userService = new UserService();
const userBooksService = new UserBooksService(userService);

class UserController {
    constructor(userService, userBooksService) {
        this.userService = userService;
        this.userBooksService = userBooksService;
        this.getUser = this.getUser.bind(this);
        this.getCollection = this.getCollection.bind(this);
        this.getReading = this.getReading.bind(this);
        this.getToRead = this.getToRead.bind(this);
        this.getStopped = this.getStopped.bind(this);
        this.getFinished = this.getFinished.bind(this);
        this.getFavorites = this.getFavorites.bind(this);
        this.addToCollection = this.addToCollection.bind(this);
        this.addToReading = this.addToReading.bind(this);
        this.addToRead = this.addToRead.bind(this);
        this.addToStopped = this.addToStopped.bind(this);
        this.addToFinished = this.addToFinished.bind(this);
        this.addToFavorites = this.addToFavorites.bind(this);
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

    async getCollection(request, response, collection) {
        console.log(`Get Books from ${collection} request accepted`);
        const userId = request.query.id;
        console.log("User id: ", userId);
        try {
            const result = await this.userBooksService.getUserCollection(userId, collection);
            response.json(result);
        } catch (error) {
            response.status(error.httpCode).json(error);
        }
    }

    async getReading(request, response) {
        await this.getCollection(request, response, READING);
    }

    async getToRead(request, response) {
        await this.getCollection(request, response, TOREAD);
    }

    async getStopped(request, response) {
        await this.getCollection(request, response, STOPPED);
    }

    async getFinished(request, response) {
        await this.getCollection(request, response, FINISHED);
    }

    async getFavorites(request, response) {
        await this.getCollection(request, response, FAVORITES);
    }

    async addToCollection(request, response, collection) {
        console.log(`\nAdd Book to ${collection} request accepted`);
        const userId = request.body.userId;
        const book = request.body.book;
        console.log(userId, book);
        try {
            const result = await this.userBooksService.addToUserCollection(userId, collection, book);
            response.json(result);
        } catch (error) {
            response.status(error.httpCode).json(error);
        }
    }

    async addToReading(request, response) {
        await this.addToCollection(request, response, READING);
    }

    async addToRead(request, response) {
        await this.addToCollection(request, response, TOREAD);
    }

    async addToStopped(request, response) {
        await this.addToCollection(request, response, STOPPED);
    }

    async addToFinished(request, response) {
        await this.addToCollection(request, response, FINISHED);
    }

    async addToFavorites(request, response) {
        await this.addToCollection(request, response, FAVORITES);
    }
}

export default new UserController(userService, userBooksService);

"use strict"
import UserService from "../services/userService";
import UserBooksService from "../services/userBooksService";
import TokenService from "../services/tokenService";

const userService = new UserService();
const userBooksService = new UserBooksService(userService);
const tokenService = new TokenService();

class UserController {
    constructor(userService, userBooksService, tokenService) {
        this.userService = userService;
        this.userBooksService = userBooksService;
        this.tokenService = tokenService;
        this.getUser = this.getUser.bind(this);
        this.getUserBooks = this.getUserBooks.bind(this);
        this.getCollection = this.getCollection.bind(this);
        this.addToCollection = this.addToCollection.bind(this);
        this.deleteBook = this.deleteBook.bind(this);
        this.setFavorite = this.setFavorite.bind(this);
        this.getFavoriteBooks = this.getFavoriteBooks.bind(this);
        this.updateBook = this.updateBook.bind(this);
        this.getUserGenres = this.getUserGenres.bind(this);
    }

    async getUser(request, response) {
        console.log("Get User request accepted");
        const token = request.headers['x-access-token'];
        console.log(token);
        try {
            const validated = this.tokenService.validateToken(token);
            if (!validated) throw new ErrorWithHttpCode(400, "Error validating token");
            const user = await this.userService.getUserById(validated.id);
            response.json(user)
        }
        catch (error) {
            response.status(error.httpCode).json(error);
        }
    }

    async getUserBooks(request, response) {
        console.log(`Get User Books request accepted`);
        const token = request.headers['x-access-token'];
        console.log(token);
        try {
            const validated = this.tokenService.validateToken(token);
            if (!validated) throw new ErrorWithHttpCode(400, "Error validating token");
            const result = await this.userBooksService.getUserBooks(validated.id);
            response.json(result);
        }
        catch (error) {
            response.status(error.httpCode).json(error);
        }
    }

    async getCollection(request, response) {
        const collection = request.params.collection;
        console.log(`Get Books from ${collection} request accepted`);
        const token = request.headers['x-access-token'];
        console.log(collection, token);
        try {
            const validated = this.tokenService.validateToken(token);
            if (!validated) throw new ErrorWithHttpCode(400, "Error validating token");
            const result = await this.userBooksService.getUserCollection(validated.id, collection);
            response.json(result);
        } catch (error) {
            response.status(error.httpCode).json(error);
        }
    }

    async addToCollection(request, response) {
        const collection = request.params.collection;
        console.log(`Get Books from ${collection} request accepted`);
        const token = request.headers['x-access-token'];
        const book = request.body.book;
        console.log(collection, book, token);
        try {
            const validated = this.tokenService.validateToken(token);
            if (!validated) throw new ErrorWithHttpCode(400, "Error validating token");
            const result = await this.userBooksService.addToUserCollection(validated.id, collection, book);
            response.json(result);
        } catch (error) {
            console.log("error ", error)
            response.status(error.httpCode).json(error);
        }
    }

    async deleteBook(request, response) {
        console.log("Book Delete Request accepted");
        const bookId = request.query.bookId;
        const token = request.headers['x-access-token'];
        console.log(bookId, token);
        try {
            const validated = this.tokenService.validateToken(token);
            if (!validated) throw new ErrorWithHttpCode(400, "Error validating token");
            const result = await this.userBooksService.deleteBookFromCollection(validated.id, bookId);
            response.json(result);
        } catch (error) {
            response.status(error.httpCode).json(error);
        }
    }

    async setFavorite(request, response) {
        console.log("Favorite book request accepted");
        const book = request.body.book;
        const token = request.headers['x-access-token'];
        console.log(book, token);
        try {
            const validated = this.tokenService.validateToken(token);
            if (!validated) throw new ErrorWithHttpCode(400, "Error validating token");
            const result = await this.userBooksService.setFavorite(validated.id, book);
            response.json(result);
        } catch (error) {
            response.status(error.httpCode).json(error);
        }
    }

    async getFavoriteBooks(request, response) {
        console.log("Get favorite books request accepted");
        const token = request.headers['x-access-token'];
        console.log(token);
        try {
            const validated = this.tokenService.validateToken(token);
            if (!validated) throw new ErrorWithHttpCode(400, "Error validating token");
            const result = await this.userBooksService.getFavorites(validated.id);
            response.json(result);
        } catch (error) {
            response.status(error.httpCode).json(error);
        }
    }

    async updateBook(request, response) {
        console.log("Update Book request accepted");
        const book = request.body.book;
        const token = request.headers['x-access-token'];
        console.log(book, token);
        try {
            const validated = this.tokenService.validateToken(token);
            if (!validated) throw new ErrorWithHttpCode(400, "Error validating token");
            const result = await this.userBooksService.updateBook(validated.id, book);
            console.log("result" + result)
            response.json(result);
        } catch (error) {
            response.status(error.httpCode).json(error);
        }
    }

    async getUserGenres(request, response) {
        console.log("GET User Genres request accepted");
        const token = request.headers["x-access-token"];
        try {
            const validated = this.tokenService.validateToken(token);
            if (!validated) throw new ErrorWithHttpCode(400, "Error validating token");
            const result = await this.userBooksService.getUserGenres(validated.id);
            response.json(result);
        } catch (error) {
            response.status(error.httpCode).json(error);
        }
    }
}

export default new UserController(userService, userBooksService, tokenService);

"use strict";
import UserService from "../services/userService";
import UserBooksService from "../services/userBooksService";
import FeedService from "../services/feedService";
import PrivateBookService from "../services/privateBookService";
import { tokenInterceptor } from "../http/interceptors";
import { ErrorWithHttpCode } from "../error/ErrorWithHttpCode";

const userService = new UserService();
const feedService = new FeedService();
const privateBookService = new PrivateBookService();
const userBooksService = new UserBooksService(feedService);

class UserController {
  constructor(userService, userBooksService, privateBookService) {
    this.userService = userService;
    this.userBooksService = userBooksService;
    this.privateBookService = privateBookService;
    this.getUser = this.getUser.bind(this);
    this.getUserBooks = this.getUserBooks.bind(this);
    this.getCollection = this.getCollection.bind(this);
    this.addToCollection = this.addToCollection.bind(this);
    this.deleteBook = this.deleteBook.bind(this);
    this.setFavorite = this.setFavorite.bind(this);
    this.getFavoriteBooks = this.getFavoriteBooks.bind(this);
    this.updateBook = this.updateBook.bind(this);
    this.getUserGenres = this.getUserGenres.bind(this);
    this.savePrivateBook = this.savePrivateBook.bind(this);
    this.getAllPrivateBooks = this.getAllPrivateBooks.bind(this);
    this.getPrivateBookById = this.getPrivateBookById.bind(this);
  }

  async getUser(request, response) {
    try {
      console.log("Get User request accepted");
      const validated = tokenInterceptor(request);
      const user = await this.userService.getUserById(validated.id);
      response.json(user);
    } catch (error) {
      response
        .status(error.httpCode)
        .json({ httpCode: error.httpCode, message: error.userMessage });
    }
  }

  async getUserBooks(request, response) {
    try {
      console.log(`Get User Books request accepted`);
      const validated = tokenInterceptor(request);
      const result = await this.userBooksService.getUserBooksAsArray(validated.id);
      response.json(result);
    } catch (error) {
      response
        .status(error.httpCode)
        .json({ httpCode: error.httpCode, message: error.userMessage });
    }
  }

  async getCollection(request, response) {
    try {
      const collection = request.params.collection;
      console.log(`Get Books from ${collection} request accepted`);
      if (!collection) throw new ErrorWithHttpCode(400, "Book status is invalid");

      const validated = tokenInterceptor(request);
      const result = await this.userBooksService.getUserCollection(validated.id, collection);
      response.json(result);
    } catch (error) {
      response
        .status(error.httpCode)
        .json({ httpCode: error.httpCode, message: error.userMessage });
    }
  }

  async addToCollection(request, response) {
    try {
      const collection = request.params.collection;
      console.log(`Get Books from ${collection} request accepted`);
      const book = request.body.book;

      if (!book || !collection) throw new ErrorWithHttpCode(400, "Params are invalid");
      const validated = tokenInterceptor(request);
      const result = await this.userBooksService.addToUserCollection(
        validated.id,
        collection,
        book
      );
      response.json(result);
    } catch (error) {
      response
        .status(error.httpCode)
        .json({ httpCode: error.httpCode, message: error.userMessage });
    }
  }

  async deleteBook(request, response) {
    try {
      console.log("Book Delete Request accepted");
      const bookId = request.query.bookId;
      if (!bookId || isNaN(bookId)) throw new ErrorWithHttpCode(400, "Book params are invalid");

      const validated = tokenInterceptor(request);
      const result = await this.userBooksService.deleteBookFromCollection(validated.id, bookId);
      response.json(result);
    } catch (error) {
      response
        .status(error.httpCode)
        .json({ httpCode: error.httpCode, message: error.userMessage });
    }
  }

  async setFavorite(request, response) {
    try {
      console.log("Favorite book request accepted");
      const book = request.body.book;
      if (!book) throw new ErrorWithHttpCode(400, "Invalid parameter");

      const validated = tokenInterceptor(request);
      const result = await this.userBooksService.setFavorite(validated.id, book);
      response.json(result);
    } catch (error) {
      response
        .status(error.httpCode)
        .json({ httpCode: error.httpCode, message: error.userMessage });
    }
  }

  async getFavoriteBooks(request, response) {
    try {
      console.log("Get favorite books request accepted");
      const validated = tokenInterceptor(request);
      const result = await this.userBooksService.getFavorites(validated.id);
      response.json(result);
    } catch (error) {
      response
        .status(error.httpCode)
        .json({ httpCode: error.httpCode, message: error.userMessage });
    }
  }

  async updateBook(request, response) {
    try {
      console.log("Update Book request accepted");
      const book = request.body.book;
      if (!book) throw new ErrorWithHttpCode(400, "Invalid parameter");
      const validated = tokenInterceptor(request);
      const result = await this.userBooksService.updateBook(validated.id, book);
      response.json(result);
    } catch (error) {
      response.status(error.httpCode).json(error);
    }
  }

  async getUserGenres(request, response) {
    try {
      console.log("GET User Genres request accepted");
      const validated = tokenInterceptor(request);
      const result = await this.userBooksService.getUserGenres(validated.id);
      response.json(result);
    } catch (error) {
      response.status(error.httpCode).json(error);
    }
  }

  async savePrivateBook(request, response) {
    console.log("Save User's private book request accepted");
    try {
      const validated = tokenInterceptor(request);
      const book = request.body;
      const cover = request.file;
      console.log(book);
      console.log(cover);

      const result = await this.privateBookService.saveUserBook(validated.id, book, cover);

      response.json(result);
    } catch (error) {
      console.log(error);
      response.status(error.httpCode || 500).json(error);
    }
  }

  async getAllPrivateBooks(request, response) {
    console.log("GET User's private books request accepted");
    try {
      const validated = tokenInterceptor(request);
      const result = await this.privateBookService.getPrivateBooks(validated.id);
      response.json(result);
    } catch (error) {
      console.log(error);
      response.status(error.httpCode || 500).json(error);
    }
  }

  async getPrivateBookById(request, response) {
    console.log("Get User's private book By Id");
    try {
      const validated = tokenInterceptor(request);
      const bookFid = request.params.id;
      const result = await this.privateBookService.getPrivateBookById(validated.id, bookFid);
      response.json(result);
    } catch (error) {
      console.log(error);
      response.status(error.httpCode || 500).json(error);
    }
  }
}

export default new UserController(userService, userBooksService, privateBookService);

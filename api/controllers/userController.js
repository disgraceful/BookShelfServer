"use strict";
import UserService from "../services/userService";
import UserBooksService from "../services/userBooksService";
import FeedService from "../services/feedService";
import PrivateBookService from "../services/privateBookService";
import { tokenInterceptor } from "../http/interceptors";

const userService = new UserService();
const feedService = new FeedService();
const privateBookService = new PrivateBookService(userService);
const userBooksService = new UserBooksService(userService, feedService);

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
  }

  async getUser(request, response) {
    console.log("Get User request accepted");
    try {
      const validated = tokenInterceptor(request);
      const user = await this.userService.getUserById(validated.id);
      response.json(user);
    } catch (error) {
      response.status(error.httpCode).json(error);
    }
  }

  async getUserBooks(request, response) {
    console.log(`Get User Books request accepted`);
    try {
      const validated = tokenInterceptor(request);
      const result = await this.userBooksService.getUserBooks(validated.id);
      response.json(result);
    } catch (error) {
      response.status(error.httpCode).json(error);
    }
  }

  async getCollection(request, response) {
    const collection = request.params.collection;
    console.log(`Get Books from ${collection} request accepted`);
    console.log(collection);
    try {
      const validated = tokenInterceptor(request);
      const result = await this.userBooksService.getUserCollection(
        validated.id,
        collection
      );
      response.json(result);
    } catch (error) {
      response.status(error.httpCode).json(error);
    }
  }

  async addToCollection(request, response) {
    const collection = request.params.collection;
    console.log(`Get Books from ${collection} request accepted`);
    const book = request.body.book;
    console.log(collection, book);
    try {
      const validated = tokenInterceptor(request);
      const result = await this.userBooksService.addToUserCollection(
        validated.id,
        collection,
        book
      );
      response.json(result);
    } catch (error) {
      console.log("error ", error);
      response.status(error.httpCode).json(error);
    }
  }

  async deleteBook(request, response) {
    console.log("Book Delete Request accepted");
    const bookId = request.query.bookId;
    console.log(bookId);
    try {
      const validated = tokenInterceptor(request);
      const result = await this.userBooksService.deleteBookFromCollection(
        validated.id,
        bookId
      );
      response.json(result);
    } catch (error) {
      response.status(error.httpCode).json(error);
    }
  }

  async setFavorite(request, response) {
    console.log("Favorite book request accepted");
    const book = request.body.book;
    console.log(book);
    try {
      const validated = tokenInterceptor(request);
      const result = await this.userBooksService.setFavorite(
        validated.id,
        book
      );
      response.json(result);
    } catch (error) {
      response.status(error.httpCode).json(error);
    }
  }

  async getFavoriteBooks(request, response) {
    console.log("Get favorite books request accepted");
    try {
      const validated = tokenInterceptor(token);
      const result = await this.userBooksService.getFavorites(validated.id);
      response.json(result);
    } catch (error) {
      response.status(error.httpCode).json(error);
    }
  }

  async updateBook(request, response) {
    console.log("Update Book request accepted");
    const book = request.body.book;
    console.log(book);
    try {
      const validated = tokenInterceptor(request);
      const result = await this.userBooksService.updateBook(validated.id, book);
      response.json(result);
    } catch (error) {
      response.status(error.httpCode).json(error);
    }
  }

  async getUserGenres(request, response) {
    console.log("GET User Genres request accepted");
    try {
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

      const result = await this.privateBookService.saveUserBook(
        validated.id,
        book,
        cover
      );

      response.json(result);
    } catch (error) {
      console.log(error);
      response.status(error.httpCode || 500).json(error);
    }
  }
}

export default new UserController(
  userService,
  userBooksService,
  privateBookService
);

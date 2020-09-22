"use strict";
import AuthController from "../controllers/authController";
import BookController from "../controllers/bookController";
import UserController from "../controllers/userController";
import SeriesController from "../controllers/seriesController";
import AuthorController from "../controllers/authorController";
import FeedController from "../controllers/feedController";

import multer from "multer";
const upload = multer();

export default (app) => {
  app.post("/auth/login", AuthController.signInUser);
  app.post("/auth/register", AuthController.signUpUser);
  app.get("/books/search", BookController.searchByTitleOrAuthor);
  app.get("/books/:bookId", BookController.getBookById);
  app.get("/user", UserController.getUser);
  app.get("/user/books", UserController.getUserBooks);
  app.get("/user/books/favorite", UserController.getFavoriteBooks);
  app.post("/user/books/favorite", UserController.setFavorite);
  app.get("/user/books/:collection", UserController.getCollection);
  app.post("/user/books/:collection", UserController.addToCollection);
  app.delete("/user/books", UserController.deleteBook);
  app.put("/user/books", UserController.updateBook);
  app.get("/user/genres", UserController.getUserGenres);
  app.get("/user/feed", FeedController.getFeed);
  app.get("/series/:id", SeriesController.getSeriesById);
  app.get("/author/:id", AuthorController.getAuthorInfo);
  app.get("/author/:id/series", AuthorController.getAuthorSeries);
  app.get("/user/upload", UserController.getAllPrivateBooks);
  app.get("/user/upload/:id", UserController.getPrivateBookById);
  app.post("/user/upload", upload.single("cover"), UserController.savePrivateBook);
  app.delete("/user/upload", UserController.removePrivateBook);
};

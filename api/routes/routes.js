"use strict"
import AuthController from "../controllers/authController";
import BookController from "../controllers/bookController";
import UserController from "../controllers/userController";
import SeriesController from "../controllers/seriesController";
import AuthorController from "../controllers/authorController";

export default (app) => {
    app.post("/auth/login", AuthController.signInUser);
    app.post("/auth/register", AuthController.signUpUser);
    app.get("/books/search", BookController.searchByTitleOrAuthor);
    app.get("/books/:bookId", BookController.getBookById);
    app.get("/user", UserController.getUser);
    app.get("/user/books", UserController.getUserBooks);
    app.get("/user/favorite", UserController.getFavoriteBooks)
    app.post("/user/favorite", UserController.setFavorite);
    app.get("/user/genres", UserController.getUserGenres)
    app.get("/user/:collection", UserController.getCollection);
    app.post("/user/:collection", UserController.addToCollection);
    app.delete("/user/collection", UserController.deleteBook);
    app.put("/user/collection", UserController.updateBook);
    app.get("/series/:id", SeriesController.getSeriesById);
    app.get("/author/:id", AuthorController.getAuthorInfo);
    app.get("/author/:id/series", AuthorController.getAuthorSeries);
};      

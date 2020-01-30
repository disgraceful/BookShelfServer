"use strict"
import AuthController from "../controllers/authController";
import BookController from "../controllers/bookController";
import UserController from "../controllers/userController"

export default (app) => {
    app.post("/auth/login", AuthController.signInUser);
    app.post("/auth/register", AuthController.signUpUser);
    app.get("/books/search/:query", BookController.searchByTitleOrAuthor);
    app.get("/books/:bookId", BookController.getBookById);
    app.get("/user", UserController.getUser);
    app.get("/user/books", UserController.getUserBooks);
    app.get("/user/:collection", UserController.getCollection);
    app.post("/user/:collection", UserController.addToCollection);
};      
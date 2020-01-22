"use strict"
import AuthController from "../controllers/authController";
import BookController from "../controllers/bookController";
import UserController from "../controllers/userController"

export default (app) => {
    app.post("/auth/login", AuthController.signInUser);
    app.post("/auth/register", AuthController.signUpUser);
    app.get("/books/search", BookController.searchByTitleOrAuthor);
    app.get("/books", BookController.getBookById);
    app.get("/user", UserController.getUser);
    app.get("/user/reading", UserController.getReading);
    app.post("/user/reading", UserController.addToReading);
};
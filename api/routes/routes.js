"use strict"
import AuthController from "../controllers/authController";
import BookController from "../controllers/bookController";
import UserController from "../controllers/userController"

export default (app) => {
    app.post("/auth/login", AuthController.signInUser);
    app.post("/auth/register", AuthController.signUpUser);
    app.get("/books/search/:query", BookController.searchByTitleOrAuthor);
    app.get("/books/:bookId", BookController.getBookById);
    //need token validation!
    app.get("/user", UserController.getUser);
    app.get("/user/reading", UserController.getReading);
    app.post("/user/reading", UserController.addToReading);
    app.get("/user/toread", UserController.getToRead);
    app.post("/user/toread", UserController.addToRead);
    app.get("/user/stopped", UserController.getStopped);
    app.post("/user/stopped", UserController.addToStopped);
    app.get("/user/finished", UserController.getFinished);
    app.post("/user/finished", UserController.addToFinished);
    app.get("/user/favorites", UserController.getFavorites);
    app.post("/user/favorites", UserController.addToFavorites);
};      
"use strict"
import AuthController from "../controllers/authController";
import BookController from "../controllers/bookController";
import UserController from "../controllers/userController"
import userController from "../controllers/userController";

export default (app) => {
    app.post("/auth/login", AuthController.signInUser);
    app.post("/auth/register", AuthController.signUpUser);
    app.get("/books/search", BookController.searchByTitleOrAuthor);
    app.get("/books", BookController.getBookById);
    app.post("/books/favorite", BookController.favoriteBook);
    app.get("/user",userController.getUser)
};
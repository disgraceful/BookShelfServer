"use strict"
import AuthController from "../controllers/authController";
import BookController from "../controllers/bookController";

export default (app) => {
    app.post("/auth/login", AuthController.signInUser);
    app.post("/auth/register", AuthController.signUpUser);
    app.get("/books/search", BookController.searchByTitleOrAuthor);
};
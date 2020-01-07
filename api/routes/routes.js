"use strict"
module.exports = (app) => {
    const authController = require("../controllers/AuthController");
    const bookController = require("../controllers/bookController");
    app.route("/auth/login").post(authController.signInUser);
    app.route("/auth/register").post(authController.signUpUser);
    app.route("/books/search").get(bookController.searchByTitleOrAuthor)
};
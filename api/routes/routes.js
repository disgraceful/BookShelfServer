"use strict"
module.exports = (app) => {
    const authController = require("../controllers/AuthController");
    app.route('/auth/login').post(authController.signInUser);
    app.route('/auth/register').post(authController.signUpUser)
};
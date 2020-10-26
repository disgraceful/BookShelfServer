import { ErrorWithHttpCode } from "../error/ErrorWithHttpCode";

export default {
  authErrorHandler(error, defaultMessage = "Someting went wrong. Try again.") {
    let errorMessage;
    let httpCode = 500;

    if (error.userMessage) throw error;
    if (!error.code) throw new ErrorWithHttpCode(httpCode, defaultMessage);

    if (error.code === "auth/email-already-in-use") {
      errorMessage = `The email is already in use`;
    } else if (error.code === "auth/invalid-email") {
      errorMessage = "Invalid email";
      httpCode = 400;
    } else if (error.code === "auth/weak-password") {
      errorMessage = "Password must be at least 6 symbols long";
      httpCode = 400;
    } else if (error.code === "auth/user-disabled") {
      errorMessage = "Account with given email has been disabled.";
    } else if (error.code === "auth/user-not-found") {
      errorMessage = `User with that email does not exist!`;
      httpCode = 404;
    } else if (error.code === "auth/wrong-password") {
      errorMessage = "Incorrect password!";
    } else if (error.code.includes("different-credential")) {
      errorMessage = "Email is already associated with another account";
    } else {
      errorMessage = defaultMessage;
    }

    throw new ErrorWithHttpCode(httpCode, errorMessage);
  },
};

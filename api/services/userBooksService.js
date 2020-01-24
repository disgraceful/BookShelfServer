import firebase from "firebase";
import { ErrorWithHttpCode } from "../error/ErrorWithHttpCode";

class UserBooksService {
    constructor(userService) {
        this.userService = userService;
        this.getUserCollection = this.getUserCollection.bind(this);
        this.addToUserCollection = this.addToUserCollection.bind(this);
    }

    async getUserCollection(id, collection) {
        try {
            const user = await this.userService.getUserById(id);
            let array = user[collection];
            if (!array && !Array.isArray(array)) {
                throw new ErrorWithHttpCode(400, error.message);
            }
            return user[collection];
        } catch (error) {
            throw new ErrorWithHttpCode(error.httpCode || 500, error.message || "Ooops! Something went wrong on the server!");
        }
    }

    async addToUserCollection(id, collection, book) {
        try {
            let user = await this.userService.getUserById(id);
            const array = user[collection];
            if (!array && !Array.isArray(array)) {
                throw new ErrorWithHttpCode(400, error.message);
            }
            if (array.every(item => item.id !== book.id)) {
                array.push(book);
                await firebase.database().ref("users").child(id).update({ [collection]: array }, (error) => {
                    if (error) throw new ErrorWithHttpCode(400, error.message);
                })
                user = await this.userService.getUserById(id)
            }
            return user;
        } catch (error) {
            throw new ErrorWithHttpCode(error.httpCode || 500, error.message || "Ooops! Something went wrong on the server!");
        }
    }
}

export default UserBooksService;

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
            const array = user.books.filter(book => book.status === collection);
            if (!array) {
                throw new ErrorWithHttpCode(400, error.message);
            }
            return array;
        } catch (error) {
            throw new ErrorWithHttpCode(error.httpCode || 500, error.message || "Ooops! Something went wrong on the server!");
        }
    }

    async addToUserCollection(id, collection, book) {
        try {
            let user = await this.userService.getUserById(id);
            if (!user.books) user.books = [];
            const bookRef = user.books.find(item => item.id === book.id);
            if (user.books.includes(book) || bookRef) {
                bookRef.status = collection;
            } else {
                book.status = collection;
                user.books.push(book);
            }
            await firebase.database().ref("users").child(id).update({ books: user.books }, (error) => {
                if (error) throw new ErrorWithHttpCode(400, error.message);
            });
            return book;
        } catch (error) {
            throw new ErrorWithHttpCode(error.httpCode || 500, error.message || "Ooops! Something went wrong on the server!");
        }
    }
}

export default UserBooksService;

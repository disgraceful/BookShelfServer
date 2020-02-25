import firebase from "firebase";
import { ErrorWithHttpCode } from "../error/ErrorWithHttpCode";
import { UserData } from "../model/UserData"

class UserBooksService {
    constructor(userService) {
        this.userService = userService;
        this.getUserBooks = this.getUserBooks.bind(this);
        this.getUserCollection = this.getUserCollection.bind(this);
        this.addToUserCollection = this.addToUserCollection.bind(this);
        this.deleteBookFromCollection = this.deleteBookFromCollection.bind(this);
        this.setFavorite = this.setFavorite.bind(this);
        this.getFavorites = this.getFavorites.bind(this);
        this.updateBook = this.updateBook.bind(this);
        this.finishBook = this.finishBook.bind(this);
    }

    async getUserBooks(id) {
        try {
            const user = await this.userService.getUserById(id);
            return user.books || [];
        }
        catch (error) {
            throw new ErrorWithHttpCode(error.httpCode || 500, error.message)
        }
    }

    async getUserCollection(id, collection) {
        try {
            const books = await this.getUserBooks(id);
            const array = books.filter(book => book.status === collection);
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
            const books = await this.getUserBooks(id);
            const bookRef = books.find(item => item.id === book.id);
            if (bookRef) {
                bookRef.userData.status = collection;
            } else {
                book.userData.status = collection;
                books.push(book);
            }
            await firebase.database().ref("users").child(id).update({ books: books }, (error) => {
                if (error) throw new ErrorWithHttpCode(400, error.message);
            });
            console.log(books);
            return books.find(item => item.id === book.id);
        } catch (error) {
            throw new ErrorWithHttpCode(error.httpCode || 500, error.message || "Ooops! Something went wrong on the server!");
        }
    }

    async deleteBookFromCollection(id, bookId) {
        try {
            let books = await this.getUserBooks(id);
            const bookRef = books.find(item => item.id === bookId);
            if (bookRef) {
                books = books.filter(item => item.id !== bookRef.id);
                await firebase.database().ref("users").child(id).update({ books: books }, (error) => {
                    if (error) throw new ErrorWithHttpCode(400, error.message);
                });
                bookRef.userData = new UserData();
                return bookRef;
            } else {
                return false;
            }
        } catch (error) {
            console.log(error);
            throw new ErrorWithHttpCode(error.httpCode || 500, error.message || "Ooops! Something went wrong on the server!");
        }
    }

    async setFavorite(id, book) {
        try {
            const books = await this.getUserBooks(id);
            const bookRef = books.find(item => item.id === book.id);
            console.log(bookRef);
            if (bookRef) {
                bookRef.userData.isFavorited = !book.userData.isFavorited;
            } else {
                book.userData.isFavorited = !book.userData.isFavorited;
                books.push(book);
            }
            await firebase.database().ref("users").child(id).update({ books: books }, (error) => {
                if (error) throw new ErrorWithHttpCode(400, error.message);
            });
            return books.find(item => item.id === book.id);
        } catch (error) {
            console.log(error);
            throw new ErrorWithHttpCode(error.httpCode || 500, error.message || "Ooops! Something went wrong on the server!");
        }
    }

    async getFavorites(id) {
        try {
            const books = await this.getUserBooks(id);
            return books.filter(item => item.isFavorited);
        }
        catch (error) {
            throw new ErrorWithHttpCode(error.httpCode || 500, error.message || "Ooops! Something went wrong on the server!");
        }
    }

    async updateBook(id, book) {
        try {
            const books = await this.getUserBooks(id);
            const bookRef = books.find(item => item.id === book.id);
            console.log(bookRef);
            if (bookRef) {
                const index = books.indexOf(bookRef);
                await firebase.database().ref(`users/${id}/books/${index}`).set(book);
                const snapshot = await firebase.database().ref(`users/${id}/books/${index}`).once("value");
                return snapshot.val();
            }

            return book;

        } catch (error) {
            console.log(error);
            throw new ErrorWithHttpCode(error.httpCode || 500, error.message || "Ooops! Something went wrong on the server!");
        }
    }

    finishBook(book) {
        book.status = "finished";
        book.pagesRead = book.pages
    }
}

export default UserBooksService;

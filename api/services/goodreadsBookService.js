import axios from "axios";
import converter from "xml-js";
import { ErrorWithHttpCode } from "../error/ErrorWithHttpCode";


class GoodreadsBookService {
    constructor(userService, formatBookService) {
        this.userService = userService;
        this.formatBookService = formatBookService;
        this.searchBooks = this.searchBooks.bind(this);
        this.getBookByGoodreadsId = this.getBookByGoodreadsId.bind(this);
        this.fetchUserBookData = this.fetchUserBookData.bind(this);
        this.getValueFromGoodreads = this.getValueFromGoodreads.bind(this);
        this.findValue = this.findValue.bind(this);

    }

    async searchBooks(url) {
        try {
            const converted = await this.getValueFromGoodreads(url);
            let books = this.findValue(converted, "work");
            if (!books) {
                throw new ErrorWithHttpCode(404, "Book not found")
            }
            let formatted = this.formatBookService.formatBooksForSearch(books)
            return formatted;
        } catch (error) {
            throw new ErrorWithHttpCode(error.httpCode || 500, error.message);
        }
    }

    async getBookByGoodreadsId(url) {
        try {
            const converted = await this.getValueFromGoodreads(url);
            let book = this.findValue(converted, "book");
            if (!book) {
                throw new ErrorWithHttpCode(404, "Book with that id is not found")
            }
            let formatted = this.formatBookService.formatBookForBookPage(book);
            return formatted;
        } catch (error) {
            throw new ErrorWithHttpCode(error.httpCode || 500, error.message);
        }
    }

    async fetchUserBookData(userId, book) {
        try {
            const user = await this.userService.getUserById(userId);
            const userBookRecord = user.books.find(item => item.id === book.id);
            return userBookRecord ? userBookRecord : book;
        } catch (error) {
            throw new ErrorWithHttpCode(error.httpCode || 500, error.message);
        }
    }

    async getValueFromGoodreads(url) {
        try {
            const response = await axios.get(url);
            const xml = response.data;
            const converted = converter.xml2js(xml, { compact: true });
            return converted;
        }
        catch (error) {
            throw new ErrorWithHttpCode(500, error.message);
        }
    }

    findValue(object, search) {
        let result;
        Object.keys(object).some(key => {
            if (key === search) {
                result = object[key];
                return true;
            }
            if (object[key] && typeof object[key] === "object") {
                result = this.findValue(object[key], search);
                return result !== undefined;
            }
        });
        return result;
    }


}

export default GoodreadsBookService;

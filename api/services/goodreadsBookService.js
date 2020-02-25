import "dotenv/config"
import axios from "axios";
import converter from "xml-js";
import { ErrorWithHttpCode } from "../error/ErrorWithHttpCode";

const dev_key = process.env.GOODREADS_KEY
const root = "https://www.goodreads.com/"
const abeBooksUrl = "https://pictures.abebooks.com/isbn/";
const defaultImgUrl = "https://s.gr-assets.com/assets/nophoto/book/111x148-bcc042a9c91a29c1d680899eff700a03.png";

class GoodreadsBookService {
    constructor(userService, formatBookService) {
        this.userService = userService;
        this.formatBookService = formatBookService;
        this.searchBooks = this.searchBooks.bind(this);
        this.getBookWithUserDataById = this.getBookWithUserDataById.bind(this);
        this.getBookByGoodreadsId = this.getBookByGoodreadsId.bind(this);
        this.fetchUserBookData = this.fetchUserBookData.bind(this);
        this.getSeriesByGoodreadsId = this.getSeriesByGoodreadsId.bind(this);
        this.getValueFromGoodreads = this.getValueFromGoodreads.bind(this);
        this.findValue = this.findValue.bind(this);

    }

    async searchBooks(searchQuery) {
        try {
            const searchUrl = `${root}search/index.xml?key=${dev_key}&q=${searchQuery}`;
            const converted = await this.getValueFromGoodreads(searchUrl);
            let books = this.findValue(converted, "work");
            if (!books) {
                throw new ErrorWithHttpCode(404, "Book not found")
            }
            let formatted = await Promise.all(books.slice(0, 4).map(async item => {
                const id = item.best_book.id._text;
                let book = await this.getBookByGoodreadsId(id);
                book = this.formatBookService.formatBookForSearch(book);
                book.imageUrl = await this.formatImageUrl(book.imageUrl, book.isbn);
                return book;
            }));
            return formatted;
        } catch (error) {
            console.log(error);
            throw new ErrorWithHttpCode(error.httpCode || 500, error.message);
        }
    }

    async getBookWithUserDataById(bookId, userId) {
        try {
            const book = await this.getBookByGoodreadsId(bookId);
            const formatted = this.formatBookService.formatBookForBookPage(book);
            formatted.imageUrl = await this.formatImageUrl(formatted.imageUrl, formatted.isbn);
            formatted.smallImageUrl = formatted.imageUrl;
            console.log(formatted);
            return await this.fetchUserBookData(userId, formatted);
        } catch (error) {
            console.log(error);
            throw new ErrorWithHttpCode(error.httpCode || 500, error.message);
        }
    }

    async getBookByGoodreadsId(id) {
        try {
            const url = `${root}book/show/${id}.xml?key=${dev_key}`;
            const converted = await this.getValueFromGoodreads(url);
            const book = this.findValue(converted, "book");
            if (!book) {
                throw new ErrorWithHttpCode(404, "Book with that id is not found")
            }
            return book;
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

    async getSeriesByGoodreadsId(url) {
        try {
            const converted = await this.getValueFromGoodreads(url);
            const series = this.findValue(converted, "series");
            const seriesWork = this.findValue(series, "series_work");
            const result = this.formatBookService.formatSeries(series);
            result.books = this.formatBookService.formatSeriesWork(seriesWork);
            return result;
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

    async formatImageUrl(url, isbn) {
        console.log(url);
        let imageUrl = "";
        console.log(url.includes("nophoto") && isbn);
        if (url.includes("nophoto") && isbn) {
            imageUrl = `${abeBooksUrl}${isbn}.jpg`;
            try {
                const response = await axios.get(imageUrl);
                console
                if (response.status !== 404) {
                    return imageUrl;
                }
            } catch (error) {
                console.log("all fine", error);
                return defaultImgUrl;
            }
        }
        return url;
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

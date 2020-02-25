import { ErrorWithHttpCode } from "../error/ErrorWithHttpCode";
import { Book } from "../model/Book"
const genresExceptions = ["to-read", "currently-reading", "owned", "default", "favorites", "books-i-own",
    "ebook", "kindle", "library", "audiobook", "owned-books", "audiobooks", "my-books",
    "ebooks", "to-buy", "english", "calibre", "books", "british", "audio", "my-library",
    "favourites", "re-read", "general", "e-books"];

class FormatBookService {
    constructor() {
        this.formatBooksForSearch = this.formatBooksForSearch.bind(this);
        this.formatBookForBookPage = this.formatBookForBookPage.bind(this);
        this.formatSeries = this.formatSeries.bind(this);
        this.formatSeriesWork = this.formatSeriesWork.bind(this);
        this.getBookTitle = this.getBookTitle.bind(this);
        this.getAllBookAuthors = this.getAllBookAuthors.bind(this);
        this.mapAuthor = this.mapAuthor.bind(this);
        this.formatDescription = this.formatDescription.bind(this);
    }

    formatBooksForSearch(books) {
        try {
            let formattedBooks = [];
            books.forEach(book => {
                let stringTitle = book.best_book.title._text;
                let seriesSeparator = stringTitle.indexOf("(");
                let title = stringTitle.substr(0, seriesSeparator > 0 ? seriesSeparator : stringTitle.length).trim();
                let seriesTitle = seriesSeparator < 0 ? "" : stringTitle.substr(seriesSeparator, stringTitle.indexOf(")") - seriesSeparator + 1);
                const newBook = {
                    year: book.original_publication_year._text,
                    goodreadsRating: book.average_rating._text,
                    id: book.best_book.id._text,
                    title: title,
                    seriesTitle: seriesTitle,
                    authorName: book.best_book.author.name._text,
                    imageUrl: book.best_book.image_url._text,
                    smallImageUrl: book.best_book.small_image_url._text,
                }
                formattedBooks.push(newBook);
            })
            return formattedBooks;
        }
        catch (error) {
            throw new ErrorWithHttpCode(400, "Failed to retrieve data from book");
        }
    }

    formatBookForBookPage(book) {
        try {
            let formatted = {
                id: book.id._text,
                title: this.getBookTitle(book.title._text) || this.getBookTitle(book.title._cdata),
                imageUrl: book.image_url._text,
                smallImageUrl: book.small_image_url._text,
                description: this.formatDescription(book.description._cdata),
                publishedYear: book.work.original_publication_year._text,
                goodreadsRating: book.average_rating._text,
                pages: book.num_pages._cdata,
            };
            const authors = book.authors.author;
            const trueAuthors = Array.isArray(authors) ? this.getAllBookAuthors(authors) : [this.mapAuthor(authors)];
            let series = book.series_works.series_work;
            if (Array.isArray(series)) {
                series = series[0];
            }
            let trueSeries = !series ? null : {
                id: series.series.id._text,
                fullName: `(${series.series.title._cdata.trim()} #${series.user_position._text})`
            }
            formatted.genres = this.formatGenresForBook(book.popular_shelves.shelf);
            return new Book(formatted.id, formatted.title, formatted.imageUrl, formatted.smallImageUrl,
                formatted.description, formatted.publishedYear, formatted.goodreadsRating, formatted.pages, trueAuthors, trueSeries, formatted.genres);
        }
        catch (error) {
            console.log(error);
            throw new ErrorWithHttpCode(400, "Failed to retrieve data from book");
        }
    }

    formatSeries(series) {
        return {
            id: series.id._text,
            title: series.title._cdata,
            workCount: series.primary_work_count._text,
        }
    }


    formatSeriesWork(seriesWork) {
        try {
            let result = seriesWork.slice(0, 6);
            result = result.map(work => {
                let book = work.work.best_book
                let formatted = {
                    position: work.user_position._text,
                    id: book.id._text,
                    title: this.getBookTitle(book.title._text),
                    author: {
                        id: book.author.id._text,
                        name: book.author.name._text,
                    },
                    image_url: book.image_url._cdata
                }

                return formatted;
            });
            return result;
        } catch (error) {
            console.log(error);
        }
    }

    //transform goodreads 'shelves' to genres
    //TODO i.e Science-fiction OR Sci-fi, not BOTH
    formatGenresForBook(shelves) {
        const genres = shelves
            .filter(shelf => !genresExceptions.includes(shelf._attributes.name))
            .map(genre => genre._attributes.name.replace(/^\w/, char => char.toUpperCase()));//first letter toUpperCase \fantasy => Fantasy
        return genres.length > 3 ? genres.slice(0, 3) : genres;
    }

    getBookTitle(string) {
        if (!string) return null;
        let stringTitle = string;
        let seriesSeparator = stringTitle.indexOf("(");
        let title = stringTitle.substring(0, seriesSeparator > 0 ? seriesSeparator : stringTitle.length).trim();
        return title;
    }

    formatDescription(descr) {
        let newD = descr.replace(new RegExp(/\<[\s\S]*?\/>/gy), ""); //replace all first tags
        newD = newD.replace(new RegExp(/\<br\s\/>/g), "\n"); //replace html line-breaks with \n
        return newD;
    }

    getAllBookAuthors(authors) {
        return authors.filter(author => !author.role._text).map(author => this.mapAuthor(author));
    }

    mapAuthor(author) {
        return {
            id: author.id._text,
            name: author.name._text,
            imageUrl: author.image_url._cdata,
            smallImageUrl: author.small_image_url._cdata,
            goodreadsRating: author.average_rating._text
        }
    }
}

export default FormatBookService
import { ErrorWithHttpCode } from "../error/ErrorWithHttpCode";
import { Book } from "../model/Book";


const genresExceptions = ["to-read", "currently-reading", "owned", "default", "favorites", "books-i-own",
    "ebook", "kindle", "library", "audiobook", "owned-books", "audiobooks", "my-books",
    "ebooks", "to-buy", "english", "calibre", "books", "british", "audio", "my-library",
    "favourites", "re-read", "general", "e-books"];

class FormatBookService {
    constructor() {
        this.formatBookForSearch = this.formatBookForSearch.bind(this);
        this.formatBookForBookPage = this.formatBookForBookPage.bind(this);
        this.formatSeriesForSeriesPage = this.formatSeriesForSeriesPage.bind(this);
    }

    formatBookForSearch(book) {
        try {
            return {
                isbn: book.isbn13._cdata,
                id: book.id._text,
                title: this.getBookTitle(book.title._text) || this.getBookTitle(book.title._cdata),
                imageUrl: book.image_url._text,
                author: this.formatAuthorForSearch(book.authors.author),
                series: this.formatSeries(book.series_works.series_work).fullName,
            }
        }
        catch (error) {
            console.log(error);
            throw new ErrorWithHttpCode(400, "Failed to retrieve data from book");
        }
    }

    formatBookForBookPage(book) {
        try {
            let formatted = {
                isbn: book.isbn13._cdata,
                id: book.id._text,
                title: this.getBookTitle(book.title._text) || this.getBookTitle(book.title._cdata),
                imageUrl: book.image_url._text,
                smallImageUrl: book.small_image_url._text,
                description: this.formatDescription(book.description._cdata),
                publishedYear: book.work.original_publication_year._text,
                goodreadsRating: book.average_rating._text,
                pages: book.num_pages._cdata,
            };
            formatted.authors = this.formatAuthor(book.authors.author);
            formatted.series = this.formatSeries(book.series_works.series_work);
            formatted.genres = this.formatGenresForBook(book.popular_shelves.shelf);
            return new Book(formatted.isbn, formatted.id, formatted.title, formatted.imageUrl, formatted.smallImageUrl,
                formatted.description, formatted.publishedYear, formatted.goodreadsRating, formatted.pages, formatted.authors, formatted.series, formatted.genres);
        }
        catch (error) {
            console.log(error);
            throw new ErrorWithHttpCode(400, "Failed to retrieve data from book");
        }
    }

    formatSeriesForSeriesPage(series) {
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

    formatSeries(series) {
        if (Array.isArray(series)) {
            series = series[0];
        }
        return series ? {
            id: series.series.id._text,
            fullName: `(${series.series.title._cdata.trim()} #${series.user_position._text})`
        } : null;

    }

    formatAuthor(authors) {
        return Array.isArray(authors) ? this.getAllBookAuthors(authors) : [this.mapAuthor(authors)];
    }

    formatAuthorForSearch(authors) {
        return Array.isArray(authors) ? authors[0].name._text : authors.name._text;
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
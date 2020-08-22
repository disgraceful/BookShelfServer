import FormatBaseService from "./formatBaseService";
import { ErrorWithHttpCode } from "../../error/ErrorWithHttpCode";
import { Book } from "../../model/Book";

class FormatBookService extends FormatBaseService {
  constructor() {
    super();
  }

  formatBookForSearch(book) {
    try {
      return {
        id: book.id._text,
        title: book.title._text || book.title._cdata,
        imageUrl: this.getLargeImageUrl(book.image_url._text),
        author: this.formatAuthorForSearch(book.author),
      };
    } catch (error) {
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
        imageUrl: this.getLargeImageUrl(book.image_url._text),
        smallImageUrl: book.small_image_url._text,
        description: this.formatDescription(book.description._cdata),
        publishedYear: book.work.original_publication_year._text,
        goodreadsRating: book.average_rating._text,
        pages: book.num_pages._cdata,
      };
      formatted.authors = this.formatAuthor(book.authors.author);
      formatted.series = this.formatSeriesForBook(book.series_works.series_work);
      formatted.genres = this.formatGenresForBook(book.popular_shelves.shelf);
      return new Book(
        formatted.isbn,
        formatted.id,
        formatted.title,
        formatted.imageUrl,
        formatted.smallImageUrl,
        formatted.description,
        formatted.publishedYear,
        formatted.goodreadsRating,
        formatted.pages,
        formatted.authors,
        formatted.series,
        formatted.genres
      );
    } catch (error) {
      console.log(error);
      throw new ErrorWithHttpCode(400, "Failed to retrieve data from book");
    }
  }
}

export default FormatBookService;

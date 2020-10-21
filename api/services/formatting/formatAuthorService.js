import { auth } from "firebase";
import FormatBookService from "./formatBaseService";

class FormatAuthorService extends FormatBookService {
  constructor() {
    super();
  }

  formatAuthorForAuthorPage(author, books) {
    return {
      id: author.id._text,
      name: author.name._text,
      imageUrl: author.large_image_url._cdata,
      about: this.formatDescription(author.about._cdata),
      workCount: author.works_count._text,
      bornDate: author.born_at._text,
      deathDate: author.died_at._text,
      bookIds: this.formatAuthorBooks(books),
    };
  }

  formatAuthorMin(author) {
    return { name: author.name._text };
  }

  formatAuthorBooks(books) {
    const authorBooks = books.book;
    return this.mapArrayIds(authorBooks);
  }
}

export default FormatAuthorService;

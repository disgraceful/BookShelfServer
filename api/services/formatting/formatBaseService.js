const genresExceptions = [
  "to-read",
  "currently-reading",
  "owned",
  "default",
  "favorites",
  "books-i-own",
  "ebook",
  "kindle",
  "library",
  "audiobook",
  "owned-books",
  "audiobooks",
  "my-books",
  "ebooks",
  "to-buy",
  "english",
  "calibre",
  "books",
  "british",
  "audio",
  "my-library",
  "favourites",
  "re-read",
  "general",
  "e-books",
  "fiction",
  "ya",
  "series",
  "classic",
];

class FormatBookService {
  mapArrayIds(array) {
    return array.map((item) => item.id._text);
  }

  //transform goodreads 'shelves' to genres
  //TODO i.e Science-fiction OR Sci-fi, not BOTH
  formatGenresForBook(shelves) {
    const genres = shelves
      .filter((shelf) => !genresExceptions.includes(shelf._attributes.name))
      .map((genre) => genre._attributes.name.replace(/^\w/, (char) => char.toUpperCase())); //first letter toUpperCase \fantasy => Fantasy
    return genres.length > 3 ? genres.slice(0, 3) : genres;
  }

  getBookTitle(string) {
    if (!string) return null;
    let stringTitle = string;
    let seriesSeparator = stringTitle.indexOf("(");
    let title = stringTitle
      .substring(0, seriesSeparator > 0 ? seriesSeparator : stringTitle.length)
      .trim();
    return title;
  }

  formatDescription(descr) {
    if (!descr) return "";
    let newD = descr.replace(new RegExp(/<br\s*\/?>/g), "\n"); //replace html line-breaks with \n
    newD = newD.replace(new RegExp(/<[^>]*>/g), ""); //replace all other html tags
    return newD;
  }

  formatSeriesForBook(series) {
    if (!series) return null;
    if (Array.isArray(series)) {
      series = series[0];
    }
    let id = series.series.id._text;
    let position = series.user_position._text ? ` #${series.user_position._text}` : "";
    let fullName = `(${series.series.title._cdata.trim()}${position})`;

    return { id, fullName };
  }

  formatAuthor(authors) {
    return Array.isArray(authors) ? this.getAllBookAuthors(authors) : [this.mapAuthor(authors)];
  }

  formatAuthorForSearch(authors) {
    return Array.isArray(authors) ? authors[0].name._text : authors.name._text;
  }

  getAllBookAuthors(authors) {
    return authors.filter((author) => !author.role._text).map((author) => this.mapAuthor(author));
  }

  mapAuthor(author) {
    return {
      id: author.id._text,
      name: author.name._text,
      imageUrl: author.image_url._cdata,
      smallImageUrl: author.small_image_url._cdata,
      goodreadsRating: author.average_rating._text,
    };
  }

  getLargeImageUrl(url) {
    if (!url || url.includes("nophoto")) {
      return url;
    }
    const regex = new RegExp(/._(.*?)_/g);
    const newUrl = url.replace(regex, "");
    return newUrl;
  }
}

export default FormatBookService;

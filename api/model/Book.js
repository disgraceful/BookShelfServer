import { UserData } from "./UserData"

export class Book {
    constructor(id, title, imgUrl, smallImgUrl, desc, pubYear, goodreadsRating, pages, authors, series, genres) {
        this.id = id;
        this.title = title;
        this.imageUrl = imgUrl;
        this.smallImageUrl = smallImgUrl;
        this.description = desc;
        this.publishedYear = pubYear;
        this.goodreadsRating = goodreadsRating;
        this.pages = pages;
        this.authors = authors;
        this.series = series;
        this.genres = genres;
        this.userData = new UserData();
    }
}

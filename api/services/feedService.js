import moment from "moment";

const actions = {
  "2read": "Will be reading",
  finished: "Finished",
  stopped: "Stopped reading",
  update: "Has read",
  reading: "Started reading",
  not: "Not reading",
};

class FeedService {
  generateFeed(book, action, pages) {
    return {
      date: moment().format("DD MMM YYYY"),
      message: `${actions[action]} ${pages ? pages + " pages" : ""}`,
      data: { id: book.id, title: book.title },
    };
  }

  saveFeed(feed) {}

  getFeed() {}
}

export default FeedService;

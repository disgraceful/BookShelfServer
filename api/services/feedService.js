import moment from "moment";
const actions = {
  TOREAD: "Will be reading",
  FINISH: "Finished",
  STOP: "Stopped reading",
  READ: "Reading",
  START: "Started reading",
};

class FeedService {
  generateFeed(book, action) {
    return {
      date: moment().format("DD MMM YYYY"),
      message: actions[action],
      data: book,
    };
  }
}

export default FeedService;

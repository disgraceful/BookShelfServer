import { expect } from "chai";
import FeedService from "../api/services/feedService";
import moment from "moment";

describe("Feed Service", function () {
  const feedService = new FeedService();
  const book = { id: 1234, title: "Power of Habit" };
  it("import Feed Service", function () {
    expect(feedService).exist;
  });

  it("invalid feed", function () {
    const feed = feedService.generateFeed(book, "asd");
  });
});

import { expect } from "chai";
import FeedService from "../api/services/feedService";
import moment from "moment";

describe("Feed Service", function () {
  const feedService = new FeedService();
  const book = { id: 1234, name: "Power of Habit" };
  it("import Feed Service", function () {
    expect(feedService).exist;
  });

  it("Service return value", function () {
    const action = "START";
    const result = feedService.generateFeed(book, action);
    const desiredRes = {
      date: moment().format("DD MMM YYYY"),
      message: "Started reading",
      data: book,
    };
    console.log(result, desiredRes);
    expect(result).to.eql(desiredRes);
  });

  it("Service return date", function () {
    const desiredResult = "11 Jul 2020";
    const result = feedService.generateFeed(book, "FINISH");
    expect(result.date).equal(desiredResult);
  });
});

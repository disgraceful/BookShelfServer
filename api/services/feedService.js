import moment from "moment";
import firebase from "firebase";
import e from "express";

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

  async saveFeed(feed, userId) {
    const feedRef = await firebase
      .database()
      .ref("users")
      .child(userId)
      .child("feed");
    await feedRef.push().set(feed);
  }

  async getFeedByDate(userId) {
    const snapshot = await firebase
      .database()
      .ref("users")
      .child(userId)
      .child("feed")
      .once("value");
    const value = snapshot.val();
    if (!value) {
      return {};
    }
    return this.formatFeedByDate(value);
  }

  formatFeedByDate(feed) {
    const feedMap = {};

    Object.keys(feed).forEach((key) => {
      const v = feed[key];
      if (!feedMap.hasOwnProperty(v.date)) {
        feedMap[v.date] = { data: [v.data], message: [v.message] };
      } else {
        const curRecord = feedMap[v.date];
        curRecord.data.push(v.data);
        curRecord.message.push(v.message);
      }
    });
    console.log(feedMap);
    return feedMap;
  }
}

export default FeedService;

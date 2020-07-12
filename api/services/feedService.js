import moment from "moment";
import firebase from "firebase";

const actions = {
  "2read": "Will be reading",
  finished: "Finished",
  stopped: "Stopped reading",
  update: "Has read",
  reading: "Started reading",
  not: "Not reading",
};

const dateFormat = "DD MMM YYYY";

class FeedService {
  generateFeed(book, action, pages) {
    return {
      date: moment().format(dateFormat),
      message: `${actions[action]} ${pages ? pages + " pages" : ""}`,
      data: { id: book.id, title: book.title },
    };
  }

  async saveFeed(feed, userId) {
    const feedRef = firebase
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
    const clean = this.cleanFeed(value);
    return this.formatFeedByDate(clean);
  }

  formatFeedByDate(feed) {
    const feedMap = {};

    feed.forEach((item) => {
      const v = item;
      if (!feedMap.hasOwnProperty(v.date)) {
        feedMap[v.date] = { data: [v.data], message: [v.message] };
      } else {
        const curRecord = feedMap[v.date];
        curRecord.data.splice(0, 0, v.data);
        curRecord.message.splice(0, 0, v.message);
      }
    });

    return feedMap;
  }

  cleanFeed(feed) {
    let next = "";
    const arr = Object.keys(feed)
      .filter((key, index, array) => {
        const v = feed[key];
        if (index + 1 >= array.length) {
          return true;
        }

        const nextIndex = index + 1;
        next = feed[array[nextIndex]];
        return next.data.id !== v.data.id;
      })
      .map((key) => feed[key]);
    arr.sort(compare);
    console.log(arr);
    return arr;
  }
}

const compare = (recordA, recordB) => {
  const dateA = moment(recordA.date, dateFormat);
  const dateB = moment(recordB.date, dateFormat);
  let comparison = 0;
  if (dateA.isAfter(dateB)) {
    return -1;
  }
  if (dateA.isBefore(dateB)) {
    return 1;
  }
  return comparison;
};

export default FeedService;

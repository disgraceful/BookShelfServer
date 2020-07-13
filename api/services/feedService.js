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

  async saveFeed(book, action, userId, pages) {
    const feed = this.generateFeed(book, action, pages);
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

    try {
      const clean = this.cleanFeed(value);

      const formatted = this.formatFeedByDate(clean);
      this.mergeUpdateRecords(formatted);
      return formatted;
    } catch (error) {
      console.log(error);
    }
  }

  cleanFeed(feed) {
    let next = "";
    const cleanFeed = Object.keys(feed)
      .filter((key, index, array) => {
        const current = feed[key];
        console.log(current);
        if (index + 1 >= array.length) {
          return true;
        }

        const nextIndex = index + 1;
        next = feed[array[nextIndex]];
        return isFeedClean(current, next);
      })
      .map((key) => feed[key]);
    cleanFeed.reverse();
    return cleanFeed;
  }

  formatFeedByDate(feed) {
    const feedMap = {};

    feed.forEach((item) => {
      if (!feedMap.hasOwnProperty(item.date)) {
        feedMap[item.date] = [{ data: item.data, message: item.message }];
      } else {
        const curRecord = feedMap[item.date];
        curRecord.unshift({ data: item.data, message: item.message });
      }
    });

    return feedMap;
  }

  mergeUpdateRecords(feed) {
    Object.keys(feed).forEach((key) => {
      const filtered = feed[key].filter((record) =>
        record.message.includes("pages")
      );

      let id = "";
      filtered.forEach((item) => {
        if (item.data.id !== id || id === "") {
          id = item.data.id;

          const sameIdRecords = filtered.filter((item) => item.data.id === id);
          const pages = sameIdRecords.reduce(pageReducer, 0);

          const mergeIndex = this.getMergeIndex(feed[key], item.data.id);
          const mergeCount = sameIdRecords.length;

          feed[key].splice(
            mergeIndex,
            mergeCount,
            this.generateFeed(item.data, "update", pages)
          );
        }
      });
    });

    return feed;
  }

  getMergeIndex(collection, dataId) {
    const ref = collection.find(
      (item) => item.data.id === dataId && item.message.includes("pages")
    );

    return collection.indexOf(ref);
  }
}

const pageReducer = (prevValue, curValue) => {
  return prevValue + Number.parseInt(curValue.message.replace(/\D/g, ""));
};

const isFeedClean = (curRecord, nextRecord) => {
  return (
    curRecord.data.id !== nextRecord.data.id ||
    curRecord.message.includes("pages") ||
    nextRecord.message.includes("pages")
  );
};

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

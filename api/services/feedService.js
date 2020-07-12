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
      const merged = this.mergeUpdateRecords(formatted);
      return formatted;
    } catch (error) {
      console.log(error);
    }
  }

  formatFeedByDate(feed) {
    const feedMap = {};

    feed.forEach((item) => {
      const v = item;
      if (!feedMap.hasOwnProperty(v.date)) {
        feedMap[v.date] = [{ data: v.data, message: v.message }];
      } else {
        const curRecord = feedMap[v.date];
        curRecord.unshift({ data: v.data, message: v.message });
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
          return isFeedClean(feed[array[index - 1]], v);
        }

        const nextIndex = index + 1;
        next = feed[array[nextIndex]];
        return isFeedClean(v, next);
      })
      .map((key) => feed[key]);
    arr.sort(compare);
    return arr;
  }

  mergeUpdateRecords(feed) {
    Object.keys(feed).forEach((key) => {
      const filtered = feed[key].filter((record) =>
        record.message.includes("pages")
      );

      console.log(filtered);
      let id = "";
      filtered.forEach((item) => {
        if (item.data.id !== id || id === "") {
          id = item.data.id;
          const pages = filtered
            .filter((item) => item.data.id === id)
            .reduce(pageReducer, 0);

          const mergeIndex = this.getMergeIndex(feed[key], item.data.id);
          const mergeCount = filtered.filter((item) => item.data.id === id)
            .length;
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

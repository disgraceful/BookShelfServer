import moment from "moment";
import firebase from "firebase";
import { ErrorWithHttpCode } from "../error/ErrorWithHttpCode";

const actions = {
  "2read": "Will be reading",
  finished: "Finished",
  stopped: "Stopped reading",
  update: "Has read",
  rating: "Has rated",
  reading: "Started reading",
  not: "Not reading",
};

const dateFormat = "DD MMM YYYY";
const errorMsg = "Something went wrong while retrieving user feed";

class FeedService {
  convertToFBAction(action) {
    if (!actions[action]) {
      return false;
    }
    switch (action) {
      case "2read":
      case "finished":
      case "stopped":
      case "reading":
        return "add";
      case "update":
      case "rating":
        return action;
      case "not":
        return "delete";
    }
  }

  generateFeed(book, action, { pages, rating }) {
    if (!actions[action] || !book || book.id === "" || book.title === "") {
      return null;
    }

    return {
      date: moment().format(dateFormat),
      message: `${actions[action]} ${pages ? pages + " pages of " : ""}`,
      action: this.convertToFBAction(action),
      data: { id: book.id, title: book.title, rating: rating || null },
    };
  }

  async saveFeed(book, action, userId, config = {}) {
    const feed = this.generateFeed(book, action, config);
    if (feed) {
      try {
        const userFeedCollection = this.getUserFeedAsFBCollection(userId);
        await userFeedCollection
          .doc()
          .set({ ...feed, timestamp: firebase.firestore.FieldValue.serverTimestamp() });
      } catch (error) {
        if (error.userMessage) throw error;
        throw new ErrorWithHttpCode(500, "Something went wrong while recording user feed");
      }
    }
  }

  getUserFeedAsFBCollection(userId) {
    return firebase.firestore().collection("users").doc(userId).collection("feed");
  }

  async getAllUserFeed(userId) {
    const feed = await this.retrieveUserFeed(userId);
    if (!feed) return {};
    return this.formatFeed(feed);
  }

  async getUserFeedByDate(userId, date) {
    const momentDate = moment(date, dateFormat);
    if (!momentDate) {
      throw new ErrorWithHttpCode(400, "Invalid date parameter");
    }

    const feed = await this.retrieveUserFeed(userId);
    if (!feed) return {};
    const formatted = this.formatFeed(feed);

    const key = Object.keys(formatted).find((key) => {
      const compareDate = moment(key, dateFormat);
      return momentDate.isSame(compareDate, "days");
    });
    if (!key) {
      return {};
    }
    return { [key]: formatted[key] };
  }

  async retrieveUserFeed(userId) {
    try {
      const userFeedCollection = this.getUserFeedAsFBCollection(userId);
      const snapshot = await userFeedCollection.orderBy("timestamp", "desc").get();

      if (snapshot.empty) {
        return null;
      } else {
        return snapshot.docs.map((doc) => doc.data());
      }
    } catch (error) {
      throw new ErrorWithHttpCode(500, errorMsg);
    }
  }

  formatFeed(feed) {
    const clean = this.cleanFeed(feed);
    const formatted = this.formatFeedByDate(clean);
    this.mergeUpdateRecords(formatted);
    return formatted;
  }

  //remove duplicates and contradicting records
  cleanFeed(feed) {
    const recordMap = new Map();

    const cleanFeed = feed.filter((value) => {
      if (recordMap.has(value.data.id)) {
        const records = recordMap.get(value.data.id);

        if (records.some((r) => r.action === "delete")) {
          return false;
        }
        if (value.action === "delete") {
          records.push(value);
          return false;
        }
        if (value.action == "update") {
          return true;
        }
        if (records.every((r) => r.action !== value.action)) {
          records.push(value);
          return true;
        }

        return false;
      } else {
        recordMap.set(value.data.id, [value]);
        return true;
      }
    });
    cleanFeed.sort(compare); //reverse is simple, but compare is reliable
    return cleanFeed;
  }

  formatFeedByDate(feed) {
    const feedMap = {};
    feed.forEach((item) => {
      if (!feedMap.hasOwnProperty(item.date)) {
        feedMap[item.date] = [item];
      } else {
        const curRecord = feedMap[item.date];
        curRecord.push(item);
      }
    });
    console.log(feedMap);
    return feedMap;
  }

  //merging multiple 'read x pages' of same book (in the same record)
  mergeUpdateRecords(feed) {
    Object.keys(feed).forEach((key) => {
      const filtered = feed[key].filter((record) => record.message.includes("pages"));

      let id = "";
      filtered.forEach((item) => {
        if (item.data.id !== id || id === "") {
          id = item.data.id;
          const sameIdRecords = filtered.filter((item) => item.data.id === id);
          const pages = sameIdRecords.reduce(pageReducer, 0);
          const mergeIndex = this.getMergeIndex(feed[key], item.data.id);
          const mergeCount = sameIdRecords.length;

          if (pages > 0) {
            feed[key].splice(
              mergeIndex,
              mergeCount,
              this.generateFeed(item.data, "update", { pages })
            );
          } else {
            feed[key].splice(mergeIndex, mergeCount);
          }
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

  isFeedClean(curRecord, nextRecord) {
    return (
      curRecord.data.id !== nextRecord.data.id ||
      curRecord.message.includes("pages") ||
      nextRecord.message.includes("pages")
    );
  }
}

const pageReducer = (prevValue, curValue) => {
  return prevValue + Number.parseInt(curValue.message.replace(/[^-\d]/g, ""));
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

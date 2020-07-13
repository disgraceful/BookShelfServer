import moment from "moment";
import firebase from "firebase";
import { ErrorWithHttpCode } from "../error/ErrorWithHttpCode";

const actions = {
  "2read": "Will be reading",
  finished: "Finished",
  stopped: "Stopped reading",
  update: "Has read",
  reading: "Started reading",
  not: "Not reading",
};

const dateFormat = "DD MMM YYYY";
const errorMsg = "Something went wrong while retrieving user feed";

class FeedService {
  generateFeed(book, action, pages) {
    if (!actions[action] || !book || book.id === "" || book.title === "") {
      return null;
    }

    return {
      date: moment().format(dateFormat),
      message: `${actions[action]} ${pages ? pages + " pages" : ""}`,
      data: { id: book.id, title: book.title },
    };
  }

  async saveFeed(book, action, userId, pages) {
    const feed = this.generateFeed(book, action, pages);
    if (feed) {
      try {
        const feedRef = firebase
          .database()
          .ref("users")
          .child(userId)
          .child("feed");
        await feedRef.push().set(feed);
      } catch (error) {
        console.log(error);
        throw new ErrorWithHttpCode(
          500,
          error.message || "Something went wrong while recording user feed"
        );
      }
    }
  }

  async getAllUserFeed(userId) {
    try {
      const feed = await this.retrieveUserFeed(userId);
      return this.formatFeed(feed);
    } catch (error) {
      console.log(erorr);
      throw new ErrorWithHttpCode(
        eror.httpCode || 500,
        error.message || errorMsg
      );
    }
  }

  async getLastUserFeed(userId, daySpan) {
    try {
      const feed = await this.retrieveUserFeed(userId);
      const fresh = this.freshFeed(feed, daySpan);
      return this.formatFeed(fresh);
    } catch (error) {
      console.log(erorr);
      throw new ErrorWithHttpCode(
        eror.httpCode || 500,
        error.message || errorMsg
      );
    }
  }

  async getUserFeedByDate(userID, date) {}

  async retrieveUserFeed(userId) {
    try {
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
      return value;
    } catch (error) {
      console.log(error);
      throw new ErrorWithHttpCode(500, error.message || errorMsg);
    }
  }

  formatFeed(feed) {
    const clean = this.cleanFeed(feed);
    const formatted = this.formatFeedByDate(clean);
    this.mergeUpdateRecords(formatted);
    return formatted;
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

  freshFeed(feed, daySpan) {
    return Object.keys(feed).filter((key) => isFeedFresh(daySpan, feed[key]));
  }

  //remove duplicates and contradicting records
  cleanFeed(feed) {
    let next = "";
    const cleanFeed = Object.keys(feed)
      .filter((key, index, array) => {
        const current = feed[key];
        if (index + 1 >= array.length) {
          return true;
        }

        const nextIndex = index + 1;
        next = feed[array[nextIndex]];
        return isFeedClean(current, next);
      })
      .map((key) => feed[key]);
    cleanFeed.sort(compare); //reverse is simple, but compare is reliable
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

  //merging multiple 'read x pages' of same book
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

  isFeedClean(curRecord, nextRecord) {
    return (
      curRecord.data.id !== nextRecord.data.id ||
      curRecord.message.includes("pages") ||
      nextRecord.message.includes("pages")
    );
  }

  //fresh feed = records in day span
  isFeedFresh(daySpan, feedRecord) {
    const last = moment().subtract(daySpan, "days");
    const recordDate = moment(feedRecord.date, dateFormat);

    console.log(last, recordDate);
    return recordDate.isAfter(last);
  }
}

const pageReducer = (prevValue, curValue) => {
  return prevValue + Number.parseInt(curValue.message.replace(/\D/g, ""));
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

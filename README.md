# BookShelf Server

This pet project is an API for BookShelf application. It uses Goodreads API to find books, authors and series and formats them to json from xml for response. Users can rate and add books, authors and series to different categories (favorites, to-read, finished, etc). Users can also write reviews for read books and track their reading progress. Authorization is handled by Firebase, also Firebase Database is used to store user info.

## Table of contents

- [General info](#general-info)
- [Technologies](#technologies)
- [Setup](#setup)
- [API routes](#routes)
- [Features](#features)
- [Directories](#directories)

## General info

The goal of the project is to create an API for web-application, which encapsulates all main features of book library administration system (etc Goodreads), but without social network elements. Only books and nothing more.

Also I want to learn more about fullstack development, new technologies and workflow between front-end and back-end.

## Technologies

- Express.js - version 4.17
- Firebase - version 7.15
- Webpack - version 4.43
- Axios - version 0.19
- Mocha - version 8.0.1

## Setup

```
npm install
```

Development build

```
npm run build-dev
```

Start nodemon dev server

```
npm start
```

Run Mocha tests

```
npm run test
```

## API routes

All API calls return json objects.

```
/auth
```

User's registration, login, JWT verification.

```
/books
```

Get book by search query or id using Goodreads API.

```
/series
```

Get book series using Goodreads API.

```
/author
```

Get author information using Goodreads API.

```
/user
```

Get user data and stats.

```
/user/books
```

CRUD calls for manipulating user books collection, favorites, etc.

## Features

- [x] Service layer for Goodreads API access
- [x] Firebase authorization
- [x] JWT-based API access
- [x] Token check and refresh at expiration

### To-do list:

- [ ] User Feed
- [ ] Change user account settings
- [ ] File upload to Firebase Storage
- [ ] Email notifications via Firebase
- [ ] Deploy and host
- [ ] Authorization with OAuth (Low-prio)
- [ ] Gathering User Statistics (Low-prio)
- [ ] Migrate to Cloud Firestore

## Directories

```
/tests - mocha and chai tests
```

```
/api/controllers - controller classes
```

```
/api/services - service layer with main business logic
```

```
/api/model - model classes for book and book's user data
```

```
/api/routes - route configurations
```

```
/api/error - error class
```

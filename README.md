# BookShelf Server

This pet project is an API for BookShelf web-application, designed to be a book library administration system. Main goal is to create application where users can track their books, their reading progress, write down some memorable notes or get information about authors and series. There are also some neat features planned like adding your own private book to your collection, whether or not it is unpublished rare edition or simply an article you read and want to save somewhere.

## Table of contents

- [General info](#general-info)
- [Technologies](#technologies)
- [Setup](#setup)
- [API routes](#routes)
- [Features](#features)
- [Directories](#directories)
- [Inspiration](#inspiration)

## General info

The project uses Goodreads API to search for all book related stuff and formats responses to json from xml. The search supports only latin symbols and solutions to make other langauges avaliable are researched. Authorization is handled by Firebase, for now only email/password, but OAuth authorization is coming soon. User info is stored in ~~Firebase Realtime Database~~ Cloud Firestore, which is newer, has way better syntax and data structure with collections. Files, such as private book's covers are stored in Firebase Storage.

I started this project because I wanted to learn more about fullstack development, new technologies and general workflow between front-end and back-end. Also I wanted to create a simple solution for storing books I read.

## Technologies

- Express.js - version 4.17
- Firebase - version 7.19
- Webpack - version 4.44
- Axios - version 0.19
- Mocha - version 8.1.1
- Moment.js - version 2.27

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

```
/user/feed
```

Get User Feed records.

```
/user/upload
```

Save/Retrieve user's private books.

## Features

- [x] Service layer for Goodreads API access
- [x] Firebase authorization
- [x] JWT-based API access
- [x] Token check and refresh at expiration
- [x] User Feed
- [x] File upload to Firebase Storage

### To-do list:

- [ ] Deploy and host
- [ ] Advanced search
- [ ] Change user account settings
- [ ] Email notifications via Firebase
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

## Inspiration

This project is inspired (and maybe plagiarized a little) by [MyShows](https://en.myshows.me/) website.

## BookShelf Server

API for BookShelf application. Uses Goodreads API and formats results in json. Authentication process is handled by Firebase.

## To-do

- [x] Service/controller layer
- [x] JWT-based authorization
- [x] CRUD with user books
- [x] Goodreads book cover workaround

- [ ] Update expired tokens
- [ ] Generate User Feed
- [ ] Change user account settings
- [ ] File upload to Firebase Storage
- [ ] Deep dive Firebase for email notifications
- [ ] Deploy and host
- [ ] Authorization with OAuth (Low-prio)
- [ ] Gathering User Statistics (Low-prio)
- [ ] Migrate to Cloud Firestore

## Setup

### Get dependencies:

```
npm install
```

### Dev build

```
npm run serve
```

### Prod build

```
npm run build
```

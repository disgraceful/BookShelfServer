import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
const app = express();
const port = 4200;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

import routes from "./routes/routes.js";
routes(app);

import firebase from "firebase/app";
var firebaseConfig = {
    apiKey: "AIzaSyBJquLDDsi6VJl8kJQ8zRqAHHyGG0SLD9o",
    authDomain: "bookshelf-a2203.firebaseapp.com",
    databaseURL: "https://bookshelf-a2203.firebaseio.com",
    projectId: "bookshelf-a2203",
    storageBucket: "bookshelf-a2203.appspot.com",
    messagingSenderId: "942217212778",
    appId: "1:942217212778:web:2795a60ea9260c875f6b13",
    measurementId: "G-SV2WRHQ6G2"
};
firebase.initializeApp(firebaseConfig);


app.listen(port, () => console.log(`Started on port ${port}!`))
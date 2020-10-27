import "core-js/stable";
import "regenerator-runtime/runtime";
import "dotenv/config";
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import routes from "./routes/routes.js";
import firebase from "firebase/app";
import { firebaseConfig } from "./firebase.config";

global.XMLHttpRequest = require("xhr2"); // So firebase storage has weird XMLHttpRequest is not defined error, this is a workaround

const app = express();
let port = process.env.PORT;
if (port == null || port == "") {
  port = 4200;
}

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

routes(app);

firebase.initializeApp(firebaseConfig);

// DO i still need this? i use cors, but in case it fucking breaks again...
// app.all("/*", function (req, res, next) {
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
//   res.header("Access-Control-Allow-Headers", "x-access-token");
//   next();
// });

app.listen(port, () => console.log(`Started on port ${port}!`));

export default app;

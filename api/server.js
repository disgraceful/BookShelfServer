import "core-js/stable";
import "regenerator-runtime/runtime";
import "dotenv/config";
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import routes from "./routes/routes.js";
import firebase from "firebase/app";
import { firebaseConfig } from "./firebase.config";

const app = express();
const port = 4200;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

routes(app);

firebase.initializeApp(firebaseConfig);

app.all("/*", function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "x-access-token");
  if (req.method == "OPTIONS") {
    res.status(200).end();
  } else {
    next();
  }
});

app.listen(port, () => console.log(`Started on port ${port}!`));

export default app;

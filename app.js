"use strict";
const API_ROUTE = "/api";
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const startSmtpServer = require("./src/api/servers/smtp-server");
const mailbox = require("./src/api/routes/api/mailbox");

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get("/", (req, res) => res.send("Hello World"));
app.use(API_ROUTE, mailbox);

const { mongoURI: db, port } = require("./src/config/config");
mongoose
  .connect(db, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })
  // .then(() => mongoose.connection.db.dropCollection("emailboxes")) // TODO remove
  .then(() => {
    console.log("Connected to MongoDB successfully");
    if (typeof run === "function") {
      // Mocha added run to the global context due to --delay flag
      // Lets tell mocha we are connected and ready!
      // https://mochajs.org/#delayed-root-suite
      run();
    }
  })
  .catch((err) => console.log(err));
startSmtpServer();

app.listen(port, () =>
  console.log(`HTTP Server is running at http://127.0.0.1:${port}/`)
);

module.exports = app; // For Testing

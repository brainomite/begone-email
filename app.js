"use strict";
const API_ROUTE = "/api";
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const startSmtpServer = require("./src/api/servers/smtp-server");
const mailbox = require("./src/api/routes/api/mailbox");
const domains = require("./src/api/routes/api/domains");
const deleteOldEmails = require("./src/util/delete-old-emails");
const config = require("./src/config/config");

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

if (config.nodeEnv === "production") {
  app.use(express.static("frontend/build"));
  app.get("/", (req, res) => {
    res.sendFile(path.resolve(__dirname, "frontend", "build", "index.html"));
  });
}

app.use(API_ROUTE, mailbox);
app.use(API_ROUTE, domains);

const { mongoURI: db, port } = require("./src/config/config");
mongoose
  .connect(db, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })
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

if (process.env.NODE_ENV !== "test") {
  setInterval(() => {
    deleteOldEmails(config.emailExpiration);
  }, 600000); // ten minutes
}

module.exports = app; // For Testing

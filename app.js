"use strict";
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const startSmtpServer = require("./api/servers/smtp-server");

app.get("/", (req, res) => res.send("Hello World"));
const { mongoURI: db, port } = require("./config/config");

mongoose
  .connect(db, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB successfully"))
  .catch((err) => console.log(err));
startSmtpServer();

app.listen(port, () =>
  console.log(`HTTP Server is running at http://127.0.0.1:${port}/`)
);

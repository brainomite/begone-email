"use strict";
const express = require("express");
const validator = require("validator");
const ObjectId = require("mongoose").Types.ObjectId;
const router = express.Router();
const CREATED = 201;
const INTERNAL_SERVER_ERROR = 500;
const BAD_REQUEST = 400;
const validateEmail = require("../../../../util/validate-email");
const sendTestEmail = require("../../../../util/send-test-email");
const EmailBox = require("../../../../models/EmailBox");

router.get("/mailbox/:email", async ({ params: { email } }, res) => {
  const validationFailure = validateEmail(email); // falsy if validation succeeds
  if (validationFailure) {
    res.status(validationFailure.status).send(validationFailure.msg);
    return;
  }
  const emailBox = await EmailBox.findById(email, {
    createdAt: false,
    updatedAt: false,
    __v: false,
    "emails.htmlBody": false,
    "emails.createdAt": false,
    "emails.updatedAt": false,
  });

  // default is empty mailbox as we clean up
  const mbToSend = emailBox || { _id: email, emails: [] };
  res.status(200).send(mbToSend);
});

router.post("/mailbox/:email", ({ params: { email } }, res) => {
  const validationFailure = validateEmail(email); // falsy if validation succeeds
  if (validationFailure) {
    res.status(validationFailure.status).send(validationFailure.msg);
    return;
  }
  try {
    sendTestEmail(email);
    res.status(CREATED).send();
  } catch (err) {
    res
      .status(INTERNAL_SERVER_ERROR)
      .send("Error sending test email to " + email);
  }
});

router.get(
  "/mailbox/:email/:emailId",
  async ({ params: { email, emailId } }, res) => {
    const validationFailure = validateEmail(email); // falsy if validation succeeds
    if (validationFailure) {
      res.status(validationFailure.status).send(validationFailure.msg);
      return;
    }
    if (!validator.isMongoId(emailId)) {
      res.status(BAD_REQUEST).send(`${emailId} isn't in the correct format`);
    }
    await EmailBox.findOneAndUpdate(
      {
        _id: email,
        emails: { $elemMatch: { _id: { $eq: new ObjectId(emailId) } } },
      },
      {
        $set: { "emails.$.isRead": true },
      }
    );
    const emailBoxWithSpecificEmail = await EmailBox.findById(email, {
      emails: { $elemMatch: { _id: { $eq: new ObjectId(emailId) } } },
    });
    if (!emailBoxWithSpecificEmail.emails.length) {
      res.status(404).send(`Specific email, ${emailId}, not found.`);
      return;
    }
    res.status(200).send(emailBoxWithSpecificEmail);
  }
);

module.exports = router;

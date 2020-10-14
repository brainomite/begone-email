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

const handleGetMailbox = async ({ params: { email } }, res) => {
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
};

const handlePostMailbox = ({ params: { email } }, res) => {
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
};

const handleGetEmail = async ({ params: { email, emailId } }, res) => {
  // validations
  const validationFailure = validateEmail(email); // falsy if validation succeeds
  if (validationFailure) {
    res.status(validationFailure.status).send(validationFailure.msg);
    return;
  }
  if (!validator.isMongoId(emailId)) {
    res.status(BAD_REQUEST).send(`${emailId} isn't in the correct format`);
    return;
  }

  // update the email to read, if not found, its a no-op
  await EmailBox.findOneAndUpdate(
    {
      _id: email,
      emails: { $elemMatch: { _id: { $eq: new ObjectId(emailId) } } },
    },
    {
      $set: { "emails.$.isRead": true },
    }
  );

  // get the email to send to client
  const emailBoxWithSpecificEmail = await EmailBox.findById(email, {
    emails: { $elemMatch: { _id: { $eq: new ObjectId(emailId) } } },
  });

  // if there is no email found, report it
  if (!emailBoxWithSpecificEmail || !emailBoxWithSpecificEmail.emails.length) {
    res.status(404).send(`Specific email not found.`);
    return;
  }

  res.status(200).send(emailBoxWithSpecificEmail);
};

router.get("/mailbox/:email", handleGetMailbox);
router.post("/mailbox/:email", handlePostMailbox);
router.get("/mailbox/:email/:emailId", handleGetEmail);

module.exports = router;

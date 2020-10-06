const express = require("express");
const router = express.Router();
const CREATED = 201;
const INTERNAL_SERVER_ERROR = 500;
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
  console.log("emailBox: ", emailBox);
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

module.exports = router;

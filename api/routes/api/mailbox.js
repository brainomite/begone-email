const express = require("express");
const router = express.Router();
const CREATED = 201;
const INTERNAL_SERVER_ERROR = 500;
const validateEmail = require("../../../util/validate-email");
const sendTestEmail = require("../../../util/send-test-email");

router.get("/mailbox/:email", ({ params: { email } }, res) => {
  const validationFailure = validateEmail(email); // falsy if validation succeeds
  if (validationFailure) {
    res.status(validationFailure.status);
    res.send(validationFailure.msg);
    return;
  }
  res.status(200).send({ msg: "This is the get mailbox route for " + email});
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

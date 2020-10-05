const express = require("express");
const router = express.Router();
const validator = require("validator");
const BAD_REQUEST = 400;
const UNPROCESSABLE_ENTITY = 422;
const CREATED = 201;
const INTERNAL_SERVER_ERROR = 500;
const { domains } = require("../../../config/config");
const sendTestEmail = require("../../../util/send-test-email");

router.get("/mailbox", (req, res) =>
  res.json({ msg: "This is the get mailbox route" })
);

router.post("/mailbox/:email", ({ params: { email } }, res) => {
  if (!validator.isEmail(email)) {
    res.status(BAD_REQUEST);
    res.send("Value provided isn't an email address, aborting!");
    return;
  }
  const emailDomain = email.split("@")[1];
  if (!domains[emailDomain]) {
    res.status(UNPROCESSABLE_ENTITY);
    res.send(
      `We are not accepting emails for the domain, ${emailDomain}, at this time.`
    );
    return;
  }
  try {
    sendTestEmail(email);
    res.status(CREATED);
    res.send();
  } catch (err) {
    res.status(INTERNAL_SERVER_ERROR);
    res.send("Error sending test email to " + email);
  }
});

module.exports = router;

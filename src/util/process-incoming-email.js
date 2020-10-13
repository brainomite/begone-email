const { simpleParser } = require("mailparser");
const EmailBox = require("../models/EmailBox");
const { Email } = require("../models/Email");

const createEmailDoc = (parsedEmail) => {
  return new Email({
    to: parsedEmail.to.value[0].address,
    from: parsedEmail.from.value[0].address,
    subject: parsedEmail.subject,
    date: parsedEmail.date,
    htmlBody: parsedEmail.html,
  });
};

const createOrUpdateMailboxWithNewEmail = (emailDoc) => {
  return EmailBox.findByIdAndUpdate(
    emailDoc.to,
    {
      $push: { emails: emailDoc },
    },
    { upsert: true }
  );
};

const processIncomingEmail = async (emailBuffer) => {
  try {
    const parsedEmail = await simpleParser(emailBuffer, {});
    const emailDoc = await createEmailDoc(parsedEmail);
    await createOrUpdateMailboxWithNewEmail(emailDoc);
  } catch (err) {
    console.log("Incoming email error: ", err);
  }
};

module.exports = processIncomingEmail;

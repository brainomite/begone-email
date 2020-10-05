const { simpleParser } = require("mailparser");
const EmailBox = require("../models/EmailBox");
const Email = require("../models/Email");

const createEmailDoc = (parsedEmail) => {
  const email = new Email({
    to: parsedEmail.to.value[0].address,
    from: parsedEmail.from.value[0].address,
    subject: parsedEmail.subject,
    date: parsedEmail.date,
    htmlBody: parsedEmail.html,
  });
  return email.save();
};

const createOrUpdateMailboxWithNewEmail = (emailId, mailboxId) => {
  return EmailBox.findByIdAndUpdate(
    mailboxId,
    {
      $push: { box: emailId },
    },
    { upsert: true }
  );
};

const processIncomingEmail = async (emailBuffer) => {
  try {
    const parsedEmail = await simpleParser(emailBuffer, {});
    const savedEmail = await createEmailDoc(parsedEmail);
    await createOrUpdateMailboxWithNewEmail(savedEmail._id, savedEmail.to);
  } catch (err) {
    console.log("Incoming email error: ", err);
  }
};

module.exports = processIncomingEmail;

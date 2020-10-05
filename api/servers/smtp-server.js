const { SMTPServer } = require("smtp-server");
const { simpleParser } = require("mailparser");
const {
  Types: { ObjectId },
} = require("mongoose");

const { smtpPort } = require("../../config/config");
const EmailBox = require("../../models/EmailBox");
const { Email } = require("../../models/Email");

const processIncomingEmail = (emailBuffer) => {
  const emailObjectId = new ObjectId();
  simpleParser(emailBuffer, {}, async (err, parsedEmail) => {
    if (err) {
      console.log("err: ", err);
      return;
    }
    const toAddress = parsedEmail.to.value[0].address;
    const fromAddress = parsedEmail.from.value[0].address;

    // just create
    const email = new Email({
      to: toAddress,
      from: fromAddress,
      subject: parsedEmail.subject,
      date: parsedEmail.date,
      htmlBody: parsedEmail.html,
    });
    try {
      const savedEmail = await email.save();
      console.log("result: ", savedEmail);
      const emailBox = await EmailBox.findByIdAndUpdate(
        toAddress,
        {
          _id: toAddress,
          $push: { box: savedEmail._id },
        },
        { upsert: true }
      );
      console.log("emailBox: ", emailBox);
    } catch (err) {
      console.log("err2: ", err);
    }
    //   .then((emailBox) => {
    //   })
    //   .catch((err) => {
    //     console.log("err2: ", err);
    //   });
  });
};

function onData(stream, session, callback) {
  const streamChunks = [];
  stream.on("data", (chunk) => streamChunks.push(chunk));
  stream.on("end", () => {
    processIncomingEmail(Buffer.concat(streamChunks));
    callback();
  });
}

const startSmtpServer = () => {
  const options = {
    logger: false,
    authOptional: true,
    disabledCommands: ["AUTH"],
    disableReverseLookup: true,
    maxClients: 5,
    onData,
  };
  const mailServer = new SMTPServer(options);

  mailServer.on("error", (err) => {
    console.log("Error %s", err.message);
  });

  mailServer.listen(smtpPort);
  console.log(`SMTP server listening on port ${smtpPort}`);

  return mailServer;
};

module.exports = startSmtpServer;

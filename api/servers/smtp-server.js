const { SMTPServer } = require("smtp-server");
const { smtpPort } = require("../../config/config");
const processIncomingEmail = require("../../util/process-incoming-email");

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

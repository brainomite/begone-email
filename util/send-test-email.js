"use strict";
const nodemailer = require("nodemailer");
const { smtpPort, hostName } = require("../config/config");
// process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

module.exports = function sendTestEmail(recipientAddress) {
  // Message object
  const message = {
    // Comma separated list of recipients
    to: recipientAddress,

    // Subject of the message
    subject: "Begone Email test! ✔",

    // plaintext body
    text: "API: ✔ SMTP: ✔ DB: ✔",

    // HTML body
    html:
      '<p><b>API Test:</b> <span style="color: green">✔</span></p>' +
      '<p><b>SMTP Test:</b> <span style="color: green">✔</span></p>' +
      '<p><b>DB Test:</b> <span style="color: green">✔</span></p>' +
      '<p><br/><img src="cid:begone@mydomain.com"/></p>',

    // An array of attachments
    attachments: [
      // File Stream attachment
      {
        filename: "happy.png",
        path: "assets/happy.png",
        cid: "begone@mydomain.com",
      },
    ],
  };

  // Create a SMTP transporter object
  const transporter = nodemailer.createTransport(
    {
      host: "localhost",
      port: smtpPort,
      logger: false,
      tls: {
        rejectUnauthorized: false,
      },
      debug: false, // include SMTP traffic in the logs
    },
    {
      from: `Begone Email Tester! <alive-test@${hostName}`,
      headers: {},
    }
  );

  transporter.sendMail(message, (error, info) => {
    if (error) {
      console.log("Mail tester error!", error.message);
    }

    // only needed when using pooled connections
    transporter.close();
  });
}


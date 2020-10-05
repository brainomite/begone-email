"use strict";
const nodemailer = require("nodemailer");
const { smtpPort } = require("../config/config");
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

function sendTestEmail() {
  // Message object
  const recipientAddress = "alive-test@example.com";

  const message = {
    // Comma separated list of recipients
    to: recipientAddress,

    // Subject of the message
    subject: "AHEM mail test! ✔",

    // plaintext body
    text: "API: ✔ SMTP: ✔ DB: ✔",

    // HTML body
    html:
      '<p><b>API Test:</b> <span style="color: green">✔</span></p>' +
      '<p><b>SMTP Test:</b> <span style="color: green">✔</span></p>' +
      '<p><b>DB Test:</b> <span style="color: green">✔</span></p>' +
      '<p><br/><img src="cid:ahem-tester@mydomain.com"/></p>',

    // An array of attachments
    attachments: [
      // File Stream attachment
      {
        filename: "ahem-happy.png",
        path: "./README.MD",
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
      from: "AHEM Test! <alive-test@example.com",
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

sendTestEmail();

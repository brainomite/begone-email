require("dotenv").config();

const configObj = {
  mongoURI: process.env.MONGO_URI,
  port: process.env.PORT || 5000,
  smtpPort: process.env.SMTP_PORT || 25
};

module.exports = Object.freeze(configObj);

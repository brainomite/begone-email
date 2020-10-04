require("dotenv").config();

const configObj = {
  mongoURI: process.env.MONGO_URI,
  port: process.env.PORT || 5000
};

module.exports = Object.freeze(configObj);

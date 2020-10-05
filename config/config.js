require("dotenv").config();
const validator = require("validator");

const { MONGO_URI, PORT, SMTP_PORT, DOMAINS } = process.env;
if (!DOMAINS) {
  throw new Error(
    "No domains specified in .env or environment variables, please specify at least one"
  );
}
const domains = DOMAINS.split(",").map((domain) => domain.trim());
domains.forEach((domain) => {
  if (!validator.isFQDN(domain)) {
    throw new Error(`The provided domain, '${domain}', is an invalid domain.`);
  }
});

const configObj = {
  mongoURI: MONGO_URI,
  port: PORT || 5000,
  smtpPort: SMTP_PORT || 25,
  domains: domains.reduce((acc, domain) => {
    acc[domain] = true;
    return acc;
  }, {}),
};

module.exports = Object.freeze(configObj);

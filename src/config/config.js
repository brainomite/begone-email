require("dotenv").config();
const validator = require("validator");

const {
  MONGO_URI,
  PORT,
  SMTP_PORT,
  DOMAINS,
  HOST_NAME,
  EMAIL_EXPIRATION,
} = process.env;
if (!DOMAINS) {
  throw new Error(
    "No domains specified in .env or environment variables, please specify at least one for the DOMAINS variable"
  );
}
const domains = DOMAINS.split(",").map((domain) => domain.trim());
domains.forEach((domain) => {
  if (!validator.isFQDN(domain)) {
    throw new Error(
      `The provided domain, '${domain}', is an invalid domain in the DOMAINS variable`
    );
  }
});

if (!validator.isFQDN(HOST_NAME || "")) {
  throw new Error(
    HOST_NAME
      ? `'${HOST_NAME}' is an invalid domain`
      : "DOMAIN is a required config variable"
  );
}
const configObj = {
  mongoURI: MONGO_URI,
  port: PORT || 5000,
  smtpPort: SMTP_PORT || 25,
  hostName: HOST_NAME.trim(),
  domains: domains.reduce((acc, domain) => {
    acc[domain] = true;
    return acc;
  }, {}),
  emailExpiration: EMAIL_EXPIRATION,
};

module.exports = Object.freeze(configObj);

const BAD_REQUEST = 400;
const UNPROCESSABLE_ENTITY = 422;
const validator = require("validator");
const { domains } = require("../config/config");

const validateEmail = (email) => {
  if (!validator.isEmail(email)) {
    return {
      status: BAD_REQUEST,
      msg: `'${email}' isn't a valid email address, aborting!`,
    };
  }
  const emailDomain = email.split("@")[1];
  if (!domains[emailDomain]) {
    return {
      status: UNPROCESSABLE_ENTITY,
      msg: `The domain, ${emailDomain}, is not available`,
    };
  }
};

module.exports = validateEmail;

process.env.NODE_ENV = "test";
const config = require("../src/config/config");

config.domains["begone.email"] = true;
config.domains["example.com"] = true;

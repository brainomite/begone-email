process.env.NODE_ENV = "test";
const config = require("../src/config/config");

// lets remove what was picked up from environment vars if any
Object.keys(config.domains).forEach(key => {
  delete config.domains[key]
});

config.domains["begone.email"] = true;
config.domains["example.com"] = true;

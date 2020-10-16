const express = require("express");
const config = require('../../../config/config')
const router = express.Router();

router.route("/domains").get(handleGetDomains)

module.exports = router;

function handleGetDomains(req, res) {
  res.status(200).send(Object.keys(config.domains))
}

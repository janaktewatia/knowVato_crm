

const express = require("express");

const app = express();

const router = express.Router();

const home = require("../Controller/HomeController.js")

const register = require("../Controller/RegisterController.js")

router.route("/home").get(home);
router.route("/register").get(register);

module.exports = router;


const express = require("express");

const app = express();

const router = express.Router();

const home = require("../Controller/HomeController.js")

const register = require("../Controller/RegisterController.js")
const login = require("../Controller/LoginController.js")

router.route("/home").get(home);
router.route("/register").post(register);
router.route("/login").post(login);

module.exports = router;